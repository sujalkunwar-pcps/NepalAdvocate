import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  Animated,
  Platform,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

interface CustomInputProps extends TextInputProps {
  label: string;
  icon?: React.ReactNode;
  error?: string | null;
  isPassword?: boolean;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  icon,
  error,
  isPassword = false,
  value,
  onChangeText,
  placeholder,
  ...props
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!isPassword);

  const focusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const animatedBorderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      error ? theme.inputErrorBorder : theme.inputBottomBorder,
      error ? theme.inputErrorBorder : theme.inputFocusedBorder,
    ],
  });

  const animatedIndicatorScale = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: isFocused ? theme.accent : theme.textSecondary }]}>
        {label}
      </Text>
      
      <Animated.View
        style={[
          styles.inputWrapper,
          {
            borderBottomColor: animatedBorderColor,
          },
        ]}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        
        <TextInput
          style={[
            styles.input,
            { color: theme.textPrimary },
            Platform.OS === 'web' && ({ outlineStyle: 'none', outlineWidth: 0 } as any),
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textMuted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
            activeOpacity={0.7}
          >
            {showPassword ? (
              <EyeOff size={18} color={theme.textSecondary} />
            ) : (
              <Eye size={18} color={theme.textSecondary} />
            )}
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Animated Underline Highlight Bar */}
      <View style={styles.underlineTrack}>
        <Animated.View
          style={[
            styles.underlineActive,
            {
              backgroundColor: error ? theme.inputErrorBorder : theme.inputFocusedBorder,
              width: animatedIndicatorScale,
            },
          ]}
        />
      </View>

      {error ? <Text style={[styles.errorText, { color: theme.inputErrorBorder }]}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 22,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderBottomWidth: 1.5,
    paddingVertical: 8,
    paddingHorizontal: 2,
    height: 44,
  },
  iconContainer: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: '100%',
    padding: 0,
  },
  eyeButton: {
    padding: 6,
  },
  underlineTrack: {
    height: 2,
    width: '100%',
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  underlineActive: {
    height: 2,
    borderRadius: 1,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});
