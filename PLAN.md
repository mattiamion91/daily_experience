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

## M4 — Dettaglio esperienza e checklist personale ✔
- [✔] Crea `weekend_checklists` con RLS per singolo utente e inserisci l'attrezzatura di default per le 3 esperienze.
- [✔] Crea la pagina `/esperienze/:id` con foto, nome, descrizione, data, orario di partenza, luogo di partenza e luogo di arrivo.
- [✔] Aggiungi la sezione dati tecnici (difficoltà, durata, lunghezza percorso, dislivello positivo) e il bottone che apre la modale "Attrezzatura consigliata".
- [✔] Implementa la checklist con checkbox persistenti, personale per utente ed esperienza, con feedback di salvataggio.

## M5 — Pannello admin CRUD ✔
- [✔] Implementa la guardia di `/admin` basata su `weekend_profiles.role`, con accesso negato e redirect per gli utenti normali.
- [✔] Crea la vista admin con elenco esperienze e form di creazione e modifica di tutti i campi, incluso l'URL dell'immagine.
- [✔] Implementa aggiornamento e cancellazione tramite chiamate REST Supabase, con conferma e messaggi di esito.
- [✔] Verifica che solo un admin possa scrivere (RLS) e che le modifiche appaiano nella lista delle esperienze.

## M6 — Correzioni dalla verifica finale ✔
- [✔] Correggi il test che fallisce: M1.spec.js › la rotta admin mostra il pannello
- [✔] Correggi il test che fallisce: M1.spec.js › una rotta sconosciuta mostra il fallback e torna alla home

## M7 — Slug leggibile e modale di login essenziale ✔
- [✔] Aggiungi la colonna `slug` a `weekend_experiences` con valori generati dal nome e mantieni valide le vecchie URL con ID.
- [✔] Usa lo slug nelle card e nella pagina di dettaglio, generandolo automaticamente dal form admin.
- [✔] Rimuovi il riquadro degli account demo dalla modale di login e verifica build e test.

## M8 — Correzioni dalla verifica finale ✔
- [✔] Correggi il test che fallisce: M1.spec.js › la rotta di dettaglio mostra l’identificativo dell’esperienza

## M9 — Ritorno alla lista esperienze ✔
- [✔] Aggiungi il pulsante "Torna a lista esperienze" nella pagina di dettaglio, anche in caso di errore, con `data-testid` dedicato.
- [✔] Rendi cliccabile il logo dell'header: al click torna alla lista esperienze, mantenendo icona, testo e accessibilità.
- [✔] Aggiorna README.md e verifica build e test delle milestone precedenti.

## M10 — Attrezzatura modificabile e card desktop ✔
- [✔] Aggiungi `suggested_equipment` a `weekend_experiences` con i suggerimenti attuali, esponilo nelle API e mantieni il fallback per i vecchi dati.
- [✔] Permetti all'admin di aggiungere e modificare l'attrezzatura consigliata dal form; la modale del dettaglio legge i suggerimenti dal database.
- [✔] Correggi il layout desktop delle card: immagine dentro la sua colonna e card della stessa altezza; verifica build e test.

## M11 — Caricamento esperienze dopo il login ✔
- [✔] Ricarica esperienze e dettaglio quando cambia l'utente autenticato, evitando la query anonima che restituisce zero righe a causa delle policy RLS.
- [✔] Aggiungi un test end-to-end che faccia il login dalla modale e verifichi le esperienze senza refresh; controlla build e test delle milestone precedenti.

## M12 — Nessuna sottolineatura al passaggio sul titolo ✔
- [✔] Rimuovi l'effetto hover che sottolinea "Prossima Gita" nell'header, mantenendo il link cliccabile e l'accessibilità.
- [✔] Aggiungi un test end-to-end che verifichi l'assenza della sottolineatura in hover; controlla build e test delle milestone precedenti.
