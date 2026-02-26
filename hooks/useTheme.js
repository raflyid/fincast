'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { LIGHT, DARK } from '@/lib/theme';

export const ThemeCtx = createContext(null);

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('fincast_theme');
    if (saved) {
      setDark(saved === 'dark');
    } else {
      setDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    setMounted(true);
  }, []);

  const toggle = () => {
    setDark(prev => {
      const next = !prev;
      localStorage.setItem('fincast_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  return (
    <ThemeCtx.Provider value={{ dark, toggle, T: dark ? DARK : LIGHT, mounted }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  // Return safe fallback if used outside provider (shouldn't happen, but prevents null crash)
  if (!ctx) return { dark: false, toggle: () => {}, T: LIGHT, mounted: false };
  return ctx;
}
