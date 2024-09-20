import React from 'react';
import styles from './adminUsers.module.css';
import { useAdminStatus } from '@/lib/useAdminStatus';
import ClientSideAdminUsersPage from './ClientSideAdminUsersPage';

export default function AdminUsersPage() {
  return <ClientSideAdminUsersPage />;
}