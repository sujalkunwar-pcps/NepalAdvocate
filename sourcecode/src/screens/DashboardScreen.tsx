import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Bell, Briefcase, User as UserIcon } from 'lucide-react-native';
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
import { CaseTrackerModal } from '../components/CaseTrackerModal';
import { LawyerDashboardView } from '../components/LawyerDashboardView';
import { NotificationsModal } from '../components/NotificationsModal';
import ClientCommunicationModal, { CommMode } from '../components/ClientCommunicationModal';
import clientService, { ClientRecord } from '../services/clientService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import dashboardService from '../services/dashboardService';
import notificationService from '../services/notificationService';
import { DashboardData, AppointmentData } from '../types/dashboard';

interface DashboardScreenProps {
  onNavigateTab?: (tab: 'home' | 'lawyers' | 'ai' | 'documents' | 'profile') => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigateTab }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, logout, t } = useAuth();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Role override for previewing the alternative dashboard
  const [viewRoleOverride, setViewRoleOverride] = useState<'CLIENT' | 'LAWYER' | null>(null);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [caseTrackerVisible, setCaseTrackerVisible] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  // Client-to-Lawyer direct communication modal
  const [clientCommModalVisible, setClientCommModalVisible] = useState(false);
  const [selectedLawyerCommClient, setSelectedLawyerCommClient] = useState<ClientRecord | null>(null);
  const [clientCommMode, setClientCommMode] = useState<CommMode>('chat');

  const handleStartClientCommunication = async (apt: AppointmentData, mode: CommMode) => {
    try {
      const advocateName = apt.lawyerName || 'Adv. Bikram Thapa';
      const clients = await clientService.getClients();
      let contact = clients.find((c) => c.name.toLowerCase() === advocateName.toLowerCase());
      if (!contact) {
        contact = await clientService.confirmClientConsultation({
          id: `adv_${Date.now()}`,
          clientName: advocateName,
          specialization: apt.specialization || 'Corporate & Civil Law',
          date: apt.date || 'Today',
          timeSlot: apt.timeSlot || '05:00 PM - 06:00 PM',
          fee: apt.fee || 2500,
          notes: 'Client consultation room with registered legal advocate.',
        });
      }
      setSelectedLawyerCommClient(contact);
      setClientCommMode(mode);
      setClientCommModalVisible(true);
    } catch (err) {
      console.error('Failed to initiate consultation room:', err);
    }
  };

  const activeRole: 'CLIENT' | 'LAWYER' =
    viewRoleOverride || (user?.role === 'LAWYER' ? 'LAWYER' : 'CLIENT');

  const loadDashboard = async () => {
    try {
      const data = await dashboardService.getDashboardData(activeRole);
      // Combine state user with backend profile
      if (user) {
        data.user = {
          ...data.user,
          firstName: user.firstName || data.user.firstName,
          lastName: user.lastName || data.user.lastName,
          email: user.email || data.user.email,
          role: activeRole,
        };
        if (user.lawyerProfile) {
          data.lawyerDetails = {
            id: user.lawyerProfile.id || 'law_01',
            userId: user.id,
            barLicenseNumber: user.lawyerProfile.barLicenseNumber,
            specialization: Array.isArray(user.lawyerProfile.specialization)
              ? user.lawyerProfile.specialization
              : [user.lawyerProfile.specialization || 'Corporate & Civil Law'],
            experience: user.lawyerProfile.experience || 5,
            hourlyRate: user.lawyerProfile.hourlyRate || 2500,
            bio: user.lawyerProfile.bio || 'Registered Legal Advocate, Nepal Bar Council',
            education: [{ degree: 'LL.B', institution: 'Tribhuvan University', year: 2018 }],
            languages: ['Nepali', 'English'],
            rating: user.lawyerProfile.rating || 4.9,
            totalReviews: 32,
            isVerified: true,
            casesWon: 45,
            officeLocation: user.lawyerProfile.officeLocation || 'Kathmandu, Nepal',
          };
        }
      }
      setDashboardData(data);

      // Load live notifications count
      try {
        const notifCount = await notificationService.getUnreadCount();
        setUnreadNotifCount(notifCount);
      } catch {
        // ignore
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [user, viewRoleOverride]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const handleActionClick = (actionName: string, customMessage?: string) => {
    setDialogTitle(actionName);
    setDialogMessage(customMessage || `Navigating to ${actionName}. Backend connection endpoint ready for live sync.`);
    setDialogVisible(true);
  };

  if (loading || !dashboardData) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Loading Legal Platform...
        </Text>
      </View>
    );
  }

  const isLawyer = activeRole === 'LAWYER';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 24) + 10,
            paddingBottom: Math.max(insets.bottom + 90, 120),
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        {/* Top Header Bar */}
        <View style={styles.headerBar}>
          <View style={styles.headerLeftGroup}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setNotificationsVisible(true)}
              style={[
                styles.iconButton,
                { backgroundColor: theme.toggleBg, borderColor: theme.cardBorder, position: 'relative' },
              ]}
            >
              <Bell size={16} color={theme.textPrimary} />
              {unreadNotifCount > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>
                    {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                  </Text>
                </View>
              )}
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

        {/* Dynamic Dashboard: Lawyer vs Client View */}
        {isLawyer ? (
          <LawyerDashboardView
            dashboardData={dashboardData}
            onNavigateTab={onNavigateTab}
            onActionClick={handleActionClick}
            onToggleViewRole={() => setViewRoleOverride(viewRoleOverride === 'CLIENT' ? null : 'CLIENT')}
          />
        ) : (
          <>
            {/* Quick Advocate Preview Bar if User registered as Lawyer or in Client view */}
            {user?.role === 'LAWYER' && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setViewRoleOverride(null)}
                style={[styles.roleAlertBar, { backgroundColor: theme.primary + '15', borderColor: theme.primary }]}
              >
                <Briefcase size={16} color={theme.primary} />
                <Text style={[styles.roleAlertText, { color: theme.textPrimary }]}>
                  You are registered as Advocate. Tap to switch back to Advocate Dashboard.
                </Text>
              </TouchableOpacity>
            )}

            {/* Profile Card */}
            <ProfileHeaderCard
              user={dashboardData.user}
              stats={dashboardData.stats}
              onEditProfile={() => (onNavigateTab ? onNavigateTab('profile') : handleActionClick('Edit Profile'))}
            />

            {/* Quick Legal Hub Actions */}
            <QuickActionGrid
              onBookConsultation={() => (onNavigateTab ? onNavigateTab('lawyers') : handleActionClick('Find Verified Lawyer'))}
              onAiAssistant={() => (onNavigateTab ? onNavigateTab('ai') : handleActionClick('AI Advocate Chatbot'))}
              onMyDocuments={() => (onNavigateTab ? onNavigateTab('documents') : handleActionClick('Legal Vault'))}
              onTrackCases={() => setCaseTrackerVisible(true)}
            />

            {/* Upcoming Appointments Section */}
            <AppointmentListCard
              appointments={dashboardData.upcomingAppointments}
              onViewAll={() => setCaseTrackerVisible(true)}
              onSelectAppointment={(apt) => setCaseTrackerVisible(true)}
              onCommunicate={handleStartClientCommunication}
            />

            {/* Recommended Verified Lawyers Directory */}
            {dashboardData.recommendedLawyers && dashboardData.recommendedLawyers.length > 0 && (
              <LawyerDirectoryWidget
                lawyers={dashboardData.recommendedLawyers}
                onViewAllLawyers={() => (onNavigateTab ? onNavigateTab('lawyers') : handleActionClick('Lawyer Directory'))}
                onSelectLawyer={(lwy) =>
                  onNavigateTab ? onNavigateTab('lawyers') : handleActionClick(`Consultation with ${lwy.name}`)
                }
              />
            )}

            {/* Recent Legal Documents */}
            <RecentDocumentsWidget
              documents={dashboardData.recentDocuments}
              onViewAll={() => (onNavigateTab ? onNavigateTab('documents') : handleActionClick('Document Library'))}
              onSelectDocument={(doc) => (onNavigateTab ? onNavigateTab('documents') : handleActionClick(`View ${doc.title}`))}
            />
          </>
        )}
      </ScrollView>

      <CaseTrackerModal
        visible={caseTrackerVisible}
        onClose={() => setCaseTrackerVisible(false)}
        onNavigateToDocuments={() => onNavigateTab && onNavigateTab('documents')}
        onNavigateToLawyers={() => onNavigateTab && onNavigateTab('lawyers')}
      />

      <NotificationsModal
        visible={notificationsVisible}
        onClose={() => setNotificationsVisible(false)}
        onUnreadChange={setUnreadNotifCount}
        onOpenClient={(clientId) => {
          setNotificationsVisible(false);
          if (onNavigateTab) {
            onNavigateTab('lawyers');
          }
        }}
      />

      <ClientCommunicationModal
        visible={clientCommModalVisible}
        onClose={() => setClientCommModalVisible(false)}
        client={selectedLawyerCommClient}
        initialMode={clientCommMode}
      />

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
  notifBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  notifBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  roleAlertBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  roleAlertText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
});
