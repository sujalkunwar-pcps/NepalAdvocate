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
import { Mail, Lock, User as UserIcon, Phone, CheckSquare, Square, ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { typography } from '../theme/typography';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { RoleSelector } from '../components/RoleSelector';
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter';
import { SocialButtons } from '../components/SocialButtons';
import { LanguageToggle } from '../components/LanguageToggle';
import { ThemeToggle } from '../components/ThemeToggle';
import { TimedDialog } from '../components/TimedDialog';

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
  onRegisterSuccess: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onNavigateToLogin,
  onRegisterSuccess,
}) => {
  const { theme } = useTheme();
  const { t, register, isLoading } = useAuth();

  const [role, setRole] = useState<'CLIENT' | 'LAWYER'>('CLIENT');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [termsError, setTermsError] = useState(false);

  // Field errors
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogType, setDialogType] = useState<'success' | 'error' | 'info'>('info');

  // Animation
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

    if (!firstName.trim()) {
      setFirstNameError(`${t.pleaseEnter} ${t.firstName.toLowerCase()}`);
      isValid = false;
    } else {
      setFirstNameError(null);
    }

    if (!lastName.trim()) {
      setLastNameError(`${t.pleaseEnter} ${t.lastName.toLowerCase()}`);
      isValid = false;
    } else {
      setLastNameError(null);
    }

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

    if (!confirmPassword) {
      setConfirmPasswordError(`${t.pleaseEnter} ${t.confirmPassword.toLowerCase()}`);
      isValid = false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError(`${t.password} ${t.doNotMatch}`);
      isValid = false;
    } else {
      setConfirmPasswordError(null);
    }

    if (!acceptedTerms || !acceptedPrivacy) {
      setTermsError(true);
      isValid = false;
    } else {
      setTermsError(false);
    }

    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    const success = await register({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      password,
      role,
      acceptedTerms,
      acceptedPrivacy,
    });

    if (success) {
      setDialogTitle(t.registrationSuccessTitle);
      setDialogMessage(t.registrationSuccessBody);
      setDialogType('success');
      setDialogVisible(true);
      setTimeout(() => {
        onRegisterSuccess();
      }, 1500);
    } else {
      setDialogTitle(t.registrationFailed);
      setDialogMessage(t.registrationError);
      setDialogType('error');
      setDialogVisible(true);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Back Button Pinned to Full Top Left */}
      <TouchableOpacity
        onPress={onNavigateToLogin}
        activeOpacity={0.7}
        style={[styles.fullTopLeftBack, { backgroundColor: theme.toggleBg, borderColor: theme.cardBorder }]}
      >
        <ArrowLeft size={16} color={theme.textPrimary} />
        <Text style={[styles.backText, { color: theme.textPrimary }]}>{t.login}</Text>
      </TouchableOpacity>

      {/* Mode & Language Pinned to Full Top Right */}
      <View style={styles.fullTopRightControls}>
        <ThemeToggle />
        <View style={{ width: 6 }} />
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
              <Text style={[styles.brandNameText, { color: theme.textPrimary }]} numberOfLines={1}>
                NepalAdvocate
              </Text>
            </View>

            {/* Main Card */}
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
              <View style={styles.leftTitleSection}>
                <Text style={[styles.createAccountTitle, { color: theme.textPrimary }]}>{t.createAccount}</Text>
                <Text style={[styles.joinSubtitle, { color: theme.textSecondary }]}>{t.joinNepalAdvocate}</Text>
              </View>

              <RoleSelector selectedRole={role} onSelectRole={setRole} />

              <View style={styles.rowFields}>
                <View style={{ flex: 1, marginRight: 6 }}>
                  <CustomInput
                    label={t.firstName}
                    placeholder={t.firstName}
                    value={firstName}
                    onChangeText={setFirstName}
                    error={firstNameError}
                    icon={<UserIcon size={18} color={theme.textSecondary} />}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 6 }}>
                  <CustomInput
                    label={t.lastName}
                    placeholder={t.lastName}
                    value={lastName}
                    onChangeText={setLastName}
                    error={lastNameError}
                    icon={<UserIcon size={18} color={theme.textSecondary} />}
                  />
                </View>
              </View>

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
                label={`${t.phone} (${t.optional})`}
                placeholder="98XXXXXXXX"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                icon={<Phone size={18} color={theme.textSecondary} />}
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

              <PasswordStrengthMeter password={password} />

              <CustomInput
                label={t.confirmPassword}
                placeholder={t.confirmPasswordHint}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                isPassword
                error={confirmPasswordError}
                icon={<Lock size={18} color={theme.textSecondary} />}
              />

              <View style={[styles.termsBox, { backgroundColor: theme.background, borderColor: termsError ? theme.error : theme.cardBorder }]}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.checkboxRow}
                  onPress={() => {
                    setAcceptedTerms(!acceptedTerms);
                    if (!acceptedTerms && acceptedPrivacy) setTermsError(false);
                  }}
                >
                  {acceptedTerms ? (
                    <CheckSquare size={17} color={theme.textPrimary} />
                  ) : (
                    <Square size={17} color={theme.textMuted} />
                  )}
                  <Text style={[styles.termsLabel, { color: theme.textSecondary }]}>{t.acceptTerms}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.checkboxRow, { marginTop: 10 }]}
                  onPress={() => {
                    setAcceptedPrivacy(!acceptedPrivacy);
                    if (acceptedTerms && !acceptedPrivacy) setTermsError(false);
                  }}
                >
                  {acceptedPrivacy ? (
                    <CheckSquare size={17} color={theme.textPrimary} />
                  ) : (
                    <Square size={17} color={theme.textMuted} />
                  )}
                  <Text style={[styles.termsLabel, { color: theme.textSecondary }]}>{t.acceptPrivacy}</Text>
                </TouchableOpacity>

                {termsError && (
                  <Text style={[styles.termsErrorText, { color: theme.error }]}>{t.mustAcceptTerms}</Text>
                )}
              </View>

              <CustomButton
                title={t.register}
                onPress={handleRegister}
                isLoading={isLoading}
                style={{ ...styles.registerButton, backgroundColor: theme.primary }}
              />

              <SocialButtons />

              <View style={styles.footerRow}>
                <Text style={[styles.footerText, { color: theme.textSecondary }]}>{t.alreadyHaveAccount}</Text>
                <TouchableOpacity onPress={onNavigateToLogin} activeOpacity={0.7}>
                  <Text style={[styles.loginLink, { color: theme.textPrimary }]}>{t.signInNow}</Text>
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
    paddingHorizontal: 14,
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    paddingBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  responsiveWrapper: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  fullTopLeftBack: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 16,
    left: 16,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 18,
    borderWidth: 1,
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
  backText: {
    fontWeight: '600',
    fontSize: 12.5,
    marginLeft: 4,
  },
  brandNameText: {
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
    paddingTop: 24,
    paddingBottom: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 16,
  },
  leftTitleSection: {
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  createAccountTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'left',
    fontFamily: typography.fontFamily,
  },
  joinSubtitle: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'left',
    fontWeight: '400',
  },
  rowFields: {
    flexDirection: 'row',
  },
  termsBox: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    marginVertical: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  termsLabel: {
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
  termsErrorText: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  registerButton: {
    marginTop: 10,
    borderRadius: 25,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  footerText: {
    fontSize: 13,
  },
  loginLink: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
});
