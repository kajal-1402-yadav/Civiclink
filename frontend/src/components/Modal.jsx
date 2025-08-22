import React from "react";
import styles from "../styles/Modal.module.css";


function Modal({ isOpen, title = "", message = "", onClose, actions = [], closeBehavior = "close" }) {
  if (!isOpen) return null;

  const handleClose = () => {
    if (closeBehavior === "primary") {
      const primary = Array.isArray(actions) ? actions.find((a) => a.variant === 'primary') : null;
      if (primary && typeof primary.onClick === 'function') {
        primary.onClick();
        return;
      }
    }
    if (typeof onClose === 'function') onClose();
  };

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 id="modal-title" className={styles.title}>{title}</h3>
          <button className={styles.closeBtn} onClick={handleClose} aria-label="Close">×</button>
        </div>
        <div className={styles.body}>
          {typeof message === "string" ? <pre className={styles.message}>{message}</pre> : message}
        </div>
        <div className={styles.footer}>
          {actions && actions.length > 0 ? (
            actions.map((a, idx) => (
              <button
                key={idx}
                className={`${styles.actionBtn} ${a.variant === 'primary' ? styles.primary : ''}`}
                onClick={a.onClick || onClose}
              >
                {a.label}
              </button>
            ))
          ) : (
            <button className={`${styles.actionBtn} ${styles.primary}`} onClick={onClose}>OK</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Modal;
