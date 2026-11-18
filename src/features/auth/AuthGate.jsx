import AuthModals from './AuthModals.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

function AuthGate({ children }) {
  const { user, loading, aggiornaSessione } = useAuth();

  return (
    <>
      {children}
      {loading && (
        <p className="stato-caricamento" data-testid="auth-loading">
          Caricamento…
        </p>
      )}
      {!loading && !user && <AuthModals onAuthenticated={aggiornaSessione} />}
    </>
  );
}

export default AuthGate;
