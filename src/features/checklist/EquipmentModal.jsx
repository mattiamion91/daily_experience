import { useEffect, useState } from 'react';
import Modal from '../../components/Modal/Modal.jsx';
import { attrezzaturaPer } from '../../lib/attrezzatura.js';
import { caricaChecklist, salvaChecklistItem } from '../../lib/supabase.js';
import styles from './EquipmentModal.module.css';

function EquipmentModal({ onClose, esperienza, user }) {
  const [voci, setVoci] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errore, setErrore] = useState('');
  const [messaggio, setMessaggio] = useState('');

  useEffect(() => {
    let attivo = true;

    caricaChecklist(user.id, esperienza.id)
      .then((righe) => {
        if (!attivo) return;
        const salvati = new Map(righe.map((riga) => [riga.equipment, riga]));
        const suggeriti = attrezzaturaPer(esperienza).map(
          (equipment) => salvati.get(equipment) ?? { equipment, packed: false },
        );
        const extra = righe.filter((riga) => !suggeriti.some((voce) => voce.equipment === riga.equipment));
        setVoci([...suggeriti, ...extra]);
      })
      .catch(() => {
        if (attivo) setErrore('Non è stato possibile caricare la checklist.');
      })
      .finally(() => {
        if (attivo) setLoading(false);
      });

    return () => {
      attivo = false;
    };
  }, [esperienza, user.id]);

  const handleToggle = async (voce) => {
    const nuovoStato = !voce.packed;
    setErrore('');
    setMessaggio('Salvataggio…');
    setVoci((precedenti) =>
      precedenti.map((elemento) =>
        elemento.equipment === voce.equipment ? { ...elemento, packed: nuovoStato } : elemento,
      ),
    );

    try {
      const riga = await salvaChecklistItem({
        userId: user.id,
        experienceId: esperienza.id,
        equipment: voce.equipment,
        packed: nuovoStato,
      });
      setVoci((precedenti) =>
        precedenti.map((elemento) => (elemento.equipment === voce.equipment ? riga : elemento)),
      );
      setMessaggio('Salvato');
    } catch {
      setVoci((precedenti) =>
        precedenti.map((elemento) =>
          elemento.equipment === voce.equipment ? { ...elemento, packed: voce.packed } : elemento,
        ),
      );
      setErrore('Non è stato possibile salvare la checklist.');
      setMessaggio('');
    }
  };

  return (
    <Modal labelledBy="titolo-attrezzatura" testId="equipment-modal" onClose={onClose}>
      <h2 className={styles.title} id="titolo-attrezzatura">
        Attrezzatura consigliata
      </h2>
      <p className={styles.text}>Spunta ciò che hai già messo nello zaino: la checklist è solo tua.</p>

      {loading && (
        <p className={styles.stato} data-testid="checklist-loading">
          Caricamento della checklist…
        </p>
      )}

      {errore && (
        <p className={`${styles.stato} ${styles.errore}`} role="alert" data-testid="checklist-error">
          {errore}
        </p>
      )}

      {!loading && voci.length === 0 && (
        <p className={styles.stato} data-testid="checklist-empty">
          Nessuna attrezzatura suggerita per questa esperienza.
        </p>
      )}

      {!loading && voci.length > 0 && (
        <ul className={styles.list} data-testid="checklist-list">
          {voci.map((voce, indice) => (
            <li className={styles.item} key={voce.equipment} data-testid="checklist-item">
              <input
                id={`attrezzo-${indice}`}
                type="checkbox"
                checked={Boolean(voce.packed)}
                onChange={() => handleToggle(voce)}
                data-testid="equipment-checkbox"
              />
              <label
                className={voce.packed ? styles.spuntato : undefined}
                htmlFor={`attrezzo-${indice}`}
              >
                {voce.equipment}
              </label>
            </li>
          ))}
        </ul>
      )}

      {messaggio && (
        <p className={styles.stato} role="status" data-testid="checklist-status">
          {messaggio}
        </p>
      )}
    </Modal>
  );
}

export default EquipmentModal;
