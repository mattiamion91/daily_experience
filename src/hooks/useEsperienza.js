import { useEffect, useState } from 'react';
import { caricaEsperienza } from '../lib/supabase.js';

export function useEsperienza(id) {
  const [esperienza, setEsperienza] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errore, setErrore] = useState('');

  useEffect(() => {
    let attivo = true;
    setLoading(true);
    setErrore('');

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
  }, [id]);

  return { esperienza, loading, errore };
}
