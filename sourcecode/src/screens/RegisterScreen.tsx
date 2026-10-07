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
import Svg, { Path } from 'react-native-svg';
import {
  ArrowLeft,
  Shield,
  Briefcase,
  MapPin,
  Clock,
  Fingerprint,
  ScanFace,
  Check,
  ArrowRight,
  ShieldCheck,
  Scale,
  Users,
  FileText,
  Phone,
  Sparkles,
  CheckSquare,
  Square,
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { typography } from '../theme/typography';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { LanguageToggle } from '../components/LanguageToggle';
import { ThemeToggle } from '../components/ThemeToggle';
import { TimedDialog } from '../components/TimedDialog';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { ActivityIndicator } from 'react-native';

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
  onRegisterSuccess: () => void;
}

type RegistrationStep = 'GOOGLE_CONNECT' | 'ROLE_SELECT' | 'ROLE_DETAILS';

const GoogleGIcon: React.FC<{ size?: number }> = ({ size = 22 }) => (
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

const SPECIALIZATION_SUGGESTIONS = [
  'Corporate & Tax Law',
  'Property & Malpot Land',
  'Criminal Defense & Bail',
  'Family & Civil Matters',
  'Constitutional & Appellate',
  'Commercial Contracts',
];

const CLIENT_INTEREST_SUGGESTIONS = [
  'Land / Malpot Disputes',
  'Business & Company Registration',
  'Family & Inheritance',
  'Criminal & Police Matters',
  'General Legal Guidance',
];

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onNavigateToLogin,
  onRegisterSuccess,
}) => {
  const { theme } = useTheme();
  const { t, googleLogin, isLoading, biometricType } = useAuth();

  // Wizard Step State
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('GOOGLE_CONNECT');
  const { promptGoogleProfile, isLoading: isGoogleLoading } = useGoogleAuth();

  // Authenticated Google Profile
  const [googleProfile, setGoogleProfile] = useState<{
    email: string;
    name: string;
    avatar?: string;
  } | null>(null);

  // Step 2: Role
  const [role, setRole] = useState<'CLIENT' | 'LAWYER'>('CLIENT');

  // Step 3: Role Details
  // Lawyer-specific
  const [barLicenseNumber, setBarLicenseNumber] = useState('');
  const [specialization, setSpecialization] = useState('Corporate & Civil Law');
  const [experience, setExperience] = useState('5');
  const [hourlyRate, setHourlyRate] = useState('2500');
  const [officeLocation, setOfficeLocation] = useState('Anamnagar, Kathmandu');
  const [bio, setBio] = useState('');

  // Client-specific
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Kathmandu');
  const [legalInterest, setLegalInterest] = useState('General Legal Guidance');

  // Common
  const [saveBiometric, setSaveBiometric] = useState(true);

  // Errors & Dialogs
  const [barLicenseError, setBarLicenseError] = useState<string | null>(null);
  const [officeLocationError, setOfficeLocationError] = useState<string | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogType, setDialogType] = useState<'success' | 'error' | 'info'>('info');

  // Fade animation
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [currentStep]);

  // Back button handler
  const handleBack = () => {
    if (currentStep === 'ROLE_DETAILS') {
      setCurrentStep('ROLE_SELECT');
    } else if (currentStep === 'ROLE_SELECT') {
      setCurrentStep('GOOGLE_CONNECT');
    } else {
      onNavigateToLogin();
    }
  };

  // Step 1: Open Real Google Authentication
  const handleOpenGoogle = async () => {
    const profile = await promptGoogleProfile();
    if (!profile) return; // User closed browser or cancelled

    setGoogleProfile({
      email: profile.email,
      name: profile.name,
      avatar: profile.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    });

    // Auto-detect role pre-selection based on email/name if apparent
    if (
      profile.email.toLowerCase().includes('advocate') ||
      profile.email.toLowerCase().includes('bikram') ||
      profile.name.toLowerCase().includes('adv')
    ) {
      setRole('LAWYER');
    } else {
      setRole('CLIENT');
    }

    // Advance to Step 2
    setCurrentStep('ROLE_SELECT');
  };

  // Step 2: Role selection proceed
  const handleProceedToDetails = () => {
    setCurrentStep('ROLE_DETAILS');
  };

  // Step 3: Final validation & full registration submission
  const handleCompleteRegistration = async () => {
    if (!googleProfile) return;

    if (role === 'LAWYER') {
      if (!barLicenseNumber.trim()) {
        setBarLicenseError('Nepal Bar Council License Number (Sanad No.) is required.');
        return;
      }
      setBarLicenseError(null);

      if (!officeLocation.trim()) {
        setOfficeLocationError('Chamber / Office location is required.');
        return;
      }
      setOfficeLocationError(null);
    }

    const payload = {
      email: googleProfile.email,
      name: googleProfile.name,
      picture: googleProfile.avatar,
      role,
      phone: phone.trim() || undefined,
      saveBiometric,
      ...(role === 'LAWYER'
        ? {
            barLicenseNumber: barLicenseNumber.trim(),
            specialization: specialization.trim() || 'Corporate & Civil Law',
            experience: Number(experience) || 1,
            hourlyRate: Number(hourlyRate) || 2500,
            officeLocation: officeLocation.trim() || 'Kathmandu, Nepal',
            bio: bio.trim() || 'Licensed legal advocate registered with Nepal Bar Council.',
          }
        : {
            officeLocation: city.trim() || 'Kathmandu, Nepal',
            bio: `Client looking for assistance in: ${legalInterest}`,
          }),
    };

    const success = await googleLogin(payload);

    if (success) {
      setDialogTitle(t.registrationSuccessTitle);
      setDialogMessage(
        role === 'LAWYER'
          ? `Welcome Adv. ${googleProfile.name}! Your Nepal Bar Council credentials have been verified and your Advocate Dashboard is ready.`
          : `Welcome ${googleProfile.name}! Your NepalAdvocate account has been created successfully.`
      );
      setDialogType('success');
      setDialogVisible(true);

      setTimeout(() => {
        onRegisterSuccess();
      }, 1200);
    } else {
      setDialogTitle(t.registrationFailed);
      setDialogMessage('Registration could not be completed. Please check your connection and try again.');
      setDialogType('error');
      setDialogVisible(true);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Left Navigation Button */}
      <TouchableOpacity
        onPress={handleBack}
        activeOpacity={0.7}
        style={[styles.fullTopLeftBack, { backgroundColor: theme.toggleBg, borderColor: theme.cardBorder }]}
      >
        <ArrowLeft size={16} color={theme.textPrimary} />
        <Text style={[styles.backText, { color: theme.textPrimary }]}>
          {currentStep === 'GOOGLE_CONNECT'
            ? t.login
            : currentStep === 'ROLE_SELECT'
            ? 'Change Account'
            : 'Change Role'}
        </Text>
      </TouchableOpacity>

      {/* Top Right Controls */}
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
            {/* ================= STEP 1: GOOGLE CONNECT ================= */}
            {currentStep === 'GOOGLE_CONNECT' && (
              <Animated.View style={[styles.mainCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, opacity: fadeAnim }]}>
                {/* Brand Seal Header */}
                <View style={styles.brandCenterHeader}>
                  <View style={[styles.iconCircle, { backgroundColor: theme.primary + '15' }]}>
                    <Scale size={32} color={theme.primary} />
                  </View>
                  <Text style={[styles.brandNameText, { color: theme.textPrimary }]}>NepalAdvocate</Text>
                  <Text style={[styles.brandSubText, { color: theme.textSecondary }]}>
                    Nepal's Integrated Legal Practice & Citizen Portal
                  </Text>
                </View>

                {/* Main Registration Card */}
                <View style={[styles.googleHeroBox, { backgroundColor: theme.background, borderColor: theme.cardBorder }]}>
                  <View style={styles.stepBadge}>
                    <Sparkles size={14} color={theme.primary} />
                    <Text style={[styles.stepBadgeText, { color: theme.primary }]}>
                      Fast & Verified Registration
                    </Text>
                  </View>

                  <Text style={[styles.googleHeroTitle, { color: theme.textPrimary }]}>
                    Sign Up with Google
                  </Text>
                  <Text style={[styles.googleHeroSub, { color: theme.textSecondary }]}>
                    NepalAdvocate requires verified Google identity for all members to ensure transparent legal representation and eliminate fake profiles.
                  </Text>

                  {/* Primary Google Action Button */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleOpenGoogle}
                    disabled={isGoogleLoading}
                    style={[styles.bigGoogleBtn, { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }]}
                  >
                    {isGoogleLoading ? (
                      <ActivityIndicator size="small" color="#4285F4" />
                    ) : (
                      <>
                        <GoogleGIcon size={24} />
                        <Text style={styles.bigGoogleBtnText}>Continue with Google</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <Text style={[styles.googleSecurityNote, { color: theme.textMuted }]}>
                    Next, you will choose your role (Client or Advocate) and set up your profile details.
                  </Text>
                </View>

                {/* Features Highlights */}
                <View style={styles.featuresList}>
                  <View style={styles.featureItem}>
                    <ShieldCheck size={18} color="#10B981" />
                    <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                      Nepal Bar Council License Recognition
                    </Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Sparkles size={18} color="#3B82F6" />
                    <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                      Instant 1-Tap Biometric / Face ID Login
                    </Text>
                  </View>
                  <View style={styles.featureItem}>
                    <FileText size={18} color="#F59E0B" />
                    <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                      End-to-End Secure Case & Document Portal
                    </Text>
                  </View>
                </View>

                {/* Already have an account */}
                <View style={styles.footerRow}>
                  <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                    {t.alreadyHaveAccount}
                  </Text>
                  <TouchableOpacity onPress={onNavigateToLogin} activeOpacity={0.7}>
                    <Text style={[styles.loginLink, { color: theme.primary }]}>
                      {t.signInNow}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}

            {/* ================= STEP 2: ROLE SELECTION ================= */}
            {currentStep === 'ROLE_SELECT' && (
              <Animated.View style={[styles.mainCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, opacity: fadeAnim }]}>
                {/* Connected Google Profile Banner */}
                {googleProfile && (
                  <View style={[styles.connectedProfileBanner, { backgroundColor: theme.background, borderColor: '#10B98150' }]}>
                    <Image source={{ uri: googleProfile.avatar }} style={styles.connectedAvatar} />
                    <View style={styles.connectedInfo}>
                      <Text style={[styles.connectedName, { color: theme.textPrimary }]} numberOfLines={1}>
                        {googleProfile.name}
                      </Text>
                      <Text style={[styles.connectedEmail, { color: theme.textMuted }]} numberOfLines={1}>
                        {googleProfile.email}
                      </Text>
                    </View>
                    <View style={styles.verifiedPill}>
                      <Check size={12} color="#10B981" />
                      <Text style={styles.verifiedPillText}>Verified</Text>
                    </View>
                  </View>
                )}

                {/* Step Indicator */}
                <View style={styles.stepHeader}>
                  <Text style={[styles.stepNumber, { color: theme.primary }]}>STEP 1 OF 2</Text>
                  <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>
                    Select Your Account Role
                  </Text>
                  <Text style={[styles.stepSub, { color: theme.textSecondary }]}>
                    Please select whether you are seeking legal counsel or joining as a licensed advocate.
                  </Text>
                </View>

                {/* Role Option 1: Client */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setRole('CLIENT')}
                  style={[
                    styles.roleCard,
                    {
                      backgroundColor: theme.background,
                      borderColor: role === 'CLIENT' ? theme.primary : theme.cardBorder,
                      borderWidth: role === 'CLIENT' ? 2 : 1,
                    },
                  ]}
                >
                  <View style={[styles.roleIconWrap, { backgroundColor: theme.primary + '15' }]}>
                    <Users size={24} color={theme.primary} />
                  </View>
                  <View style={styles.roleCardBody}>
                    <View style={styles.roleTitleRow}>
                      <Text style={[styles.roleCardTitle, { color: theme.textPrimary }]}>
                        Client / Citizen
                      </Text>
                      {role === 'CLIENT' && (
                        <View style={[styles.roleRadioChecked, { backgroundColor: theme.primary }]}>
                          <Check size={12} color="#FFF" />
                        </View>
                      )}
                    </View>
                    <Text style={[styles.roleCardDesc, { color: theme.textSecondary }]}>
                      Seek legal advice, consult verified advocates, schedule appointments, and generate legal documents.
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Role Option 2: Advocate / Lawyer */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setRole('LAWYER')}
                  style={[
                    styles.roleCard,
                    {
                      backgroundColor: theme.background,
                      borderColor: role === 'LAWYER' ? '#F59E0B' : theme.cardBorder,
                      borderWidth: role === 'LAWYER' ? 2 : 1,
                    },
                  ]}
                >
                  <View style={[styles.roleIconWrap, { backgroundColor: '#F59E0B20' }]}>
                    <ShieldCheck size={24} color="#F59E0B" />
                  </View>
                  <View style={styles.roleCardBody}>
                    <View style={styles.roleTitleRow}>
                      <Text style={[styles.roleCardTitle, { color: theme.textPrimary }]}>
                        Advocate / Legal Practitioner
                      </Text>
                      {role === 'LAWYER' && (
                        <View style={[styles.roleRadioChecked, { backgroundColor: '#F59E0B' }]}>
                          <Check size={12} color="#FFF" />
                        </View>
                      )}
                    </View>
                    <View style={styles.barBadge}>
                      <Text style={styles.barBadgeText}>Nepal Bar Council License</Text>
                    </View>
                    <Text style={[styles.roleCardDesc, { color: theme.textSecondary }]}>
                      Licensed advocate practicing in Nepal. Accept client consultations, manage case schedules, and receive fees.
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Next Button */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleProceedToDetails}
                  style={[styles.actionBtn, { backgroundColor: role === 'LAWYER' ? '#F59E0B' : theme.primary }]}
                >
                  <Text style={styles.actionBtnText}>
                    {role === 'LAWYER' ? 'Next: Enter Bar Credentials' : 'Next: Complete Client Details'}
                  </Text>
                  <ArrowRight size={18} color="#FFF" />
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* ================= STEP 3: ROLE DETAILS ================= */}
            {currentStep === 'ROLE_DETAILS' && (
              <Animated.View style={[styles.mainCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, opacity: fadeAnim }]}>
                {/* Header Badge */}
                <View style={styles.detailsHeaderRow}>
                  <View>
                    <Text style={[styles.stepNumber, { color: role === 'LAWYER' ? '#F59E0B' : theme.primary }]}>
                      STEP 2 OF 2
                    </Text>
                    <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>
                      {role === 'LAWYER' ? 'Advocate Verification' : 'Client Profile Setup'}
                    </Text>
                  </View>
                  <View style={[styles.rolePill, { backgroundColor: role === 'LAWYER' ? '#F59E0B20' : theme.primary + '20' }]}>
                    <Text style={[styles.rolePillText, { color: role === 'LAWYER' ? '#D97706' : theme.primary }]}>
                      {role === 'LAWYER' ? '⚖️ Advocate' : '👤 Client'}
                    </Text>
                  </View>
                </View>

                {/* If Advocate */}
                {role === 'LAWYER' ? (
                  <View style={styles.formContainer}>
                    {/* Bar License Number */}
                    <CustomInput
                      label="Nepal Bar Council License (Sanad No.) *"
                      placeholder="e.g. NBA-5421"
                      value={barLicenseNumber}
                      onChangeText={(val) => {
                        setBarLicenseNumber(val);
                        if (val.trim()) setBarLicenseError(null);
                      }}
                      error={barLicenseError}
                      icon={<Shield size={18} color={theme.primary} />}
                    />

                    {/* Specialization with quick suggestion pills */}
                    <CustomInput
                      label="Practice Specialization *"
                      placeholder="e.g. Corporate & Civil Law"
                      value={specialization}
                      onChangeText={setSpecialization}
                      icon={<Briefcase size={18} color={theme.textSecondary} />}
                    />
                    <View style={styles.suggestionsWrapper}>
                      <Text style={[styles.suggestionsLabel, { color: theme.textMuted }]}>Quick Select:</Text>
                      <View style={styles.pillsRow}>
                        {SPECIALIZATION_SUGGESTIONS.map((sug) => (
                          <TouchableOpacity
                            key={sug}
                            activeOpacity={0.7}
                            onPress={() => setSpecialization(sug)}
                            style={[
                              styles.sugPill,
                              {
                                backgroundColor: specialization === sug ? theme.primary + '20' : theme.background,
                                borderColor: specialization === sug ? theme.primary : theme.cardBorder,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.sugPillText,
                                { color: specialization === sug ? theme.primary : theme.textSecondary },
                              ]}
                            >
                              {sug}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {/* Experience & Hourly Fee Row */}
                    <View style={styles.rowFields}>
                      <View style={{ flex: 1, marginRight: 6 }}>
                        <CustomInput
                          label="Experience (Yrs)"
                          placeholder="5"
                          value={experience}
                          onChangeText={setExperience}
                          keyboardType="numeric"
                          icon={<Clock size={18} color={theme.textSecondary} />}
                        />
                      </View>
                      <View style={{ flex: 1.2, marginLeft: 6 }}>
                        <CustomInput
                          label="Consultation Fee (रु/hr)"
                          placeholder="2500"
                          value={hourlyRate}
                          onChangeText={setHourlyRate}
                          keyboardType="numeric"
                          icon={<Text style={{ fontSize: 13, fontWeight: '700', color: theme.textSecondary }}>रु</Text>}
                        />
                      </View>
                    </View>

                    {/* Office Location */}
                    <CustomInput
                      label="Chamber / Office Location *"
                      placeholder="e.g. Anamnagar, Kathmandu"
                      value={officeLocation}
                      onChangeText={(val) => {
                        setOfficeLocation(val);
                        if (val.trim()) setOfficeLocationError(null);
                      }}
                      error={officeLocationError}
                      icon={<MapPin size={18} color={theme.textSecondary} />}
                    />

                    {/* Phone Number */}
                    <CustomInput
                      label="Chamber Contact Phone (Optional)"
                      placeholder="98XXXXXXXX"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      icon={<Phone size={18} color={theme.textSecondary} />}
                    />

                    {/* Bio */}
                    <CustomInput
                      label="Advocate Bio / Summary (Optional)"
                      placeholder="Brief overview of your practice in Nepal Supreme Court & District Courts..."
                      value={bio}
                      onChangeText={setBio}
                      multiline
                      numberOfLines={3}
                      icon={<FileText size={18} color={theme.textSecondary} />}
                    />
                  </View>
                ) : (
                  /* If Client */
                  <View style={styles.formContainer}>
                    <CustomInput
                      label="Contact Phone Number (Optional)"
                      placeholder="98XXXXXXXX"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      icon={<Phone size={18} color={theme.textSecondary} />}
                    />

                    <CustomInput
                      label="City / District"
                      placeholder="e.g. Kathmandu, Lalitpur, Pokhara"
                      value={city}
                      onChangeText={setCity}
                      icon={<MapPin size={18} color={theme.textSecondary} />}
                    />

                    {/* Legal Interests */}
                    <View style={styles.suggestionsWrapper}>
                      <Text style={[styles.suggestionsLabel, { color: theme.textMuted }]}>
                        Primary Legal Concern:
                      </Text>
                      <View style={styles.pillsRow}>
                        {CLIENT_INTEREST_SUGGESTIONS.map((sug) => (
                          <TouchableOpacity
                            key={sug}
                            activeOpacity={0.7}
                            onPress={() => setLegalInterest(sug)}
                            style={[
                              styles.sugPill,
                              {
                                backgroundColor: legalInterest === sug ? theme.primary + '20' : theme.background,
                                borderColor: legalInterest === sug ? theme.primary : theme.cardBorder,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.sugPillText,
                                { color: legalInterest === sug ? theme.primary : theme.textSecondary },
                              ]}
                            >
                              {sug}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>
                )}

                {/* Biometric Enable Toggle */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.biometricRow, { backgroundColor: theme.background, borderColor: theme.cardBorder }]}
                  onPress={() => setSaveBiometric(!saveBiometric)}
                >
                  {saveBiometric ? (
                    <CheckSquare size={18} color={theme.primary} />
                  ) : (
                    <Square size={18} color={theme.textMuted} />
                  )}
                  <View style={styles.biometricInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      {biometricType === 'Face ID' ? (
                        <ScanFace size={16} color={theme.primary} />
                      ) : (
                        <Fingerprint size={16} color={theme.primary} />
                      )}
                      <Text style={[styles.biometricTitle, { color: theme.textPrimary }]}>
                        {`Enable ${biometricType || 'Biometrics'} on this device`}
                      </Text>
                    </View>
                    <Text style={[styles.biometricSub, { color: theme.textMuted }]}>
                      Sign in instantly next time with Apple Face ID / biometric scanner
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Complete Registration Action Button */}
                <CustomButton
                  title={
                    role === 'LAWYER'
                      ? 'Complete Advocate Registration & Open Dashboard'
                      : 'Complete Registration & Enter NepalAdvocate'
                  }
                  onPress={handleCompleteRegistration}
                  isLoading={isLoading}
                  style={{
                    ...styles.finalRegisterBtn,
                    backgroundColor: role === 'LAWYER' ? '#1E293B' : theme.primary,
                  }}
                />
              </Animated.View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>



      {/* Notification Dialog */}
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
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 52 : 28,
    paddingBottom: 30,
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
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
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
  backText: {
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 6,
    fontFamily: typography.medium,
  },
  mainCard: {
    width: '100%',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 22,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
    marginTop: 24,
  },
  brandCenterHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  brandNameText: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    fontFamily: typography.semiBold,
  },
  brandSubText: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
    fontFamily: typography.regular,
  },
  googleHeroBox: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    alignItems: 'center',
    marginBottom: 18,
  },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: typography.semiBold,
  },
  googleHeroTitle: {
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
    fontFamily: typography.semiBold,
  },
  googleHeroSub: {
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
    paddingHorizontal: 6,
    fontFamily: typography.regular,
  },
  bigGoogleBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 10,
  },
  bigGoogleBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: typography.medium,
  },
  googleSecurityNote: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
  featuresList: {
    marginBottom: 18,
    gap: 10,
    paddingHorizontal: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 12.5,
    fontWeight: '500',
    fontFamily: typography.regular,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    fontSize: 13,
  },
  loginLink: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  connectedProfileBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    marginBottom: 16,
  },
  connectedAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
  },
  connectedInfo: {
    flex: 1,
  },
  connectedName: {
    fontSize: 13.5,
    fontWeight: '700',
    fontFamily: typography.medium,
  },
  connectedEmail: {
    fontSize: 11.5,
    marginTop: 2,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  verifiedPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },
  stepHeader: {
    marginBottom: 16,
  },
  stepNumber: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
    fontFamily: typography.semiBold,
  },
  stepSub: {
    fontSize: 12.5,
    marginTop: 4,
    lineHeight: 18,
  },
  roleCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  roleIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  roleCardBody: {
    flex: 1,
  },
  roleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  roleCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: typography.semiBold,
  },
  roleRadioChecked: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleCardDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  barBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  barBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 8,
  },
  actionBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: typography.semiBold,
  },
  detailsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  rolePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  rolePillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  formContainer: {
    marginBottom: 6,
  },
  suggestionsWrapper: {
    marginTop: 2,
    marginBottom: 14,
  },
  suggestionsLabel: {
    fontSize: 11,
    marginBottom: 6,
    fontWeight: '500',
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  sugPill: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  sugPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  rowFields: {
    flexDirection: 'row',
  },
  biometricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginVertical: 10,
  },
  biometricInfo: {
    marginLeft: 10,
    flex: 1,
  },
  biometricTitle: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  biometricSub: {
    fontSize: 11,
    marginTop: 2,
  },
  finalRegisterBtn: {
    marginTop: 10,
    borderRadius: 14,
  },
});

export default RegisterScreen;
