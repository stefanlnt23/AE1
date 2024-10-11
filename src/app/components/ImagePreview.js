// C:\Users\sefan\Desktop\AE1\AE1\src\app\components\ImagePreview.js
'use client';

import { useState } from 'react';
import styles from './ImagePreview.module.css';

export default function ImagePreview({ url }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className={styles.previewContainer}>
      {isLoading && <div className={styles.loading}>Loading...</div>}
      {hasError && <div className={styles.error}>Failed to load image</div>}
      <img
        src={url}
        alt="Preview"
        className={`${styles.previewImage} ${isLoading || hasError ? styles.hidden : ''}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
}