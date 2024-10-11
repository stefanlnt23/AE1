// C:\Users\sefan\Desktop\AE1\AE1\src\app\myaccount\page.js
'use client';

import { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth, updateEmail, updatePassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import styles from './MyAccount.module.css';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaCog } from 'react-icons/fa';

export default function MyAccount() {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    preferences: {
      newsletter: false,
      roomPreference: 'no preference',
    }
  });
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            setUserData({
              username: data.username || '',
              email: user.email,
              firstName: data.firstName || '',
              lastName: data.lastName || '',
              phoneNumber: data.phoneNumber || '',
              preferences: {
                newsletter: data.preferences?.newsletter || false,
                roomPreference: data.preferences?.roomPreference || 'no preference',
              }
            });
          } else {
            setError('User data not found');
          }
        } catch (err) {
          setError('Error fetching user data');
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        setError('User not authenticated');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, db]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user) {
      try {
        setLoading(true);
        // Update email if changed
        if (user.email !== userData.email) {
          await updateEmail(user, userData.email);
        }
        
        // Update password if provided
        if (newPassword) {
          await updatePassword(user, newPassword);
        }
        
        // Update user profile in Firestore
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          username: userData.username,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phoneNumber: userData.phoneNumber,
          preferences: userData.preferences
        });

        setSuccessMessage('Profile updated successfully!');
        setNewPassword('');
      } catch (err) {
        setError('Error updating profile: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;

  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>My Account</h1>
      {successMessage && <div className={styles.success}>{successMessage}</div>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.formSection}>
            <h2><FaUser /> Personal Information</h2>
            <div className={styles.formGroup}>
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                id="username"
                name="username"
                value={userData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email"><FaEnvelope /> Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={userData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="firstName">First Name:</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={userData.firstName}
                onChange={handleChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="lastName">Last Name:</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={userData.lastName}
                onChange={handleChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="phoneNumber"><FaPhone /> Phone Number:</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={userData.phoneNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.formSection}>
            <h2><FaLock /> Change Password</h2>
            <div className={styles.formGroup}>
              <label htmlFor="newPassword">New Password:</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.formSection}>
            <h2><FaCog /> Preferences</h2>
            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="newsletter"
                  checked={userData.preferences.newsletter}
                  onChange={handlePreferenceChange}
                />
                Receive newsletter
              </label>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="roomPreference">Room Preference:</label>
              <select
                id="roomPreference"
                name="roomPreference"
                value={userData.preferences.roomPreference}
                onChange={handlePreferenceChange}
              >
                <option value="no preference">No Preference</option>
                <option value="quiet">Quiet Room</option>
                <option value="high floor">High Floor</option>
                <option value="low floor">Low Floor</option>
              </select>
            </div>
          </div>
        </div>

        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
}