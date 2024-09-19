'use client';

import { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import styles from './EditBooking.module.css';
import { fetchBookingDetails, updateBooking, checkAvailability } from '../../../components/bookingLogic';

export default function EditBooking({ params }) {
  const [booking, setBooking] = useState(null);
  const [users, setUsers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = getFirestore();

        // Fetch booking data
        const bookingData = await fetchBookingDetails(id);
        setBooking(bookingData);

        // Fetch users and hotels for dropdowns
        const [usersSnap, hotelsSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'hotels'))
        ]);

        setUsers(usersSnap.docs.map(doc => ({
          id: doc.id,
          username: doc.data().username
        })));

        setHotels(hotelsSnap.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name
        })));

      } catch (err) {
        setError('Error fetching data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'checkIn' || name === 'checkOut') {
      setBooking(prev => ({
        ...prev,
        [name]: new Date(value)
      }));
    } else if (name === 'rooms') {
      setBooking(prev => ({
        ...prev,
        [name]: parseInt(value, 10)
      }));
    } else {
      setBooking(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!booking || !booking.hotelId || !booking.checkIn || !booking.checkOut || !booking.roomType || !booking.rooms) {
        setError('Missing required booking information');
        return;
      }

      // Check availability before updating
      const bookedRooms = await checkAvailability(
        booking.hotelId,
        booking.checkIn,
        booking.checkOut,
        booking.roomType
      );

      const availableRooms = booking.rooms - (bookedRooms[booking.roomType] || 0);

      if (availableRooms < booking.rooms) {
        setError(`Only ${availableRooms} rooms are available for the selected dates.`);
        return;
      }

      await updateBooking(id, booking);
      alert('Booking updated successfully!');
      router.push('/admin/bookings');
    } catch (err) {
      setError('Error updating booking: ' + err.message);
      console.error('Error updating booking:', err);
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;

  if (error) return <div className={styles.error}>{error}</div>;

  if (!booking) return <div className={styles.error}>Booking not found</div>;

  return (
    <div className={styles.editBooking}>
      <h1>Edit Booking</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="userId">User Name:</label>
          <select
            id="userId"
            name="userId"
            value={booking.userId || ''}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Select user</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.username}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="hotelId">Hotel Name:</label>
          <select
            id="hotelId"
            name="hotelId"
            value={booking.hotelId || ''}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Select hotel</option>
            {hotels.map(hotel => (
              <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="checkIn">Check-in Date:</label>
          <input
            type="date"
            id="checkIn"
            name="checkIn"
            value={booking.checkIn ? booking.checkIn.toISOString().split('T')[0] : ''}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="checkOut">Check-out Date:</label>
          <input
            type="date"
            id="checkOut"
            name="checkOut"
            value={booking.checkOut ? booking.checkOut.toISOString().split('T')[0] : ''}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="roomType">Room Type:</label>
          <input
            type="text"
            id="roomType"
            name="roomType"
            value={booking.roomType || ''}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="rooms">Number of Rooms:</label>
          <input
            type="number"
            id="rooms"
            name="rooms"
            value={booking.rooms || ''}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Update Booking</button>
      </form>
    </div>
  );
}