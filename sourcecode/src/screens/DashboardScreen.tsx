import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { LogOut, Bell } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { typography } from '../theme/typography';
import { LanguageToggle } from '../components/LanguageToggle';
import { ThemeToggle } from '../components/ThemeToggle';
import { ProfileHeaderCard } from '../components/ProfileHeaderCard';
import { QuickActionGrid } from '../components/QuickActionGrid';
import { AppointmentListCard } from '../components/AppointmentListCard';
import { LawyerDirectoryWidget } from '../components/LawyerDirectoryWidget';
import { RecentDocumentsWidget } from '../components/RecentDocumentsWidget';
import { TimedDialog } from '../components/TimedDialog';
import dashboardService from '../services/dashboardService';
import { DashboardData } from '../types/dashboard';

export const DashboardScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user, logout, t } = useAuth();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');

  const loadDashboard = async () => {
    try {
      const data = await dashboardService.getDashboardData();
      // Combine state user with backend profile
      if (user) {
        data.user = {
          ...data.user,
          firstName: user.firstName || data.user.firstName,
          lastName: user.lastName || data.user.lastName,
          email: user.email || data.user.email,
          role: user.role || data.user.role,
        };
      }
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const handleActionClick = (actionName: string) => {
    setDialogTitle(actionName);
    setDialogMessage(`Navigating to ${actionName}. Backend connection endpoint ready for live sync.`);
    setDialogVisible(true);
  };

  if (loading || !dashboardData) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Loading Legal Dashboard...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        {/* Top Header Bar: 2 controls on left, Title centered, Language on right */}
        <View style={styles.headerBar}>
          <View style={styles.headerLeftGroup}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleActionClick('Notifications')}
              style={[styles.iconButton, { backgroundColor: theme.toggleBg, borderColor: theme.cardBorder }]}
            >
              <Bell size={16} color={theme.textPrimary} />
            </TouchableOpacity>

            <ThemeToggle />
          </View>

          <Text style={[styles.brandTitle, { color: theme.textPrimary }]} numberOfLines={1}>
            NepalAdvocate
          </Text>

          <View style={styles.headerRightGroup}>
            <LanguageToggle />
          </View>
        </View>

        {/* Profile Card (Without Logout Button) */}
        <ProfileHeaderCard
          user={dashboardData.user}
          stats={dashboardData.stats}
          onEditProfile={() => handleActionClick('Edit Profile')}
        />

        {/* Quick Legal Hub Actions */}
        <QuickActionGrid
          onBookConsultation={() => handleActionClick('Find Verified Lawyer')}
          onAiAssistant={() => handleActionClick('AI Advocate Chatbot')}
          onMyDocuments={() => handleActionClick('Legal Vault')}
          onTrackCases={() => handleActionClick('Court Case Status')}
        />

        {/* Upcoming Appointments Section */}
        <AppointmentListCard
          appointments={dashboardData.upcomingAppointments}
          onViewAll={() => handleActionClick('All Appointments')}
          onSelectAppointment={(apt) => handleActionClick(`Appointment with ${apt.lawyerName}`)}
        />

        {/* Recommended Verified Lawyers Directory */}
        <LawyerDirectoryWidget
          lawyers={dashboardData.recommendedLawyers}
          onViewAllLawyers={() => handleActionClick('Lawyer Directory')}
          onSelectLawyer={(lwy) => handleActionClick(`Consultation with ${lwy.name}`)}
        />

        {/* Recent Legal Documents */}
        <RecentDocumentsWidget
          documents={dashboardData.recentDocuments}
          onViewAll={() => handleActionClick('Document Library')}
          onSelectDocument={(doc) => handleActionClick(`View ${doc.title}`)}
        />
      </ScrollView>

      <TimedDialog
        visible={dialogVisible}
        title={dialogTitle}
        message={dialogMessage}
        type="info"
        onDismiss={() => setDialogVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
    marginTop: 12,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
    paddingBottom: 36,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '100%',
  },
  headerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-start',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
    fontFamily: typography.fontFamily,
    flex: 2,
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  iconButton: {
    padding: 8,
    borderRadius: 18,
    borderWidth: 1,
    marginRight: 6,
  },
});

