import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary' | 'outline';
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  variant = 'primary',
}) => {
  const { theme } = useTheme();

  const isOutline = variant === 'outline';

  if (isOutline) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || isLoading}
        activeOpacity={0.8}
        style={[
          styles.outlineButton,
          { borderColor: theme.primary, backgroundColor: 'transparent' },
          disabled && styles.disabled,
          style,
        ]}
      >
        {isLoading ? (
          <ActivityIndicator color={theme.primary} size="small" />
        ) : (
          <Text style={[styles.outlineText, { color: theme.primary }, textStyle]}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.85}
      style={[
        styles.button,
        { backgroundColor: disabled ? theme.textMuted : theme.primary },
        disabled && styles.disabled,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={theme.textInverse} size="small" />
      ) : (
        <Text style={[styles.text, { color: theme.textInverse }, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  outlineButton: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  outlineText: {
    fontSize: 15,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.5,
  },
});
