import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Globe } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export const LanguageToggle: React.FC = () => {
  const { theme } = useTheme();
  const { language, toggleLanguage } = useAuth();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={toggleLanguage}
      style={[styles.container, { backgroundColor: theme.toggleBg, borderColor: theme.cardBorder }]}
    >
      <Globe size={15} color={theme.textPrimary} style={styles.icon} />
      <Text style={[styles.text, { color: theme.textPrimary }]}>
        {language === 'en' ? 'नेपाली' : 'English'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  icon: {
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});
