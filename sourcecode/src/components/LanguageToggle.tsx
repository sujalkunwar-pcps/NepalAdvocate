import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Globe } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export const LanguageToggle: React.FC = () => {
  const { language, toggleLanguage } = useAuth();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={toggleLanguage}
      style={styles.container}
    >
      <Globe size={16} color={Colors.primary} style={styles.icon} />
      <Text style={styles.text}>
        {language === 'en' ? 'नेपाली' : 'English'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  icon: {
    marginRight: 6,
  },
  text: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
});
