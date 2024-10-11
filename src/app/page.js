// C:\Users\sefan\Desktop\AE1\AE1\src\app\page.js
'use client';

import { useState, useEffect } from 'react';
import { getFirestore, collection, query, limit, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import Image from 'next/image';
import SearchComponent from './components/SearchComponent';
import styles from './HomePage.module.css';
import { FaMapMarkerAlt, FaDollarSign } from 'react-icons/fa';

export default function HomePage() {
  const [featuredHotels, setFeaturedHotels] = useState([]);

  useEffect(() => {
    const fetchFeaturedHotels = async () => {
      const db = getFirestore();
      const hotelsRef = collection(db, 'hotels');
      const q = query(hotelsRef, limit(4));
      const querySnapshot = await getDocs(q);
      const hotels = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFeaturedHotels(hotels);
    };

    fetchFeaturedHotels();
  }, []);

  const popularDestinations = [
    { name: 'Paris', imageUrl: 'https://media.istockphoto.com/id/2153348183/photo/eiffel-tower-with-bridge-over-river-in-paris-france.jpg?s=2048x2048&w=is&k=20&c=7ErCZBEJ4BMpUMPnTr16HSQOapK1aRsOpPVpHBXKJmo%3D' },
    { name: 'New York', imageUrl: 'https://media.istockphoto.com/id/538811669/photo/manhattan-panorama-with-its-skyscrapers-illuminated-at-dusk-new-york.jpg?s=2048x2048&w=is&k=20&c=A23Ek2HSVBj5nXFQ7zGdGdc8XtQF0tskm_G-_KPMmZ4%3D' },
    { name: 'Tokyo', imageUrl: 'https://media.istockphoto.com/id/1330558677/photo/kabukicho-shinjuku-at-night.jpg?s=2048x2048&w=is&k=20&c=yCoyZaGEiI70ABIPFkrYx2sFdqdg63R04Wymdx1fezo%3D' },
    { name: 'Rome', imageUrl: 'https://media.istockphoto.com/id/539115110/photo/colosseum-in-rome-and-morning-sun-italy.jpg?s=2048x2048&w=is&k=20&c=98qMLmYY4cYbb0jGZcyFntjUJpN8UfixLcisXpU7bDk%3D' },
  ];

  const testimonials = [
    { text: "I found my dream vacation spot thanks to this amazing booking site!", author: "Sarah K." },
    { text: "The best prices and the most user-friendly interface. Highly recommended!", author: "Mike R." },
    { text: "Our family trip was a breeze to plan with this website. Thank you!", author: "Emily L." },
  ];

  return (
    <div className={styles.homePage}>
      <header className={styles.hero}>
        <h1>Discover Your Perfect Getaway</h1>
        <p>Explore extraordinary accommodations and create unforgettable memories around the world</p>
        <SearchComponent isHomePage={true} />
      </header>

      <section className={styles.featuredHotels}>
        <h2>Featured Hotels</h2>
        <div className={styles.hotelGrid}>
          {featuredHotels.map(hotel => (
            <Link href={`/hotel/${hotel.id}`} key={hotel.id} className={styles.hotelCard}>
              <div className={styles.hotelCardInner} style={{
                backgroundImage: `url(${hotel.photos && hotel.photos[0] ? hotel.photos[0] : ''})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}>
                <div className={styles.hotelInfo}>
                  <h3>{hotel.name}</h3>
                  <p className={styles.location}>
                    <FaMapMarkerAlt className={styles.icon} />
                    {hotel.address.city}, {hotel.address.country}
                  </p>
                  <p className={styles.price}>
                    <FaDollarSign className={styles.icon} />
                    From ${hotel.rooms?.single?.price || 'N/A'} per night
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.popularDestinations}>
        <h2>Popular Destinations</h2>
        <div className={styles.destinationGrid}>
          {popularDestinations.map(destination => (
            <Link href={`/search?destination=${destination.name}`} key={destination.name} className={styles.destinationCard}>
              <Image
                src={destination.imageUrl}
                alt={destination.name}
                width={300}
                height={200}
                className={styles.destinationImage}
              />
              <h3>{destination.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.testimonials}>
        <h2>What Our Customers Say</h2>
        <div className={styles.testimonialGrid}>
          {testimonials.map((testimonial, index) => (
            <div key={index} className={styles.testimonialCard}>
              <p className={styles.testimonialText}>"{testimonial.text}"</p>
              <p className={styles.testimonialAuthor}>- {testimonial.author}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}