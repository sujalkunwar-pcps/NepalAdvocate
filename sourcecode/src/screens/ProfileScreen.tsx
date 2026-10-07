import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Linking,
  Modal,
} from 'react-native';
import {
  Moon,
  Sun,
  Globe,
  Shield,
  Bell,
  PhoneCall,
  LogOut,
  ChevronRight,
  Fingerprint,
  ScanFace,
  Briefcase,
  MapPin,
  Award,
  CheckCircle2,
  X,
  Phone,
  FileCheck,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { ProfileHeaderCard } from '../components/ProfileHeaderCard';
import { PlayfulCard } from '../components/PlayfulCard';
import { TimedDialog } from '../components/TimedDialog';
import { UserProfile, DashboardStats } from '../types/dashboard';
import { typography } from '../theme/typography';
import { dashboardService } from '../services/dashboardService';

export const ProfileScreen: React.FC = () => {
  const { theme, mode, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    user,
    logout,
    toggleLanguage,
    language,
    isBiometricAvailable,
    isBiometricEnabled,
    biometricType,
    toggleBiometric,
  } = useAuth();

  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogType, setDialogType] = useState<'success' | 'error' | 'info'>('info');

  const [nagariktaModalVisible, setNagariktaModalVisible] = useState(false);
  const [notifSettingsVisible, setNotifSettingsVisible] = useState(false);
  const [emergencyModalVisible, setEmergencyModalVisible] = useState(false);
  const [hearingAlerts, setHearingAlerts] = useState(true);
  const [appointmentAlerts, setAppointmentAlerts] = useState(true);
  const [chatAlerts, setChatAlerts] = useState(true);

  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalAppointments: 0,
    activeCases: 0,
    savedDocuments: 0,
    consultationHours: 0,
  });

  const isLawyer = user?.role === 'LAWYER';
  const lawyerProfile = user?.lawyerProfile;

  useEffect(() => {
    let isMounted = true;
    dashboardService.getDashboardData(isLawyer ? 'LAWYER' : 'CLIENT')
      .then((data) => {
        if (isMounted && data?.stats) {
          setDashboardStats({
            totalAppointments: data.stats.totalAppointments ?? 0,
            activeCases: data.stats.activeCases ?? 0,
            savedDocuments: data.stats.savedDocuments ?? 0,
            consultationHours: data.stats.consultationHours ?? 0,
          });
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [user, isLawyer]);

  const userProfile: UserProfile = {
    id: user?.id || '',
    email: user?.email || '',
    firstName: user?.firstName || (user?.email ? user.email.split('@')[0] : 'User'),
    lastName: user?.lastName || '',
    role: user?.role || 'CLIENT',
    phone: user?.phone || '',
    profilePicture: user?.profilePicture || null,
    isActive: true,
    createdAt: (user as any)?.createdAt || new Date().toISOString(),
  };

  const handleAction = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setDialogTitle(title);
    setDialogMessage(message);
    setDialogType(type);
    setDialogVisible(true);
  };

  const handleBiometricToggle = async (val: boolean) => {
    const success = await toggleBiometric(val);
    if (success) {
      handleAction(
        val ? 'Biometric Authentication Enabled' : 'Biometric Authentication Disabled',
        val
          ? `${biometricType} login is now enabled for quick access.`
          : `${biometricType} login has been disabled.`,
        val ? 'success' : 'info'
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 20) + 10,
            paddingBottom: Math.max(insets.bottom + 90, 120),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Account & Profile</Text>
        </View>

        {/* Rounded Profile Header Card */}
        <ProfileHeaderCard
          user={userProfile}
          stats={dashboardStats}
          onLogout={logout}
        />

        {/* ADVOCATE CREDENTIALS SECTION (IF LAWYER) */}
        {isLawyer && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              ADVOCATE BAR CREDENTIALS
            </Text>
            <PlayfulCard delay={80}>
              <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
                {/* Bar License */}
                <View style={styles.settingRow}>
                  <View style={styles.settingLeft}>
                    <View style={[styles.iconBox, { backgroundColor: theme.primary + '18' }]}>
                      <Shield size={18} color={theme.primary} />
                    </View>
                    <View>
                      <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>
                        Nepal Bar Council License
                      </Text>
                      <Text style={[styles.settingSub, { color: theme.primary, fontWeight: '700' }]}>
                        {lawyerProfile?.barLicenseNumber || 'NBA-5421'} • Verified Advocate
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.verifiedPill, { backgroundColor: '#10B98120' }]}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#10B981' }}>Active</Text>
                  </View>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />

                {/* Practice Area */}
                <View style={styles.settingRow}>
                  <View style={styles.settingLeft}>
                    <View style={[styles.iconBox, { backgroundColor: theme.toggleBg }]}>
                      <Briefcase size={18} color={theme.textPrimary} />
                    </View>
                    <View>
                      <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>
                        Practice Specialization
                      </Text>
                      <Text style={[styles.settingSub, { color: theme.textMuted }]}>
                        {typeof lawyerProfile?.specialization === 'string'
                          ? lawyerProfile.specialization
                          : (Array.isArray(lawyerProfile?.specialization) && lawyerProfile.specialization[0]) ||
                            'Corporate & Civil Law'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />

                {/* Chamber Location */}
                <View style={styles.settingRow}>
                  <View style={styles.settingLeft}>
                    <View style={[styles.iconBox, { backgroundColor: theme.toggleBg }]}>
                      <MapPin size={18} color={theme.textPrimary} />
                    </View>
                    <View>
                      <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>
                        Chamber Address
                      </Text>
                      <Text style={[styles.settingSub, { color: theme.textMuted }]}>
                        {lawyerProfile?.officeLocation || 'Anamnagar, Kathmandu'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </PlayfulCard>
          </>
        )}

        {/* Section: Preferences */}
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>PREFERENCES</Text>
        <PlayfulCard delay={100}>
          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            {/* Dark Mode Toggle */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: theme.toggleBg }]}>
                  {mode === 'dark' ? (
                    <Moon size={18} color={theme.textPrimary} />
                  ) : (
                    <Sun size={18} color={theme.textPrimary} />
                  )}
                </View>
                <View>
                  <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Dark Mode</Text>
                  <Text style={[styles.settingSub, { color: theme.textMuted }]}>
                    {mode === 'dark' ? 'Dark theme active' : 'Light theme active'}
                  </Text>
                </View>
              </View>
              <Switch
                value={mode === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.toggleBg, true: theme.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />

            {/* Language Selection */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={toggleLanguage}
              style={styles.settingRow}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: theme.toggleBg }]}>
                  <Globe size={18} color={theme.textPrimary} />
                </View>
                <View>
                  <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Language</Text>
                  <Text style={[styles.settingSub, { color: theme.textMuted }]}>
                    {language === 'ne' ? 'नेपाली (Nepali)' : 'English (US)'} • Tap to switch
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
        </PlayfulCard>

        {/* Section: Security */}
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>SECURITY & DATA</Text>
        <PlayfulCard delay={180}>
          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            {/* Biometric Login Toggle */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: theme.primary + '18' }]}>
                  {biometricType === 'Face ID' ? (
                    <ScanFace size={18} color={theme.primary} />
                  ) : (
                    <Fingerprint size={18} color={theme.primary} />
                  )}
                </View>
                <View>
                  <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>
                    Biometric Authentication
                  </Text>
                  <Text style={[styles.settingSub, { color: theme.textMuted }]}>
                    {biometricType} fast sign-in
                  </Text>
                </View>
              </View>
              <Switch
                value={isBiometricEnabled}
                onValueChange={handleBiometricToggle}
                trackColor={{ false: theme.toggleBg, true: theme.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setNagariktaModalVisible(true)}
              style={styles.settingRow}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: theme.toggleBg }]}>
                  <Shield size={18} color={theme.textPrimary} />
                </View>
                <View>
                  <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>
                    Nagarikta / Identity Verification
                  </Text>
                  <Text style={[styles.settingSub, { color: theme.textMuted }]}>
                    Verified Status Active
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color={theme.textMuted} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setNotifSettingsVisible(true)}
              style={styles.settingRow}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: theme.toggleBg }]}>
                  <Bell size={18} color={theme.textPrimary} />
                </View>
                <View>
                  <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Push Notifications</Text>
                  <Text style={[styles.settingSub, { color: theme.textMuted }]}>Hearing dates & Advocate updates</Text>
                </View>
              </View>
              <ChevronRight size={18} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
        </PlayfulCard>

        {/* Section: Support */}
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>LEGAL HELPLINE</Text>
        <PlayfulCard delay={260}>
          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setEmergencyModalVisible(true)}
              style={styles.settingRow}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: theme.toggleBg }]}>
                  <PhoneCall size={18} color={theme.textPrimary} />
                </View>
                <View>
                  <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>24/7 Legal Emergency Line</Text>
                  <Text style={[styles.settingSub, { color: theme.textMuted }]}>Toll Free: 1660-01-9988</Text>
                </View>
              </View>
              <ChevronRight size={18} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
        </PlayfulCard>

        {/* Logout Button */}
        <PlayfulCard delay={340}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={logout}
            style={[styles.logoutBtn, { backgroundColor: theme.toggleBg, borderColor: theme.cardBorder }]}
          >
            <LogOut size={18} color="#EF4444" style={{ marginRight: 8 }} />
            <Text style={[styles.logoutText, { color: '#EF4444' }]}>Log Out of Account</Text>
          </TouchableOpacity>
        </PlayfulCard>
      </ScrollView>

      {/* 1. Nagarikta & Identity Verification Modal */}
      <Modal visible={nagariktaModalVisible} transparent animationType="fade" onRequestClose={() => setNagariktaModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Shield size={20} color="#10B981" />
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Identity & Nagarikta</Text>
              </View>
              <TouchableOpacity onPress={() => setNagariktaModalVisible(false)} style={styles.modalCloseBtn}>
                <X size={18} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={[styles.kycCard, { backgroundColor: theme.background, borderColor: theme.cardBorder }]}>
              <View style={styles.kycHeaderRow}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: theme.primary, letterSpacing: 0.5 }}>
                  GOVERNMENT OF NEPAL • e-KYC VERIFIED
                </Text>
                <CheckCircle2 size={16} color="#10B981" />
              </View>

              <View style={styles.kycDetailRow}>
                <Text style={[styles.kycLabel, { color: theme.textSecondary }]}>Full Name:</Text>
                <Text style={[styles.kycVal, { color: theme.textPrimary }]}>{userProfile.firstName} {userProfile.lastName}</Text>
              </View>
              <View style={styles.kycDetailRow}>
                <Text style={[styles.kycLabel, { color: theme.textSecondary }]}>Citizenship No (नागरिकता नं):</Text>
                <Text style={[styles.kycVal, { color: theme.textPrimary }]}>27-01-78-04921</Text>
              </View>
              <View style={styles.kycDetailRow}>
                <Text style={[styles.kycLabel, { color: theme.textSecondary }]}>National ID (NIN):</Text>
                <Text style={[styles.kycVal, { color: theme.textPrimary }]}>NIN-9812-4410-09</Text>
              </View>
              <View style={styles.kycDetailRow}>
                <Text style={[styles.kycLabel, { color: theme.textSecondary }]}>Issuing District:</Text>
                <Text style={[styles.kycVal, { color: theme.textPrimary }]}>Kathmandu (काठमाडौँ)</Text>
              </View>
              <View style={styles.kycDetailRow}>
                <Text style={[styles.kycLabel, { color: theme.textSecondary }]}>Verification Authority:</Text>
                <Text style={[styles.kycVal, { color: '#10B981' }]}>Nagarik App e-KYC API (Level 3)</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setNagariktaModalVisible(false)}
              style={[styles.modalActionBtn, { backgroundColor: theme.primary }]}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>Verified & Confirmed</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 2. Notification Preferences Modal */}
      <Modal visible={notifSettingsVisible} transparent animationType="fade" onRequestClose={() => setNotifSettingsVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Bell size={20} color={theme.primary} />
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Notification Settings</Text>
              </View>
              <TouchableOpacity onPress={() => setNotifSettingsVisible(false)} style={styles.modalCloseBtn}>
                <X size={18} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 14, marginVertical: 14 }}>
              <View style={styles.settingRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Court Hearing & Tariqh Alerts</Text>
                  <Text style={[styles.settingSub, { color: theme.textMuted }]}>Reminders 24 hours prior to hearing</Text>
                </View>
                <Switch
                  value={hearingAlerts}
                  onValueChange={setHearingAlerts}
                  trackColor={{ false: theme.toggleBg, true: theme.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.settingRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Consultation Bookings</Text>
                  <Text style={[styles.settingSub, { color: theme.textMuted }]}>Instant alerts for schedule requests</Text>
                </View>
                <Switch
                  value={appointmentAlerts}
                  onValueChange={setAppointmentAlerts}
                  trackColor={{ false: theme.toggleBg, true: theme.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.settingRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Direct Chat & Calls</Text>
                  <Text style={[styles.settingSub, { color: theme.textMuted }]}>Audio/Video call and message rings</Text>
                </View>
                <Switch
                  value={chatAlerts}
                  onValueChange={setChatAlerts}
                  trackColor={{ false: theme.toggleBg, true: theme.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={() => {
                setNotifSettingsVisible(false);
                handleAction('Preferences Saved', 'Your push notification rules have been updated.', 'success');
              }}
              style={[styles.modalActionBtn, { backgroundColor: theme.primary }]}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>Save Notification Rules</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 3. 24/7 Legal Emergency Line Modal */}
      <Modal visible={emergencyModalVisible} transparent animationType="fade" onRequestClose={() => setEmergencyModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <PhoneCall size={20} color="#EF4444" />
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Legal Emergency Hotline</Text>
              </View>
              <TouchableOpacity onPress={() => setEmergencyModalVisible(false)} style={styles.modalCloseBtn}>
                <X size={18} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 14 }}>
              Direct access to Nepal Bar Council and Supreme Court emergency roster advocate helpline.
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setEmergencyModalVisible(false);
                Linking.openURL('tel:1660019988');
              }}
              style={[styles.emergencyActionBtn, { backgroundColor: '#EF4444' }]}
            >
              <PhoneCall size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.emergencyBtnTitle}>Call Toll-Free 1660-01-9988</Text>
                <Text style={styles.emergencyBtnSub}>24/7 Nepal Legal Aid & Emergency Roster</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setEmergencyModalVisible(false);
                Linking.openURL('tel:014200727');
              }}
              style={[styles.emergencyActionBtn, { backgroundColor: '#2563EB', marginTop: 10 }]}
            >
              <Phone size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.emergencyBtnTitle}>Supreme Court Bar: 01-4200727</Text>
                <Text style={styles.emergencyBtnSub}>Supreme Court Bar Association Secretariat</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setEmergencyModalVisible(false);
                Linking.openURL('tel:100');
              }}
              style={[styles.emergencyActionBtn, { backgroundColor: '#374151', marginTop: 10 }]}
            >
              <Shield size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.emergencyBtnTitle}>Nepal Police Emergency: 100</Text>
                <Text style={styles.emergencyBtnSub}>Immediate law enforcement dispatch</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: typography.fontFamily,
    letterSpacing: -0.5,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 22,
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: typography.fontFamily,
  },
  settingSub: {
    fontSize: 12,
    marginTop: 2,
  },
  verifiedPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 14,
  },
  kycCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    gap: 10,
  },
  kycHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#10B98130',
  },
  kycDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kycLabel: {
    fontSize: 12,
  },
  kycVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalActionBtn: {
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  emergencyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  emergencyBtnTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  emergencyBtnSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    marginTop: 1,
  },
});
