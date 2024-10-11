// C:\Users\sefan\Desktop\AE1\AE1\src\app\components\UserBookings.js
'use client';

import { useState, useEffect } from 'react';
import { useBookingAPI } from '@/hooks/useBookingAPI';
import { useAuth } from '@/hooks/useAuth';
import { withAuth } from '@/hocs/withAuth';
import LoadingSpinner from './LoadingSpinner';
import ConfirmationModal from './ConfirmationModal';
import styles from './UserBookings.module.css';

function UserBookings() {
  const { user } = useAuth();
  const {
    loading,
    error,
    fetchUserBookings,
    cancelUserBooking
  } = useBookingAPI();

  const [bookings, setBookings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  const loadBookings = async () => {
    try {
      const userBookings = await fetchUserBookings(user.uid);
      setBookings(userBookings);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  const handleCancelBooking = async () => {
    if (selectedBooking) {
      try {
        await cancelUserBooking(selectedBooking.id);
        setShowModal(false);
        setSelectedBooking(null);
        await loadBookings(); // Reload bookings after cancellation
      } catch (err) {
        console.error('Error cancelling booking:', err);
      }
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Your Bookings</h2>
      {bookings.length === 0 ? (
        <p className={styles.noBookings}>You have no bookings.</p>
      ) : (
        <ul className={styles.bookingList}>
          {bookings.map((booking) => (
            <li key={booking.id} className={styles.bookingItem}>
              <div className={styles.bookingInfo}>
                <h3>{booking.hotelName}</h3>
                <p>Check-in: {new Date(booking.checkIn).toLocaleDateString()}</p>
                <p>Check-out: {new Date(booking.checkOut).toLocaleDateString()}</p>
              </div>
              <button
                className={styles.cancelButton}
                onClick={() => {
                  setSelectedBooking(booking);
                  setShowModal(true);
                }}
              >
                Cancel Booking
              </button>
            </li>
          ))}
        </ul>
      )}
      {showModal && (
        <ConfirmationModal
          message="Are you sure you want to cancel this booking?"
          onConfirm={handleCancelBooking}
          onCancel={() => {
            setShowModal(false);
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
}

export default withAuth(UserBookings);