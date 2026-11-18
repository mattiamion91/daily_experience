# Test

Elenco dei test e2e, aggiornato dal loop a ogni esecuzione: non modificarlo a mano.
`- [ ]` da fare · `- [➤]` in lavorazione · `- [✔]` passata · `- [✘]` fallita

## M1 — Scheletro React, design token e rotte
- [✔] M1 — Scheletro, rotte e stile › la home mostra header, contenitore principale e titolo
- [✔] M1 — Scheletro, rotte e stile › la rotta di dettaglio mostra l’identificativo dell’esperienza
- [✔] M1 — Scheletro, rotte e stile › la rotta admin mostra il pannello
- [✔] M1 — Scheletro, rotte e stile › una rotta sconosciuta mostra il fallback e torna alla home

## M2 — Autenticazione con Supabase
- [✔] M2 — Autenticazione › la modale di login appare per prima e permette accedi, mostra password ed esci
- [✔] M2 — Autenticazione › il link porta alla registrazione con conferma password e mostra password
- [✔] M2 — Autenticazione › la registrazione segnala password diverse
- [✔] M2 — Autenticazione › una sessione già presente mantiene l’utente autenticato

## M3 — Esperienze: tabella, seed e lista card
- [✔] M3 — Lista esperienze › mostra tre card ordinate per data con nome, foto e luogo
- [✔] M3 — Lista esperienze › il click su una card apre il dettaglio dell’esperienza
- [✔] M3 — Lista esperienze › mostra uno stato vuoto quando non ci sono esperienze
- [✔] M3 — Lista esperienze › mostra un errore se il caricamento fallisce

## M4 — Dettaglio esperienza e checklist personale
- [✔] M4 — Dettaglio e checklist › il dettaglio mostra tutte le informazioni e i dati tecnici
- [✔] M4 — Dettaglio e checklist › la modale mostra l’attrezzatura e salva lo stato della checkbox
- [✔] M4 — Dettaglio e checklist › la checklist salvata in precedenza risulta già spuntata

## M5 — Pannello admin CRUD
- [✔] M5 — Pannello admin CRUD › un utente normale vede accesso negato e può tornare alle esperienze
- [✔] M5 — Pannello admin CRUD › l’admin vede il pannello con l’elenco delle esperienze
- [✔] M5 — Pannello admin CRUD › l’admin crea un’esperienza compilando tutti i campi
- [✔] M5 — Pannello admin CRUD › l’admin modifica un’esperienza e il cambiamento appare nella lista pubblica
- [✔] M5 — Pannello admin CRUD › l’admin elimina un’esperienza solo dopo conferma

## M7 — Slug leggibile e modale di login essenziale
- [✔] M7 — Slug e login essenziale › il link della card mostra il nome dell’esperienza nella URL
- [✔] M7 — Slug e login essenziale › una vecchia URL con ID continua ad aprire il dettaglio
- [✔] M7 — Slug e login essenziale › il form admin genera lo slug dal nome
- [✔] M7 — Slug e login essenziale › la modale di login non mostra più gli account demo

## M9 — Ritorno alla lista esperienze
- [✔] M9 — Ritorno alla lista esperienze › il pulsante nel dettaglio torna alla lista esperienze
- [✔] M9 — Ritorno alla lista esperienze › il pulsante torna alla lista anche se il dettaglio non si carica
- [✔] M9 — Ritorno alla lista esperienze › il logo dell’header torna alla lista esperienze
- [✔] diagnosi desktop

## M10 — Attrezzatura modificabile e card desktop
- [✔] M10 — Attrezzatura modificabile e card desktop › l’admin aggiunge l’attrezzatura consigliata a una nuova esperienza
- [✔] M10 — Attrezzatura modificabile e card desktop › l’admin modifica l’attrezzatura consigliata di un’esperienza esistente
- [✔] M10 — Attrezzatura modificabile e card desktop › la modale mostra l’attrezzatura salvata per quell’esperienza
- [✔] M10 — Attrezzatura modificabile e card desktop › in desktop le card hanno la stessa dimensione e l’immagine non copre il testo
