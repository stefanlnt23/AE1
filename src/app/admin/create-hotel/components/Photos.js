'use client';

import FormInput from '@/app/auth/components/FormInput';
import ImagePreview from '@/app/components/ImagePreview';
import { validatePhotoUrl } from '@/utils/validation';
import styles from '../createHotel.module.css';

export default function Photos({ photos = [], handlePhotoChange, addPhotoInput, removePhotoInput, errors }) {
  console.log('Rendering Photos component with photos:', photos);

  const handleChange = (index, value) => {
    console.log(`Photo change: index ${index}, value ${value}`);
    const error = validatePhotoUrl(value);
    handlePhotoChange(index, value, error);
  };

  const handleAddPhoto = () => {
    console.log('Add Photo button clicked');
    addPhotoInput();
  };

  const handleRemovePhoto = (index) => {
    console.log(`Remove Photo button clicked for index ${index}`);
    removePhotoInput(index);
  };

  return (
    <>
      <div className={styles['photos-container']}>
        {photos.map((photo, index) => (
          <div key={index} className={styles['photo-input-group']}>
            <FormInput
              type="url"
              name={`photos[${index}]`}
              value={photo}
              onChange={(e) => handleChange(index, e.target.value)}
              placeholder="Photo URL"
              error={errors.photos && errors.photos[index]}
            />
            {photo && <ImagePreview url={photo} />}
            <button 
              type="button" 
              onClick={() => handleRemovePhoto(index)} 
              className={`${styles.button} ${styles['button-danger']}`}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button 
        type="button" 
        onClick={handleAddPhoto} 
        className={`${styles.button} ${styles['button-secondary']}`}
      >
        Add Photo
      </button>
      {errors.photos && typeof errors.photos === 'string' && (
        <p className={styles.error}>{errors.photos}</p>
      )}
    </>
  );
}