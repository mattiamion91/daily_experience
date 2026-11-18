import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { caricaEsperienza } from '../lib/supabase.js';

export function useEsperienza(id) {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;
  const [esperienza, setEsperienza] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errore, setErrore] = useState('');

  useEffect(() => {
    let attivo = true;
    setErrore('');

    // Senza sessione la policy RLS restituisce nessun risultato: si attende il login.
    if (authLoading) return () => { attivo = false; };
    if (!userId) {
      setEsperienza(null);
      setLoading(true);
      return () => { attivo = false; };
    }

    setLoading(true);
    caricaEsperienza(id)
      .then((risultato) => {
        if (attivo) setEsperienza(risultato);
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
  }, [id, userId, authLoading]);

  return { esperienza, loading, errore };
}
