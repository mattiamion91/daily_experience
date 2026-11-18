import { useState } from 'react';
import { signIn, signUp } from '../../lib/supabase.js';
import LoginModal from './LoginModal.jsx';
import RegisterModal from './RegisterModal.jsx';

function AuthModals({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const cambiaMode = (nuovoMode) => {
    setMode(nuovoMode);
    setError('');
    setSuccess('');
  };

  const handleLogin = async ({ email, password }) => {
    setPending(true);
    setError('');
    try {
      await signIn(email, password);
      onAuthenticated();
    } catch (errore) {
      setError(errore.message);
    } finally {
      setPending(false);
    }
  };

  const handleRegister = async (dati) => {
    if (dati.errore) {
      setError(dati.errore);
      return;
    }
    setPending(true);
    setError('');
    setSuccess('');
    try {
      const sessione = await signUp(dati.email, dati.password);
      if (sessione.session) {
        onAuthenticated();
      } else {
        setSuccess('Registrazione completata: conferma la tua email per accedere.');
      }
    } catch (errore) {
      setError(errore.message);
    } finally {
      setPending(false);
    }
  };

  if (mode === 'register') {
    return (
      <RegisterModal
        onSubmit={handleRegister}
        onSwitchToLogin={() => cambiaMode('login')}
        pending={pending}
        error={error}
        success={success}
      />
    );
  }

  return (
    <LoginModal
      onSubmit={handleLogin}
      onSwitchToRegister={() => cambiaMode('register')}
      pending={pending}
      error={error}
    />
  );
}

export default AuthModals;
