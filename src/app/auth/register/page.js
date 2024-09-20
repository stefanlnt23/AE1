'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser, signInWithGoogle } from '@/app/auth/utils/firebaseAuth';
import { getDoc, setDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import useAuthForm from '@/app/auth/hooks/useAuthForm';
import AuthForm from '@/app/auth/components/AuthForm';
import styles from './Register.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState(null);

  const onSubmit = async (email, password, username) => {
    await registerUser(email, password, username);
    router.push('/');
  };

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          username: user.displayName,
        });
      }

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
    username,
    setUsername,
    isLoading,
    handleSubmit,
  } = useAuthForm(onSubmit, true, error, setError);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Register</h1>
      <AuthForm
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        username={username}
        setUsername={setUsername}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        buttonText="Register"
        linkText="Already have an account?"
        linkHref="/auth/login"
        onSubmit={onSubmit}
        onGoogleSignIn={handleGoogleSignIn}
        isRegister={true}
      />
    </div>
  );
}
