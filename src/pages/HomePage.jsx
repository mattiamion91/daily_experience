import ExperienceCard from '../features/experiences/ExperienceCard.jsx';
import { useEsperienze } from '../hooks/useEsperienze.js';
import page from '../styles/page.module.css';
import styles from '../features/experiences/ExperienceList.module.css';

function HomePage() {
  const { esperienze, loading, errore } = useEsperienze();

  return (
    <section className={page.page} data-testid="home-page">
      <h2 className={page.title}>Prossime esperienze</h2>
      <p className={styles.intro}>Dalla più vicina alla più lontana: scegli la prossima avventura con gli amici.</p>

      {loading && (
        <p className={styles.stato} data-testid="experience-loading">
          Caricamento delle esperienze…
        </p>
      )}

      {!loading && errore && (
        <p className={styles.errore} role="alert" data-testid="experience-error">
          Non siamo riusciti a caricare le esperienze. Riprova più tardi.
        </p>
      )}

      {!loading && !errore && esperienze.length === 0 && (
        <p className={styles.stato} data-testid="experience-empty">
          Nessuna esperienza in programma.
        </p>
      )}

      {!loading && !errore && esperienze.length > 0 && (
        <div className={styles.list} data-testid="experiences-list">
          {esperienze.map((esperienza) => (
            <ExperienceCard key={esperienza.id} esperienza={esperienza} />
          ))}
        </div>
      )}
    </section>
  );
}

export default HomePage;
