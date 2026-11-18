import { useParams } from 'react-router-dom';
import styles from '../styles/page.module.css';

function ExperienceDetailPage() {
  const { id } = useParams();

  return (
    <section className={styles.page} data-testid="experience-detail-page">
      <h2 className={styles.title}>Dettaglio esperienza</h2>
      <p className={styles.text}>Scheda in preparazione per l'esperienza {id}.</p>
    </section>
  );
}

export default ExperienceDetailPage;
