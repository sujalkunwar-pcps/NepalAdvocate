import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Scale, LogOut, User as UserIcon, Shield, Calendar, MessageSquare, FileText, Sparkles } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { LanguageToggle } from '../components/LanguageToggle';
import { ThemeToggle } from '../components/ThemeToggle';

export const DashboardScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user, logout, t } = useAuth();

  const isLawyer = user?.role === 'LAWYER';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <View style={styles.brandRow}>
            <Scale size={24} color={theme.accent} />
            <Text style={[styles.brandTitle, { color: theme.textPrimary }]}>{t.appName}</Text>
          </View>
          <View style={styles.headerRight}>
            <ThemeToggle />
            <LanguageToggle />
            <TouchableOpacity onPress={logout} style={[styles.logoutButton, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
              <LogOut size={16} color={theme.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Welcome Card */}
        <View style={[styles.userCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
          <View style={[styles.userAvatar, { backgroundColor: theme.toggleBg }]}>
            <UserIcon size={28} color={theme.accent} />
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>{t.welcomeUser},</Text>
            <Text style={[styles.userName, { color: theme.textPrimary }]}>
              {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
            </Text>
            <Text style={[styles.userEmail, { color: theme.textMuted }]}>{user?.email}</Text>
          </View>
          <View
            style={[
              styles.roleBadge,
              {
                backgroundColor: isLawyer ? theme.roleBadgeLawyerBg : theme.roleBadgeClientBg,
                borderColor: isLawyer ? theme.roleBadgeLawyerText : theme.roleBadgeClientText,
              },
            ]}
          >
            <Text
              style={[
                styles.roleText,
                { color: isLawyer ? theme.roleBadgeLawyerText : theme.roleBadgeClientText },
              ]}
            >
              {isLawyer ? t.roleLawyer : t.roleClient}
            </Text>
          </View>
        </View>

        {/* Quick Legal Hub Grid */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Legal Services Hub</Text>

        <View style={styles.grid}>
          <View style={[styles.gridCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <View style={[styles.iconBox, { backgroundColor: theme.roleBadgeClientBg }]}>
              <Calendar size={22} color={theme.roleBadgeClientText} />
            </View>
            <Text style={[styles.gridCardTitle, { color: theme.textPrimary }]}>Appointments</Text>
            <Text style={[styles.gridCardSub, { color: theme.textMuted }]}>Schedule legal consultations</Text>
          </View>

          <View style={[styles.gridCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <View style={[styles.iconBox, { backgroundColor: theme.roleBadgeLawyerBg }]}>
              <Sparkles size={22} color={theme.roleBadgeLawyerText} />
            </View>
            <Text style={[styles.gridCardTitle, { color: theme.textPrimary }]}>AI Legal Assistant</Text>
            <Text style={[styles.gridCardSub, { color: theme.textMuted }]}>Instant legal guidance</Text>
          </View>

          <View style={[styles.gridCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
              <MessageSquare size={22} color={theme.success} />
            </View>
            <Text style={[styles.gridCardTitle, { color: theme.textPrimary }]}>Messages</Text>
            <Text style={[styles.gridCardSub, { color: theme.textMuted }]}>Chat with verified lawyers</Text>
          </View>

          <View style={[styles.gridCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(168, 85, 247, 0.12)' }]}>
              <FileText size={22} color="#A855F7" />
            </View>
            <Text style={[styles.gridCardTitle, { color: theme.textPrimary }]}>Documents</Text>
            <Text style={[styles.gridCardSub, { color: theme.textMuted }]}>Draft & review contracts</Text>
          </View>
        </View>

        {/* Security Banner */}
        <View style={[styles.banner, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
          <Shield size={18} color={theme.accent} style={{ marginRight: 10 }} />
          <Text style={[styles.bannerText, { color: theme.textSecondary }]}>
            Logged in securely to NepalAdvocate Legal Network
          </Text>
        </View>
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
    paddingTop: 54,
    paddingBottom: 30,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButton: {
    marginLeft: 8,
    padding: 9,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  userCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 12,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  gridCardTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  gridCardSub: {
    fontSize: 11,
    marginTop: 4,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginTop: 10,
  },
  bannerText: {
    fontSize: 12,
    flex: 1,
    fontWeight: '500',
  },
});
