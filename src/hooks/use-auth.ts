import { useState, useEffect } from 'react';
import { auth } from '@/services/localStorage';

export const useAuth = () => {
  const [user, setUser] = useState(auth.getUser());

  useEffect(() => {
    // Check for user in localStorage on mount
    const storedUser = auth.getUser();
    if (storedUser) {
      setUser(storedUser);
    }

    // Set up storage event listener
    const handleStorageChange = () => {
      setUser(auth.getUser());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return { user, isLoading: false };
};