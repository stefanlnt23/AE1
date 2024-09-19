'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser } from '@/utils';
import useAuthForm from '@/app/auth/hooks/useAuthForm';
import AuthForm from '@/app/auth/components/AuthForm';
import styles from './Login.module.css';

export default function LoginPage() {
  const router = useRouter();

  const onSubmit = async (email, password) => {
    await loginUser(email, password);
    router.push('/');
  };

  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isLoading,
    handleSubmit,
  } = useAuthForm(onSubmit, false);

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
        buttonText="Login"
      />
      <p className={styles.registerLink}>
        Don't have an account? <Link href="/auth/register">Register here</Link>
      </p>
    </div>
  );
}