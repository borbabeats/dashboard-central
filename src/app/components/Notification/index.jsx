'use client';

import { useEffect, useState } from 'react';
import styles from './styles.module.scss';

const Notification = ({ message, type = 'success', onClose, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(), 300); // Tempo para a animação de saída
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`${styles.notification} ${styles[type]}`}>
      <div className={styles.message}>{message}</div>
      <button 
        onClick={() => {
          setIsVisible(false);
          onClose();
        }} 
        className={styles.closeButton}
        aria-label="Fechar notificação"
      >
        &times;
      </button>
    </div>
  );
};

export default Notification;
