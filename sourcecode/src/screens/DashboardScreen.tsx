import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Scale, LogOut, User as UserIcon, Shield, Calendar, MessageSquare, FileText, Sparkles } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { LanguageToggle } from '../components/LanguageToggle';

export const DashboardScreen: React.FC = () => {
  const { user, logout, t } = useAuth();

  const isLawyer = user?.role === 'LAWYER';

  return (
    <LinearGradient colors={Colors.backgroundGradient} style={styles.gradientContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <View style={styles.brandRow}>
            <Scale size={24} color={Colors.primary} />
            <Text style={styles.brandTitle}>{t.appName}</Text>
          </View>
          <View style={styles.headerRight}>
            <LanguageToggle />
            <TouchableOpacity onPress={logout} style={styles.logoutButton}>
              <LogOut size={18} color={Colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Welcome Card */}
        <View style={styles.userCard}>
          <View style={styles.userAvatar}>
            <UserIcon size={32} color={Colors.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>{t.welcomeUser},</Text>
            <Text style={styles.userName}>
              {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
            </Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
          <View
            style={[
              styles.roleBadge,
              {
                backgroundColor: isLawyer
                  ? 'rgba(245, 158, 11, 0.15)'
                  : 'rgba(56, 189, 248, 0.15)',
                borderColor: isLawyer ? Colors.lawyerRole : Colors.clientRole,
              },
            ]}
          >
            <Text
              style={[
                styles.roleText,
                { color: isLawyer ? Colors.lawyerRole : Colors.clientRole },
              ]}
            >
              {isLawyer ? t.roleLawyer : t.roleClient}
            </Text>
          </View>
        </View>

        {/* Quick Legal Hub Grid */}
        <Text style={styles.sectionTitle}>Legal Services Hub</Text>

        <View style={styles.grid}>
          <View style={styles.gridCard}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
              <Calendar size={24} color={Colors.accentCyan} />
            </View>
            <Text style={styles.gridCardTitle}>Appointments</Text>
            <Text style={styles.gridCardSub}>Schedule legal consultations</Text>
          </View>

          <View style={styles.gridCard}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Sparkles size={24} color={Colors.primary} />
            </View>
            <Text style={styles.gridCardTitle}>AI Legal Assistant</Text>
            <Text style={styles.gridCardSub}>Instant legal guidance</Text>
          </View>

          <View style={styles.gridCard}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <MessageSquare size={24} color={Colors.success} />
            </View>
            <Text style={styles.gridCardTitle}>Messages</Text>
            <Text style={styles.gridCardSub}>Chat with verified lawyers</Text>
          </View>

          <View style={styles.gridCard}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
              <FileText size={24} color="#A855F7" />
            </View>
            <Text style={styles.gridCardTitle}>Documents</Text>
            <Text style={styles.gridCardSub}>Draft & review contracts</Text>
          </View>
        </View>

        {/* Security Banner */}
        <View style={styles.banner}>
          <Shield size={20} color={Colors.primary} style={{ marginRight: 10 }} />
          <Text style={styles.bannerText}>
            Logged in securely to NepalAdvocate Legal Network
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
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
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButton: {
    marginLeft: 12,
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  userCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  userAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  userName: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  userEmail: {
    color: Colors.textMuted,
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
    color: Colors.textPrimary,
    fontSize: 18,
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
    backgroundColor: Colors.cardBackground,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 14,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  gridCardTitle: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  gridCardSub: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    marginTop: 10,
  },
  bannerText: {
    color: Colors.textSecondary,
    fontSize: 12,
    flex: 1,
    fontWeight: '500',
  },
});
