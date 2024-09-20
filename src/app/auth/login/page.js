'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser, signInWithGoogle } from '@/app/auth/utils/firebaseAuth';
import useAuthForm from '@/app/auth/hooks/useAuthForm';
import AuthForm from '@/app/auth/components/AuthForm';
import styles from './Login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState(null);

  const onSubmit = async (email, password) => {
    await loginUser(email, password);
    router.push('/');
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

  const {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    handleSubmit,
  } = useAuthForm(onSubmit, false, error, setError);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Login</h1>
      <AuthForm
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        setError={setError}
        buttonText="Login"
        linkText="Don't have an account?"
        linkHref="/auth/register"
        onSubmit={onSubmit}
        onGoogleSignIn={handleGoogleSignIn}
        isRegister={false}
        forgotPasswordText="Forgot Password?"
        forgotPasswordHref="/auth/reset-password"
      />
    </div>
  );
}