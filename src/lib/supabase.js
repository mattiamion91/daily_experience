import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error('Configurazione Supabase mancante: controlla il file .env.');
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(erroreAuth(error.message));
  return data;
}

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(erroreAuth(error.message));
  return data;
}

export async function getCurrentSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(erroreAuth(error.message));
}

export async function getRole(userId) {
  const { data, error } = await supabase
    .from('weekend_profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data?.role ?? 'user';
}

export async function caricaEsperienze() {
  const { data, error } = await supabase
    .from('weekend_experiences')
    .select('*')
    .order('date', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export function erroreAuth(messaggio) {
  if (!messaggio) return 'Si è verificato un errore. Riprova.';
  if (/invalid login credentials/i.test(messaggio)) return 'Email o password non corretti.';
  if (/email not confirmed/i.test(messaggio)) return 'Conferma la tua email prima di accedere.';
  if (/user already registered/i.test(messaggio)) return 'Esiste già un account con questa email.';
  if (/password should be at least/i.test(messaggio)) return 'La password deve avere almeno 6 caratteri.';
  if (/failed to fetch|network/i.test(messaggio)) return 'Connessione non disponibile. Riprova.';
  return messaggio;
}
