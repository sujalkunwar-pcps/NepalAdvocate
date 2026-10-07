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
  ActivityIndicator,
} from 'react-native';
import { typography } from '../theme/typography';
import {
  Mail,
  Lock,
  CheckSquare,
  Square,
  Fingerprint,
  ScanFace,
  Shield,
  User,
  ArrowRight,
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { SocialButtons } from '../components/SocialButtons';
import { LanguageToggle } from '../components/LanguageToggle';
import { ThemeToggle } from '../components/ThemeToggle';
import { TimedDialog } from '../components/TimedDialog';
import { useGoogleAuth } from '../hooks/useGoogleAuth';

interface LoginScreenProps {
  onNavigateToRegister: () => void;
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigateToRegister,
  onLoginSuccess,
}) => {
  const { theme } = useTheme();
  const {
    t,
    login,
    googleLogin,
    loginWithBiometrics,
    isLoading,
    errorMessage,
    isBiometricAvailable,
    isBiometricEnabled,
    biometricType,
    hasSavedBiometrics,
    savedBiometricAccount,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [saveBiometric, setSaveBiometric] = useState(true);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogType, setDialogType] = useState<'success' | 'error' | 'info'>('info');

  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(!hasSavedBiometrics);

  const { signInWithGoogle, isLoading: isGoogleLoading } = useGoogleAuth(() => {
    setDialogTitle(t.loginSuccessTitle);
    setDialogMessage('Signed in via Google successfully.');
    setDialogType('success');
    setDialogVisible(true);
    setTimeout(() => {
      onLoginSuccess();
    }, 1200);
  });

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
      saveBiometric,
    });

    if (success) {
      setDialogTitle(t.loginSuccessTitle);
      setDialogMessage(t.loginSuccessBody);
      setDialogType('success');
      setDialogVisible(true);
      setTimeout(() => {
        onLoginSuccess();
      }, 1000);
    } else {
      setDialogTitle(t.loginFailed);
      setDialogMessage(errorMessage || t.loginCredentialsMismatch);
      setDialogType('error');
      setDialogVisible(true);
    }
  };

  const handleBiometricLogin = async () => {
    setIsBiometricLoading(true);
    try {
      const success = await loginWithBiometrics(false);
      if (success) {
        setDialogTitle(t.loginSuccessTitle);
        setDialogMessage(`${biometricType} verified. Welcome back!`);
        setDialogType('success');
        setDialogVisible(true);
        setTimeout(() => {
          onLoginSuccess();
        }, 1000);
      } else {
        const msg = errorMessage || `${biometricType} verification failed.`;
        if (!msg.toLowerCase().includes('cancel') && !msg.toLowerCase().includes('dismiss')) {
          setDialogTitle(`${biometricType} Sign-In`);
          setDialogMessage(msg);
          setDialogType('error');
          setDialogVisible(true);
        }
      }
    } catch (err: any) {
      const msg = err?.message || errorMessage || `${biometricType} verification failed.`;
      if (!msg.toLowerCase().includes('cancel') && !msg.toLowerCase().includes('dismiss')) {
        setDialogTitle(`${biometricType} Sign-In`);
        setDialogMessage(msg);
        setDialogType('error');
        setDialogVisible(true);
      }
    } finally {
      setIsBiometricLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setDialogTitle(t.forgotPassword);
    setDialogMessage(t.passwordResetSent);
    setDialogType('info');
    setDialogVisible(true);
  };

  const handleGooglePress = async () => {
    const targetRole = savedBiometricAccount?.role === 'LAWYER' ? ('LAWYER' as const) : undefined;
    const result = await signInWithGoogle(targetRole);
    if (!result.success && result.message && result.message !== 'Google sign-in was cancelled.') {
      setDialogTitle(t.loginFailed);
      setDialogMessage(result.message);
      setDialogType('error');
      setDialogVisible(true);
    }
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
              {hasSavedBiometrics && !showPasswordForm ? (
                /* Dedicated Biometric Unlock View */
                <View>
                  <View style={styles.leftTitleSection}>
                    <Text style={[styles.welcomeText, { color: theme.textPrimary }]}>{t.welcomeBack}</Text>
                    <Text style={[styles.subtitleText, { color: theme.textSecondary }]}>
                      {`Instant sign-in with ${biometricType}`}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.bioAccountCard,
                      {
                        backgroundColor: theme.background,
                        borderColor: theme.cardBorder,
                      },
                    ]}
                  >
                    <View style={[styles.bioIconCircle, { backgroundColor: theme.primary + '18' }]}>
                      {biometricType === 'Face ID' ? (
                        <ScanFace size={36} color={theme.primary} />
                      ) : (
                        <Fingerprint size={36} color={theme.primary} />
                      )}
                    </View>
                    <Text style={[styles.bioAccountName, { color: theme.textPrimary }]} numberOfLines={1}>
                      {savedBiometricAccount?.name || 'Saved Account'}
                    </Text>
                    <Text style={[styles.bioAccountEmail, { color: theme.textMuted }]} numberOfLines={1}>
                      {savedBiometricAccount?.email || ''}
                    </Text>
                    <View style={[styles.bioRoleBadge, { backgroundColor: theme.toggleBg }]}>
                      <Shield size={10} color={theme.textPrimary} style={{ marginRight: 4 }} />
                      <Text style={[styles.bioRoleText, { color: theme.textPrimary }]}>
                        {savedBiometricAccount?.role === 'LAWYER' ? 'Advocate' : 'Client'}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleBiometricLogin}
                    disabled={isBiometricLoading}
                    style={[
                      styles.bioMainBtn,
                      {
                        backgroundColor: theme.primary,
                      },
                    ]}
                  >
                    {isBiometricLoading ? (
                      <ActivityIndicator size="small" color={theme.textInverse} />
                    ) : (
                      <>
                        {biometricType === 'Face ID' ? (
                          <ScanFace size={20} color={theme.textInverse} style={{ marginRight: 8 }} />
                        ) : (
                          <Fingerprint size={20} color={theme.textInverse} style={{ marginRight: 8 }} />
                        )}
                        <Text style={[styles.bioMainBtnText, { color: theme.textInverse }]}>
                          {`Sign in with ${biometricType}`}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setShowPasswordForm(true)}
                    style={styles.switchModeBtn}
                  >
                    <Text style={[styles.switchModeText, { color: theme.primary }]}>
                      Sign in with password or switch account
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                /* Standard Credentials Form */
                <View>
                  <View style={styles.leftTitleSection}>
                    <Text style={[styles.welcomeText, { color: theme.textPrimary }]}>{t.welcomeBack}</Text>
                    <Text style={[styles.subtitleText, { color: theme.textSecondary }]}>{t.loginSubtitle}</Text>
                  </View>

                  {hasSavedBiometrics && (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setShowPasswordForm(false)}
                      style={[
                        styles.bioQuickBanner,
                        {
                          backgroundColor: theme.primary + '12',
                          borderColor: theme.primary + '30',
                        },
                      ]}
                    >
                      {biometricType === 'Face ID' ? (
                        <ScanFace size={16} color={theme.primary} style={{ marginRight: 6 }} />
                      ) : (
                        <Fingerprint size={16} color={theme.primary} style={{ marginRight: 6 }} />
                      )}
                      <Text style={[styles.bioQuickBannerText, { color: theme.primary }]}>
                        {`Switch to ${biometricType} sign-in`}
                      </Text>
                    </TouchableOpacity>
                  )}

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

                  {/* Biometric Save Checkbox */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.biometricCheckRow, { backgroundColor: theme.background, borderColor: theme.cardBorder }]}
                    onPress={() => setSaveBiometric(!saveBiometric)}
                  >
                    {saveBiometric ? (
                      <CheckSquare size={16} color={theme.primary} />
                    ) : (
                      <Square size={16} color={theme.textMuted} />
                    )}
                    {biometricType === 'Face ID' ? (
                      <ScanFace size={15} color={theme.primary} style={{ marginLeft: 6, marginRight: 4 }} />
                    ) : (
                      <Fingerprint size={15} color={theme.primary} style={{ marginLeft: 6, marginRight: 4 }} />
                    )}
                    <Text style={[styles.biometricSaveText, { color: theme.textSecondary }]}>
                      {`Enable ${biometricType} fast login`}
                    </Text>
                  </TouchableOpacity>

                  {/* Unified Sign In Button */}
                  <CustomButton
                    title={t.login}
                    onPress={handleLogin}
                    isLoading={isLoading}
                    style={styles.loginButton}
                  />
                </View>
              )}

              {/* Social Logins */}
              <SocialButtons
                onGooglePress={handleGooglePress}
              />

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
    maxWidth: 420,
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
    paddingHorizontal: 18,
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
    marginBottom: 14,
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
  bioAccountCard: {
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 16,
  },
  bioIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  bioAccountName: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: typography.fontFamily,
    marginBottom: 4,
  },
  bioAccountEmail: {
    fontSize: 13,
    marginBottom: 10,
  },
  bioRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  bioRoleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bioMainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 14,
    width: '100%',
    marginBottom: 12,
  },
  bioMainBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  switchModeBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  switchModeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  bioQuickBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  bioQuickBannerText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    rowGap: 6,
    marginTop: 8,
    marginBottom: 8,
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
  biometricCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  biometricSaveText: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  loginButton: {
    marginTop: 4,
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
