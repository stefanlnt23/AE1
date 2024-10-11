// C:\Users\sefan\Desktop\AE1\AE1\src\app\admin\create-hotel\components\BasicInfo.js
'use client';

import FormInput from '@/app/auth/components/FormInput';
import styles from '../createHotel.module.css';

export default function BasicInfo({ hotel, handleChange, errors }) {
  console.log('Rendering BasicInfo component with hotel:', hotel);

  const handleInputChange = (e) => {
    console.log('BasicInfo input change:', e.target.name, e.target.value);
    handleChange(e);
  };

  return (
    <>
      <div className={styles['form-group']}>
        <label htmlFor="type">Accommodation Type:</label>
        <select
          id="type"
          name="type"
          value={hotel.type}
          onChange={handleInputChange}
          required
          className={styles['form-control']}
        >
          <option value="">Select Type</option>
          <option value="Hotel">Hotel</option>
          <option value="Hostel">Hostel</option>
          <option value="Campsite">Campsite</option>
          <option value="Apartment">Apartment</option>
        </select>
        {errors.type && <p className={styles.error}>{errors.type}</p>}
      </div>
      <FormInput
        type="text"
        id="name"
        name="name"
        value={hotel.name}
        onChange={handleInputChange}
        placeholder="Hotel Name"
        required
        error={errors.name}
      />
    </>
  );
}