import React from 'react';
import styles from '../[id]/editHotel.module.css';

export default function HotelAddress({ hotel, handleChange }) {
  return (
    <>
      <h2>Address</h2>
      {['country', 'region', 'city', 'street', 'nameNumber'].map((field) => (
        <div key={field} className={styles.formGroup}>
          <label htmlFor={`address.${field}`}>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
          <input
            type="text"
            id={`address.${field}`}
            name={`address.${field}`}
            value={hotel.address[field]}
            onChange={handleChange}
            required
          />
        </div>
      ))}
    </>
  );
}