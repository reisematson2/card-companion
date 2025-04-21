// context/ThemeContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext({
  isDark: false,
  toggleTheme: () => {},
  themeReady: false,
});

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');
  const [themeReady, setThemeReady] = useState(false);
  const [deckDisplayStyle, setDeckDisplayStyle] = useState<'default' | 'list'>('default');


  useEffect(() => {
    const loadPreference = async () => {
      const stored = await AsyncStorage.getItem('useDarkMode');
      if (stored !== null) {
        setIsDark(stored === 'true');
      } else {
        setIsDark(systemColorScheme === 'dark');
      }
      setThemeReady(true);
    };
    loadPreference();
  }, [systemColorScheme]);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    await AsyncStorage.setItem('useDarkMode', next.toString());
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, themeReady }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
