'use client';

import Link from 'next/link';
import FormInput from './FormInput';
import useAuthForm from '../hooks/useAuthForm';
import styles from './AuthForm.module.css';

export default function AuthForm({ onSubmit, buttonText, linkText, linkHref, isRegister, disabled }) {
  const {
    email,
    setEmail,
    password,
    setPassword,
    username,
    setUsername,
    error,
    handleSubmit,
    isLoading,
  } = useAuthForm(onSubmit, isRegister);

  return (
    <div className={styles.authFormContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        {isRegister && (
          <FormInput
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
            disabled={disabled || isLoading}
          />
        )}
        <FormInput
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          disabled={disabled || isLoading}
        />
        <FormInput
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          disabled={disabled || isLoading}
        />
        <button type="submit" className={styles.submitButton} disabled={disabled || isLoading}>
          {isLoading ? (
            <>
              {buttonText}
              <span className={styles.spinner}></span>
            </>
          ) : (
            buttonText
          )}
        </button>
      </form>
      {error && <p className={styles.error}>{error}</p>}
      <p className={styles.linkText}>
        {linkText}{' '}
        <Link href={linkHref} className={styles.link}>
          {linkText === 'Already have an account?' ? 'Login' : 'Register'}
        </Link>
      </p>
    </div>
  );
}
