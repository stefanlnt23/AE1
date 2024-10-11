// C:\Users\sefan\Desktop\AE1\AE1\src\app\hotel\[id]\page.js
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getFirestore, doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import styles from './hotel.module.css';
import PaymentForm from '../../components/PaymentForm';
import { checkAvailability, createBooking } from '../../components/bookingLogic';
import ReviewSection from '../../components/ReviewSection';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {children}
        <button className={styles.closeButton} onClick={onClose}>×</button>
      </div>
    </div>
  );
};

export default function HotelDetails({ params, searchParams }) {
  const [hotel, setHotel] = useState(null);
  const [mainImage, setMainImage] = useState('');
  const [checkIn, setCheckIn] = useState(searchParams.checkIn || '');
  const [checkOut, setCheckOut] = useState(searchParams.checkOut || '');
  const [selectedRoomType, setSelectedRoomType] = useState('');
  const [rooms, setRooms] = useState(searchParams.rooms ? parseInt(searchParams.rooms) : 1);
  const [availableRooms, setAvailableRooms] = useState({});
  const [loading, setLoading] = useState(true);
  const [fetchingAvailability, setFetchingAvailability] = useState(false);
  const [error, setError] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const router = useRouter();
  const db = useMemo(() => getFirestore(), []);

  useEffect(() => {
    const fetchHotelData = async () => {
      setLoading(true);
      try {
        const hotelDoc = await getDoc(doc(db, 'hotels', params.id));
        if (hotelDoc.exists()) {
          const hotelData = { id: hotelDoc.id, ...hotelDoc.data() };
          setHotel(hotelData);
          setSelectedRoomType(Object.keys(hotelData.rooms)[0]);
          setMainImage(hotelData.mainImage || hotelData.rooms[Object.keys(hotelData.rooms)[0]].photos[0]);

          const reviewsQuery = query(collection(db, 'reviews'), where('hotelId', '==', params.id));
          const reviewsSnapshot = await getDocs(reviewsQuery);
          const reviewsData = reviewsSnapshot.docs.map(doc => doc.data());
          if (reviewsData.length > 0) {
            const avgRating = reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length;
            setAverageRating(avgRating.toFixed(1));
          }
        } else {
          throw new Error("Hotel not found");
        }
      } catch (err) {
        console.error("Error fetching hotel data:", err);
        setError("Failed to load hotel data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchHotelData();
  }, [params.id, db]);

  const checkAvailabilityForHotel = useCallback(async () => {
    if (hotel && checkIn && checkOut) {
      setFetchingAvailability(true);
      try {
        const bookedRooms = await checkAvailability(params.id, checkIn, checkOut);
        const available = Object.entries(hotel.rooms).reduce((acc, [type, details]) => {
          acc[type] = details.number - (bookedRooms[type] || 0);
          return acc;
        }, {});
        setAvailableRooms(available);
      } catch (err) {
        console.error("Error fetching availability:", err);
        setError("Failed to load room availability. Please try again.");
      } finally {
        setFetchingAvailability(false);
      }
    }
  }, [hotel, checkIn, checkOut, params.id]);

  useEffect(() => {
    checkAvailabilityForHotel();
  }, [checkAvailabilityForHotel]);

  const totalAmount = useMemo(() => {
    if (checkIn && checkOut && hotel && selectedRoomType) {
      const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
      return hotel.rooms[selectedRoomType].price * rooms * nights;
    }
    return 0;
  }, [checkIn, checkOut, hotel, selectedRoomType, rooms]);

  const handleDateChange = useCallback((e, dateType) => {
    const selectedDate = e.target.value;
    const today = new Date().toISOString().split('T')[0];

    if (dateType === 'checkIn') {
      if (selectedDate < today) {
        setError("Check-in date cannot be in the past");
        return;
      }
      if (checkOut && selectedDate >= checkOut) {
        setError("Check-in date must be before check-out date");
        return;
      }
      setCheckIn(selectedDate);
    } else {
      if (checkIn && selectedDate <= checkIn) {
        setError("Check-out date must be after check-in date");
        return;
      }
      setCheckOut(selectedDate);
    }
    setError(null);
  }, [checkIn, checkOut]);

  const handleBooking = useCallback((e) => {
    e.preventDefault();
    if (!selectedRoomType || !checkIn || !checkOut) {
      setError('Please select room type, check-in, and check-out dates');
      return;
    }

    if (!availableRooms[selectedRoomType] || availableRooms[selectedRoomType] < rooms) {
      setShowUnavailableModal(true);
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      setError('You must be logged in to make a booking.');
      router.push('/login');
      return;
    }

    setShowPaymentForm(true);
    setError(null);
  }, [selectedRoomType, checkIn, checkOut, availableRooms, rooms, router]);

  const handlePaymentComplete = useCallback(async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setError('You must be logged in to make a booking.');
        return;
      }

      const bookingData = {
        hotelId: params.id,
        roomType: selectedRoomType,
        rooms,
        checkIn,
        checkOut,
        userId: user.uid,
        totalAmount,
      };

      await createBooking(bookingData);

      setAvailableRooms(prev => ({
        ...prev,
        [selectedRoomType]: prev[selectedRoomType] - rooms
      }));

      setShowSuccessModal(true);
      setShowPaymentForm(false);
    } catch (err) {
      console.error("Error making booking:", err);
      setError('Failed to make booking. Please try again.');
    }
  }, [params.id, selectedRoomType, rooms, checkIn, checkOut, totalAmount]);

  const handleImageNavigation = (direction) => {
    if (hotel && selectedRoomType) {
      const photos = hotel.rooms[selectedRoomType].photos;
      setCurrentImageIndex((prevIndex) => {
        if (direction === 'next') {
          return (prevIndex + 1) % photos.length;
        } else {
          return (prevIndex - 1 + photos.length) % photos.length;
        }
      });
    }
  };

  const closeAllModals = useCallback(() => {
    setShowUnavailableModal(false);
    setShowSuccessModal(false);
    setShowPaymentForm(false);
  }, []);

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!hotel) return <div className={styles.notFound}>Hotel not found</div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.heroSection} style={{backgroundImage: `url(${mainImage})`}}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <h1 className={styles.hotelName}>{hotel.name}</h1>
          <p className={styles.hotelAddress}>{hotel.address.city}, {hotel.address.country}</p>
          {averageRating > 0 && (
            <div className={styles.averageRating}>
              {averageRating} <span className={styles.stars}>{'★'.repeat(Math.round(parseFloat(averageRating)))}</span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.roomDisplay}>
          <div className={styles.imageSlider}>
            <img 
              src={hotel.rooms[selectedRoomType].photos[currentImageIndex]} 
              alt={`${selectedRoomType} room`} 
              className={styles.sliderImage}
            />
            <button onClick={() => handleImageNavigation('prev')} className={`${styles.sliderButton} ${styles.prevButton}`}>&#10094;</button>
            <button onClick={() => handleImageNavigation('next')} className={`${styles.sliderButton} ${styles.nextButton}`}>&#10095;</button>
          </div>
          <div className={styles.roomTypeIcons}>
            {Object.keys(hotel.rooms).map((roomType) => (
              <div 
                key={roomType} 
                className={`${styles.roomTypeIcon} ${selectedRoomType === roomType ? styles.active : ''}`}
                onClick={() => setSelectedRoomType(roomType)}
              >
                {roomType[0].toUpperCase()}
              </div>
            ))}
          </div>
          <h3 className={styles.roomTypeName}>{selectedRoomType}</h3>
          <p className={styles.roomTypePrice}>${hotel.rooms[selectedRoomType].price} per night</p>
          <div className={styles.roomDescription}>
            <h4>Room Description</h4>
            <p>{hotel.rooms[selectedRoomType].description}</p>
          </div>
        </div>

        <div className={styles.bookingSection}>
          <h2 className={styles.sectionTitle}>Book Your Stay</h2>
          <form onSubmit={handleBooking} className={styles.bookingForm}>
            <div className={styles.formGroup}>
              <input
                id="checkIn"
                type="date"
                value={checkIn}
                onChange={(e) => handleDateChange(e, 'checkIn')}
                required
                className={styles.input}
                min={new Date().toISOString().split('T')[0]}
                placeholder=" "
              />
              <label htmlFor="checkIn">Check-in</label>
            </div>
            <div className={styles.formGroup}>
              <input
                id="checkOut"
                type="date"
                value={checkOut}
                onChange={(e) => handleDateChange(e, 'checkOut')}
                required
                className={styles.input}
                min={checkIn || new Date().toISOString().split('T')[0]}
                placeholder=" "
              />
              <label htmlFor="checkOut">Check-out</label>
            </div>
            <div className={styles.formGroup}>
              <input
                id="rooms"
                type="number"
                value={rooms}
                onChange={(e) => setRooms(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max={availableRooms[selectedRoomType] !== undefined ? availableRooms[selectedRoomType] : hotel.rooms[selectedRoomType].number}
                required
                className={styles.input}
                placeholder=" "
              />
              <label htmlFor="rooms">Number of Rooms</label>
            </div>
            {totalAmount > 0 && (
              <div className={styles.bookingSummary}>
                <p>Total: ${totalAmount}</p>
              </div>
            )}
            <button type="submit" className={styles.bookButton} disabled={fetchingAvailability}>
              {fetchingAvailability ? 'Checking Availability...' : 'Book Now'}
            </button>
          </form>
        </div>
      </div>

      <div className={styles.hotelInfo}>
        <h2>About {hotel.name}</h2>
        <p>{hotel.description}</p>
        {hotel.amenities && hotel.amenities.length > 0 && (
          <>
            <h3>Amenities</h3>
            <ul className={styles.amenitiesList}>
              {hotel.amenities.map((amenity, index) => (
                <li key={index}>{amenity}</li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className={styles.reviewSection}>
        <h2>Guest Reviews</h2>
        <ReviewSection hotelId={params.id} />
      </div>

      <Modal isOpen={showPaymentForm} onClose={() => setShowPaymentForm(false)}>
        <div className={styles.modalHeader}>
          <h3>Booking Summary</h3>
        </div>
        <div className={styles.bookingSummary}>
          <p><strong>Room Type:</strong> {selectedRoomType}</p>
          <p><strong>Check-in:</strong> {checkIn}</p>
          <p><strong>Check-out:</strong> {checkOut}</p>
          <p><strong>Number of Rooms:</strong> {rooms}</p>
          <p><strong>Total Amount:</strong> ${totalAmount}</p>
        </div>
        <PaymentForm totalAmount={totalAmount} onPaymentComplete={handlePaymentComplete} />
      </Modal>

      <Modal isOpen={showUnavailableModal} onClose={closeAllModals}>
        <h2>Room Unavailable</h2>
        <p>We're sorry, but the selected room type is not available for the chosen dates and number of rooms. Please try different dates or room type.</p>
      </Modal>

      <Modal isOpen={showSuccessModal} onClose={() => {
        closeAllModals();
        router.push('/bookings');
      }}>
        <h2>Booking Successful!</h2>
        <p>Your booking has been confirmed. Thank you for choosing {hotel.name}!</p>
        <button onClick={() => {
          closeAllModals();
          router.push('/bookings');
        }} className={styles.bookButton}>
          View My Bookings
        </button>
      </Modal>
    </div>
  );
}