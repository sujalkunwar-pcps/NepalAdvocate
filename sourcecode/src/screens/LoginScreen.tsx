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
  Image,
} from 'react-native';
import { typography } from '../theme/typography';
import { Mail, Lock, CheckSquare, Square } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { SocialButtons } from '../components/SocialButtons';
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
  const [rememberMe, setRememberMe] = useState(false);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogType, setDialogType] = useState<'success' | 'error' | 'info'>('info');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 450,
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

  const handleForgotPassword = () => {
    setDialogTitle(t.forgotPassword);
    setDialogMessage(t.passwordResetSent);
    setDialogType('info');
    setDialogVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Mode & Language Pinned to Full Top Right */}
      <View style={styles.fullTopRightControls}>
        <ThemeToggle />
        <LanguageToggle />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.responsiveWrapper}>
            {/* Centered App Title */}
            <View style={styles.brandTitleHeader}>
              <Text style={[styles.brandTitleText, { color: theme.textPrimary }]} numberOfLines={1}>
                NepalAdvocate
              </Text>
            </View>

            {/* Animated Main Card */}
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
              {/* Headline */}
              <View style={styles.leftTitleSection}>
                <Text style={[styles.welcomeText, { color: theme.textPrimary }]}>{t.welcomeBack}</Text>
                <Text style={[styles.subtitleText, { color: theme.textSecondary }]}>{t.loginSubtitle}</Text>
              </View>

              {/* Input Fields */}
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

              {/* Options Row */}
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.rememberMeRow}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  {rememberMe ? (
                    <CheckSquare size={16} color={theme.textPrimary} />
                  ) : (
                    <Square size={16} color={theme.textMuted} />
                  )}
                  <Text style={[styles.rememberMeText, { color: theme.textSecondary }]}>
                    {t.rememberMe}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.7} onPress={handleForgotPassword}>
                  <Text style={[styles.forgotPasswordText, { color: theme.textSecondary }]}>
                    {t.forgotPassword}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Sign In Button */}
              <CustomButton
                title={t.login}
                onPress={handleLogin}
                isLoading={isLoading}
                style={styles.loginButton}
              />

              {/* Social Logins */}
              <SocialButtons />

              {/* Register Link */}
              <View style={styles.footerRow}>
                <Text style={[styles.footerText, { color: theme.textSecondary }]}>{t.dontHaveAccount}</Text>
                <TouchableOpacity onPress={onNavigateToRegister} activeOpacity={0.7}>
                  <Text style={[styles.registerLink, { color: theme.textPrimary }]}>{t.signUpNow}</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
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
    width: '100%',
  },
  keyboardView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    paddingBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  responsiveWrapper: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  fullTopRightControls: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 16,
    right: 16,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitleHeader: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  brandTitleText: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.6,
    textAlign: 'center',
    fontFamily: typography.fontFamily,
  },
  mainCard: {
    width: '100%',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  leftTitleSection: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'left',
    fontFamily: typography.fontFamily,
  },
  subtitleText: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'left',
    fontWeight: '400',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    rowGap: 6,
    marginVertical: 10,
    width: '100%',
  },
  rememberMeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberMeText: {
    fontSize: 11.5,
    marginLeft: 5,
    fontWeight: '500',
  },
  forgotPasswordText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  loginButton: {
    marginTop: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  footerText: {
    fontSize: 12.5,
  },
  registerLink: {
    fontSize: 12.5,
    fontWeight: '700',
    marginLeft: 6,
  },
});
