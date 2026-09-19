import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const MainNavigation: React.FC = () => {
  const { theme, mode } = useTheme();
  const { user, isLoading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<'login' | 'register'>('login');

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      {user ? (
        <DashboardScreen />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
