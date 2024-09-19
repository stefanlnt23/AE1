'use client';

import { useState } from 'react';
import {
  fetchBookingsAndHotels,
  cancelBooking,
  modifyBooking,
  fetchBookingDetails,
  updateBooking,
  checkAvailability,
  createBooking
} from '@/utils';

export function useBookingAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleApiCall = async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunction(...args);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const fetchUserBookings = (userId) => handleApiCall(fetchBookingsAndHotels, userId);
  const cancelUserBooking = (bookingId) => handleApiCall(cancelBooking, bookingId);
  const modifyUserBooking = (bookingId, newCheckIn, newCheckOut) => handleApiCall(modifyBooking, bookingId, newCheckIn, newCheckOut);
  const fetchUserBookingDetails = (bookingId) => handleApiCall(fetchBookingDetails, bookingId);
  const updateUserBooking = (bookingId, bookingData) => handleApiCall(updateBooking, bookingId, bookingData);
  const checkRoomAvailability = (hotelId, checkIn, checkOut, roomType) => handleApiCall(checkAvailability, hotelId, checkIn, checkOut, roomType);
  const createUserBooking = (bookingData) => handleApiCall(createBooking, bookingData);

  return {
    loading,
    error,
    fetchUserBookings,
    cancelUserBooking,
    modifyUserBooking,
    fetchUserBookingDetails,
    updateUserBooking,
    checkRoomAvailability,
    createUserBooking
  };
}