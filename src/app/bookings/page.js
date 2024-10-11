// C:\Users\sefan\Desktop\AE1\AE1\src\app\bookings\page.js
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import styles from './bookings.module.css';
import { fetchBookingsAndHotels, cancelBooking, modifyBooking, formatDate, getDateString, checkAvailability } from '../components/bookingLogic';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [newCheckIn, setNewCheckIn] = useState('');
  const [newCheckOut, setNewCheckOut] = useState('');
  const [toast, setToast] = useState({ message: '', type: '' });
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchBookings(user.uid);
      } else {
        setUser(null);
        setLoading(false);
        router.push('/auth/login'); // Redirect to login page if not authenticated
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchBookings = async (userId) => {
    try {
      const bookingsWithHotelDetails = await fetchBookingsAndHotels(userId);
      console.log('Fetched bookings:', bookingsWithHotelDetails);
      setBookings(bookingsWithHotelDetails);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await cancelBooking(bookingId);
        setBookings(bookings.filter(booking => booking.id !== bookingId));
        showToast('Booking cancelled successfully.', 'success');
      } catch (err) {
        console.error('Error cancelling booking:', err);
        showToast('Failed to cancel booking. Please try again.', 'error');
      }
    }
  };

  const handleModifyBooking = async (bookingId, newCheckIn, newCheckOut) => {
    const checkInDate = new Date(newCheckIn);
    const checkOutDate = new Date(newCheckOut);

    if (checkInDate >= checkOutDate) {
      showToast('Check-out date must be after check-in date.', 'error');
      return;
    }

    if (checkInDate < new Date()) {
      showToast('Check-in date must be in the future.', 'error');
      return;
    }

    try {
      const booking = selectedBooking;
      const bookedRooms = await checkAvailability(
        booking.hotelId,
        checkInDate,
        checkOutDate,
        booking.roomType
      );

      const availableRooms = booking.rooms - (bookedRooms[booking.roomType] || 0);

      if (availableRooms < booking.rooms) {
        showToast(`Only ${availableRooms} rooms available. Please select different dates.`, 'error');
        return;
      }

      const updatedDates = await modifyBooking(bookingId, newCheckIn, newCheckOut);
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, ...updatedDates }
          : booking
      ));
      showToast('Booking dates updated successfully!', 'success');
      setModalOpen(false);
    } catch (err) {
      console.error('Error modifying booking:', err);
      showToast(err.message || 'Failed to modify booking. Please try again.', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };

  if (loading) return <div className={styles.loading}>Loading your bookings...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!user) return null; // This prevents any flash of content while redirecting

  return (
    <div className={styles.bookingsPage}>
      <h1 className={styles.pageTitle}>My Luxurious Bookings</h1>
      {bookings.length === 0 ? (
        <p className={styles.noBookings}>You have no bookings yet. Time to plan your next luxurious getaway!</p>
      ) : (
        <ul className={styles.bookingsList}>
          {bookings.map(booking => (
            <li key={booking.id} className={styles.bookingItem}>
              <div className={styles.bookingHeader}>
                <h2 className={styles.hotelName}>{booking.hotelName || "Hotel Name Unavailable"}</h2>
                <span className={styles.bookingStatus}>Confirmed</span>
              </div>
              <div className={styles.bookingContent}>
                <div className={styles.bookingInfo}>
                  <p className={styles.hotelAddress}><i className="fas fa-map-marker-alt"></i> {booking.hotelAddress || "Address Unavailable"}</p>
                  <div className={styles.bookingDetails}>
                    <p><i className="fas fa-calendar-check"></i> Check-in: {formatDate(booking.checkIn)}</p>
                    <p><i className="fas fa-calendar-times"></i> Check-out: {formatDate(booking.checkOut)}</p>
                    <p><i className="fas fa-bed"></i> Room Type: {booking.roomType}</p>
                    <p><i className="fas fa-door-open"></i> Number of Rooms: {booking.rooms}</p>
                  </div>
                  <p className={styles.pricePaid}><i className="fas fa-tag"></i> Total Price: ${booking.totalAmount.toFixed(2)}</p>
                </div>
              </div>
              <div className={styles.bookingActions}>
                <button className={styles.cancelButton} onClick={() => handleCancelBooking(booking.id)}>
                  <i className="fas fa-times"></i> Cancel Booking
                </button>
                <button className={styles.modifyButton} onClick={() => {
                  setSelectedBooking(booking);
                  setNewCheckIn(getDateString(booking.checkIn));
                  setNewCheckOut(getDateString(booking.checkOut));
                  setModalOpen(true);
                }}>
                  <i className="fas fa-edit"></i> Modify Dates
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {modalOpen && selectedBooking && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Modify Booking Dates</h2>
            <label>
              Check-in:
              <input 
                type="date" 
                value={newCheckIn} 
                onChange={(e) => setNewCheckIn(e.target.value)}
              />
            </label>
            <label>
              Check-out:
              <input 
                type="date" 
                value={newCheckOut} 
                onChange={(e) => setNewCheckOut(e.target.value)}
              />
            </label>
            <div className={styles.modalActions}>
              <button onClick={() => handleModifyBooking(selectedBooking.id, newCheckIn, newCheckOut)}>
                Save Changes
              </button>
              <button onClick={() => setModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {toast.message && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}