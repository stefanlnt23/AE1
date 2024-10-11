// C:\Users\sefan\Desktop\AE1\AE1\src\app\auth\password-reset\page.js
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPassword } from '@/app/auth/utils/firebaseAuth';
import FormInput from '@/app/auth/components/FormInput';
import styles from './PasswordReset.module.css';

export default function PasswordResetPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetCode = searchParams.get('oobCode');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await resetPassword(password, resetCode);
      router.push('/auth/login');
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
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New Password"
          required
          disabled={isLoading}
        />
        <FormInput
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm New Password"
          required
          disabled={isLoading}
        />
        <button type="submit" className={styles.submitButton} disabled={isLoading}>
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}