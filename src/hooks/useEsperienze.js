import { useEffect, useState } from 'react';
import { caricaEsperienze } from '../lib/supabase.js';

export function useEsperienze() {
  const [esperienze, setEsperienze] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errore, setErrore] = useState('');

  useEffect(() => {
    let attivo = true;

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
  }, []);

  return { esperienze, loading, errore };
}
