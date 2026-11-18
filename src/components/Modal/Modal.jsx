import styles from './Modal.module.css';

function Modal({ children, labelledBy, testId = 'modal', onClose }) {
  return (
    <div className={styles.overlay} data-testid={testId}>
      <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
        {onClose && (
          <button
            className={styles.close}
            type="button"
            onClick={onClose}
            aria-label="Chiudi"
            data-testid="modal-close"
          >
            ×
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

export default Modal;
