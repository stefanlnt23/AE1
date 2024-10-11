// C:\Users\sefan\Desktop\AE1\AE1\src\app\auth\reset-password\page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendPasswordResetEmailUtil } from '@/app/auth/utils/firebaseAuth';
import FormInput from '@/app/auth/components/FormInput';
import styles from './ResetPassword.module.css';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await sendPasswordResetEmailUtil(email);
      router.push('/auth/reset-password-success');
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Reset Password</h1>
      <form onSubmit={handleResetPassword} className={styles.form}>
        <FormInput
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          disabled={isLoading}
        />
        <button type="submit" className={styles.submitButton} disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}