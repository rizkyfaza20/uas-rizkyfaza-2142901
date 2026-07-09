import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@theme_mode';

export const lightColors = {
  mode: 'light',
  background: '#f5f5f5',
  backgroundAlt: '#FAFAFA',
  surface: '#ffffff',
  surfaceAlt: '#f9f9f9',
  border: '#dddddd',
  divider: '#eeeeee',
  text: '#333333',
  textSecondary: '#666666',
  textMuted: '#999999',
  disabled: '#cccccc',
  overlay: 'rgba(0, 0, 0, 0.5)',
  statusBarStyle: 'dark',
};

export const darkColors = {
  mode: 'dark',
  background: '#121212',
  backgroundAlt: '#161616',
  surface: '#1e1e1e',
  surfaceAlt: '#2a2a2a',
  border: '#3a3a3a',
  divider: '#2a2a2a',
  text: '#f0f0f0',
  textSecondary: '#b3b3b3',
  textMuted: '#8a8a8a',
  disabled: '#555555',
  overlay: 'rgba(0, 0, 0, 0.7)',
  statusBarStyle: 'light',
};

const ThemeContext = createContext({
  isDark: false,
  colors: lightColors,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(Appearance.getColorScheme() === 'dark');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved === 'dark' || saved === 'light') {
          setIsDark(saved === 'dark');
        }
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light');
      return next;
    });
  };

  const value = useMemo(
    () => ({
      isDark,
      colors: isDark ? darkColors : lightColors,
      toggleTheme,
    }),
    [isDark]
  );

  if (!ready) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
