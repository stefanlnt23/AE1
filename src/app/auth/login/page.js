// C:\Users\sefan\Desktop\AE1\AE1\src\app\auth\login\page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, signInWithGoogle } from '@/app/auth/utils/firebaseAuth';
import AuthForm from '@/app/auth/components/AuthForm';
import styles from './Login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState(null);

  const onSubmit = async (email, password) => {
    try {
      await loginUser(email, password);
      router.push('/');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      router.push('/');
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setError(error.message);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Login</h1>
      <AuthForm
        onSubmit={onSubmit}
        error={error}
        setError={setError}
        buttonText="Login"
        linkText="Don't have an account?"
        linkHref="/auth/register"
        onGoogleSignIn={handleGoogleSignIn}
        isRegister={false}
        forgotPasswordText="Forgot Password?"
        forgotPasswordHref="/auth/reset-password"
      />
    </div>
  );
}