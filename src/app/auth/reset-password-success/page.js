'use client';

import Link from 'next/link';
import styles from './ResetPasswordSuccess.module.css';

export default function ResetPasswordSuccessPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Password Reset Email Sent</h1>
      <p className={styles.message}>
        A password reset link has been sent to your email address. Please check your inbox and follow the instructions to reset your password.
      </p>
      <Link href="/auth/login" className={styles.link}>
        Back to Login
      </Link>
    </div>
  );
}