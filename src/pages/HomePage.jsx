import styles from '../styles/page.module.css';

function HomePage() {
  return (
    <section className={styles.page} data-testid="home-page">
      <h2 className={styles.title}>Prossime esperienze</h2>
      <p className={styles.text}>Le gite del gruppo appariranno qui.</p>
    </section>
  );
}

export default HomePage;
