import { useState } from 'react';
import Modal from '../../components/Modal/Modal.jsx';
import styles from './AuthForm.module.css';

function RegisterModal({ onSubmit, onSwitchToLogin, pending, error, success }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [conferma, setConferma] = useState('');
  const [mostraPassword, setMostraPassword] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (password !== conferma) {
      onSubmit({ errore: 'Le password non coincidono.' });
      return;
    }
    onSubmit({ email: email.trim(), password });
  };

  return (
    <Modal labelledBy="titolo-registrazione" testId="register-modal">
      <p className={styles.kicker}>Unisciti al gruppo</p>
      <h2 className={styles.title} id="titolo-registrazione">
        Crea il tuo account
      </h2>
      <p className={styles.intro}>Ti bastano email e password per partire.</p>

      <form className={styles.form} onSubmit={handleSubmit} data-testid="register-form">
        <label className={styles.label} htmlFor="register-email">
          Email
        </label>
        <input
          className={styles.input}
          id="register-email"
          data-testid="register-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <label className={styles.label} htmlFor="register-password">
          Password
        </label>
        <input
          className={styles.input}
          id="register-password"
          data-testid="register-password"
          type={mostraPassword ? 'text' : 'password'}
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <label className={styles.label} htmlFor="register-confirm-password">
          Conferma password
        </label>
        <input
          className={styles.input}
          id="register-confirm-password"
          data-testid="register-confirm-password"
          type={mostraPassword ? 'text' : 'password'}
          autoComplete="new-password"
          required
          minLength={6}
          value={conferma}
          onChange={(event) => setConferma(event.target.value)}
        />

        <label className={styles.checkbox} htmlFor="register-show-password">
          <input
            id="register-show-password"
            data-testid="register-show-password"
            type="checkbox"
            checked={mostraPassword}
            onChange={(event) => setMostraPassword(event.target.checked)}
          />
          Mostra password
        </label>

        {error && (
          <p className={styles.error} role="alert" data-testid="register-error">
            {error}
          </p>
        )}

        {success && (
          <p className={styles.success} role="status" data-testid="register-success">
            {success}
          </p>
        )}

        <button className={styles.primary} type="submit" disabled={pending} data-testid="register-submit">
          {pending ? 'Registrazione in corso…' : 'Registrati'}
        </button>
      </form>

      <p className={styles.switch}>
        Hai già un account?{' '}
        <button className={styles.link} type="button" onClick={onSwitchToLogin} data-testid="go-to-login">
          Accedi
        </button>
        .
      </p>
    </Modal>
  );
}

export default RegisterModal;
