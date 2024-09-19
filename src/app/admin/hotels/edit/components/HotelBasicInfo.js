import React from 'react';
import styles from '../[id]/editHotel.module.css';

export default function HotelBasicInfo({ hotel, handleChange }) {
  return (
    <>
      <div className={styles.formGroup}>
        <label htmlFor="type">Accommodation Type:</label>
        <select
          id="type"
          name="type"
          value={hotel.type}
          onChange={handleChange}
          required
        >
          <option value="Hotel">Hotel</option>
          <option value="Hostel">Hostel</option>
          <option value="Campsite">Campsite</option>
          <option value="Apartment">Apartment</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="name">Hotel Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={hotel.name}
          onChange={handleChange}
          required
        />
      </div>
    </>
  );
}