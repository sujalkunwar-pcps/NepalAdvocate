import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorScheme, LightColors, DarkColors, ThemeMode } from '../theme/colors';

interface ThemeContextType {
  theme: ColorScheme;
  mode: ThemeMode;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>('dark'); // Default dark minimalist

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedMode = await AsyncStorage.getItem('app_theme_mode');
      if (savedMode === 'light' || savedMode === 'dark') {
        setModeState(savedMode);
      }
    } catch (e) {
      console.error('Failed to load theme preference', e);
    }
  };

  const setMode = async (newMode: ThemeMode) => {
    setModeState(newMode);
    await AsyncStorage.setItem('app_theme_mode', newMode);
  };

  const toggleTheme = () => {
    const nextMode = mode === 'light' ? 'dark' : 'light';
    setMode(nextMode);
  };

  const theme = mode === 'light' ? LightColors : DarkColors;

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
