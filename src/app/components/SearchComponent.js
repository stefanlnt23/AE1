'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getFirestore, collection, query, where, getDocs, limit, and } from 'firebase/firestore';
import { LucideHotel, LucideHome, LucideTent, LucideBuilding } from 'lucide-react';
import styles from './SearchComponent.module.css';

// Define accommodation types with their respective icons
const accommodationIcons = {
  Hotel: { icon: LucideHotel, label: 'Hotel' },
  Apartment: { icon: LucideBuilding, label: 'Apartment' },
  Hostel: { icon: LucideHome, label: 'Hostel' },
  Campsite: { icon: LucideTent, label: 'Campsite' },
};

// SearchForm component
const SearchForm = ({ searchState, handleInputChange, handleAccommodationTypeChange, handleSearch, loading }) => (
  <form onSubmit={handleSearch} className={styles.searchForm}>
    <div className={styles.mainInputs}>
      <input
        type="text"
        name="destination"
        placeholder="Search Country / City"
        value={searchState.destination}
        onChange={handleInputChange}
        required
        className={styles.destinationInput}
      />
      <div className={styles.dateInputs}>
        <DateInput
          id="checkIn"
          label="Check In"
          value={searchState.checkIn}
          onChange={handleInputChange}
        />
        <DateInput
          id="checkOut"
          label="Check Out"
          value={searchState.checkOut}
          onChange={handleInputChange}
        />
      </div>
      <div className={styles.inputField}>
        <label htmlFor="guests">Guests</label>
        <input
          type="number"
          id="guests"
          name="guests"
          value={searchState.guests}
          onChange={handleInputChange}
          min="1"
          required
          className={styles.numberInput}
        />
      </div>
    </div>
    <AccommodationTypeButtons
      selectedType={searchState.type}
      onChange={handleAccommodationTypeChange}
    />
    <button type="submit" disabled={loading} className={styles.searchButton}>
      {loading ? 'Searching...' : 'Search'}
    </button>
  </form>
);

// DateInput component
const DateInput = ({ id, label, value, onChange }) => (
  <div className={styles.inputField}>
    <label htmlFor={id}>{label}</label>
    <input
      type="date"
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      className={styles.dateInput}
    />
  </div>
);

// AccommodationTypeButtons component
const AccommodationTypeButtons = ({ selectedType, onChange }) => (
  <div className={styles.accommodationTypes}>
    {Object.entries(accommodationIcons).map(([type, { icon: Icon, label }]) => (
      <button
        key={type}
        type="button"
        onClick={() => onChange(type)}
        className={`${styles.accommodationTypeButton} ${selectedType === type ? styles.active : ''}`}
      >
        <Icon size={20} />
        <span>{label}</span>
      </button>
    ))}
  </div>
);

// SearchResults component
const SearchResults = ({ results, searchState }) => (
  <div className={styles.resultsGrid}>
    {results.map(hotel => (
      <Link 
        href={`/hotel/${hotel.id}?${new URLSearchParams({
          ...(searchState.checkIn && { checkIn: searchState.checkIn }),
          ...(searchState.checkOut && { checkOut: searchState.checkOut }),
          guests: searchState.guests.toString()
        }).toString()}`}
        key={hotel.id} 
        className={styles.hotelCard}
      >
        <HotelImage hotel={hotel} />
        <div className={styles.hotelInfo}>
          <HotelHeader hotel={hotel} />
          <p>{hotel.address.city}, {hotel.address.country}</p>
          <HotelPrice rooms={hotel.rooms} />
        </div>
      </Link>
    ))}
  </div>
);

// HotelImage component
const HotelImage = ({ hotel }) => (
  <div className={styles.hotelImageContainer}>
    {hotel.photos && hotel.photos[0] ? (
      <Image
        src={hotel.photos[0]}
        alt={hotel.name}
        width={300}
        height={200}
        className={styles.hotelImage}
      />
    ) : (
      <div className={styles.hotelImagePlaceholder}>
        {hotel.name[0]}
      </div>
    )}
  </div>
);

// HotelHeader component
const HotelHeader = ({ hotel }) => (
  <div className={styles.hotelHeader}>
    <h3>{hotel.name}</h3>
    <div className={styles.accommodationType}>
      {accommodationIcons[hotel.type] && 
        React.createElement(accommodationIcons[hotel.type].icon, { size: 20 })}
    </div>
  </div>
);

// HotelPrice component
const HotelPrice = ({ rooms }) => (
  <p className={styles.price}>
    From ${Math.min(
      ...Object.values(rooms)
        .map(room => parseFloat(room.price))
        .filter(price => !isNaN(price))
    ) || 'N/A'} per night
  </p>
);

// Main SearchComponent
export default function SearchComponent({ isHomePage = false }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchState, setSearchState] = useState({
    destination: searchParams.get('destination') || '',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    guests: parseInt(searchParams.get('guests')) || 1,
    type: searchParams.get('type') || '',
  });

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isHomePage && (searchParams.get('destination') || searchState.type)) {
      handleSearch();
    }
  }, [isHomePage, searchParams, searchState.type]);

  const performSearch = async (destination, type) => {
    try {
      const db = getFirestore();
      const hotelsRef = collection(db, 'hotels');
      
      const conditions = [
        where('searchable', 'array-contains', destination.toLowerCase())
      ];

      if (type) {
        conditions.push(where('type', '==', type));
      }
  
      const q = query(hotelsRef, and(...conditions), limit(10));
  
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error("Search error:", err);
      throw new Error("An error occurred while searching. Please try again.");
    }
  };

  const handleSearch = async (e) => {
    e && e.preventDefault();
  
    setLoading(true);
    setError(null);
  
    try {
      const newResults = await performSearch(searchState.destination, searchState.type);
      setResults(newResults);

      const searchQuery = new URLSearchParams({
        destination: searchState.destination,
        guests: searchState.guests.toString(),
        ...(searchState.checkIn && { checkIn: searchState.checkIn }),
        ...(searchState.checkOut && { checkOut: searchState.checkOut }),
        ...(searchState.type && { type: searchState.type }),
      });

      if (isHomePage) {
        router.push(`/search?${searchQuery.toString()}`);
      } else {
        router.push(`/search?${searchQuery.toString()}`, { shallow: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchState(prev => ({
      ...prev,
      [name]: name === 'guests' ? Math.max(1, parseInt(value) || 1) : value
    }));
  };

  const handleAccommodationTypeChange = (type) => {
    setSearchState(prev => ({
      ...prev,
      type: prev.type === type ? '' : type 
    }));
  };

  return (
    <div className={styles.searchContainer}>
      <SearchForm
        searchState={searchState}
        handleInputChange={handleInputChange}
        handleAccommodationTypeChange={handleAccommodationTypeChange}
        handleSearch={handleSearch}
        loading={loading}
      />

      {error && <p className={styles.error}>{error}</p>}

      {!isHomePage && (
        <>
          <SearchResults results={results} searchState={searchState} />

          {(!results.length && !loading) && (
            <div className={styles.noResults}>
              <p>No results found. Try adjusting your search criteria.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}