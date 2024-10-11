// C:\Users\sefan\Desktop\AE1\AE1\src\app\admin\users\ClientSideAdminUsersPage.js
'use client';

import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';
import styles from './adminUsers.module.css';
import { withAuth } from '@/hocs/withAuth';
import { useAdminStatus } from '@/lib/useAdminStatus';

const ClientSideAdminUsersPage = () => {
  const { isAdmin, isLoading: adminLoading } = useAdminStatus();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const db = getFirestore();
      const usersCollection = collection(db, 'users');
      const adminsCollection = collection(db, 'admins');
      
      const [userSnapshot, adminSnapshot] = await Promise.all([
        getDocs(usersCollection),
        getDocs(adminsCollection)
      ]);
      
      const adminIds = new Set(adminSnapshot.docs.map(doc => doc.id));
      
      const userList = userSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        role: adminIds.has(doc.id) ? 'Admin' : 'User'
      }));
      
      setUsers(userList);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const makeAdmin = async (userId) => {
    try {
      const db = getFirestore();
      const adminDocRef = doc(db, 'admins', userId);
      await setDoc(adminDocRef, {});
      await fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error('Error making user admin:', error);
    }
  };

  if (adminLoading || isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return <div>Access denied. Admin privileges required.</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Admin Users</h1>
      <div className={styles.userList}>
        {users.length > 0 ? (
          <table className={styles.userTable}>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    {user.role === 'User' && (
                      <button 
                        className={styles.makeAdminButton} 
                        onClick={() => makeAdmin(user.id)}
                      >
                        Make Admin
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No users found.</p>
        )}
      </div>
    </div>
  );
};

export default withAuth(ClientSideAdminUsersPage);