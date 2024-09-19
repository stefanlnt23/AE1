'use client';

import styles from '../createHotel.module.css';

export default function Description({ hotel, handleChange, errors }) {
  console.log('Rendering Description component with hotel:', hotel);

  const handleInputChange = (e) => {
    console.log('Description input change:', e.target.name, e.target.value);
    handleChange(e);
  };

  return (
    <div className={styles['form-group']}>
      <label htmlFor="description">Description:</label>
      <textarea
        id="description"
        name="description"
        value={hotel.description}
        onChange={handleInputChange}
        required
        className={`${styles['form-control']} ${errors.description ? styles['error-input'] : ''}`}
        rows="6"
        placeholder="Enter hotel description"
      />
      {errors.description && <p className={styles.error}>{errors.description}</p>}
    </div>
  );
}