import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEsperienza } from '../hooks/useEsperienza.js';
import { useAuth } from '../context/AuthContext.jsx';
import EquipmentModal from '../features/checklist/EquipmentModal.jsx';
import { formattaData, formattaDurata, formattaOrario } from '../lib/format.js';
import page from '../styles/page.module.css';
import styles from '../features/experiences/ExperienceDetail.module.css';

function ExperienceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { esperienza, loading, errore } = useEsperienza(id);
  const [modaleAperta, setModaleAperta] = useState(false);
  const tornaAllaLista = () => navigate('/');

  if (loading) {
    return (
      <section className={page.page} data-testid="experience-detail-page">
        <h2 className={page.title}>Dettaglio esperienza</h2>
        <p className={page.text}>Caricamento dell'esperienza…</p>
        <p className={page.text} data-testid="detail-identifier">
          {id}
        </p>
      </section>
    );
  }

  if (errore) {
    return (
      <section className={page.page} data-testid="experience-detail-page">
        <button className={styles.back} type="button" onClick={tornaAllaLista} data-testid="back-to-list-button">
          Torna a lista esperienze
        </button>
        <h2 className={page.title}>Dettaglio esperienza</h2>
        <p className={page.text} role="alert" data-testid="detail-error">
          {errore}
        </p>
        <p className={page.text} data-testid="detail-identifier">
          {id}
        </p>
      </section>
    );
  }

  return (
    <section className={styles.page} data-testid="experience-detail-page">
      <button className={styles.back} type="button" onClick={tornaAllaLista} data-testid="back-to-list-button">
        Torna a lista esperienze
      </button>
      <img
        className={styles.image}
        src={esperienza.image_url}
        alt={esperienza.name}
        data-testid="detail-image"
      />
      <div>
        <h2 className={styles.title} data-testid="detail-name">
          {esperienza.name}
        </h2>
        <p className={page.text} data-testid="detail-identifier">
          {id}
        </p>
        <p className={styles.description} data-testid="detail-description">
          {esperienza.description}
        </p>
      </div>

      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <p className={styles.label}>Data</p>
          <p className={styles.value} data-testid="detail-date">
            {formattaData(esperienza.date)}
          </p>
        </div>
        <div className={styles.infoItem}>
          <p className={styles.label}>Orario di partenza</p>
          <p className={styles.value} data-testid="detail-departure-time">
            {formattaOrario(esperienza.departure_time)}
          </p>
        </div>
        <div className={styles.infoItem}>
          <p className={styles.label}>Luogo di partenza</p>
          <p className={styles.value} data-testid="detail-departure-place">
            {esperienza.departure_place}
          </p>
        </div>
        <div className={styles.infoItem}>
          <p className={styles.label}>Luogo di arrivo</p>
          <p className={styles.value} data-testid="detail-arrival-place">
            {esperienza.arrival_place}
          </p>
        </div>
      </div>

      <section className={styles.section} data-testid="technical-section">
        <h3 className={styles.sectionTitle}>Dati tecnici</h3>
        <div className={styles.techGrid}>
          <div className={styles.infoItem}>
            <p className={styles.label}>Difficoltà</p>
            <p className={styles.value} data-testid="detail-difficulty">
              {esperienza.difficulty}
            </p>
          </div>
          <div className={styles.infoItem}>
            <p className={styles.label}>Durata esperienza</p>
            <p className={styles.value} data-testid="detail-duration">
              {formattaDurata(esperienza.duration_minutes)}
            </p>
          </div>
          <div className={styles.infoItem}>
            <p className={styles.label}>Lunghezza percorso</p>
            <p className={styles.value} data-testid="detail-path-length">
              {esperienza.path_length_km} km
            </p>
          </div>
          <div className={styles.infoItem}>
            <p className={styles.label}>Dislivello positivo</p>
            <p className={styles.value} data-testid="detail-elevation-gain">
              {esperienza.elevation_gain_m} m
            </p>
          </div>
        </div>
      </section>

      <button
        className={styles.action}
        type="button"
        onClick={() => setModaleAperta(true)}
        data-testid="open-equipment-button"
      >
        Attrezzatura consigliata
      </button>

      {modaleAperta && (
        <EquipmentModal
          onClose={() => setModaleAperta(false)}
          esperienza={esperienza}
          user={user}
        />
      )}
    </section>
  );
}

export default ExperienceDetailPage;
