import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface SocialButtonsProps {
  onGooglePress?: () => void;
  text?: string;
  dividerText?: string;
}

// Google Official Multi-color Vector Icon
const GoogleIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </Svg>
);

export const SocialButtons: React.FC<SocialButtonsProps> = ({
  onGooglePress,
  text,
  dividerText,
}) => {
  const { theme } = useTheme();
  const { t } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.dividerRow}>
        <View style={[styles.line, { backgroundColor: theme.cardBorder }]} />
        <Text style={[styles.orText, { color: theme.textMuted }]}>
          {dividerText || t.socialLoginNote || 'Or continue with'}
        </Text>
        <View style={[styles.line, { backgroundColor: theme.cardBorder }]} />
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onGooglePress}
        style={[
          styles.googleButton,
          {
            backgroundColor: theme.cardBackground,
            borderColor: theme.cardBorder,
          },
        ]}
      >
        <GoogleIcon size={20} />
        <Text style={[styles.googleButtonText, { color: theme.textPrimary }]}>
          {text || t.continueWithGoogle || 'Continue with Google'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
    alignItems: 'center',
    width: '100%',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 14,
  },
  line: {
    flex: 1,
    height: 1,
  },
  orText: {
    fontSize: 12.5,
    fontWeight: '500',
    marginHorizontal: 12,
  },
  googleButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  googleButtonText: {
    fontSize: 14.5,
    fontWeight: '600',
    marginLeft: 10,
    letterSpacing: 0.2,
  },
});
