// C:\Users\sefan\Desktop\AE1\AE1\src\app\admin\hotels\edit\components\HotelDescription.js
import React from 'react';
import styles from '../[id]/editHotel.module.css';

export default function HotelDescription({ hotel, handleChange }) {
  return (
    <div className={styles.formGroup}>
      <label htmlFor="description">Description:</label>
      <textarea
        id="description"
        name="description"
        value={hotel.description}
        onChange={handleChange}
        required
      />
    </div>
  );
}