import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Mail, Lock, Scale, ShieldCheck } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { LanguageToggle } from '../components/LanguageToggle';
import { ThemeToggle } from '../components/ThemeToggle';
import { TimedDialog } from '../components/TimedDialog';

interface LoginScreenProps {
  onNavigateToRegister: () => void;
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigateToRegister,
  onLoginSuccess,
}) => {
  const { theme } = useTheme();
  const { t, login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogType, setDialogType] = useState<'success' | 'error' | 'info'>('info');

  // Fade-in animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateForm = () => {
    let isValid = true;

    if (!email.trim()) {
      setEmailError(`${t.pleaseEnter} ${t.email.toLowerCase()}`);
      isValid = false;
    } else if (!email.includes('@')) {
      setEmailError(`${t.pleaseEnter} ${t.validEmail}`);
      isValid = false;
    } else {
      setEmailError(null);
    }

    if (!password) {
      setPasswordError(`${t.pleaseEnter} ${t.password.toLowerCase()}`);
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError(t.passwordMustBe);
      isValid = false;
    } else {
      setPasswordError(null);
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    const success = await login({
      email: email.trim(),
      password,
    });

    if (success) {
      setDialogTitle(t.loginSuccessTitle);
      setDialogMessage(t.loginSuccessBody);
      setDialogType('success');
      setDialogVisible(true);
      setTimeout(() => {
        onLoginSuccess();
      }, 1500);
    } else {
      setDialogTitle(t.loginFailed);
      setDialogMessage(t.loginCredentialsMismatch);
      setDialogType('error');
      setDialogVisible(true);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Controls */}
          <View style={styles.headerBar}>
            <View style={[styles.badgeRow, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
              <Scale size={16} color={theme.accent} />
              <Text style={[styles.badgeText, { color: theme.textPrimary }]}>NepalAdvocate</Text>
            </View>
            <View style={styles.rightControls}>
              <ThemeToggle />
              <LanguageToggle />
            </View>
          </View>

          {/* Animated Hero & Form Container */}
          <Animated.View
            style={[
              styles.mainCard,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.cardBorder,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Header Title */}
            <View style={styles.titleSection}>
              <Text style={[styles.welcomeText, { color: theme.textPrimary }]}>{t.welcomeBack}</Text>
              <Text style={[styles.subtitleText, { color: theme.textSecondary }]}>{t.loginSubtitle}</Text>
            </View>

            <View style={styles.formSpacer} />

            {/* Input Fields (Bottom Border Style) */}
            <CustomInput
              label={t.email}
              placeholder={t.enterYourEmail}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError}
              icon={<Mail size={18} color={theme.textSecondary} />}
            />

            <CustomInput
              label={t.password}
              placeholder={t.enterYourPassword}
              value={password}
              onChangeText={setPassword}
              isPassword
              error={passwordError}
              icon={<Lock size={18} color={theme.textSecondary} />}
            />

            <CustomButton
              title={t.login}
              onPress={handleLogin}
              isLoading={isLoading}
              style={styles.loginButton}
            />

            {/* Account Switch */}
            <View style={styles.footerRow}>
              <Text style={[styles.footerText, { color: theme.textSecondary }]}>{t.dontHaveAccount}</Text>
              <TouchableOpacity onPress={onNavigateToRegister} activeOpacity={0.7}>
                <Text style={[styles.registerLink, { color: theme.accent }]}>{t.register}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Security Note */}
          <View style={styles.securityNote}>
            <ShieldCheck size={14} color={theme.textMuted} style={{ marginRight: 6 }} />
            <Text style={[styles.securityText, { color: theme.textMuted }]}>{t.authSecureNote}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <TimedDialog
        visible={dialogVisible}
        title={dialogTitle}
        message={dialogMessage}
        type={dialogType}
        onDismiss={() => setDialogVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 0.3,
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainCard: {
    borderRadius: 20,
    padding: 26,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginVertical: 12,
  },
  titleSection: {
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: '400',
  },
  formSpacer: {
    height: 16,
  },
  loginButton: {
    marginTop: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  securityNote: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  securityText: {
    fontSize: 12,
  },
});
