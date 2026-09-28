import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { DashboardScreen } from '../screens/DashboardScreen';
import { LawyersScreen } from '../screens/LawyersScreen';
import { AiChatScreen } from '../screens/AiChatScreen';
import { DocumentsScreen } from '../screens/DocumentsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { BottomTabBar, TabKey } from '../components/BottomTabBar';
import { useTheme } from '../context/ThemeContext';

export const MainTabNavigator: React.FC = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabKey>('home');

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return <DashboardScreen />;
      case 'lawyers':
        return <LawyersScreen />;
      case 'ai':
        return <AiChatScreen />;
      case 'documents':
        return <DocumentsScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.screenContainer}>{renderActiveScreen()}</View>
      <BottomTabBar activeTab={activeTab} onSelectTab={setActiveTab} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  screenContainer: {
    flex: 1,
  },
});
