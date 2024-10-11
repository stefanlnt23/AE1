// C:\Users\sefan\Desktop\AE1\AE1\src\app\auth\register\page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser, signInWithGoogle } from '@/app/auth/utils/firebaseAuth';
import { getDoc, setDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AuthForm from '@/app/auth/components/AuthForm';
import styles from './Register.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState(null);

  const onSubmit = async (email, password, username) => {
    try {
      await registerUser(email, password, username);
      router.push('/');
    } catch (error) {
      setError(error.message);
    }
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

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Register</h1>
      <AuthForm
        onSubmit={onSubmit}
        error={error}
        setError={setError}
        buttonText="Register"
        linkText="Already have an account?"
        linkHref="/auth/login"
        onGoogleSignIn={handleGoogleSignIn}
        isRegister={true}
      />
    </div>
  );
}
