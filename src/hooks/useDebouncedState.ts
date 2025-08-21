import { useEffect, useState } from 'react';

export function useDebouncedState<T>(initial: T, delay = 300) {
  const [value, setValue] = useState(initial);
  const [debounced, setDebounced] = useState(initial);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return [debounced, setValue] as const;
}
