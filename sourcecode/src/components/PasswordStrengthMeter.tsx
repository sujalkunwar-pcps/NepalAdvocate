import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface PasswordStrengthMeterProps {
  password?: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password = '',
}) => {
  const { theme } = useTheme();

  if (!password) return null;

  // Calculate score (0 to 3)
  let score = 0;
  if (password.length >= 6) score += 1;
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password) || password.length >= 10) score += 1;

  const getLabel = () => {
    if (score === 1) return { text: 'Weak', color: '#EF4444' };
    if (score === 2) return { text: 'Medium', color: '#F59E0B' };
    return { text: 'Strong', color: '#10B981' };
  };

  const info = getLabel();

  return (
    <View style={styles.container}>
      <View style={styles.barsRow}>
        <View
          style={[
            styles.bar,
            { backgroundColor: score >= 1 ? info.color : theme.cardBorder },
          ]}
        />
        <View
          style={[
            styles.bar,
            { backgroundColor: score >= 2 ? info.color : theme.cardBorder },
          ]}
        />
        <View
          style={[
            styles.bar,
            { backgroundColor: score >= 3 ? info.color : theme.cardBorder },
          ]}
        />
      </View>
      <Text style={[styles.labelText, { color: info.color }]}>{info.text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: -14,
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  barsRow: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  bar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    marginRight: 4,
  },
  labelText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
