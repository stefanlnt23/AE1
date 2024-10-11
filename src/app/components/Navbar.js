// C:\Users\sefan\Desktop\AE1\AE1\src\app\components\Navbar.js
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { auth } from '@/lib/firebase';
import { useAdminStatus } from '@/lib/useAdminStatus';
import styles from './Navbar.module.css';

// NavLink component for consistent styling and accessibility
const NavLink = ({ href, children }) => (
  <Link href={href} className={styles.navbarLink}>
    <span className={styles.navLinkText}>{children}</span>
  </Link>
);

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { isAdmin, loading: adminLoading } = useAdminStatus();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const db = getFirestore();
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUsername(userSnap.data().username || '');
          }
        } catch (error) {
          console.error('Error fetching username:', error);
        }
      } else {
        setUsername('');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (adminLoading) {
    return <nav className={styles.navbar} aria-label="Site navigation">Loading...</nav>;
  }

  return (
    <nav className={styles.navbar} aria-label="Site navigation">
      <div className={styles.navbarContent}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoText}>Places To Stay</span>
        </Link>
        <button className={styles.menuToggle} onClick={toggleMenu} aria-label="Toggle menu">
          <span className={styles.menuIcon}></span>
        </button>
        <div className={`${styles.navLinks} ${isMenuOpen ? styles.showMenu : ''}`}>
          <NavLink href="/">Home</NavLink>
          <NavLink href="/search">Search</NavLink>
          {user ? (
            <>
              <NavLink href="/bookings">My Bookings</NavLink>
              <div className={styles.dropdown}>
                <button className={styles.dropbtn}>
                  <span className={styles.welcome} aria-label="Logged in user">
                    Welcome, {username}
                  </span>
                  <i className={styles.dropdownIcon}></i>
                </button>
                <div className={styles.dropdownContent}>
                  <NavLink href="/myaccount">My Account</NavLink>
                  {isAdmin && (
                    <>
                      <NavLink href="/admin/dashboard">Admin Dashboard</NavLink>
                      <NavLink href="/admin/users">Admin Users</NavLink>
                    </>
                  )}
                  <button 
                    className={styles.logoutButton} 
                    onClick={handleLogout}
                    aria-label="Log out"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <NavLink href="/auth/login">Login</NavLink>
              <NavLink href="/auth/register">Register</NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
