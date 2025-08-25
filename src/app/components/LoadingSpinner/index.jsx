"use client";

import { CircularProgress } from '@mui/material';
import styles from './LoadingSpinner.module.scss';

export function LoadingSpinner({ size = 'medium', className = '' }) {
    const sizeMap = {
        small: 20,
        medium: 40,
        large: 60,
    };

    return (
        <div className={`${styles.spinnerContainer} ${className}`}>
            <CircularProgress 
                size={sizeMap[size] || sizeMap.medium}
                thickness={4}
                className={styles.spinner}
            />
        </div>
    );
}
