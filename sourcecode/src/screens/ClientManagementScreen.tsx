import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {
  Search,
  Users,
  MessageSquare,
  Phone,
  Video,
  Calendar,
  Clock,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Filter,
  Plus,
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import clientService, { ClientRecord } from '../services/clientService';
import ClientCommunicationModal, { CommMode } from '../components/ClientCommunicationModal';
import { PlayfulCard } from '../components/PlayfulCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type FilterTab = 'ALL' | 'CONFIRMED' | 'IN_PROGRESS' | 'PENDING' | 'CLOSED';

interface ClientManagementScreenProps {
  onOpenChatWithClient?: (client: ClientRecord) => void;
}

export const ClientManagementScreen: React.FC<ClientManagementScreenProps> = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');

  // Communication modal state
  const [commModalVisible, setCommModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);
  const [commMode, setCommMode] = useState<CommMode>('chat');

  const loadClients = useCallback(async () => {
    try {
      const data = await clientService.getClients();
      setClients(data);
    } catch (err) {
      console.error('Failed to load clients:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
    const unsubscribe = clientService.subscribe((updatedClients) => {
      setClients(updatedClients);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [loadClients]);

  const onRefresh = () => {
    setRefreshing(true);
    loadClients();
  };

  const handleStartCommunication = (client: ClientRecord, mode: CommMode) => {
    setSelectedClient(client);
    setCommMode(mode);
    setCommModalVisible(true);
  };

  const filteredClients = clients.filter((c) => {
    const matchesQuery =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.caseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.caseType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesQuery) return false;

    if (activeFilter === 'ALL') return true;
    return c.status === activeFilter;
  });

  const confirmedCount = clients.filter((c) => c.status === 'CONFIRMED').length;
  const inProgressCount = clients.filter((c) => c.status === 'IN_PROGRESS').length;
  const unreadMessagesCount = clients.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const getStatusColor = (status: ClientRecord['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return { bg: '#10B98120', text: '#10B981', border: '#10B98140', label: 'Confirmed' };
      case 'IN_PROGRESS':
        return { bg: '#2563EB20', text: '#2563EB', border: '#2563EB40', label: 'In Progress' };
      case 'PENDING':
        return { bg: '#F59E0B20', text: '#F59E0B', border: '#F59E0B40', label: 'Pending' };
      case 'CLOSED':
        return { bg: '#64748B20', text: '#64748B', border: '#64748B40', label: 'Closed' };
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        {/* Top Header */}
        <View style={styles.header}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Manage Clients</Text>
            <Text style={[styles.headerSub, { color: theme.textSecondary }]} numberOfLines={1}>
              Active consultations & direct client communications
            </Text>
          </View>

          <View style={[styles.clientCountBadge, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <Users size={16} color={theme.textPrimary} style={{ marginRight: 6 }} />
            <Text style={[styles.clientCountText, { color: theme.textPrimary }]}>{clients.length} Total</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <PlayfulCard delay={40}>
            <View style={[styles.statBox, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
              <View style={[styles.statIconCircle, { backgroundColor: '#10B98118' }]}>
                <CheckCircle2 size={16} color="#10B981" />
              </View>
              <Text style={[styles.statNumber, { color: theme.textPrimary }]}>{confirmedCount}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Confirmed</Text>
            </View>
          </PlayfulCard>

          <PlayfulCard delay={80}>
            <View style={[styles.statBox, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
              <View style={[styles.statIconCircle, { backgroundColor: '#2563EB18' }]}>
                <Briefcase size={16} color="#2563EB" />
              </View>
              <Text style={[styles.statNumber, { color: theme.textPrimary }]}>{inProgressCount}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>In Progress</Text>
            </View>
          </PlayfulCard>

          <PlayfulCard delay={120}>
            <View style={[styles.statBox, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
              <View style={[styles.statIconCircle, { backgroundColor: '#F59E0B18' }]}>
                <MessageSquare size={16} color="#F59E0B" />
              </View>
              <Text style={[styles.statNumber, { color: theme.textPrimary }]}>{unreadMessagesCount}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Unread Chats</Text>
            </View>
          </PlayfulCard>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
          <Search size={18} color={theme.textSecondary} style={{ marginRight: 10 }} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder="Search by client name, case, or email..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {(['ALL', 'CONFIRMED', 'IN_PROGRESS', 'PENDING', 'CLOSED'] as FilterTab[]).map((tab) => {
            const isActive = activeFilter === tab;
            return (
              <TouchableOpacity
                key={tab}
                activeOpacity={0.7}
                onPress={() => setActiveFilter(tab)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isActive ? '#2563EB' : theme.cardBackground,
                    borderColor: isActive ? '#2563EB' : theme.cardBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color: isActive ? '#FFFFFF' : theme.textSecondary,
                      fontWeight: isActive ? '700' : '500',
                    },
                  ]}
                >
                  {tab === 'ALL'
                    ? 'All Clients'
                    : tab === 'IN_PROGRESS'
                    ? 'In Progress'
                    : tab.charAt(0) + tab.slice(1).toLowerCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Client List */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading client records...</Text>
          </View>
        ) : filteredClients.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <AlertCircle size={36} color={theme.textSecondary} style={{ marginBottom: 12 }} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No clients found</Text>
            <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
              {searchQuery
                ? `No clients match "${searchQuery}" in this filter.`
                : 'Confirm pending consultation requests to add clients here.'}
            </Text>
          </View>
        ) : (
          filteredClients.map((client, idx) => {
            const statusConfig = getStatusColor(client.status);
            return (
              <PlayfulCard key={client.id} delay={idx * 50}>
                <View
                  style={[
                    styles.clientCard,
                    {
                      backgroundColor: theme.cardBackground,
                      borderColor: theme.cardBorder,
                    },
                  ]}
                >
                  {/* Top Row: Avatar + Name + Status */}
                  <View style={styles.clientTopRow}>
                    <View style={styles.avatarGroup}>
                      <Image source={{ uri: client.avatar }} style={styles.clientAvatar} />
                      <View style={styles.onlineDot} />
                    </View>

                    <View style={styles.clientInfoBlock}>
                      <View style={styles.nameHeaderRow}>
                        <Text style={[styles.clientName, { color: theme.textPrimary }]} numberOfLines={1}>
                          {client.name}
                        </Text>
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor: statusConfig.bg,
                              borderColor: statusConfig.border,
                            },
                          ]}
                        >
                          <Text style={[styles.statusBadgeText, { color: statusConfig.text }]}>
                            {statusConfig.label}
                          </Text>
                        </View>
                      </View>

                      <Text style={[styles.clientPhone, { color: theme.textSecondary }]}>
                        {client.phone} • {client.email}
                      </Text>
                    </View>
                  </View>

                  {/* Case & Consultation Meta */}
                  <View style={[styles.caseMetaBox, { backgroundColor: theme.background }]}>
                    <View style={styles.caseMetaRow}>
                      <Briefcase size={14} color="#2563EB" style={{ marginRight: 6 }} />
                      <Text style={[styles.caseTitleText, { color: theme.textPrimary }]} numberOfLines={1}>
                        {client.caseTitle}
                      </Text>
                    </View>

                    <View style={styles.scheduleRow}>
                      <View style={styles.scheduleItem}>
                        <Calendar size={13} color={theme.textSecondary} style={{ marginRight: 4 }} />
                        <Text style={[styles.scheduleText, { color: theme.textSecondary }]}>
                          {client.appointmentDate}
                        </Text>
                      </View>
                      <View style={styles.scheduleItem}>
                        <Clock size={13} color={theme.textSecondary} style={{ marginRight: 4 }} />
                        <Text style={[styles.scheduleText, { color: theme.textSecondary }]}>
                          {client.appointmentTime}
                        </Text>
                      </View>
                      <View style={styles.feeItem}>
                        <Text style={[styles.feeText, { color: theme.textPrimary }]}>
                          रु {client.fee}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Last Message Snippet */}
                  {client.lastMessage && (
                    <View style={styles.lastMsgRow}>
                      <MessageSquare size={13} color={theme.textSecondary} style={{ marginRight: 6, marginTop: 2 }} />
                      <Text style={[styles.lastMsgText, { color: theme.textSecondary }]} numberOfLines={1}>
                        "{client.lastMessage}"
                      </Text>
                    </View>
                  )}

                  {/* Communication Action Bar */}
                  <View style={[styles.actionBar, { borderTopColor: theme.cardBorder }]}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleStartCommunication(client, 'chat')}
                      style={[styles.commActionBtn, { backgroundColor: '#2563EB' }]}
                    >
                      <MessageSquare size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={[styles.commActionBtnText, { color: '#FFFFFF' }]}>Message</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleStartCommunication(client, 'audio')}
                      style={[styles.commActionBtn, { backgroundColor: '#10B981' }]}
                    >
                      <Phone size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={[styles.commActionBtnText, { color: '#FFFFFF' }]}>Audio Call</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleStartCommunication(client, 'video')}
                      style={[styles.commActionBtn, { backgroundColor: '#8B5CF6' }]}
                    >
                      <Video size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={[styles.commActionBtnText, { color: '#FFFFFF' }]}>Video Call</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </PlayfulCard>
            );
          })
        )}
      </ScrollView>

      {/* Embedded Communication Suite Modal */}
      <ClientCommunicationModal
        visible={commModalVisible}
        onClose={() => setCommModalVisible(false)}
        client={selectedClient}
        initialMode={commMode}
        onClientUpdated={loadClients}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  headerSub: {
    fontSize: 13,
    marginTop: 2,
  },
  clientCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  clientCountText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  statIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  filterScroll: {
    gap: 8,
    marginBottom: 16,
    paddingVertical: 2,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
  },
  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
    marginTop: 10,
  },
  emptyCard: {
    padding: 32,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
  },
  clientCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  clientTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarGroup: {
    position: 'relative',
    marginRight: 12,
  },
  clientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  clientInfoBlock: {
    flex: 1,
  },
  nameHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clientName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  clientPhone: {
    fontSize: 12,
    marginTop: 3,
  },
  caseMetaBox: {
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
  },
  caseMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  caseTitleText: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleText: {
    fontSize: 11,
    fontWeight: '500',
  },
  feeItem: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  feeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  lastMsgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  lastMsgText: {
    fontSize: 12,
    fontStyle: 'italic',
    flex: 1,
  },
  actionBar: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  commActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 12,
  },
  commActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export default ClientManagementScreen;
