'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function useAuthForm(onSubmit, isRegister, error, setError) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validateForm = () => {
    if (!email || !password) {
      setError('Please fill in all required fields.');
      return false;
    }
    if (isRegister && !username) {
      setError('Please enter a username.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      if (isRegister) {
        await onSubmit(email, password, username);
      } else {
        await onSubmit(email, password);
      }
      router.push('/');
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    username,
    setUsername,
    error,
    setError,
    isLoading,
    handleSubmit,
  };
}