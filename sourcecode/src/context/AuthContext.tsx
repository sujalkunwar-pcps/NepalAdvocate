import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import safeStorage from '../utils/safeStorage';
import { User, authService, RegisterPayload, LoginPayload, GoogleAuthPayload } from '../services/authService';
import biometricService, { BiometricStatus } from '../services/biometricService';
import { Language, translations } from '../l10n/translations';

export interface SavedBiometricAccount {
  email: string;
  role: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  language: Language;
  t: typeof translations['en'];
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  login: (payload: LoginPayload) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  googleLogin: (payload?: GoogleAuthPayload) => Promise<boolean>;
  loginWithBiometrics: (skipPrompt?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  errorMessage: string | null;
  clearError: () => void;
  // Biometric state
  isBiometricAvailable: boolean;
  isBiometricEnabled: boolean;
  biometricType: string;
  hasSavedBiometrics: boolean;
  savedBiometricAccount: SavedBiometricAccount | null;
  toggleBiometric: (enabled: boolean) => Promise<boolean>;
  refreshBiometricStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [language, setLanguageState] = useState<Language>('en');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Biometric state
  const [isBiometricAvailable, setIsBiometricAvailable] = useState<boolean>(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState<boolean>(false);
  const [biometricType, setBiometricType] = useState<string>(
    Platform.OS === 'ios' ? 'Face ID' : Platform.OS === 'android' ? 'Fingerprint' : 'Biometrics'
  );
  const [hasSavedBiometrics, setHasSavedBiometrics] = useState<boolean>(false);
  const [savedBiometricAccount, setSavedBiometricAccount] = useState<SavedBiometricAccount | null>(null);

  useEffect(() => {
    loadInitialState();
  }, []);

  const refreshBiometricStatus = async () => {
    try {
      const status: BiometricStatus = await biometricService.checkBiometricStatus();
      setIsBiometricAvailable(status.available && status.enrolled);
      setBiometricType(status.biometricType);

      const enabled = await biometricService.isBiometricEnabled();
      setIsBiometricEnabled(enabled);

      const account = await biometricService.getSavedAccount();
      setSavedBiometricAccount(account);
      setHasSavedBiometrics(!!account);
    } catch (e) {
      console.warn('Biometric status refresh error:', e);
    }
  };

  const loadInitialState = async () => {
    try {
      setIsLoading(true);
      const savedLang = await safeStorage.getItem('app_language');
      if (savedLang === 'en' || savedLang === 'ne') {
        setLanguageState(savedLang);
      }
      const storedUser = await authService.getCurrentUser();
      setUser(storedUser);

      await refreshBiometricStatus();
    } catch (e) {
      console.error('Failed to load initial auth state', e);
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    try {
      await safeStorage.setItem('app_language', lang);
    } catch {}
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
        await refreshBiometricStatus();
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
        await refreshBiometricStatus();
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

  const googleLogin = async (payload?: GoogleAuthPayload): Promise<boolean> => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await authService.googleLogin(payload || {});
      if (res.success && res.data) {
        setUser(res.data.user);
        await refreshBiometricStatus();
        return true;
      }
      setErrorMessage(res.message || 'Google sign-in failed');
      return false;
    } catch (err: any) {
      setErrorMessage(err.message || 'Google sign-in failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithBiometrics = async (skipPrompt = false): Promise<boolean> => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await authService.loginWithBiometrics(skipPrompt);
      if (res.success && res.data) {
        setUser(res.data.user);
        return true;
      }
      setErrorMessage(res.message || 'Biometric authentication failed');
      return false;
    } catch (err: any) {
      setErrorMessage(err.message || 'Biometric login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBiometric = async (enabled: boolean): Promise<boolean> => {
    try {
      if (enabled && user) {
        const authResult = await biometricService.authenticate(
          `Verify your identity to enable ${biometricType}`
        );
        if (!authResult.success) {
          setErrorMessage(authResult.error || 'Biometric authentication cancelled');
          return false;
        }

        const token = (await safeStorage.getItem('auth_token')) || `token_${Date.now()}`;
        await biometricService.saveCredentials({
          email: user.email,
          role: user.role === 'LAWYER' ? 'LAWYER' : 'CLIENT',
          token,
          user,
        });
      } else {
        await biometricService.clearCredentials();
      }
      await refreshBiometricStatus();
      return true;
    } catch (e: any) {
      setErrorMessage(e.message || 'Failed to update biometric settings');
      return false;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    await authService.logout();
    setUser(null);
    await refreshBiometricStatus();
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
        googleLogin,
        loginWithBiometrics,
        logout,
        errorMessage,
        clearError,
        isBiometricAvailable,
        isBiometricEnabled,
        biometricType,
        hasSavedBiometrics,
        savedBiometricAccount,
        toggleBiometric,
        refreshBiometricStatus,
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
