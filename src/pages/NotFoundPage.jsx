import { Link } from 'react-router-dom';
import styles from '../styles/page.module.css';

function NotFoundPage() {
  return (
    <section className={styles.page} data-testid="not-found-page">
      <h2 className={styles.title}>Pagina non trovata</h2>
      <p className={styles.text}>
        <Link to="/">Torna alle esperienze</Link>
      </p>
    </section>
  );
}

export default NotFoundPage;
