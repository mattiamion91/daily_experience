import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import styles from './Header.module.css';

function Header() {
  const { user, signOut } = useAuth();
  const [errore, setErrore] = useState('');

  const handleLogout = async () => {
    setErrore('');
    try {
      await signOut();
    } catch {
      setErrore('Non è stato possibile uscire. Riprova.');
    }
  };

  return (
    <header className={styles.header} data-testid="app-header">
      <div className={styles.inner}>
        <Link
          className={styles.brand}
          to="/"
          aria-label="Prossima Gita, torna alla lista esperienze"
          data-testid="logo-link"
        >
          <span className={styles.mark} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 21s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12Z" />
              <circle cx="12" cy="9" r="2.5" fill="currentColor" stroke="none" />
            </svg>
          </span>
          <div className={styles.identity}>
            <p className={styles.eyebrow}>Il tuo weekend, con gli amici</p>
            <h1 className={styles.title}>Prossima Gita</h1>
          </div>
        </Link>
        {user && (
          <div className={styles.account}>
            <span className={styles.email} data-testid="user-email">
              {user.email}
            </span>
            <button className={styles.logout} type="button" onClick={handleLogout} data-testid="logout-button">
              Esci
            </button>
            {errore && (
              <span className={styles.errore} role="alert">
                {errore}
              </span>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
