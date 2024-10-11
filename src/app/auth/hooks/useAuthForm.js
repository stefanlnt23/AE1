
'use client';

import { useState } from 'react';

export default function useAuthForm(isRegister) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (email, password, username, setError) => {
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

  return {
    email,
    setEmail,
    password,
    setPassword,
    username,
    setUsername,
    isLoading,
    setIsLoading,
    validateForm,
  };
}