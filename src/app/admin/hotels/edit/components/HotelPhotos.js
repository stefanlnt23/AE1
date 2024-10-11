// C:\Users\sefan\Desktop\AE1\AE1\src\app\admin\hotels\edit\components\HotelPhotos.js
import React from 'react';
import styles from '../[id]/editHotel.module.css';

export default function HotelPhotos({ hotel, handlePhotoChange, addPhotoInput, removePhotoInput }) {
  return (
    <>
      <h2>Hotel Photos</h2>
      {hotel.photos.map((photo, index) => (
        <div key={index} className={styles.formGroup}>
          <input
            type="url"
            value={photo}
            onChange={(e) => handlePhotoChange(index, e.target.value)}
            placeholder="Photo URL"
          />
          <button type="button" onClick={() => removePhotoInput(index)} className={styles.removeButton}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={addPhotoInput} className={styles.addButton}>Add Photo</button>
    </>
  );
}