import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentSession, getRole, onAuthChange, signOut as esci } from '../lib/supabase.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(true);

  const applicaSessione = useCallback(async (nuovaSessione) => {
    setSession(nuovaSessione);
    if (nuovaSessione?.user) {
      try {
        setRole(await getRole(nuovaSessione.user.id));
      } catch {
        setRole('user');
      }
    } else {
      setRole('user');
    }
  }, []);

  const aggiornaSessione = useCallback(async () => {
    await applicaSessione(await getCurrentSession());
  }, [applicaSessione]);

  useEffect(() => {
    let attivo = true;

    getCurrentSession()
      .then(async (sessioneIniziale) => {
        if (!attivo) return;
        await applicaSessione(sessioneIniziale);
        if (attivo) setLoading(false);
      })
      .catch(() => {
        if (attivo) setLoading(false);
      });

    const { data } = onAuthChange((_evento, sessione) => {
      applicaSessione(sessione);
    });

    return () => {
      attivo = false;
      data.subscription.unsubscribe();
    };
  }, [applicaSessione]);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      role,
      loading,
      aggiornaSessione,
      signOut: esci,
    }),
    [session, role, loading, aggiornaSessione],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contesto = useContext(AuthContext);
  if (!contesto) throw new Error('useAuth va usato dentro AuthProvider.');
  return contesto;
}
