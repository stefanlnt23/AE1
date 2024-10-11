// C:\Users\sefan\Desktop\AE1\AE1\src\app\admin\dashboard\page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminStatus } from '@/lib/useAdminStatus';
import styles from './adminDashboard.module.css';

export default function AdminDashboard() {
  const router = useRouter();
  const { isAdmin, loading: adminLoading, error: adminError } = useAdminStatus();
  const [stats, setStats] = useState({ hotels: 0, bookings: 0, users: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      router.push('/');
    }

    async function fetchDashboardStats() {
      try {
        const response = await fetch('/api/admin/dashboard-stats');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard statistics');
        }
        const data = await response.json();
        setStats(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    if (isAdmin) {
      fetchDashboardStats();
    }
  }, [isAdmin, adminLoading, router]);

  if (adminLoading || loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (adminError || error) {
    return <div className={styles.error}>An error occurred: {adminError?.message || error}</div>;
  }

  if (!isAdmin) {
    return <div className={styles.accessDenied}>Access Denied</div>;
  }

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Admin Dashboard</h1>
      
      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <h3>Total Hotels</h3>
          <p>{stats.hotels}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Total Bookings</h3>
          <p>{stats.bookings}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Registered Users</h3>
          <p>{stats.users}</p>
        </div>
      </div>

      <div className={styles.actionsContainer}>
        <Link href="/admin/create-hotel" className={styles.actionCard}>
          <span className={styles.icon}>🏨</span>
          <h3>Create Hotel</h3>
          <p>Add a new hotel to the system</p>
        </Link>
        <Link href="/admin/hotels" className={styles.actionCard}>
          <span className={styles.icon}>📋</span>
          <h3>View All Hotels</h3>
          <p>Manage existing hotels</p>
        </Link>
        <Link href="/admin/bookings" className={styles.actionCard}>
          <span className={styles.icon}>📅</span>
          <h3>View All Bookings</h3>
          <p>Manage customer bookings</p>
        </Link>
        <Link href="/admin/users" className={styles.actionCard}>
          <span className={styles.icon}>👥</span>
          <h3>View All Users</h3>
          <p>Manage user accounts</p>
        </Link>
      </div>
    </div>
  );
}
