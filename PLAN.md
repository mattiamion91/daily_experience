# Piano

Memoria del progetto: cosa è fatto e cosa resta.
Una milestone = un risultato visibile e testabile nel browser, piccolo (3-5 task, 30-90 min di lavoro).
Le milestone aggiungono funzionalità usando i punti di estensione creati in M1. Le modifiche necessarie alle precedenti vanno indicate esplicitamente nelle task del piano da approvare, preservando gli altri comportamenti completati.
Titoli: `## M<numero> — Titolo`. Il loop aggiunge ✔ (superata) o ✘ (bloccata), e a fine piano può aggiungere milestone "Correzioni dalla verifica finale".

Stati delle task (cambiali con `node .agent/loop.mjs task <n> inizia|fatta|errore`, mai a mano):
`- [ ]` da fare · `- [➤]` in lavorazione (al massimo una) · `- [✔]` completata · `- [✘]` non completata o con errori

## M1 — Scheletro React, design token e rotte ✔
- [✔] Inizializza Vite + React, installa `react-router-dom` e `@supabase/supabase-js`, crea `.env` e `.env.example` con URL e publishable key del progetto Supabase collegato.
- [✔] Crea il client Supabase in `src/lib/`, i design token CSS da DESIGN.md e il layout mobile-first con header.
- [✔] Definisci le rotte `/`, `/esperienze/:id` e `/admin` con pagine segnaposto e le cartelle modulo/componenti come punti di estensione.
- [✔] Aggiungi `data-testid` alle regioni chiave e verifica build e avvio senza errori.

## M2 — Autenticazione con Supabase ✔
- [✔] Crea `weekend_profiles` con trigger su `auth.users`, policy RLS e colonna `role`; crea via SQL gli account demo admin e user.
- [✔] Implementa la modale di login con email, password, checkbox "Mostra password" e link "Non sei utente, registrati qui".
- [✔] Implementa la modale di registrazione con email, password, conferma password, checkbox "Mostra password" e validazione.
- [✔] Mostra la modale di login come prima cosa per chi non è autenticato; gestisci sessione persistente, stato di caricamento e logout.

## M3 — Esperienze: tabella, seed e lista card ✔
- [✔] Crea `weekend_experiences` con RLS di lettura per gli utenti autenticati e inserisci le 3 esperienze (Colli di Valdobbiadene, Lagorai, Alpago) con URL placeholder e date future.
- [✔] Crea la pagina `/` con card ordinate per data crescente contenenti nome, data, foto anteprima e luogo.
- [✔] Gestisci caricamento, stato vuoto ed errori; collega il click della card alla rotta di dettaglio con `data-testid` dedicati.

## M4 — Dettaglio esperienza e checklist personale
- [ ] Crea `weekend_checklists` con RLS per singolo utente e inserisci l'attrezzatura di default per le 3 esperienze.
- [ ] Crea la pagina `/esperienze/:id` con foto, nome, descrizione, data, orario di partenza, luogo di partenza e luogo di arrivo.
- [ ] Aggiungi la sezione dati tecnici (difficoltà, durata, lunghezza percorso, dislivello positivo) e il bottone che apre la modale "Attrezzatura consigliata".
- [ ] Implementa la checklist con checkbox persistenti, personale per utente ed esperienza, con feedback di salvataggio.

## M5 — Pannello admin CRUD
- [ ] Implementa la guardia di `/admin` basata su `weekend_profiles.role`, con accesso negato e redirect per gli utenti normali.
- [ ] Crea la vista admin con elenco esperienze e form di creazione e modifica di tutti i campi, incluso l'URL dell'immagine.
- [ ] Implementa aggiornamento e cancellazione tramite chiamate REST Supabase, con conferma e messaggi di esito.
- [ ] Verifica che solo un admin possa scrivere (RLS) e che le modifiche appaiano nella lista delle esperienze.
