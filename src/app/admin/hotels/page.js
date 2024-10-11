// C:\Users\sefan\Desktop\AE1\AE1\src\app\admin\hotels\page.js
'use client';

import { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdminStatus } from '@/lib/useAdminStatus';
import styles from './viewHotels.module.css';

export default function ViewHotels() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { isAdmin, loading: adminLoading } = useAdminStatus();

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, adminLoading, router]);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const db = getFirestore();
        const hotelsCollection = collection(db, 'hotels');
        const hotelSnapshot = await getDocs(hotelsCollection);
        const hotelList = hotelSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setHotels(hotelList);
      } catch (err) {
        setError('Error fetching hotels. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin && !adminLoading) {
      fetchHotels();
    }
  }, [isAdmin, adminLoading]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this hotel?')) {
      try {
        const db = getFirestore();
        await deleteDoc(doc(db, 'hotels', id));
        setHotels(hotels.filter(hotel => hotel.id !== id));
      } catch (err) {
        setError('Error deleting hotel. Please try again.');
      }
    }
  };

  if (adminLoading || loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!isAdmin) {
    return <div className={styles.accessDenied}>Access Denied</div>;
  }

  return (
    <div className={styles.container}>
      <h1>Hotel Management</h1>
      <div className={styles.actionBar}>
        <Link href="/admin/create-hotel" className={styles.addButton}>
          Add New Hotel
        </Link>
      </div>
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.tableContainer}>
        <table className={styles.hotelsTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {hotels.map(hotel => (
              <tr key={hotel.id}>
                <td>{hotel.name}</td>
                <td>{hotel.type}</td>
                <td>{hotel.address?.city}, {hotel.address?.country}</td>
                <td>
                  <div className={styles.actionButtons}>
                    <Link href={`/admin/hotels/edit/${hotel.id}`} className={styles.editButton}>
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(hotel.id)} className={styles.deleteButton}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hotels.length === 0 && !loading && (
        <div className={styles.noHotels}>No hotels found. Add a new hotel to get started.</div>
      )}
    </div>
  );
}
