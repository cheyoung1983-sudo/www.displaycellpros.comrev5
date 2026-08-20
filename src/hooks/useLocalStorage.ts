import { useState, useEffect } from 'react';

/**
 * Custom React hook that persists state to localStorage across page reloads.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // Always initialize with initialValue so the first client render matches
  // the server-rendered HTML exactly (avoids a hydration mismatch); the real
  // persisted value is read after mount in the effect below.
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) setStoredValue(JSON.parse(item));
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  const removeValue = () => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  };

  useEffect(() => {
    try {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === key) {
          if (e.newValue === null) {
            setStoredValue(initialValue);
          } else {
            try {
              setStoredValue(JSON.parse(e.newValue));
            } catch (err) {
              console.warn(`Error parsing storage event newValue for "${key}":`, err);
            }
          }
        }
      };
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    } catch (e) {
      // safe fallback in test/mock environments
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
