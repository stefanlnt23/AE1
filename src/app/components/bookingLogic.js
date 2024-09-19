import { getFirestore, collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';

export const fetchBookingsAndHotels = async (userId) => {
  const db = getFirestore();
  const bookingsRef = collection(db, 'bookings');
  const q = query(bookingsRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);

  const bookingsPromises = querySnapshot.docs.map(async (bookingDoc) => {
    const bookingData = { id: bookingDoc.id, ...bookingDoc.data() };
    
    const hotelDocRef = doc(db, 'hotels', bookingData.hotelId);
    const hotelDocSnap = await getDoc(hotelDocRef);
    if (hotelDocSnap.exists()) {
      const hotelData = hotelDocSnap.data();
      return {
        ...bookingData,
        hotelName: hotelData.name,
        hotelAddress: `${hotelData.address.street}, ${hotelData.address.city}, ${hotelData.address.country}`,
        hotelImage: hotelData.images && hotelData.images.length > 0 ? hotelData.images[0] : null
      };
    }
    return bookingData;
  });

  return Promise.all(bookingsPromises);
};

export const cancelBooking = async (bookingId) => {
  const db = getFirestore();
  await deleteDoc(doc(db, 'bookings', bookingId));
};

export const modifyBooking = async (bookingId, newCheckIn, newCheckOut) => {
  const checkInDate = new Date(newCheckIn);
  const checkOutDate = new Date(newCheckOut);

  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    throw new Error('Invalid date format. Please use YYYY-MM-DD.');
  }

  if (checkInDate >= checkOutDate) {
    throw new Error('Check-out date must be after check-in date.');
  }

  const db = getFirestore();
  const bookingRef = doc(db, 'bookings', bookingId);

  await updateDoc(bookingRef, {
    checkIn: checkInDate,
    checkOut: checkOutDate
  });

  return { checkIn: checkInDate, checkOut: checkOutDate };
};

export const fetchBookingDetails = async (bookingId) => {
  const db = getFirestore();
  const bookingRef = doc(db, 'bookings', bookingId);
  const bookingSnap = await getDoc(bookingRef);
  
  if (bookingSnap.exists()) {
    const data = bookingSnap.data();
    return {
      ...data,
      checkIn: data.checkIn?.toDate() || new Date(data.checkIn),
      checkOut: data.checkOut?.toDate() || new Date(data.checkOut)
    };
  }
  
  throw new Error('Booking not found');
};

export const updateBooking = async (bookingId, bookingData) => {
  const db = getFirestore();
  const bookingRef = doc(db, 'bookings', bookingId);
  await updateDoc(bookingRef, {
    ...bookingData,
    checkIn: bookingData.checkIn instanceof Date ? bookingData.checkIn : new Date(bookingData.checkIn),
    checkOut: bookingData.checkOut instanceof Date ? bookingData.checkOut : new Date(bookingData.checkOut)
  });
};

export const checkAvailability = async (hotelId, checkIn, checkOut, roomType = null) => {
  const db = getFirestore();
  const bookingsRef = collection(db, 'bookings');
  const q = query(bookingsRef, where('hotelId', '==', hotelId));
  const bookingsSnapshot = await getDocs(q);

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  const bookedRooms = bookingsSnapshot.docs.reduce((acc, doc) => {
    const booking = doc.data();
    const bookingCheckIn = booking.checkIn.toDate();
    const bookingCheckOut = booking.checkOut.toDate();

    if (bookingCheckIn < checkOutDate && bookingCheckOut > checkInDate) {
      if (roomType === null || booking.roomType === roomType) {
        if (!acc[booking.roomType]) {
          acc[booking.roomType] = 0;
        }
        acc[booking.roomType] += booking.rooms;
      }
    }
    return acc;
  }, {});

  return bookedRooms;
};

export const createBooking = async (bookingData) => {
  const db = getFirestore();
  const bookingRef = collection(db, 'bookings');
  const newBooking = {
    ...bookingData,
    checkIn: Timestamp.fromDate(new Date(bookingData.checkIn)),
    checkOut: Timestamp.fromDate(new Date(bookingData.checkOut)),
    createdAt: Timestamp.now()
  };
  const docRef = await addDoc(bookingRef, newBooking);
  return docRef.id;
};

export const formatDate = (date) => {
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

export const getDateString = (dateValue) => {
  if (dateValue instanceof Date) {
    return dateValue.toISOString().split('T')[0];
  } else if (typeof dateValue === 'object' && dateValue.seconds) {
    return new Date(dateValue.seconds * 1000).toISOString().split('T')[0];
  } else if (typeof dateValue === 'string') {
    const parsedDate = new Date(dateValue);
    return isNaN(parsedDate.getTime()) ? dateValue : parsedDate.toISOString().split('T')[0];
  }
  return new Date().toISOString().split('T')[0];
};