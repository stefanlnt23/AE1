// C:\Users\sefan\Desktop\AE1\AE1\src\app\components\ProgressBar.js
'use client';

import styles from './ProgressBar.module.css';

export default function ProgressBar({ steps, currentStep }) {
  return (
    <div className={styles.progressBarContainer}>
      {steps.map((step, index) => (
        <div 
          key={step} 
          className={`${styles.step} ${index <= currentStep ? styles.active : ''}`}
        >
          <div className={styles.stepNumber}>{index + 1}</div>
          <div className={styles.stepLabel}>{step}</div>
        </div>
      ))}
    </div>
  );
}