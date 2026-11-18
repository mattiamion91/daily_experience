---
stack: modern
skills: supabase
tempo: 2h
---

# Prossima Gita

## Obiettivo
Web app mobile-first per un gruppo di amici che organizza e segue gite e uscite il sabato o la domenica: tutti gli utenti autenticati vedono le stesse esperienze, ma ciascuno ha la propria checklist di attrezzatura.

## Funzionalità principali
- Modale di login come prima schermata per chi non è autenticato, con link alla registrazione.
- Registrazione con email, password, conferma password e checkbox "Mostra password" sia in login sia in registrazione.
- Lista delle esperienze ordinata dalla data più prossima a oggi alla più lontana; ogni card mostra nome, data, foto anteprima e luogo.
- Dettaglio esperienza con foto, nome, descrizione, data, orario di partenza, luogo di partenza e luogo di arrivo.
- Sezione dati tecnici: difficoltà, durata esperienza, lunghezza percorso, dislivello positivo.
- Modale "Attrezzatura consigliata" con checklist spuntabile, personale e unica per ogni utente.
- Pannello admin con CRUD completo delle esperienze tramite REST API Supabase, accessibile solo con ruolo `admin`.
- Tre esperienze iniziali: Colli di Valdobbiadene, Lagorai, Alpago.

## Vincoli
- Lingua dell'interfaccia: italiano.
- Dispositivi: mobile first (da 360 px in su), layout responsive anche su desktop.
- Cose da NON fare: upload di immagini (per ora solo URL), chat, prenotazioni, pagamenti, modifica delle esperienze da parte di utenti non admin.
- Tabelle Supabase da creare, esattamente: `weekend_profiles`, `weekend_experiences`, `weekend_checklists`. Non toccare le tabelle esistenti di altri progetti.
- Progetto Supabase collegato: `https://nqvpuiehktxzjlddxczj.supabase.co`. Nel client usare solo la chiave publishable/anon, mai una service role key.

## Design
Vedi DESIGN.md

## Note tecniche
- Stack: React + Vite, `react-router-dom`, `@supabase/supabase-js`.
- Dati e persistenza: Supabase Auth, Postgres con RLS e API REST PostgREST tramite client Supabase. Nessun dato dell'app in localStorage; la sessione è gestita da Supabase.
- Le migrazioni vengono applicate direttamente sul progetto collegato tramite MCP Supabase; non serve `db.sql`.
- Account demo creati via SQL (solo per collaudo): `admin@weekend.demo` / `Demo1234!` con ruolo admin, `user@weekend.demo` / `Demo1234!` con ruolo user.
- Le immagini sono salvate come URL nel campo `image_url` e per la prima versione usano un placeholder; l'admin potrà sostituirle in seguito dal pannello.
- Il pannello admin scrive sulle tabelle con le normali chiamate REST del client Supabase: la sicurezza è affidata alle policy RLS che verificano il ruolo admin.
- Test end-to-end Playwright in `.agent/tests/e2e`, uno per milestone, elementi interattivi identificati con `data-testid`.
