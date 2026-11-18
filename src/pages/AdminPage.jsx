import styles from '../styles/page.module.css';

function AdminPage() {
  return (
    <section className={styles.page} data-testid="admin-page">
      <h2 className={styles.title}>Pannello admin</h2>
      <p className={styles.text}>La gestione delle esperienze apparirà qui.</p>
    </section>
  );
}

export default AdminPage;
