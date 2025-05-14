
"use client";

import { useState, useEffect, useCallback } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [initialValueForEffect] = useState<T>(initialValue);

  const [storedValue, setStoredValue] = useState<T>(() => {
    // For SSR, always return initialValue. localStorage is not available.
    if (typeof window === "undefined") {
      return initialValueForEffect;
    }
    // For client, try to read from localStorage.
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValueForEffect;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}" during initial state setup:`, error);
      return initialValueForEffect;
    }
  });

  // This effect synchronizes the state with localStorage *after* hydration on the client,
  // if the value in localStorage differs from the initial server-rendered/default state.
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const item = window.localStorage.getItem(key);
        const valueFromStorage = item ? (JSON.parse(item) as T) : initialValueForEffect;
        
        // Only update if the value from storage is actually different from the current state.
        // This prevents an unnecessary re-render if the state is already in sync.
        if (JSON.stringify(valueFromStorage) !== JSON.stringify(storedValue)) {
          setStoredValue(valueFromStorage);
        }
      } catch (error) {
        console.warn(`Error reading localStorage key "${key}" on client mount:`, error);
        // If parsing fails and current state is different from initial, reset to initial.
        if (JSON.stringify(initialValueForEffect) !== JSON.stringify(storedValue)) {
            setStoredValue(initialValueForEffect);
        }
      }
    }
  // This effect should run once after the component mounts on the client to hydrate from localStorage.
  // initialValueForEffect is stable. key is stable.
  // `storedValue` is intentionally omitted from deps here to avoid re-running this specific effect on every state change.
  // Its purpose is initial hydration from localStorage.
  }, [key, initialValueForEffect]);


  const setValue = useCallback((value: T | ((val: T) => T)) => {
    if (typeof window === 'undefined') {
      const valueToStoreServer = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStoreServer);
      console.warn(
        `Tried setting localStorage key “${key}” even though environment is not a client. State updated, but not persisted.`
      );
      return;
    }
    
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]); // storedValue is needed here for the functional update `value(storedValue)`

  // This effect handles synchronization from other tabs/windows via the 'storage' event.
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== key) return;

      if (event.newValue === null) { // Item was removed or cleared in another tab
        // Only update if current state is not already the initial value
        if (JSON.stringify(storedValue) !== JSON.stringify(initialValueForEffect)) {
          setStoredValue(initialValueForEffect);
        }
      } else { // Item was added or changed in another tab
        // Only update if the new value string is different from the current stringified state
        if (event.newValue !== JSON.stringify(storedValue)) {
          try {
            setStoredValue(JSON.parse(event.newValue) as T);
          } catch (error) {
            console.warn(`Error parsing storage event value for key "${key}":`, error);
            // Fallback to captured initial value if parsing fails and current value is different
            if (JSON.stringify(storedValue) !== JSON.stringify(initialValueForEffect)) {
              setStoredValue(initialValueForEffect);
            }
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, storedValue, initialValueForEffect]); // Dependencies ensure listener closure has fresh values.

  return [storedValue, setValue];
}

export default useLocalStorage;
