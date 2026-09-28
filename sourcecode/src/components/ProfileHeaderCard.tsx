import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { CheckCircle2, MapPin, Phone, Mail, Shield, LogOut } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { UserProfile, DashboardStats } from '../types/dashboard';
import { PlayfulCard } from './PlayfulCard';
import { typography } from '../theme/typography';

interface ProfileHeaderCardProps {
  user: UserProfile;
  stats: DashboardStats;
  onEditProfile?: () => void;
  onLogout?: () => void;
}

export const ProfileHeaderCard: React.FC<ProfileHeaderCardProps> = ({
  user,
  stats,
  onEditProfile,
  onLogout,
}) => {
  const { theme } = useTheme();

  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <PlayfulCard delay={60}>
      <View
        style={[
          styles.cardContainer,
          {
            backgroundColor: theme.cardBackground,
            borderColor: theme.cardBorder,
          },
        ]}
      >
        {/* Top Profile Banner Row */}
        <View style={styles.headerRow}>
          {/* Avatar Ring & Verified Badge Overlay */}
          <View style={styles.avatarWrapper}>
            <View
              style={[
                styles.avatarRing,
                {
                  borderColor: theme.cardBorder,
                  backgroundColor: theme.toggleBg,
                },
              ]}
            >
              {user.profilePicture ? (
                <Image
                  source={{ uri: user.profilePicture }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={require('../../assets/icon.png')}
                  style={styles.avatarImage}
                  resizeMode="contain"
                />
              )}
            </View>

            {/* Verified Badge */}
            <View style={[styles.verifiedBadge, { backgroundColor: theme.cardBackground }]}>
              <CheckCircle2 size={16} color="#10B981" />
            </View>
          </View>

          {/* User Bio Details - Organized Straight Vertical Line Stack */}
          <View style={styles.infoSection}>
            <View style={styles.nameRoleRow}>
              <Text style={[styles.fullName, { color: theme.textPrimary }]} numberOfLines={1}>
                {fullName}
              </Text>
              <View style={[styles.roleBadge, { backgroundColor: theme.toggleBg }]}>
                <Shield size={10} color={theme.textPrimary} style={{ marginRight: 3 }} />
                <Text style={[styles.roleBadgeText, { color: theme.textPrimary }]}>
                  {user.role}
                </Text>
              </View>
            </View>

            {/* Organized Vertical Metadata Column */}
            <View style={styles.metaStack}>
              {/* Email Row */}
              <View style={styles.metaRow}>
                <View style={styles.iconFixedBox}>
                  <Mail size={12.5} color={theme.textMuted} />
                </View>
                <Text style={[styles.metaText, { color: theme.textSecondary }]} numberOfLines={1}>
                  {user.email}
                </Text>
              </View>

              {/* Location Row */}
              <View style={styles.metaRow}>
                <View style={styles.iconFixedBox}>
                  <MapPin size={12.5} color={theme.textMuted} />
                </View>
                <Text style={[styles.metaText, { color: theme.textMuted }]} numberOfLines={1}>
                  Kathmandu, Nepal
                </Text>
              </View>

              {/* Phone Row */}
              {user.phone ? (
                <View style={styles.metaRow}>
                  <View style={styles.iconFixedBox}>
                    <Phone size={12.5} color={theme.textMuted} />
                  </View>
                  <Text style={[styles.metaText, { color: theme.textMuted }]} numberOfLines={1}>
                    {user.phone}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Optional Action Button */}
          {onLogout && (
            <View style={styles.actionColumn}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onLogout}
                style={[styles.logoutIconButton, { backgroundColor: theme.toggleBg }]}
              >
                <LogOut size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Horizontal Divider */}
        <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />

        {/* Embedded Professional Statistics Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: theme.textPrimary }]}>
              {stats.totalAppointments}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Consultations</Text>
          </View>

          <View style={[styles.statDivider, { backgroundColor: theme.cardBorder }]} />

          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: theme.textPrimary }]}>
              {stats.activeCases}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Active Cases</Text>
          </View>

          <View style={[styles.statDivider, { backgroundColor: theme.cardBorder }]} />

          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: theme.textPrimary }]}>
              {stats.savedDocuments}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Documents</Text>
          </View>
        </View>
      </View>
    </PlayfulCard>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  avatarRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1.5,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    borderRadius: 10,
    padding: 1.5,
  },
  infoSection: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRoleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  fullName: {
    fontSize: 16.5,
    fontWeight: '800',
    letterSpacing: -0.4,
    fontFamily: typography.fontFamily,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 10,
  },
  roleBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  metaStack: {
    gap: 3.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconFixedBox: {
    width: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  metaText: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  actionColumn: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  logoutIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 2,
    fontFamily: typography.fontFamily,
  },
  statLabel: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 26,
    opacity: 0.5,
  },
});
