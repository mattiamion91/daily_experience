import styles from './Header.module.css';

function Header() {
  return (
    <header className={styles.header} data-testid="app-header">
      <div className={styles.inner}>
        <span className={styles.mark} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 21s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12Z" />
            <circle cx="12" cy="9" r="2.5" fill="currentColor" stroke="none" />
          </svg>
        </span>
        <div>
          <p className={styles.eyebrow}>Il tuo weekend, con gli amici</p>
          <h1 className={styles.title}>Prossima Gita</h1>
        </div>
      </div>
    </header>
  );
}

export default Header;
