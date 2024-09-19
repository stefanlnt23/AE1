import React from 'react';
import styles from '../[id]/editHotel.module.css';

export default function HotelRooms({ 
  hotel, 
  handleRoomChange, 
  handleRoomPhotoChange, 
  addRoomPhotoInput, 
  removeRoomPhotoInput 
}) {
  return (
    <>
      <h2>Room Types</h2>
      {Object.entries(hotel.rooms).map(([type, room]) => (
        <div key={type} className={styles.roomType}>
          <h3>{type.charAt(0).toUpperCase() + type.slice(1)}</h3>
          <div className={styles.formGroup}>
            <label htmlFor={`${type}-price`}>Price:</label>
            <input
              type="number"
              id={`${type}-price`}
              value={room.price}
              onChange={(e) => handleRoomChange(type, 'price', e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor={`${type}-number`}>Number of Rooms:</label>
            <input
              type="number"
              id={`${type}-number`}
              value={room.number}
              onChange={(e) => handleRoomChange(type, 'number', e.target.value)}
            />
          </div>
          <h4>Room Photos</h4>
          {room.photos.map((photo, index) => (
            <div key={index} className={styles.formGroup}>
              <input
                type="url"
                value={photo}
                onChange={(e) => handleRoomPhotoChange(type, index, e.target.value)}
                placeholder="Photo URL"
              />
              <button type="button" onClick={() => removeRoomPhotoInput(type, index)} className={styles.removeButton}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => addRoomPhotoInput(type)} className={styles.addButton}>Add Photo</button>
        </div>
      ))}
    </>
  );
}