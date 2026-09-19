import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, authService, RegisterPayload, LoginPayload } from '../services/authService';
import { Language, translations } from '../l10n/translations';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  language: Language;
  t: typeof translations['en'];
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  login: (payload: LoginPayload) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  logout: () => Promise<void>;
  errorMessage: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [language, setLanguageState] = useState<Language>('en');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadInitialState();
  }, []);

  const loadInitialState = async () => {
    try {
      setIsLoading(true);
      const savedLang = await AsyncStorage.getItem('app_language');
      if (savedLang === 'en' || savedLang === 'ne') {
        setLanguageState(savedLang);
      }
      const storedUser = await authService.getCurrentUser();
      setUser(storedUser);
    } catch (e) {
      console.error('Failed to load initial auth state', e);
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    await AsyncStorage.setItem('app_language', lang);
  };

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'ne' : 'en';
    setLanguage(nextLang);
  };

  const login = async (payload: LoginPayload): Promise<boolean> => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await authService.login(payload);
      if (res.success && res.data) {
        setUser(res.data.user);
        return true;
      }
      setErrorMessage(res.message || 'Login failed');
      return false;
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload): Promise<boolean> => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await authService.register(payload);
      if (res.success && res.data) {
        setUser(res.data.user);
        return true;
      }
      setErrorMessage(res.message || 'Registration failed');
      return false;
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    await authService.logout();
    setUser(null);
    setIsLoading(false);
  };

  const clearError = () => setErrorMessage(null);

  const t = translations[language];

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        language,
        t,
        setLanguage,
        toggleLanguage,
        login,
        register,
        logout,
        errorMessage,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
