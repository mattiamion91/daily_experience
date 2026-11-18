import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { caricaEsperienze } from '../lib/supabase.js';

export function useEsperienze() {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;
  const [esperienze, setEsperienze] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errore, setErrore] = useState('');

  useEffect(() => {
    let attivo = true;
    setErrore('');

    // Le policy RLS mostrano le esperienze solo agli utenti autenticati.
    if (authLoading) return () => { attivo = false; };
    if (!userId) {
      setEsperienze([]);
      setLoading(false);
      return () => { attivo = false; };
    }

    setLoading(true);
    caricaEsperienze()
      .then((risultato) => {
        const ordinati = [...risultato].sort((a, b) => a.date.localeCompare(b.date));
        if (attivo) setEsperienze(ordinati);
      })
      .catch((erroreCaricamento) => {
        if (attivo) setErrore(erroreCaricamento.message);
      })
      .finally(() => {
        if (attivo) setLoading(false);
      });

    return () => {
      attivo = false;
    };
  }, [userId, authLoading]);

  return { esperienze, loading, errore };
}
