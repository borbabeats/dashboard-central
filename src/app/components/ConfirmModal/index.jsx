'use client';

import React from 'react';
import ReactModal from 'react-modal';
import styles from './styles.module.scss';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar ação',
  message = 'Tem certeza que deseja continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar'
}) => {
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      className={styles.modal}
      overlayClassName={styles.overlay}
      ariaHideApp={false}
    >
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.buttons}>
          <button 
            onClick={onClose}
            className={`${styles.button} ${styles.cancelButton}`}
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className={`${styles.button} ${styles.confirmButton}`}
            autoFocus
          >
            {confirmText}
          </button>
        </div>
      </div>
    </ReactModal>
  );
};

export default ConfirmModal;
