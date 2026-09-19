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
import { Mail, Lock, User as UserIcon, Phone, CheckSquare, Square, ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { RoleSelector } from '../components/RoleSelector';
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
            <TouchableOpacity onPress={onNavigateToLogin} style={[styles.backButton, { backgroundColor: theme.toggleBg, borderColor: theme.cardBorder }]}>
              <ArrowLeft size={18} color={theme.textPrimary} />
              <Text style={[styles.backText, { color: theme.textPrimary }]}>{t.login}</Text>
            </TouchableOpacity>
            <View style={styles.rightControls}>
              <ThemeToggle />
              <LanguageToggle />
            </View>
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
            <Text style={[styles.createAccountTitle, { color: theme.textPrimary }]}>{t.createAccount}</Text>
            <Text style={[styles.joinSubtitle, { color: theme.textSecondary }]}>{t.joinNepalAdvocate}</Text>

            <View style={{ height: 16 }} />

            {/* Role Selection */}
            <RoleSelector selectedRole={role} onSelectRole={setRole} />

            {/* Form Fields */}
            <View style={styles.rowFields}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <CustomInput
                  label={t.firstName}
                  placeholder={t.firstName}
                  value={firstName}
                  onChangeText={setFirstName}
                  error={firstNameError}
                  icon={<UserIcon size={18} color={theme.textSecondary} />}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
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

            <CustomInput
              label={t.confirmPassword}
              placeholder={t.confirmPasswordHint}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword
              error={confirmPasswordError}
              icon={<Lock size={18} color={theme.textSecondary} />}
            />

            {/* Terms & Privacy Box */}
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
                  <CheckSquare size={18} color={theme.accent} />
                ) : (
                  <Square size={18} color={theme.textMuted} />
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
                  <CheckSquare size={18} color={theme.accent} />
                ) : (
                  <Square size={18} color={theme.textMuted} />
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
              style={{ marginTop: 12 }}
            />

            {/* Login Switch */}
            <View style={styles.footerRow}>
              <Text style={[styles.footerText, { color: theme.textSecondary }]}>{t.alreadyHaveAccount}</Text>
              <TouchableOpacity onPress={onNavigateToLogin} activeOpacity={0.7}>
                <Text style={[styles.loginLink, { color: theme.accent }]}>{t.signInNow}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
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
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  backText: {
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 6,
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
  },
  createAccountTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  joinSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  rowFields: {
    flexDirection: 'row',
  },
  termsBox: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    marginVertical: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  termsLabel: {
    fontSize: 13,
    marginLeft: 10,
    flex: 1,
  },
  termsErrorText: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  footerText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
});
