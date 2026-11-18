import { useState } from 'react';
import styles from './Admin.module.css';

const VALORI_INIZIALI = {
  name: '',
  date: '',
  image_url: '',
  location: '',
  description: '',
  departure_time: '',
  departure_place: '',
  arrival_place: '',
  difficulty: 'facile',
  duration_minutes: 0,
  path_length_km: 0,
  elevation_gain_m: 0,
};

function ExperienceForm({ esperienza, onSubmit, onAnnulla, pending }) {
  const [dati, setDati] = useState(() => ({
    ...VALORI_INIZIALI,
    ...(esperienza ?? {}),
    departure_time: esperienza?.departure_time?.slice(0, 5) ?? '',
  }));

  const cambia = (campo) => (event) => {
    setDati((precedenti) => ({ ...precedenti, [campo]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(dati);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} data-testid="admin-form">
      <h3 className={styles.formTitle} data-testid="admin-form-title">
        {esperienza ? 'Modifica esperienza' : 'Nuova esperienza'}
      </h3>

      <label className={styles.label} htmlFor="admin-name">Nome</label>
      <input
        className={styles.input}
        id="admin-name"
        data-testid="admin-field-name"
        type="text"
        required
        value={dati.name}
        onChange={cambia('name')}
      />

      <label className={styles.label} htmlFor="admin-date">Data</label>
      <input
        className={styles.input}
        id="admin-date"
        data-testid="admin-field-date"
        type="date"
        required
        value={dati.date}
        onChange={cambia('date')}
      />

      <label className={styles.label} htmlFor="admin-image-url">URL dell'immagine</label>
      <input
        className={styles.input}
        id="admin-image-url"
        data-testid="admin-field-image-url"
        type="url"
        placeholder="https://placehold.co/800x500/EA580C/FFFFFF?text=Gita"
        value={dati.image_url}
        onChange={cambia('image_url')}
      />

      <label className={styles.label} htmlFor="admin-location">Luogo</label>
      <input
        className={styles.input}
        id="admin-location"
        data-testid="admin-field-location"
        type="text"
        required
        value={dati.location}
        onChange={cambia('location')}
      />

      <label className={styles.label} htmlFor="admin-description">Descrizione</label>
      <textarea
        className={styles.input}
        id="admin-description"
        data-testid="admin-field-description"
        rows={3}
        value={dati.description}
        onChange={cambia('description')}
      />

      <label className={styles.label} htmlFor="admin-departure-time">Orario di partenza</label>
      <input
        className={styles.input}
        id="admin-departure-time"
        data-testid="admin-field-departure-time"
        type="time"
        value={dati.departure_time}
        onChange={cambia('departure_time')}
      />

      <label className={styles.label} htmlFor="admin-departure-place">Luogo di partenza</label>
      <input
        className={styles.input}
        id="admin-departure-place"
        data-testid="admin-field-departure-place"
        type="text"
        value={dati.departure_place}
        onChange={cambia('departure_place')}
      />

      <label className={styles.label} htmlFor="admin-arrival-place">Luogo di arrivo</label>
      <input
        className={styles.input}
        id="admin-arrival-place"
        data-testid="admin-field-arrival-place"
        type="text"
        value={dati.arrival_place}
        onChange={cambia('arrival_place')}
      />

      <label className={styles.label} htmlFor="admin-difficulty">Difficoltà</label>
      <select
        className={styles.input}
        id="admin-difficulty"
        data-testid="admin-field-difficulty"
        value={dati.difficulty}
        onChange={cambia('difficulty')}
      >
        <option value="facile">facile</option>
        <option value="media">media</option>
        <option value="difficile">difficile</option>
      </select>

      <label className={styles.label} htmlFor="admin-duration">Durata (minuti)</label>
      <input
        className={styles.input}
        id="admin-duration"
        data-testid="admin-field-duration-minutes"
        type="number"
        min="0"
        step="15"
        value={dati.duration_minutes}
        onChange={cambia('duration_minutes')}
      />

      <label className={styles.label} htmlFor="admin-path-length">Lunghezza percorso (km)</label>
      <input
        className={styles.input}
        id="admin-path-length"
        data-testid="admin-field-path-length-km"
        type="number"
        min="0"
        step="0.1"
        value={dati.path_length_km}
        onChange={cambia('path_length_km')}
      />

      <label className={styles.label} htmlFor="admin-elevation">Dislivello positivo (m)</label>
      <input
        className={styles.input}
        id="admin-elevation"
        data-testid="admin-field-elevation-gain-m"
        type="number"
        min="0"
        step="10"
        value={dati.elevation_gain_m}
        onChange={cambia('elevation_gain_m')}
      />

      <div className={styles.azioni}>
        <button
          className={styles.salva}
          type="submit"
          disabled={pending}
          data-testid="admin-save-button"
        >
          {pending ? 'Salvataggio…' : 'Salva esperienza'}
        </button>
        <button
          className={styles.annulla}
          type="button"
          onClick={onAnnulla}
          disabled={pending}
          data-testid="admin-cancel-button"
        >
          Annulla
        </button>
      </div>
    </form>
  );
}

export default ExperienceForm;
