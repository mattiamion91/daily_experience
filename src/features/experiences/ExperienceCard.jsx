import { Link } from 'react-router-dom';
import { formattaData } from '../../lib/format.js';
import styles from './ExperienceCard.module.css';

function ExperienceCard({ esperienza }) {
  const immagine = esperienza.image_url || 'https://placehold.co/800x500/E5E7EB/6B7280?text=Esperienza';

  return (
    <article className={styles.card} data-testid="experience-card">
      <Link className={styles.link} to={`/esperienze/${esperienza.id}`} data-testid="experience-card-link">
        <div className={styles.imageWrapper}>
          <img
            className={styles.image}
            src={immagine}
            alt={`Anteprima di ${esperienza.name}`}
            loading="lazy"
            data-testid="experience-image"
          />
          <span className={styles.date} data-testid="experience-date">
            {formattaData(esperienza.date)}
          </span>
        </div>
        <div className={styles.body}>
          <h3 className={styles.name} data-testid="experience-name">
            {esperienza.name}
          </h3>
          <p className={styles.location} data-testid="experience-location">
            <span aria-hidden="true">⌖</span> {esperienza.location}
          </p>
        </div>
      </Link>
    </article>
  );
}

export default ExperienceCard;
