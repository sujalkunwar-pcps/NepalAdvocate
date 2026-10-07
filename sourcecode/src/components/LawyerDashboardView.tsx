import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import {
  Shield,
  CheckCircle2,
  Calendar,
  Clock,
  Briefcase,
  FileText,
  DollarSign,
  MapPin,
  ChevronRight,
  User,
  Star,
  Check,
  X,
  Phone,
  Bot,
  AlertCircle,
  MessageSquare,
  Video,
  Users,
  Award,
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { typography } from '../theme/typography';
import { DashboardData, AppointmentData } from '../types/dashboard';
import { PlayfulCard } from './PlayfulCard';
import clientService, { ClientRecord } from '../services/clientService';
import notificationService from '../services/notificationService';
import ClientCommunicationModal, { CommMode } from './ClientCommunicationModal';
import { apiClient } from '../services/api';

interface LawyerDashboardViewProps {
  dashboardData: DashboardData;
  onNavigateTab?: (tab: 'home' | 'lawyers' | 'ai' | 'documents' | 'profile') => void;
  onActionClick: (title: string, message: string) => void;
  onToggleViewRole?: () => void;
}

export const LawyerDashboardView: React.FC<LawyerDashboardViewProps> = ({
  dashboardData,
  onNavigateTab,
  onActionClick,
  onToggleViewRole,
}) => {
  const { theme } = useTheme();
  const { user, t } = useAuth();

  const lawyerProfile = user?.lawyerProfile || dashboardData.lawyerDetails;
  const fullName = `Adv. ${user?.firstName || dashboardData.user.firstName} ${user?.lastName || dashboardData.user.lastName}`;
  const barNumber = lawyerProfile?.barLicenseNumber || 'NBA-5421';
  const specialization =
    typeof lawyerProfile?.specialization === 'string'
      ? lawyerProfile.specialization
      : (Array.isArray(lawyerProfile?.specialization) && lawyerProfile.specialization[0]) ||
        'Corporate & Civil Law';
  const hourlyRate = lawyerProfile?.hourlyRate || 2500;
  const experience = lawyerProfile?.experience || 8;
  const location = lawyerProfile?.officeLocation || 'Anamnagar, Kathmandu';

  const [commModalVisible, setCommModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);
  const [commMode, setCommMode] = useState<CommMode>('chat');

  // Modal states for working buttons
  const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
  const [selectedAptForReschedule, setSelectedAptForReschedule] = useState<AppointmentData | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('Tomorrow (Oct 08, 2026)');
  const [rescheduleSlot, setRescheduleSlot] = useState('02:00 PM - 03:00 PM');

  const [caseBriefModalVisible, setCaseBriefModalVisible] = useState(false);
  const [selectedAptForBrief, setSelectedAptForBrief] = useState<AppointmentData | null>(null);

  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [availableDays, setAvailableDays] = useState(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('05:00 PM');
  const [rateVal, setRateVal] = useState(hourlyRate.toString());
  const [slotDuration, setSlotDuration] = useState('45 Mins');

  const [barModalVisible, setBarModalVisible] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const [appointments, setAppointments] = useState<AppointmentData[]>(
    dashboardData.upcomingAppointments || []
  );

  // Synchronize appointments and ensure confirmed clients never reappear
  useEffect(() => {
    let isMounted = true;
    const syncAppointments = async () => {
      try {
        const confirmedClients = await clientService.getClients();
        const confirmedNames = new Set(
          confirmedClients
            .filter((c) => c.status === 'CONFIRMED')
            .map((c) => c.name.toLowerCase().trim())
        );
        const raw = dashboardData.upcomingAppointments || [];
        const pending = raw.filter(
          (a) => a.status === 'UPCOMING' && !confirmedNames.has(a.clientName.toLowerCase().trim())
        );
        if (isMounted) {
          setAppointments(pending);
        }
      } catch {
        if (isMounted) {
          setAppointments(
            (dashboardData.upcomingAppointments || []).filter((a) => a.status === 'UPCOMING')
          );
        }
      }
    };

    syncAppointments();
    return () => {
      isMounted = false;
    };
  }, [dashboardData.upcomingAppointments]);

  const handleOpenComm = async (clientName: string, mode: CommMode) => {
    try {
      const clients = await clientService.getClients();
      let client = clients.find(
        (c) => c.name.toLowerCase() === clientName.toLowerCase()
      );
      if (!client) {
        client = await clientService.confirmClientConsultation({
          id: `cli_${Date.now()}`,
          clientName,
          specialization,
          date: 'Today',
          timeSlot: '05:00 PM - 06:00 PM',
          fee: hourlyRate,
          notes: 'Consultation room initiated from advocate dashboard.',
        });
      }
      setSelectedClient(client);
      setCommMode(mode);
      setCommModalVisible(true);
    } catch (err) {
      console.error('Error opening client communication:', err);
    }
  };

  const handleAcceptAppointment = async (id: string, clientName: string) => {
    const targetApt = appointments.find((a) => a.id === id);

    // 1. Confirm client in clientService so client appears in Manage Clients!
    const confirmedClient = await clientService.confirmClientConsultation({
      id,
      clientName,
      specialization: targetApt?.specialization || specialization,
      date: targetApt?.date || 'Today',
      timeSlot: targetApt?.timeSlot || '10:30 AM - 11:30 AM',
      fee: targetApt?.fee || hourlyRate,
      notes: targetApt?.notes,
    });

    // 2. Persist confirmation in backend database
    try {
      await apiClient.patch(`/appointments/${id}/status`, { status: 'CONFIRMED' });
    } catch {
      // offline / local fallback
    }

    // 3. Add in-app notification
    await notificationService.addNotification({
      title: 'Consultation Confirmed',
      message: `Consultation with ${clientName} confirmed. Direct communication room is active.`,
      type: 'CONSULTATION',
      clientId: confirmedClient.id,
      clientName: confirmedClient.name,
    });

    // 4. Remove confirmed request from dashboard so it disappears and appears in Manage Clients
    setAppointments((prev) => prev.filter((a) => a.id !== id));

    setStatusFeedback(`Consultation with ${clientName} confirmed! Moved to Manage Clients page.`);
    setTimeout(() => setStatusFeedback(null), 4000);
  };

  const handleOpenReschedule = (apt: AppointmentData) => {
    setSelectedAptForReschedule(apt);
    setRescheduleModalVisible(true);
  };

  const handleSaveReschedule = async () => {
    if (!selectedAptForReschedule) return;
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === selectedAptForReschedule.id
          ? { ...a, date: rescheduleDate, timeSlot: rescheduleSlot }
          : a
      )
    );

    try {
      await apiClient.patch(`/appointments/${selectedAptForReschedule.id}`, {
        date: rescheduleDate,
        timeSlot: rescheduleSlot,
      });
    } catch {
      // offline / local fallback
    }

    await notificationService.addNotification({
      title: 'Consultation Rescheduled',
      message: `Rescheduled meeting with ${selectedAptForReschedule.clientName} to ${rescheduleDate} (${rescheduleSlot}).`,
      type: 'CONSULTATION',
      clientName: selectedAptForReschedule.clientName,
    });
    setRescheduleModalVisible(false);
    setStatusFeedback(`Meeting with ${selectedAptForReschedule.clientName} rescheduled to ${rescheduleDate}.`);
    setTimeout(() => setStatusFeedback(null), 4000);
  };

  const handleOpenCaseBrief = (apt: AppointmentData) => {
    setSelectedAptForBrief(apt);
    setCaseBriefModalVisible(true);
  };

  const handleSaveSchedule = () => {
    setScheduleModalVisible(false);
    setStatusFeedback(`Schedule saved: ${availableDays.join(', ')} (${startTime} - ${endTime}) at रु ${rateVal}/hr.`);
    setTimeout(() => setStatusFeedback(null), 4000);
  };

  return (
    <View style={styles.container}>
      {statusFeedback && (
        <View style={[styles.feedbackBanner, { backgroundColor: '#10B98115', borderColor: '#10B98150' }]}>
          <CheckCircle2 size={16} color="#10B981" style={{ marginRight: 8 }} />
          <Text style={[styles.feedbackText, { color: '#059669' }]}>{statusFeedback}</Text>
        </View>
      )}

      {/* Advocate Profile & Credentials Card */}
      <PlayfulCard delay={40}>
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
          <View style={styles.profileRow}>
            {/* Avatar with Verified Shield */}
            <View style={styles.avatarWrapper}>
              <Image
                source={{
                  uri:
                    user?.profilePicture ||
                    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
                }}
                style={styles.avatar}
              />
              <View style={[styles.shieldBadge, { backgroundColor: '#10B981' }]}>
                <Check size={12} color="#FFFFFF" />
              </View>
            </View>

            {/* Advocate Details */}
            <View style={styles.advocateInfo}>
              <View style={styles.titleRow}>
                <Text style={[styles.advocateName, { color: theme.textPrimary }]} numberOfLines={1}>
                  {fullName}
                </Text>
              </View>

              <Text style={[styles.advocateSub, { color: theme.textSecondary }]}>
                Advocate • Nepal Bar Council
              </Text>

              {/* License Number Badge */}
              <View style={styles.badgeRow}>
                <View style={[styles.licenseBadge, { backgroundColor: theme.toggleBg, borderColor: theme.cardBorder }]}>
                  <Shield size={11} color={theme.primary} style={{ marginRight: 4 }} />
                  <Text style={[styles.licenseText, { color: theme.textPrimary }]}>
                    License: {barNumber}
                  </Text>
                </View>

                <View style={[styles.ratingBadge, { backgroundColor: '#FEF3C7' }]}>
                  <Star size={11} color="#D97706" fill="#D97706" style={{ marginRight: 3 }} />
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#B45309' }}>
                    {dashboardData.stats?.rating || 4.9} (34)
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Practice Metadata Strip */}
          <View style={[styles.metaStrip, { backgroundColor: theme.background, borderColor: theme.cardBorder }]}>
            <View style={styles.metaCol}>
              <Text style={[styles.metaLabel, { color: theme.textMuted }]}>SPECIALIZATION</Text>
              <Text style={[styles.metaVal, { color: theme.textPrimary }]} numberOfLines={1}>
                {specialization}
              </Text>
            </View>
            <View style={[styles.vDivider, { backgroundColor: theme.cardBorder }]} />
            <View style={styles.metaCol}>
              <Text style={[styles.metaLabel, { color: theme.textMuted }]}>FEE RATE</Text>
              <Text style={[styles.metaVal, { color: theme.primary }]}>
                रु {hourlyRate} / hr
              </Text>
            </View>
            <View style={[styles.vDivider, { backgroundColor: theme.cardBorder }]} />
            <View style={styles.metaCol}>
              <Text style={[styles.metaLabel, { color: theme.textMuted }]}>EXPERIENCE</Text>
              <Text style={[styles.metaVal, { color: theme.textPrimary }]}>
                {experience} Years
              </Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <MapPin size={13} color={theme.textMuted} style={{ marginRight: 4 }} />
            <Text style={[styles.locationText, { color: theme.textSecondary }]}>
              Chamber: {location}
            </Text>
          </View>
        </View>
      </PlayfulCard>

      {/* Advocate KPI Stats Grid */}
      <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>PRACTICE OVERVIEW</Text>
      <View style={styles.statsGrid}>
        <PlayfulCard delay={70}>
          <View style={[styles.statBox, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <View style={[styles.statIconBox, { backgroundColor: theme.primary + '15' }]}>
              <Briefcase size={18} color={theme.primary} />
            </View>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>
              {dashboardData.stats.activeCases || 0}
            </Text>
            <Text style={[styles.statTitle, { color: theme.textSecondary }]}>Active Cases</Text>
          </View>
        </PlayfulCard>

        <PlayfulCard delay={100}>
          <View style={[styles.statBox, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <View style={[styles.statIconBox, { backgroundColor: '#10B98115' }]}>
              <Calendar size={18} color="#10B981" />
            </View>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>
              {appointments.length}
            </Text>
            <Text style={[styles.statTitle, { color: theme.textSecondary }]}>Consultations</Text>
          </View>
        </PlayfulCard>

        <PlayfulCard delay={130}>
          <View style={[styles.statBox, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <View style={[styles.statIconBox, { backgroundColor: '#8B5CF615' }]}>
              <Clock size={18} color="#8B5CF6" />
            </View>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>
              {dashboardData.stats.consultationHours || 0}h
            </Text>
            <Text style={[styles.statTitle, { color: theme.textSecondary }]}>Billable Hours</Text>
          </View>
        </PlayfulCard>

        <PlayfulCard delay={160}>
          <View style={[styles.statBox, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <View style={[styles.statIconBox, { backgroundColor: '#F59E0B15' }]}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#F59E0B' }}>रु</Text>
            </View>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>
              {(dashboardData.stats as any).totalEarnings ? `रु ${((dashboardData.stats as any).totalEarnings / 1000).toFixed(0)}k` : 'रु 0'}
            </Text>
            <Text style={[styles.statTitle, { color: theme.textSecondary }]}>Revenue</Text>
          </View>
        </PlayfulCard>
      </View>

      {/* Client Appointment Requests Card */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionHeading, { color: theme.textSecondary, marginBottom: 0 }]}>
          CLIENT CONSULTATION REQUESTS
        </Text>
        <Text
          style={[
            styles.countBadge,
            {
              backgroundColor: theme.mode === 'dark' ? '#2563EB25' : '#DBEAFE',
              color: theme.mode === 'dark' ? '#60A5FA' : '#1D4ED8',
              borderColor: theme.mode === 'dark' ? '#2563EB44' : '#BFDBFE',
              borderWidth: 1,
            },
          ]}
        >
          {appointments.length} Upcoming
        </Text>
      </View>

      <PlayfulCard delay={190}>
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
          {appointments.length === 0 ? (
            <View style={{ paddingVertical: 24, alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={32} color="#10B981" style={{ marginBottom: 8 }} />
              <Text style={{ fontSize: 14, fontWeight: '700', color: theme.textPrimary }}>All Consultations Confirmed</Text>
              <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 4, textAlign: 'center', paddingHorizontal: 20 }}>
                No pending requests. Confirmed client files are active in Manage Clients.
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onNavigateTab ? onNavigateTab('lawyers') : onActionClick('Manage Clients', 'Open active client registry and case files.')}
                style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563EB', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 }}
              >
                <Users size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 12 }}>Open Manage Clients</Text>
              </TouchableOpacity>
            </View>
          ) : (
            appointments.map((apt, index) => (
            <View key={apt.id}>
              {index > 0 && <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />}
              <View style={styles.appointmentItem}>
                <View style={styles.aptTopRow}>
                  <View style={styles.clientAvatarRow}>
                    <View style={[styles.clientAvatar, { backgroundColor: theme.toggleBg }]}>
                      <User size={16} color={theme.textPrimary} />
                    </View>
                    <View>
                      <Text style={[styles.clientNameText, { color: theme.textPrimary }]}>
                        {apt.clientName}
                      </Text>
                      <Text style={[styles.aptDateText, { color: theme.textSecondary }]}>
                        {apt.date} • {apt.timeSlot}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.feePill, { backgroundColor: theme.toggleBg }]}>
                    <Text style={[styles.feePillText, { color: theme.textPrimary }]}>
                      रु {apt.fee}
                    </Text>
                  </View>
                </View>

                {apt.notes && (
                  <View style={[styles.notesBox, { backgroundColor: theme.background }]}>
                    <Text style={[styles.notesText, { color: theme.textSecondary }]} numberOfLines={2}>
                      "{apt.notes}"
                    </Text>
                  </View>
                )}

                {apt.status === 'CONFIRMED' ? (
                  <View style={styles.confirmedSection}>
                    <View style={[styles.confirmedPill, { backgroundColor: '#10B98118', borderColor: '#10B98140' }]}>
                      <CheckCircle2 size={13} color="#10B981" style={{ marginRight: 5 }} />
                      <Text style={[styles.confirmedPillText, { color: '#10B981' }]}>Confirmed Consultation Active</Text>
                    </View>

                    <View style={styles.commActionRow}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleOpenComm(apt.clientName, 'chat')}
                        style={[styles.commActionBtn, { backgroundColor: '#2563EB' }]}
                      >
                        <MessageSquare size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                        <Text style={styles.commActionBtnText}>Message</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleOpenComm(apt.clientName, 'audio')}
                        style={[styles.commActionBtn, { backgroundColor: '#10B981' }]}
                      >
                        <Phone size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                        <Text style={styles.commActionBtnText}>Audio Call</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleOpenComm(apt.clientName, 'video')}
                        style={[styles.commActionBtn, { backgroundColor: '#8B5CF6' }]}
                      >
                        <Video size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                        <Text style={styles.commActionBtnText}>Video Call</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.actionBtnRow}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleAcceptAppointment(apt.id, apt.clientName)}
                      style={[
                        styles.acceptBtn,
                        {
                          backgroundColor: theme.mode === 'dark' ? '#2563EB' : '#1D4ED8',
                        },
                      ]}
                    >
                      <Check size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={[styles.acceptBtnText, { color: '#FFFFFF' }]}>Confirm Meeting</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleOpenReschedule(apt)}
                      style={[styles.declineBtn, { borderColor: theme.cardBorder }]}
                    >
                      <X size={14} color={theme.textSecondary} style={{ marginRight: 4 }} />
                      <Text style={[styles.declineBtnText, { color: theme.textSecondary }]}>
                        Reschedule
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleOpenCaseBrief(apt)}
                      style={[styles.briefBtn, { borderColor: theme.cardBorder }]}
                    >
                      <FileText size={14} color={theme.primary} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
        </View>
      </PlayfulCard>

      {/* Advocate Hub Management Grid */}
      <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>CHAMBER MANAGEMENT HUB</Text>
      <View style={styles.hubGrid}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onNavigateTab ? onNavigateTab('lawyers') : onActionClick('Manage Clients', 'Open active client registry and case files.')}
          style={[styles.hubCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}
        >
          <View style={[styles.hubIconBox, { backgroundColor: '#2563EB15' }]}>
            <Users size={20} color="#2563EB" />
          </View>
          <Text style={[styles.hubTitle, { color: theme.textPrimary }]}>Manage Clients</Text>
          <Text style={[styles.hubSub, { color: theme.textSecondary }]}>Chat & Direct Calls</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setScheduleModalVisible(true)}
          style={[styles.hubCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}
        >
          <View style={[styles.hubIconBox, { backgroundColor: theme.primary + '15' }]}>
            <Calendar size={20} color={theme.primary} />
          </View>
          <Text style={[styles.hubTitle, { color: theme.textPrimary }]}>Manage Schedule</Text>
          <Text style={[styles.hubSub, { color: theme.textSecondary }]}>Hours & Hourly Rates</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onNavigateTab ? onNavigateTab('documents') : onActionClick('Case Vault', 'Client deeds, pleadings, and affidavits.')}
          style={[styles.hubCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}
        >
          <View style={[styles.hubIconBox, { backgroundColor: '#10B98115' }]}>
            <FileText size={20} color="#10B981" />
          </View>
          <Text style={[styles.hubTitle, { color: theme.textPrimary }]}>Client Documents</Text>
          <Text style={[styles.hubSub, { color: theme.textSecondary }]}>Vault & Contracts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onNavigateTab ? onNavigateTab('ai') : onActionClick('AI Legal Research', 'Nepal Supreme Court precedents and statute citations.')}
          style={[styles.hubCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}
        >
          <View style={[styles.hubIconBox, { backgroundColor: '#8B5CF615' }]}>
            <Bot size={20} color="#8B5CF6" />
          </View>
          <Text style={[styles.hubTitle, { color: theme.textPrimary }]}>AI Legal Research</Text>
          <Text style={[styles.hubSub, { color: theme.textSecondary }]}>Nepal Supreme Court Precedents</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setBarModalVisible(true)}
          style={[styles.hubCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}
        >
          <View style={[styles.hubIconBox, { backgroundColor: '#F59E0B15' }]}>
            <Shield size={20} color="#F59E0B" />
          </View>
          <Text style={[styles.hubTitle, { color: theme.textPrimary }]}>Bar Verification</Text>
          <Text style={[styles.hubSub, { color: theme.textSecondary }]}>{barNumber}</Text>
        </TouchableOpacity>
      </View>

      {/* Embedded Client Communication Modal */}
      <ClientCommunicationModal
        visible={commModalVisible}
        onClose={() => setCommModalVisible(false)}
        client={selectedClient}
        initialMode={commMode}
      />

      {/* Reschedule Consultation Modal */}
      <Modal
        visible={rescheduleModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRescheduleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconBox, { backgroundColor: theme.primary + '15' }]}>
                <Calendar size={20} color={theme.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Reschedule Consultation</Text>
                <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                  {selectedAptForReschedule?.clientName} • Current: {selectedAptForReschedule?.timeSlot}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setRescheduleModalVisible(false)} style={styles.modalCloseBtn}>
                <X size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>SELECT NEW DATE</Text>
              <View style={styles.optionsWrap}>
                {[
                  'Today (Evening)',
                  'Tomorrow (Oct 08, 2026)',
                  'In 2 Days (Oct 09, 2026)',
                  'Next Sunday (Oct 11, 2026)',
                ].map((d) => (
                  <TouchableOpacity
                    key={d}
                    activeOpacity={0.7}
                    onPress={() => setRescheduleDate(d)}
                    style={[
                      styles.choicePill,
                      {
                        backgroundColor: rescheduleDate === d ? theme.primary : theme.toggleBg,
                        borderColor: rescheduleDate === d ? theme.primary : theme.cardBorder,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.choicePillText,
                        { color: rescheduleDate === d ? '#FFFFFF' : theme.textPrimary },
                      ]}
                    >
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, { color: theme.textSecondary, marginTop: 14 }]}>
                SELECT NEW TIME SLOT
              </Text>
              <View style={styles.optionsWrap}>
                {[
                  '10:30 AM - 11:30 AM',
                  '02:00 PM - 03:00 PM',
                  '04:00 PM - 05:00 PM',
                  '06:00 PM - 07:00 PM',
                ].map((slot) => (
                  <TouchableOpacity
                    key={slot}
                    activeOpacity={0.7}
                    onPress={() => setRescheduleSlot(slot)}
                    style={[
                      styles.choicePill,
                      {
                        backgroundColor: rescheduleSlot === slot ? theme.primary : theme.toggleBg,
                        borderColor: rescheduleSlot === slot ? theme.primary : theme.cardBorder,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.choicePillText,
                        { color: rescheduleSlot === slot ? '#FFFFFF' : theme.textPrimary },
                      ]}
                    >
                      {slot}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={[styles.infoBanner, { backgroundColor: theme.background, borderColor: theme.cardBorder }]}>
                <Clock size={16} color={theme.primary} />
                <Text style={[styles.infoBannerText, { color: theme.textSecondary }]}>
                  The client will immediately receive an in-app hearing notice with the updated slot.
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleSaveReschedule}
                style={[styles.saveModalBtn, { backgroundColor: theme.primary }]}
              >
                <Check size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.saveModalBtnText}>Confirm Reschedule</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Case Brief & Client File Modal */}
      <Modal
        visible={caseBriefModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCaseBriefModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconBox, { backgroundColor: '#2563EB15' }]}>
                <FileText size={20} color="#2563EB" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Case Brief & Client File</Text>
                <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                  Consultation Case Docket
                </Text>
              </View>
              <TouchableOpacity onPress={() => setCaseBriefModalVisible(false)} style={styles.modalCloseBtn}>
                <X size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedAptForBrief && (
                <>
                  <View style={[styles.briefCard, { backgroundColor: theme.background, borderColor: theme.cardBorder }]}>
                    <View style={styles.briefRow}>
                      <Text style={[styles.briefLabel, { color: theme.textMuted }]}>CLIENT NAME</Text>
                      <Text style={[styles.briefVal, { color: theme.textPrimary }]}>{selectedAptForBrief.clientName}</Text>
                    </View>
                    <View style={styles.briefRow}>
                      <Text style={[styles.briefLabel, { color: theme.textMuted }]}>MATTER / SPECIALIZATION</Text>
                      <Text style={[styles.briefVal, { color: theme.textPrimary }]}>{selectedAptForBrief.specialization}</Text>
                    </View>
                    <View style={styles.briefRow}>
                      <Text style={[styles.briefLabel, { color: theme.textMuted }]}>APPOINTMENT SLOT</Text>
                      <Text style={[styles.briefVal, { color: theme.textPrimary }]}>{selectedAptForBrief.date} • {selectedAptForBrief.timeSlot}</Text>
                    </View>
                    <View style={styles.briefRow}>
                      <Text style={[styles.briefLabel, { color: theme.textMuted }]}>CONSULTATION FEE</Text>
                      <Text style={[styles.briefVal, { color: '#10B981', fontWeight: '800' }]}>रु {selectedAptForBrief.fee}</Text>
                    </View>
                  </View>

                  <Text style={[styles.inputLabel, { color: theme.textSecondary, marginTop: 14 }]}>
                    CLIENT PETITION & NOTES
                  </Text>
                  <View style={[styles.notesContainer, { backgroundColor: theme.background, borderColor: theme.cardBorder }]}>
                    <Text style={[styles.notesBody, { color: theme.textPrimary }]}>
                      {selectedAptForBrief.notes || 'General consultation request regarding property partitioning and tenant agreements.'}
                    </Text>
                  </View>

                  <Text style={[styles.inputLabel, { color: theme.textSecondary, marginTop: 14 }]}>
                    DIRECT CLIENT COMMUNICATION
                  </Text>
                  <View style={styles.briefCommRow}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {
                        setCaseBriefModalVisible(false);
                        handleOpenComm(selectedAptForBrief.clientName, 'chat');
                      }}
                      style={[styles.commActionBtn, { backgroundColor: '#2563EB', paddingVertical: 10 }]}
                    >
                      <MessageSquare size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.commActionBtnText}>Message</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {
                        setCaseBriefModalVisible(false);
                        handleOpenComm(selectedAptForBrief.clientName, 'audio');
                      }}
                      style={[styles.commActionBtn, { backgroundColor: '#10B981', paddingVertical: 10 }]}
                    >
                      <Phone size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.commActionBtnText}>Audio Call</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {
                        setCaseBriefModalVisible(false);
                        handleOpenComm(selectedAptForBrief.clientName, 'video');
                      }}
                      style={[styles.commActionBtn, { backgroundColor: '#8B5CF6', paddingVertical: 10 }]}
                    >
                      <Video size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.commActionBtnText}>Video Call</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Chamber Schedule & Availability Modal */}
      <Modal
        visible={scheduleModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setScheduleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconBox, { backgroundColor: theme.primary + '15' }]}>
                <Clock size={20} color={theme.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Manage Chamber Schedule</Text>
                <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                  Chamber Consultation Hours & Rate
                </Text>
              </View>
              <TouchableOpacity onPress={() => setScheduleModalVisible(false)} style={styles.modalCloseBtn}>
                <X size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>AVAILABLE WORKING DAYS</Text>
              <View style={styles.daysRow}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => {
                  const isSelected = availableDays.includes(day);
                  return (
                    <TouchableOpacity
                      key={day}
                      activeOpacity={0.7}
                      onPress={() => {
                        if (isSelected) {
                          setAvailableDays(availableDays.filter((d) => d !== day));
                        } else {
                          setAvailableDays([...availableDays, day]);
                        }
                      }}
                      style={[
                        styles.dayPill,
                        {
                          backgroundColor: isSelected ? theme.primary : theme.toggleBg,
                          borderColor: isSelected ? theme.primary : theme.cardBorder,
                        },
                      ]}
                    >
                      <Text style={[styles.dayPillText, { color: isSelected ? '#FFFFFF' : theme.textPrimary }]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.inputLabel, { color: theme.textSecondary, marginTop: 14 }]}>
                DAILY WORKING HOURS (NST)
              </Text>
              <View style={styles.timeInputsRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.timeInputSub, { color: theme.textMuted }]}>Start Time</Text>
                  <TextInput
                    style={[styles.modalTextInput, { backgroundColor: theme.background, borderColor: theme.cardBorder, color: theme.textPrimary }]}
                    value={startTime}
                    onChangeText={setStartTime}
                    placeholder="10:00 AM"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
                <View style={{ width: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.timeInputSub, { color: theme.textMuted }]}>End Time</Text>
                  <TextInput
                    style={[styles.modalTextInput, { backgroundColor: theme.background, borderColor: theme.cardBorder, color: theme.textPrimary }]}
                    value={endTime}
                    onChangeText={setEndTime}
                    placeholder="05:00 PM"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
              </View>

              <Text style={[styles.inputLabel, { color: theme.textSecondary, marginTop: 14 }]}>
                HOURLY RATE (रु)
              </Text>
              <View style={[styles.rateInputWrap, { backgroundColor: theme.background, borderColor: theme.cardBorder }]}>
                <Text style={[styles.currencyPrefix, { color: theme.primary }]}>रु</Text>
                <TextInput
                  style={[styles.rateTextInput, { color: theme.textPrimary }]}
                  value={rateVal}
                  onChangeText={setRateVal}
                  keyboardType="numeric"
                  placeholder="2500"
                  placeholderTextColor={theme.textMuted}
                />
                <Text style={[styles.rateSuffix, { color: theme.textSecondary }]}>/ hr</Text>
              </View>

              <Text style={[styles.inputLabel, { color: theme.textSecondary, marginTop: 14 }]}>
                DEFAULT SLOT DURATION
              </Text>
              <View style={styles.optionsWrap}>
                {['30 Mins', '45 Mins', '60 Mins'].map((dur) => (
                  <TouchableOpacity
                    key={dur}
                    activeOpacity={0.7}
                    onPress={() => setSlotDuration(dur)}
                    style={[
                      styles.choicePill,
                      {
                        backgroundColor: slotDuration === dur ? theme.primary : theme.toggleBg,
                        borderColor: slotDuration === dur ? theme.primary : theme.cardBorder,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.choicePillText,
                        { color: slotDuration === dur ? '#FFFFFF' : theme.textPrimary },
                      ]}
                    >
                      {dur}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleSaveSchedule}
                style={[styles.saveModalBtn, { backgroundColor: theme.primary, marginTop: 20 }]}
              >
                <Check size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.saveModalBtnText}>Save Schedule & Availability</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Nepal Bar Council Verification Certificate Modal */}
      <Modal
        visible={barModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBarModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconBox, { backgroundColor: '#F59E0B18' }]}>
                <Award size={20} color="#D97706" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Nepal Bar Council</Text>
                <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                  Digital Advocate Credential & Verification
                </Text>
              </View>
              <TouchableOpacity onPress={() => setBarModalVisible(false)} style={styles.modalCloseBtn}>
                <X size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={[styles.certBox, { backgroundColor: theme.background, borderColor: '#D9770640' }]}>
                <View style={styles.certHeader}>
                  <Shield size={32} color="#D97706" />
                  <Text style={[styles.certHeading, { color: theme.textPrimary }]}>
                    NEPAL BAR COUNCIL (नेपाल बार काउन्सिल)
                  </Text>
                  <Text style={[styles.certSubheading, { color: theme.textSecondary }]}>
                    ADVOCATE CERTIFICATE OF PRACTICE
                  </Text>
                </View>

                <View style={styles.certDivider} />

                <View style={styles.certRow}>
                  <Text style={[styles.certLabel, { color: theme.textMuted }]}>ADVOCATE NAME</Text>
                  <Text style={[styles.certVal, { color: theme.textPrimary }]}>{fullName}</Text>
                </View>

                <View style={styles.certRow}>
                  <Text style={[styles.certLabel, { color: theme.textMuted }]}>LICENSE REGISTRATION</Text>
                  <Text style={[styles.certVal, { color: '#2563EB', fontWeight: '800' }]}>{barNumber}</Text>
                </View>

                <View style={styles.certRow}>
                  <Text style={[styles.certLabel, { color: theme.textMuted }]}>PRACTICE SPECIALIZATION</Text>
                  <Text style={[styles.certVal, { color: theme.textPrimary }]}>{specialization}</Text>
                </View>

                <View style={styles.certRow}>
                  <Text style={[styles.certLabel, { color: theme.textMuted }]}>ENROLLMENT ACT</Text>
                  <Text style={[styles.certVal, { color: theme.textPrimary }]}>Nepal Bar Council Act, 2050 (Sec. 17)</Text>
                </View>

                <View style={styles.certRow}>
                  <Text style={[styles.certLabel, { color: theme.textMuted }]}>REPRESENTATION RIGHTS</Text>
                  <Text style={[styles.certVal, { color: theme.textPrimary }]}>
                    Supreme Court, High Courts, District Courts
                  </Text>
                </View>

                <View style={styles.certRow}>
                  <Text style={[styles.certLabel, { color: theme.textMuted }]}>STATUS</Text>
                  <View style={[styles.statusBadgeCert, { backgroundColor: '#10B98118' }]}>
                    <CheckCircle2 size={12} color="#10B981" style={{ marginRight: 4 }} />
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#10B981' }}>ACTIVE & GOOD STANDING</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setBarModalVisible(false)}
                style={[styles.saveModalBtn, { backgroundColor: theme.primary, marginTop: 16 }]}
              >
                <Text style={styles.saveModalBtnText}>Close Certificate</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: 24,
  },
  confirmedSection: {
    marginTop: 8,
  },
  confirmedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  confirmedPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  commActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  commActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  commActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  shieldBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  advocateInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  advocateName: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: typography.fontFamily,
    letterSpacing: -0.3,
  },
  advocateSub: {
    fontSize: 12.5,
    marginTop: 2,
    fontWeight: '500',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  licenseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  licenseText: {
    fontSize: 11,
    fontWeight: '700',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  metaStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 14,
  },
  metaCol: {
    flex: 1,
    alignItems: 'center',
  },
  vDivider: {
    width: 1,
    height: 24,
  },
  metaLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  metaVal: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingLeft: 2,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionHeading: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 4,
  },
  countBadge: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
  },
  statIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '800',
    fontFamily: typography.fontFamily,
  },
  statTitle: {
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },
  appointmentItem: {
    paddingVertical: 10,
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 10,
  },
  aptTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clientAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  clientAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientNameText: {
    fontSize: 14,
    fontWeight: '700',
  },
  aptDateText: {
    fontSize: 12,
    marginTop: 2,
  },
  feePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  feePillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  notesBox: {
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  notesText: {
    fontSize: 11.5,
    fontStyle: 'italic',
  },
  actionBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  acceptBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  acceptBtnText: {
    color: '#FFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  declineBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  declineBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  briefBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  hubCard: {
    width: '48%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 4,
  },
  hubIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  hubTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  hubSub: {
    fontSize: 11,
    marginTop: 2,
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  feedbackText: {
    fontSize: 12.5,
    fontWeight: '600',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  choicePill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  choicePillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 16,
    gap: 8,
  },
  infoBannerText: {
    fontSize: 11.5,
    flex: 1,
    lineHeight: 16,
  },
  saveModalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 10,
  },
  saveModalBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  briefCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  briefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  briefLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  briefVal: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  notesContainer: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  notesBody: {
    fontSize: 12.5,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  briefCommRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  daysRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  dayPill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  dayPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  timeInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInputSub: {
    fontSize: 10.5,
    marginBottom: 4,
    fontWeight: '600',
  },
  modalTextInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    fontWeight: '600',
  },
  rateInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: '800',
    marginRight: 6,
  },
  rateTextInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    padding: 0,
  },
  rateSuffix: {
    fontSize: 12,
    fontWeight: '600',
  },
  certBox: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    gap: 12,
  },
  certHeader: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  certHeading: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 6,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  certSubheading: {
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.8,
  },
  certDivider: {
    height: 1,
    backgroundColor: '#D9770630',
  },
  certRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  certLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  certVal: {
    fontSize: 12,
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
  statusBadgeCert: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
});
