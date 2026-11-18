import { createClient } from '@supabase/supabase-js';
import { slugify } from './slug.js';

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

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function caricaEsperienza(identificativo) {
  const colonna = UUID.test(identificativo) ? 'id' : 'slug';
  const { data, error } = await supabase
    .from('weekend_experiences')
    .select('*')
    .eq(colonna, identificativo)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Esperienza non trovata.');
  return data;
}

function normalizzaEsperienza(dati) {
  const voci = dati.suggested_equipment;
  const righe = Array.isArray(voci) ? voci : String(voci ?? '').split('\n');
  const suggerimenti = righe.map((voce) => String(voce).trim()).filter(Boolean);
  return {
    name: String(dati.name ?? '').trim(),
    slug: dati.slug ? slugify(dati.slug) : slugify(dati.name),
    date: dati.date ?? '',
    image_url: String(dati.image_url ?? '').trim(),
    location: String(dati.location ?? '').trim(),
    description: String(dati.description ?? '').trim(),
    departure_time: dati.departure_time || null,
    departure_place: String(dati.departure_place ?? '').trim(),
    arrival_place: String(dati.arrival_place ?? '').trim(),
    difficulty: dati.difficulty ?? 'facile',
    suggested_equipment: suggerimenti,
    duration_minutes: Number(dati.duration_minutes) || 0,
    path_length_km: Number(dati.path_length_km) || 0,
    elevation_gain_m: Number(dati.elevation_gain_m) || 0,
  };
}

export async function creaEsperienza(dati) {
  const { data, error } = await supabase
    .from('weekend_experiences')
    .insert(normalizzaEsperienza(dati))
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function aggiornaEsperienza(id, dati) {
  const { data, error } = await supabase
    .from('weekend_experiences')
    .update(normalizzaEsperienza(dati))
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function eliminaEsperienza(id) {
  const { error } = await supabase
    .from('weekend_experiences')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function caricaChecklist(userId, experienceId) {
  const { data, error } = await supabase
    .from('weekend_checklists')
    .select('*')
    .eq('user_id', userId)
    .eq('experience_id', experienceId)
    .order('equipment', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function salvaChecklistItem({ userId, experienceId, equipment, packed }) {
  const { data, error } = await supabase
    .from('weekend_checklists')
    .upsert(
      { user_id: userId, experience_id: experienceId, equipment, packed },
      { onConflict: 'user_id,experience_id,equipment' },
    )
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
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
