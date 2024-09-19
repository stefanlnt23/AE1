'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser } from '@/utils';
import useAuthForm from '@/app/auth/hooks/useAuthForm';
import AuthForm from '@/app/auth/components/AuthForm';
import styles from './Register.module.css';

export default function RegisterPage() {
  const router = useRouter();

  const onSubmit = async (email, password, username) => {
    await registerUser(email, password, username);
    router.push('/');
  };

  const {
    email,
    setEmail,
    password,
    setPassword,
    username,
    setUsername,
    error,
    isLoading,
    handleSubmit,
  } = useAuthForm(onSubmit, true);

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
        isRegister={true}
      />
      <p className={styles.loginLink}>
        Already have an account? <Link href="/auth/login">Login here</Link>
      </p>
    </div>
  );
}
