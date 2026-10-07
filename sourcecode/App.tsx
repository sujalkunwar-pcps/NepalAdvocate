import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { SplashScreen } from './src/screens/SplashScreen';
import { MainTabNavigator } from './src/navigation/MainTabNavigator';
import { View, StyleSheet, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

// Complete any pending web auth sessions from OAuth redirects/popups
WebBrowser.maybeCompleteAuthSession();

// Web global CSS reset to eliminate horizontal scrolling & body margin offsets
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const styleId = 'nepal-advocate-web-reset';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      html, body, #root, [data-contents="true"] {
        width: 100% !important;
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow-x: hidden !important;
        box-sizing: border-box !important;
      }
      * {
        box-sizing: border-box !important;
      }
    `;
    document.head.appendChild(style);
  }
}

const MainNavigation: React.FC = () => {
  const { theme, mode } = useTheme();
  const { user } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<'login' | 'register'>('login');

  if (showSplash) {
    return (
      <View style={[styles.rootContainer, { backgroundColor: theme.background }]}>
        <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
        <SplashScreen onFinish={() => setShowSplash(false)} duration={2500} />
      </View>
    );
  }

  return (
    <View style={[styles.rootContainer, { backgroundColor: theme.background }]}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      {user ? (
        <MainTabNavigator />
      ) : currentScreen === 'register' ? (
        <RegisterScreen
          onNavigateToLogin={() => setCurrentScreen('login')}
          onRegisterSuccess={() => setCurrentScreen('login')}
        />
      ) : (
        <LoginScreen
          onNavigateToRegister={() => setCurrentScreen('register')}
          onLoginSuccess={() => {}}
        />
      )}
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <MainNavigation />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
});
