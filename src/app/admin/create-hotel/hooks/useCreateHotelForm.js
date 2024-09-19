'use client';

import { useState, useCallback } from 'react';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { generateSearchable } from '@/utils/updateHotelsSearchable';
import { validatePhotoUrl } from '@/utils/validation';

export default function useCreateHotelForm() {
  const [activeTab, setActiveTab] = useState(0);
  const [hotel, setHotel] = useState({
    type: '',
    name: '',
    address: {
      country: '',
      region: '',
      city: '',
      street: '',
      nameNumber: ''
    },
    description: '',
    photos: [''],
    rooms: {
      single: { price: '', number: '', photos: [''] },
      double: { price: '', number: '', photos: [''] },
      king: { price: '', number: '', photos: [''] }
    }
  });
  const [errors, setErrors] = useState({});
  const [photoErrors, setPhotoErrors] = useState([]);
  const [roomPhotoErrors, setRoomPhotoErrors] = useState({
    single: [], double: [], king: []
  });
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const validateForm = () => {
    console.log('Validating form...');
    let formErrors = {};

    // Basic Info validation
    if (!hotel.type) formErrors.type = 'Please select an accommodation type';
    if (!hotel.name) formErrors.name = 'Please enter a hotel name';

    // Address validation
    Object.keys(hotel.address).forEach(field => {
      if (!hotel.address[field]) formErrors[`address.${field}`] = `Please enter the ${field}`;
    });

    // Description validation
    if (!hotel.description) formErrors.description = 'Please enter a description';

    // Photos validation
    if (hotel.photos.filter(photo => photo.trim() !== '').length === 0) {
      formErrors.photos = 'Please add at least one photo';
    } else if (photoErrors.some(error => error)) {
      formErrors.photos = 'Please correct photo URL errors';
    }

    // Rooms validation
    Object.keys(hotel.rooms).forEach(type => {
      if (!hotel.rooms[type].price) formErrors[`rooms.${type}.price`] = `Please enter a price for ${type} room`;
      if (!hotel.rooms[type].number) formErrors[`rooms.${type}.number`] = `Please enter the number of ${type} rooms`;
      if (hotel.rooms[type].photos.filter(photo => photo.trim() !== '').length === 0) {
        formErrors[`rooms.${type}.photos`] = `Please add at least one photo for ${type} room`;
      } else if (roomPhotoErrors[type].some(error => error)) {
        formErrors[`rooms.${type}.photos`] = `Please correct photo URL errors for ${type} room`;
      }
    });

    console.log('Validation errors:', formErrors);
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    console.log(`handleChange called: ${name} = ${value}`);
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setHotel(prev => {
        const newHotel = {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        };
        console.log('Updated hotel state:', newHotel);
        return newHotel;
      });
    } else {
      setHotel(prev => {
        const newHotel = { ...prev, [name]: value };
        console.log('Updated hotel state:', newHotel);
        return newHotel;
      });
    }
    // Clear error when field is updated
    setErrors(prev => ({ ...prev, [name]: '' }));
  }, []);

  const handleRoomChange = useCallback((type, field, value) => {
    console.log(`handleRoomChange called: ${type}.${field} = ${value}`);
    setHotel(prev => {
      const newHotel = {
        ...prev,
        rooms: {
          ...prev.rooms,
          [type]: {
            ...prev.rooms[type],
            [field]: value
          }
        }
      };
      console.log('Updated hotel state:', newHotel);
      return newHotel;
    });
    // Clear error when field is updated
    setErrors(prev => ({ ...prev, [`rooms.${type}.${field}`]: '' }));
  }, []);

  const handlePhotoChange = useCallback((index, value, error) => {
    console.log(`handlePhotoChange called: index ${index}, value ${value}, error ${error}`);
    setHotel(prev => ({
      ...prev,
      photos: prev.photos.map((photo, i) => i === index ? value : photo)
    }));
    setPhotoErrors(prev => {
      const newErrors = [...prev];
      newErrors[index] = error;
      return newErrors;
    });
    // Clear general photos error when a photo is updated
    setErrors(prev => ({ ...prev, photos: '' }));
  }, []);

  const handleRoomPhotoChange = useCallback((type, index, value, error) => {
    console.log(`handleRoomPhotoChange called: type ${type}, index ${index}, value ${value}, error ${error}`);
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
    setRoomPhotoErrors(prev => ({
      ...prev,
      [type]: prev[type].map((err, i) => i === index ? error : err)
    }));
    // Clear room photos error when a photo is updated
    setErrors(prev => ({ ...prev, [`rooms.${type}.photos`]: '' }));
  }, []);

  const addPhotoInput = useCallback(() => {
    console.log('addPhotoInput called');
    setHotel(prev => ({
      ...prev,
      photos: [...prev.photos, '']
    }));
    setPhotoErrors(prev => [...prev, null]);
  }, []);

  const addRoomPhotoInput = useCallback((type) => {
    console.log(`addRoomPhotoInput called for type ${type}`);
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
    setRoomPhotoErrors(prev => ({
      ...prev,
      [type]: [...prev[type], null]
    }));
  }, []);

  const removePhotoInput = useCallback((index) => {
    console.log(`removePhotoInput called for index ${index}`);
    setHotel(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
    setPhotoErrors(prev => prev.filter((_, i) => i !== index));
  }, []);

  const removeRoomPhotoInput = useCallback((type, index) => {
    console.log(`removeRoomPhotoInput called for type ${type}, index ${index}`);
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
    setRoomPhotoErrors(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    console.log('handleSubmit called');
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }
    console.log('Form validation passed, proceeding with submission');
    setIsLoading(true);
    const db = getFirestore();
    try {
      const hotelWithSearchable = {
        ...hotel,
        searchable: generateSearchable(hotel)
      };
      console.log('Submitting hotel data:', hotelWithSearchable);
      await addDoc(collection(db, 'hotels'), hotelWithSearchable);
      console.log('Hotel successfully added to Firestore');
      router.push('/admin/dashboard');
    } catch (error) {
      console.error('Error adding hotel: ', error);
      setErrors(prev => ({ ...prev, submit: 'Error creating hotel. Please try again.' }));
    } finally {
      setIsLoading(false);
    }
  }, [hotel, router]);

  return {
    activeTab,
    setActiveTab,
    hotel,
    errors,
    isLoading,
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