'use client';

import FormInput from '@/app/auth/components/FormInput';
import ImagePreview from '@/app/components/ImagePreview';
import { validatePhotoUrl } from '@/utils/validation';
import styles from '../createHotel.module.css';

export default function Rooms({ 
  hotel = {}, 
  handleRoomChange, 
  handleRoomPhotoChange, 
  addRoomPhotoInput, 
  removeRoomPhotoInput,
  errors = {}
}) {
  const roomTypes = ['single', 'double', 'king'];

  const handlePhotoChange = (type, index, value) => {
    console.log(`Room photo change: ${type}, ${index}, ${value}`);
    const error = validatePhotoUrl(value);
    handleRoomPhotoChange(type, index, value, error);
  };

  return (
    <>
      {roomTypes.map((type) => {
        const roomData = hotel.rooms && hotel.rooms[type] ? hotel.rooms[type] : { price: '', number: '', photos: [''] };
        return (
          <div key={type} className={styles['room-type']}>
            <h3>{type.charAt(0).toUpperCase() + type.slice(1)}</h3>
            <div className={styles['form-group']}>
              <FormInput
                type="number"
                id={`${type}-price`}
                name={`rooms.${type}.price`}
                value={roomData.price}
                onChange={(e) => {
                  console.log(`Room price change: ${type}, ${e.target.value}`);
                  handleRoomChange(type, 'price', e.target.value);
                }}
                placeholder="Price"
                error={errors[`rooms.${type}.price`]}
              />
            </div>
            <div className={styles['form-group']}>
              <FormInput
                type="number"
                id={`${type}-number`}
                name={`rooms.${type}.number`}
                value={roomData.number}
                onChange={(e) => {
                  console.log(`Room number change: ${type}, ${e.target.value}`);
                  handleRoomChange(type, 'number', e.target.value);
                }}
                placeholder="Number of Rooms"
                error={errors[`rooms.${type}.number`]}
              />
            </div>
            <h4>Room Photos</h4>
            <div className={styles['photos-container']}>
              {roomData.photos.map((photo, index) => (
                <div key={index} className={styles['photo-input-group']}>
                  <FormInput
                    type="url"
                    value={photo}
                    onChange={(e) => handlePhotoChange(type, index, e.target.value)}
                    placeholder="Photo URL"
                    error={errors.rooms && errors.rooms[type] && errors.rooms[type].photos && errors.rooms[type].photos[index]}
                  />
                  {photo && <ImagePreview url={photo} />}
                  <button 
                    type="button" 
                    onClick={() => removeRoomPhotoInput(type, index)} 
                    className={`${styles.button} ${styles['button-danger']}`}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button 
              type="button" 
              onClick={() => addRoomPhotoInput(type)} 
              className={`${styles.button} ${styles['button-secondary']}`}
            >
              Add Photo
            </button>
          </div>
        );
      })}
    </>
  );
}