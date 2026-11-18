import { useState } from 'react';
import Modal from '../../components/Modal/Modal.jsx';
import styles from './AuthForm.module.css';

function LoginModal({ onSubmit, onSwitchToRegister, pending, error }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostraPassword, setMostraPassword] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ email: email.trim(), password });
  };

  return (
    <Modal labelledBy="titolo-login" testId="login-modal">
      <p className={styles.kicker}>Prossima Gita</p>
      <h2 className={styles.title} id="titolo-login">
        Bentornato nel gruppo
      </h2>
      <p className={styles.intro}>Accedi per vedere le prossime uscite e la tua checklist.</p>

      <form className={styles.form} onSubmit={handleSubmit} data-testid="login-form">
        <label className={styles.label} htmlFor="login-email">
          Email
        </label>
        <input
          className={styles.input}
          id="login-email"
          data-testid="login-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <label className={styles.label} htmlFor="login-password">
          Password
        </label>
        <input
          className={styles.input}
          id="login-password"
          data-testid="login-password"
          type={mostraPassword ? 'text' : 'password'}
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <label className={styles.checkbox} htmlFor="login-show-password">
          <input
            id="login-show-password"
            data-testid="login-show-password"
            type="checkbox"
            checked={mostraPassword}
            onChange={(event) => setMostraPassword(event.target.checked)}
          />
          Mostra password
        </label>

        {error && (
          <p className={styles.error} role="alert" data-testid="login-error">
            {error}
          </p>
        )}

        <button className={styles.primary} type="submit" disabled={pending} data-testid="login-submit">
          {pending ? 'Accesso in corso…' : 'Accedi'}
        </button>
      </form>

      <p className={styles.switch}>
        Non sei utente,{' '}
        <button className={styles.link} type="button" onClick={onSwitchToRegister} data-testid="go-to-register">
          registrati qui
        </button>
        .
      </p>

      <div className={styles.hint} data-testid="demo-credentials">
        <p className={styles.hintTitle}>Account demo</p>
        <p>admin@weekend.demo — admin</p>
        <p>user@weekend.demo — utente</p>
        <p>Password: Demo1234!</p>
      </div>
    </Modal>
  );
}

export default LoginModal;
