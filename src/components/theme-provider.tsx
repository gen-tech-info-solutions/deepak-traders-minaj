import { setThemeServerFn } from '@/lib/theme';
import { useRouter } from '@tanstack/react-router';
import { createContext, PropsWithChildren, use } from 'react';

export type Theme = 'light' | 'dark';

type ThemeContextVal = { theme: Theme; setTheme: (val: Theme) => void };

const ThemeContext = createContext<ThemeContextVal | null>(null);

type Props = PropsWithChildren<{ theme: Theme }>;

export function ThemeProvider({ children, theme }: Props) {
  const router = useRouter();

  function setTheme(val: Theme) {
    setThemeServerFn({ data: val });
    router.invalidate();
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const val = use(ThemeContext);
  if (!val) throw new Error('useTheme called outside of ThemeProvider!');
  return val;
}
