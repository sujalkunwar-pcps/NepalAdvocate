import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, User as UserIcon, Phone, ShieldCheck, CheckSquare, Square, ArrowLeft } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { RoleSelector } from '../components/RoleSelector';
import { LanguageToggle } from '../components/LanguageToggle';
import { TimedDialog } from '../components/TimedDialog';

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
  onRegisterSuccess: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onNavigateToLogin,
  onRegisterSuccess,
}) => {
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
    <LinearGradient colors={Colors.backgroundGradient} style={styles.gradientContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Bar */}
          <View style={styles.headerBar}>
            <TouchableOpacity onPress={onNavigateToLogin} style={styles.backButton}>
              <ArrowLeft size={20} color={Colors.primary} />
              <Text style={styles.backText}>{t.login}</Text>
            </TouchableOpacity>
            <LanguageToggle />
          </View>

          {/* Header Titles */}
          <View style={styles.headerSection}>
            <Text style={styles.createAccountTitle}>{t.createAccount}</Text>
            <Text style={styles.joinSubtitle}>{t.joinNepalAdvocate}</Text>
          </View>

          {/* Glass Form Container */}
          <View style={styles.glassCard}>
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
                  icon={<UserIcon size={18} color={Colors.primary} />}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <CustomInput
                  label={t.lastName}
                  placeholder={t.lastName}
                  value={lastName}
                  onChangeText={setLastName}
                  error={lastNameError}
                  icon={<UserIcon size={18} color={Colors.primary} />}
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
              icon={<Mail size={18} color={Colors.primary} />}
            />

            <CustomInput
              label={`${t.phone} (${t.optional})`}
              placeholder="98XXXXXXXX"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              icon={<Phone size={18} color={Colors.primary} />}
            />

            <CustomInput
              label={t.password}
              placeholder={t.enterYourPassword}
              value={password}
              onChangeText={setPassword}
              isPassword
              error={passwordError}
              icon={<Lock size={18} color={Colors.primary} />}
            />

            <CustomInput
              label={t.confirmPassword}
              placeholder={t.confirmPasswordHint}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword
              error={confirmPasswordError}
              icon={<Lock size={18} color={Colors.primary} />}
            />

            {/* Terms & Privacy Box */}
            <View
              style={[
                styles.termsBox,
                termsError && { borderColor: Colors.error, borderWidth: 1.5 },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.checkboxRow}
                onPress={() => {
                  setAcceptedTerms(!acceptedTerms);
                  if (!acceptedTerms && acceptedPrivacy) setTermsError(false);
                }}
              >
                {acceptedTerms ? (
                  <CheckSquare size={20} color={Colors.primary} />
                ) : (
                  <Square size={20} color={Colors.textMuted} />
                )}
                <Text style={styles.termsLabel}>{t.acceptTerms}</Text>
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
                  <CheckSquare size={20} color={Colors.primary} />
                ) : (
                  <Square size={20} color={Colors.textMuted} />
                )}
                <Text style={styles.termsLabel}>{t.acceptPrivacy}</Text>
              </TouchableOpacity>

              {termsError && (
                <Text style={styles.termsErrorText}>{t.mustAcceptTerms}</Text>
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
              <Text style={styles.footerText}>{t.alreadyHaveAccount}</Text>
              <TouchableOpacity onPress={onNavigateToLogin} activeOpacity={0.7}>
                <Text style={styles.loginLink}>{t.signInNow}</Text>
              </TouchableOpacity>
            </View>
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
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingBottom: 24,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  backText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
  headerSection: {
    marginBottom: 16,
  },
  createAccountTitle: {
    color: Colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  joinSubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  glassCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: 16,
  },
  rowFields: {
    flexDirection: 'row',
  },
  termsBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    marginVertical: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  termsLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginLeft: 10,
    flex: 1,
  },
  termsErrorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
});
