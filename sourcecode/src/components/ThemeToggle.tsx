import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Sun, Moon } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, mode, toggleTheme } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={toggleTheme}
      style={[styles.container, { backgroundColor: theme.toggleBg, borderColor: theme.cardBorder }]}
    >
      {mode === 'dark' ? (
        <Sun size={18} color="#F59E0B" />
      ) : (
        <Moon size={18} color="#4F46E5" />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginRight: 8,
  },
});
