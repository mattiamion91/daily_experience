import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  aggiornaEsperienza,
  caricaEsperienze,
  creaEsperienza,
  eliminaEsperienza,
} from '../lib/supabase.js';
import { formattaData } from '../lib/format.js';
import ExperienceForm from '../features/admin/ExperienceForm.jsx';
import page from '../styles/page.module.css';
import styles from '../features/admin/Admin.module.css';

function AdminPage() {
  const { role, user } = useAuth();
  const [esperienze, setEsperienze] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errore, setErrore] = useState('');
  const [formAperto, setFormAperto] = useState(false);
  const [inModifica, setInModifica] = useState(null);
  const [pending, setPending] = useState(false);
  const [messaggio, setMessaggio] = useState('');
  const [confermaElimina, setConfermaElimina] = useState(null);

  const ricarica = useCallback(async () => {
    setLoading(true);
    setErrore('');
    try {
      setEsperienze(await caricaEsperienze());
    } catch {
      setErrore('Non è stato possibile caricare le esperienze.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (role === 'admin') ricarica();
  }, [role, ricarica]);

  const apriNuova = () => {
    setInModifica(null);
    setErrore('');
    setFormAperto(true);
  };

  const apriModifica = (esperienza) => {
    setInModifica(esperienza);
    setErrore('');
    setFormAperto(true);
  };

  const chiudiForm = () => {
    setFormAperto(false);
    setInModifica(null);
  };

  const salva = async (dati) => {
    setPending(true);
    setErrore('');
    setMessaggio('');
    try {
      if (inModifica) {
        const aggiornata = await aggiornaEsperienza(inModifica.id, dati);
        setEsperienze((precedenti) =>
          precedenti
            .map((esperienza) => (esperienza.id === aggiornata.id ? aggiornata : esperienza))
            .sort((a, b) => a.date.localeCompare(b.date)),
        );
        setMessaggio('Esperienza aggiornata.');
      } else {
        const creata = await creaEsperienza(dati);
        setEsperienze((precedenti) =>
          [...precedenti, creata].sort((a, b) => a.date.localeCompare(b.date)),
        );
        setMessaggio('Esperienza creata.');
      }
      chiudiForm();
    } catch (erroreSalvataggio) {
      setErrore(`Non è stato possibile salvare l'esperienza: ${erroreSalvataggio.message}`);
    } finally {
      setPending(false);
    }
  };

  const elimina = async (esperienza) => {
    setPending(true);
    setErrore('');
    setMessaggio('');
    try {
      await eliminaEsperienza(esperienza.id);
      setEsperienze((precedenti) => precedenti.filter((elemento) => elemento.id !== esperienza.id));
      setMessaggio('Esperienza eliminata.');
    } catch (erroreEliminazione) {
      setErrore(`Non è stato possibile eliminare l'esperienza: ${erroreEliminazione.message}`);
    } finally {
      setConfermaElimina(null);
      setPending(false);
    }
  };

  if (!user) {
    return (
      <section className={page.page} data-testid="admin-page">
        <h2 className={page.title}>Pannello admin</h2>
        <p className={styles.intro}>Accedi per gestire le esperienze del gruppo.</p>
      </section>
    );
  }

  if (role !== 'admin') {
    return (
      <section className={page.page} data-testid="admin-denied">
        <h2 className={page.title}>Accesso negato</h2>
        <p className={page.text}>Solo gli amministratori possono gestire le esperienze.</p>
        <p className={page.text}>
          <Link to="/">Torna alle esperienze</Link>
        </p>
      </section>
    );
  }

  return (
    <section className={page.page} data-testid="admin-page">
      <div className={styles.header}>
        <h2 className={page.title}>Pannello admin</h2>
        <button className={styles.nuovo} type="button" onClick={apriNuova} data-testid="admin-new-button">
          Nuova esperienza
        </button>
      </div>
      <p className={styles.intro}>Gestisci le esperienze del gruppo.</p>

      {errore && (
        <p className={`${styles.stato} ${styles.errore}`} role="alert" data-testid="admin-error">
          {errore}
        </p>
      )}

      {messaggio && (
        <p className={styles.stato} role="status" data-testid="admin-success">
          {messaggio}
        </p>
      )}

      {formAperto && (
        <ExperienceForm
          key={inModifica?.id ?? 'nuova'}
          esperienza={inModifica}
          onSubmit={salva}
          onAnnulla={chiudiForm}
          pending={pending}
        />
      )}

      {loading && (
        <p className={styles.stato} data-testid="admin-loading">
          Caricamento delle esperienze…
        </p>
      )}

      {!loading && esperienze.length === 0 && (
        <p className={styles.stato} data-testid="admin-empty">
          Nessuna esperienza in programma.
        </p>
      )}

      {!loading && esperienze.length > 0 && (
        <ul className={styles.elenco} data-testid="admin-list">
          {esperienze.map((esperienza) => (
            <li className={styles.riga} key={esperienza.id} data-testid="admin-list-item">
              <div className={styles.rigaInfo}>
                <p className={styles.rigaNome} data-testid="admin-item-name">
                  {esperienza.name}
                </p>
                <p className={styles.rigaMeta} data-testid="admin-item-meta">
                  {formattaData(esperienza.date)} · {esperienza.location}
                </p>
              </div>
              {confermaElimina?.id === esperienza.id ? (
                <div className={styles.azioni} data-testid="admin-delete-confirm">
                  <span className={styles.stato}>Eliminare «{esperienza.name}»?</span>
                  <button
                    className={styles.conferma}
                    type="button"
                    onClick={() => elimina(esperienza)}
                    disabled={pending}
                    data-testid="admin-confirm-delete"
                  >
                    Conferma
                  </button>
                  <button
                    className={styles.annulla}
                    type="button"
                    onClick={() => setConfermaElimina(null)}
                    disabled={pending}
                    data-testid="admin-cancel-delete"
                  >
                    Annulla
                  </button>
                </div>
              ) : (
                <div className={styles.azioni}>
                  <button
                    className={styles.modifica}
                    type="button"
                    onClick={() => apriModifica(esperienza)}
                    data-testid="admin-edit-button"
                  >
                    Modifica
                  </button>
                  <button
                    className={styles.elimina}
                    type="button"
                    onClick={() => setConfermaElimina(esperienza)}
                    data-testid="admin-delete-button"
                  >
                    Elimina
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default AdminPage;
