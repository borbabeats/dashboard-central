"use client";

import styles from './LoadingSpinner.module.scss';

export function LoadingSpinner({ size = 'medium', className = '' }) {
    const sizeClass = {
        small: styles.small,
        medium: styles.medium,
        large: styles.large,
    }[size] || styles.medium;

    return (
        <div className={`${styles.spinnerContainer} ${sizeClass} ${className}`}>
            <div className={styles.spinner}></div>
        </div>
    );
}
