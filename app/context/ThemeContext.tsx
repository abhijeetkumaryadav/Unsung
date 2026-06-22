// app/context/ThemeContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Load saved theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('unsung_theme') as Theme | null;
    if (saved && ['light', 'dark', 'system'].includes(saved)) {
      setTheme(saved);
    }
  }, []);

  // Resolve the actual theme based on system preference
  useEffect(() => {
    const resolveTheme = () => {
      if (theme === 'system') {
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        return darkModeMediaQuery.matches ? 'dark' : 'light';
      }
      return theme;
    };

    const newResolvedTheme = resolveTheme();
    setResolvedTheme(newResolvedTheme);

    // Apply theme to HTML element
    const html = document.documentElement;
    if (newResolvedTheme === 'dark') {
      html.classList.add('dark');
      // Apply charcoal gray background to html
      html.style.backgroundColor = '#1a1a1a';
    } else {
      html.classList.remove('dark');
      html.style.backgroundColor = '#f8fafc';
    }

    // Save theme preference
    localStorage.setItem('unsung_theme', theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;

    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const html = document.documentElement;
      if (darkModeMediaQuery.matches) {
        html.classList.add('dark');
        html.style.backgroundColor = '#1a1a1a';
        setResolvedTheme('dark');
      } else {
        html.classList.remove('dark');
        html.style.backgroundColor = '#f8fafc';
        setResolvedTheme('light');
      }
    };

    darkModeMediaQuery.addEventListener('change', handleChange);
    return () => darkModeMediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const isDark = resolvedTheme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}