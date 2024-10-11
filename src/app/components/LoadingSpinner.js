// C:\Users\sefan\Desktop\AE1\AE1\src\app\components\LoadingSpinner.js
'use client';

import styles from './LoadingSpinner.module.css';

export default function LoadingSpinner() {
  return (
    <div className={styles.spinnerOverlay}>
      <div className={styles.spinner}></div>
    </div>
  );
}