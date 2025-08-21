import { useState, useEffect, useCallback, useRef } from 'react';

type SetValue<T> = T | ((prev: T) => T);

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: SetValue<T>) => void, () => void] {
  // Store initial value in ref to avoid recreating functions when it changes
  const initialValueRef = useRef<T>(initialValue);
  initialValueRef.current = initialValue;

  // Track if we're currently hydrating to prevent hydration mismatches
  const [isHydrated, setIsHydrated] = useState(false);

  // Read value from localStorage with comprehensive error handling
  const readValue = useCallback((): T => {
    // Always return initialValue during SSR or before hydration
    if (typeof window === 'undefined' || !isHydrated) {
      return initialValueRef.current;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return initialValueRef.current;
      }

      const parsed = JSON.parse(item);
      return parsed as T;
    } catch (error) {
      console.warn(
        `useLocalStorage: Failed to parse stored value for key "${key}"`,
        error,
      );
      // Try to clean up corrupted data
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Ignore cleanup errors
      }
      return initialValueRef.current;
    }
  }, [key, isHydrated]);

  // Initialize state with a function to avoid reading localStorage on every render
  const [storedValue, setStoredValue] = useState<T>(
    () => initialValueRef.current,
  );

  // Hydrate from localStorage after component mounts (client-side only)
  useEffect(() => {
    setIsHydrated(true);
    const value = readValue();
    setStoredValue(value);
  }, [readValue]);

  // Memoized setter function
  const setValue = useCallback(
    (value: SetValue<T>) => {
      try {
        setStoredValue((prevValue) => {
          const nextValue =
            value instanceof Function ? value(prevValue) : value;

          // Only write to localStorage if we're hydrated (client-side)
          if (typeof window !== 'undefined' && isHydrated) {
            try {
              window.localStorage.setItem(key, JSON.stringify(nextValue));
            } catch (error) {
              console.warn(
                `useLocalStorage: Failed to write to localStorage for key "${key}"`,
                error,
              );
            }
          }

          return nextValue;
        });
      } catch (error) {
        console.warn(
          `useLocalStorage: setValue failed for key "${key}"`,
          error,
        );
      }
    },
    [key, isHydrated],
  );

  // Memoized remove function
  const remove = useCallback(() => {
    try {
      setStoredValue(initialValueRef.current);

      if (typeof window !== 'undefined' && isHydrated) {
        try {
          window.localStorage.removeItem(key);
        } catch (error) {
          console.warn(
            `useLocalStorage: Failed to remove key "${key}" from localStorage`,
            error,
          );
        }
      }
    } catch (error) {
      console.warn(`useLocalStorage: remove failed for key "${key}"`, error);
    }
  }, [key, isHydrated]);

  // Cross-tab synchronization
  useEffect(() => {
    // Only set up listener after hydration
    if (typeof window === 'undefined' || !isHydrated) return;

    const handleStorageChange = (e: StorageEvent) => {
      // Only handle changes to our specific key
      if (e.key !== key) return;

      // Ignore changes from the same window/tab
      if (e.storageArea !== window.localStorage) return;

      try {
        if (e.newValue === null) {
          // Key was removed in another tab
          setStoredValue(initialValueRef.current);
        } else {
          // Key was updated in another tab
          const newValue = JSON.parse(e.newValue) as T;
          setStoredValue(newValue);
        }
      } catch (error) {
        console.warn(
          `useLocalStorage: Failed to sync storage change for key "${key}"`,
          error,
        );
        // On parse error, fall back to initial value
        setStoredValue(initialValueRef.current);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, isHydrated]);

  // Return current value during SSR, hydrated value after mounting
  return [storedValue, setValue, remove];
}
