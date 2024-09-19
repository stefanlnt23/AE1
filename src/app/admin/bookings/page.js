'use client';

import { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, doc, getDoc, deleteDoc, query } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import styles from './adminBookings.module.css';

// Include formatDate function directly to avoid import issues
const formatDate = (date) => {
  if (date instanceof Date) {
    return date.toLocaleDateString();
  } else if (date && typeof date.toDate === 'function') {
    return date.toDate().toLocaleDateString();
  } else if (date && typeof date === 'string') {
    return new Date(date).toLocaleDateString();
  } else if (date && typeof date === 'object' && date.seconds) {
    return new Date(date.seconds * 1000).toLocaleDateString();
  }
  return 'Invalid Date';
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const fetchBookingsAndDetails = async () => {
    const db = getFirestore();
    const bookingsQuery = query(collection(db, 'bookings'));
    const bookingsSnap = await getDocs(bookingsQuery);

    const bookingsData = await Promise.all(bookingsSnap.docs.map(async (docSnap) => {
      const bookingData = { id: docSnap.id, ...docSnap.data() };
      
      // Fetch hotel data
      let hotelData = { name: 'Unknown', address: 'Unknown' };
      if (bookingData.hotelId) {
        const hotelRef = doc(db, 'hotels', bookingData.hotelId);
        const hotelSnap = await getDoc(hotelRef);
        if (hotelSnap.exists()) {
          const hotel = hotelSnap.data();
          hotelData = {
            name: hotel.name || 'Unknown',
            address: hotel.address ? `${hotel.address.street}, ${hotel.address.city}, ${hotel.address.country}` : 'Unknown'
          };
        }
      }

      // Fetch user data
      let userData = { name: 'Unknown' };
      if (bookingData.userId) {
        const userRef = doc(db, 'users', bookingData.userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const user = userSnap.data();
          userData = {
            name: user.username || user.email || 'Unknown'
          };
        }
      }

      return {
        id: docSnap.id,
        ...bookingData,
        hotelName: hotelData.name,
        hotelAddress: hotelData.address,
        userName: userData.name,
        checkIn: bookingData.checkIn?.toDate() || new Date(bookingData.checkIn),
        checkOut: bookingData.checkOut?.toDate() || new Date(bookingData.checkOut),
      };
    }));

    return bookingsData;
  };

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const bookingData = await fetchBookingsAndDetails();
        setBookings(bookingData);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Error fetching bookings: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  const handleEdit = (id) => {
    router.push(`/admin/bookings/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        const db = getFirestore();
        await deleteDoc(doc(db, 'bookings', id));
        setBookings(prev => prev.filter(booking => booking.id !== id));
        alert('Booking deleted successfully!');
      } catch (err) {
        console.error('Error deleting booking:', err);
        alert('Error deleting booking: ' + err.message);
      }
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;

  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <h1>All Bookings</h1>
      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User Name</th>
              <th>Hotel Name</th>
              <th>Hotel Address</th>
              <th>Check-in Date</th>
              <th>Check-out Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.userName}</td>
                <td>{booking.hotelName}</td>
                <td>{booking.hotelAddress}</td>
                <td>{formatDate(booking.checkIn)}</td>
                <td>{formatDate(booking.checkOut)}</td>
                <td>
                  <button onClick={() => handleEdit(booking.id)} className={styles.editButton}>Edit</button>
                  <button onClick={() => handleDelete(booking.id)} className={styles.deleteButton}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}