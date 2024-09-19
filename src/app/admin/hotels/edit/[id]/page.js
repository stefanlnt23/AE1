'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStatus } from '@/lib/useAdminStatus';
import { useEditHotelForm } from '../hooks/useEditHotelForm';
import HotelBasicInfo from '../components/HotelBasicInfo';
import HotelAddress from '../components/HotelAddress';
import HotelDescription from '../components/HotelDescription';
import HotelPhotos from '../components/HotelPhotos';
import HotelRooms from '../components/HotelRooms';
import styles from './editHotel.module.css';

export default function EditHotel({ params }) {
  const router = useRouter();
  const { isAdmin, loading: adminLoading } = useAdminStatus();
  const {
    hotel,
    loading,
    error,
    handleChange,
    handleRoomChange,
    handlePhotoChange,
    handleRoomPhotoChange,
    addPhotoInput,
    addRoomPhotoInput,
    removePhotoInput,
    removeRoomPhotoInput,
    handleSubmit
  } = useEditHotelForm(params.id);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, adminLoading, router]);

  if (adminLoading || loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!isAdmin) {
    return <div className={styles.accessDenied}>Access Denied</div>;
  }

  if (!hotel) {
    return <div className={styles.notFound}>Hotel not found</div>;
  }

  return (
    <div className={styles.container}>
      <h1>Edit Hotel: {hotel.name}</h1>
      {error && <div className={styles.error}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <HotelBasicInfo hotel={hotel} handleChange={handleChange} />
        <HotelAddress hotel={hotel} handleChange={handleChange} />
        <HotelDescription hotel={hotel} handleChange={handleChange} />
        <HotelPhotos
          hotel={hotel}
          handlePhotoChange={handlePhotoChange}
          addPhotoInput={addPhotoInput}
          removePhotoInput={removePhotoInput}
        />
        <HotelRooms
          hotel={hotel}
          handleRoomChange={handleRoomChange}
          handleRoomPhotoChange={handleRoomPhotoChange}
          addRoomPhotoInput={addRoomPhotoInput}
          removeRoomPhotoInput={removeRoomPhotoInput}
        />
        <button type="submit" className={styles.submitButton}>Update Hotel</button>
      </form>
    </div>
  );
}