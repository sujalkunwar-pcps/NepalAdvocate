import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
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
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { ProfileHeaderCard } from '../components/ProfileHeaderCard';
import { PlayfulCard } from '../components/PlayfulCard';
import { UserProfile, DashboardStats } from '../types/dashboard';
import { typography } from '../theme/typography';

export const ProfileScreen: React.FC = () => {
  const { theme, mode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const userProfile: UserProfile = {
    id: user?.id || 'usr_101',
    email: user?.email || 'client@nepaladvocate.np',
    firstName: user?.firstName || 'Aarav',
    lastName: user?.lastName || 'Sharma',
    role: user?.role || 'CLIENT',
    phone: user?.phone || '+977 9841234567',
    profilePicture: user?.profilePicture || null,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  const dashboardStats: DashboardStats = {
    totalAppointments: 3,
    activeCases: 1,
    savedDocuments: 8,
    consultationHours: 12,
  };

  const handleAction = (title: string) => {
    // Action trigger placeholder
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
              onPress={() => handleAction('Language')}
              style={styles.settingRow}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: theme.toggleBg }]}>
                  <Globe size={18} color={theme.textPrimary} />
                </View>
                <View>
                  <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Language</Text>
                  <Text style={[styles.settingSub, { color: theme.textMuted }]}>
                    English / नेपाली (Nepali)
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
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleAction('ID Verification')}
              style={styles.settingRow}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: theme.toggleBg }]}>
                  <Shield size={18} color={theme.textPrimary} />
                </View>
                <View>
                  <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Nagarikta / Passport Verification</Text>
                  <Text style={[styles.settingSub, { color: theme.textMuted }]}>Verified Status Active</Text>
                </View>
              </View>
              <ChevronRight size={18} color={theme.textMuted} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleAction('Notifications')}
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
              onPress={() => handleAction('Legal Helpline')}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
    paddingBottom: 90,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    fontFamily: typography.fontFamily,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 22,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: typography.fontFamily,
  },
  settingSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
  divider: {
    height: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 28,
    marginBottom: 10,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: typography.fontFamily,
  },
});
