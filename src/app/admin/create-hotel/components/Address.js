'use client';

import FormInput from '@/app/auth/components/FormInput';
import styles from '../createHotel.module.css';

export default function Address({ hotel, handleChange, errors }) {
  console.log('Rendering Address component with hotel:', hotel);

  const addressFields = ['country', 'region', 'city', 'street', 'nameNumber'];

  const handleInputChange = (e) => {
    console.log('Address input change:', e.target.name, e.target.value);
    handleChange(e);
  };

  return (
    <>
      {addressFields.map((field) => (
        <FormInput
          key={field}
          type="text"
          id={`address.${field}`}
          name={`address.${field}`}
          value={hotel.address[field]}
          onChange={handleInputChange}
          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          required
          error={errors[`address.${field}`]}
        />
      ))}
    </>
  );
}