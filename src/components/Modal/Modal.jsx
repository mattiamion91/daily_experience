import styles from './Modal.module.css';

function Modal({ children, labelledBy, testId = 'modal' }) {
  return (
    <div className={styles.overlay} data-testid={testId}>
      <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
        {children}
      </div>
    </div>
  );
}

export default Modal;
