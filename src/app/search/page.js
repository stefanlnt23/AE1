// C:\Users\sefan\Desktop\AE1\AE1\src\app\search\page.js
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './search.module.css';
import { getFirestore, collection, query, where, getDocs, limit, startAfter, and } from 'firebase/firestore';
import SearchComponent from '../components/SearchComponent';
import { FaSearch, FaMapMarkerAlt, FaDollarSign, FaHotel, FaHome, FaBuilding, FaWarehouse } from 'react-icons/fa';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const initialSearchCriteria = {
      destination: searchParams.get('destination') || '',
      checkIn: searchParams.get('checkIn') || '',
      checkOut: searchParams.get('checkOut') || '',
      guests: parseInt(searchParams.get('guests')) || 1,
      accommodationType: searchParams.get('accommodationType') || ''
    };
    handleSearch(initialSearchCriteria);
  }, []);

  const performSearch = async (searchCriteria = {}, loadMore = false) => {
    const { destination, checkIn, checkOut, guests, accommodationType } = searchCriteria;
  
    console.log('Search criteria:', searchCriteria);
  
    try {
      const db = getFirestore();
      const hotelsRef = collection(db, 'hotels');
      
      let conditions = [];
      
      if (destination) {
        conditions.push(where('searchable', 'array-contains', destination.toLowerCase()));
      }
  
      if (accommodationType) {
        conditions.push(where('accommodationType', '==', accommodationType));
      }
  
      let q;
      if (conditions.length > 0) {
        q = query(hotelsRef, and(...conditions), limit(10));
      } else {
        q = query(hotelsRef, limit(10));
      }
  
      if (loadMore && lastVisible) {
        q = query(q, startAfter(lastVisible));
      }
  
      console.log('Firestore query:', q);
  
      const querySnapshot = await getDocs(q);
      
      console.log('Query snapshot size:', querySnapshot.size);
  
      const searchResults = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
  
      console.log('Search results:', searchResults);
  
      return {
        results: searchResults,
        lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1],
        hasMore: querySnapshot.docs.length === 10
      };
  
    } catch (err) {
      console.error("Search error:", err);
      throw new Error("An error occurred while searching. Please try again.");
    }
  };

  const handleSearch = async (searchCriteria = {}, loadMore = false) => {
    setLoading(true);
    setError(null);
  
    try {
      const { results: newResults, lastVisible: newLastVisible, hasMore: newHasMore } = 
        await performSearch(searchCriteria, loadMore);
  
      setResults(prevResults => loadMore ? [...prevResults, ...newResults] : newResults);
      setLastVisible(newLastVisible);
      setHasMore(newHasMore);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    const currentSearchParams = Object.fromEntries(searchParams.entries());
    handleSearch(currentSearchParams, true);
  };

  const getAccommodationIcon = (type) => {
    switch((type ?? '').toLowerCase()) {
      case 'hotel':
        return <FaHotel className={styles.icon} />;
      case 'apartment':
        return <FaBuilding className={styles.icon} />;
      case 'house':
        return <FaHome className={styles.icon} />;
      default:
        return <FaWarehouse className={styles.icon} />;
    }
  };

  return (
    <div className={styles.searchContainer}>
      <h1 className={styles.title}>
        <FaSearch className={styles.searchIcon} />
        Discover Your Perfect Stay
      </h1>
      
      <SearchComponent 
        isHomePage={false} 
        onSearch={handleSearch} 
      />

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.resultsGrid}>
        {results.map(hotel => (
          <Link 
            href={`/hotel/${hotel.id}?${new URLSearchParams({
              checkIn: searchParams.get('checkIn') || '',
              checkOut: searchParams.get('checkOut') || '',
              guests: searchParams.get('guests') || '1'
            }).toString()}`}
            key={hotel.id} 
            className={styles.hotelCard}
          >
            <div className={styles.hotelCardInner} style={{
              backgroundImage: `url(${hotel.photos && hotel.photos[0] ? hotel.photos[0] : ''})`,
            }}>
              <div className={styles.hotelInfo}>
                <h3>{hotel.name}</h3>
                <p className={styles.location}>
                  <FaMapMarkerAlt className={styles.icon} />
                  {hotel.address.city}, {hotel.address.country}
                </p>
                <p className={styles.accommodationType}>
                  {getAccommodationIcon(hotel.accommodationType)}
                  {hotel.accommodationType}
                </p>
                <p className={styles.price}>
                  <FaDollarSign className={styles.icon} />
                  From ${Math.min(
                    ...Object.values(hotel.rooms || {})
                      .map(room => parseFloat(room.price))
                      .filter(price => !isNaN(price))
                  ) || 'N/A'} per night
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {hasMore && (
        <button onClick={handleLoadMore} className={styles.loadMoreButton} disabled={loading}>
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}

      {(!results.length && !loading) && (
        <div className={styles.noResults}>
          <p>No results found. Try adjusting your search criteria.</p>
        </div>
      )}
    </div>
  );
}