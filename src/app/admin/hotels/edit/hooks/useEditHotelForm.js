import { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export function useEditHotelForm(hotelId) {
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const db = getFirestore();
        const hotelDoc = await getDoc(doc(db, 'hotels', hotelId));
        if (hotelDoc.exists()) {
          const hotelData = { id: hotelDoc.id, ...hotelDoc.data() };
          // Ensure photos array exists for hotel and each room type
          hotelData.photos = hotelData.photos || [];
          Object.keys(hotelData.rooms).forEach(roomType => {
            hotelData.rooms[roomType].photos = hotelData.rooms[roomType].photos || [];
          });
          setHotel(hotelData);
        } else {
          router.push('/admin/hotels');
        }
      } catch (err) {
        setError('Error fetching hotel details.');
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, [hotelId, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setHotel(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setHotel(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRoomChange = (type, field, value) => {
    setHotel(prev => ({
      ...prev,
      rooms: {
        ...prev.rooms,
        [type]: {
          ...prev.rooms[type],
          [field]: value
        }
      }
    }));
  };

  const handlePhotoChange = (index, value) => {
    setHotel(prev => ({
      ...prev,
      photos: prev.photos.map((photo, i) => i === index ? value : photo)
    }));
  };

  const handleRoomPhotoChange = (type, index, value) => {
    setHotel(prev => ({
      ...prev,
      rooms: {
        ...prev.rooms,
        [type]: {
          ...prev.rooms[type],
          photos: prev.rooms[type].photos.map((photo, i) => i === index ? value : photo)
        }
      }
    }));
  };

  const addPhotoInput = () => {
    setHotel(prev => ({
      ...prev,
      photos: [...prev.photos, '']
    }));
  };

  const addRoomPhotoInput = (type) => {
    setHotel(prev => ({
      ...prev,
      rooms: {
        ...prev.rooms,
        [type]: {
          ...prev.rooms[type],
          photos: [...prev.rooms[type].photos, '']
        }
      }
    }));
  };

  const removePhotoInput = (index) => {
    setHotel(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const removeRoomPhotoInput = (type, index) => {
    setHotel(prev => ({
      ...prev,
      rooms: {
        ...prev.rooms,
        [type]: {
          ...prev.rooms[type],
          photos: prev.rooms[type].photos.filter((_, i) => i !== index)
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const db = getFirestore();
    try {
      await updateDoc(doc(db, 'hotels', hotel.id), hotel);
      alert('Hotel updated successfully!');
      router.push('/admin/hotels');
    } catch (error) {
      console.error('Error updating hotel: ', error);
      setError('Error updating hotel. Please try again.');
    }
  };

  return {
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
  };
}