import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, Clock, ArrowRight, UserCheck, MessageSquare, Phone, Video } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { AppointmentData } from '../types/dashboard';
import { PlayfulCard } from './PlayfulCard';

interface AppointmentListCardProps {
  appointments: AppointmentData[];
  onViewAll?: () => void;
  onSelectAppointment?: (apt: AppointmentData) => void;
  onCommunicate?: (apt: AppointmentData, mode: 'chat' | 'audio' | 'video') => void;
}

export const AppointmentListCard: React.FC<AppointmentListCardProps> = ({
  appointments,
  onViewAll,
  onSelectAppointment,
  onCommunicate,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          Upcoming Consultations
        </Text>
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll} activeOpacity={0.7} style={styles.viewAllBtn}>
            <Text style={[styles.viewAllText, { color: theme.textSecondary }]}>View All</Text>
            <ArrowRight size={14} color={theme.textSecondary} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        )}
      </View>

      {appointments.length === 0 ? (
        <PlayfulCard delay={240}>
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder },
            ]}
          >
            <Calendar size={28} color={theme.textMuted} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No upcoming consultations scheduled.
            </Text>
          </View>
        </PlayfulCard>
      ) : (
        appointments.map((apt, idx) => (
          <PlayfulCard key={apt.id} delay={240 + idx * 60}>
            <View
              style={[
                styles.itemCard,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.cardBorder,
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onSelectAppointment && onSelectAppointment(apt)}
              >
                <View style={styles.topRow}>
                  <View style={styles.lawyerGroup}>
                    <View style={[styles.iconBox, { backgroundColor: theme.toggleBg }]}>
                      <UserCheck size={18} color={theme.textPrimary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.lawyerName, { color: theme.textPrimary }]}>
                        {apt.lawyerName}
                      </Text>
                      <Text style={[styles.specText, { color: theme.textSecondary }]}>
                        {apt.specialization}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: apt.status === 'UPCOMING' ? '#FEF3C7' : '#D1FAE5' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: apt.status === 'UPCOMING' ? '#D97706' : '#059669' },
                      ]}
                    >
                      {apt.status}
                    </Text>
                  </View>
                </View>

                <View style={[styles.cardDivider, { backgroundColor: theme.cardBorder }]} />

                <View style={styles.bottomRow}>
                  <View style={styles.timeInfo}>
                    <Calendar size={13} color={theme.textMuted} />
                    <Text style={[styles.timeText, { color: theme.textSecondary }]}>{apt.date}</Text>
                    <Clock size={13} color={theme.textMuted} style={{ marginLeft: 10 }} />
                    <Text style={[styles.timeText, { color: theme.textSecondary }]}>
                      {apt.timeSlot}
                    </Text>
                  </View>

                  <Text style={[styles.feeText, { color: theme.textPrimary }]}>
                    Rs. {apt.fee.toLocaleString()}
                  </Text>
                </View>
              </TouchableOpacity>

              {onCommunicate && (
                <View style={[styles.commRow, { borderTopColor: theme.cardBorder }]}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => onCommunicate(apt, 'chat')}
                    style={[styles.commBtn, { backgroundColor: '#2563EB' }]}
                  >
                    <MessageSquare size={13} color="#FFFFFF" style={{ marginRight: 5 }} />
                    <Text style={styles.commBtnText}>Message</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => onCommunicate(apt, 'audio')}
                    style={[styles.commBtn, { backgroundColor: '#10B981' }]}
                  >
                    <Phone size={13} color="#FFFFFF" style={{ marginRight: 5 }} />
                    <Text style={styles.commBtnText}>Audio Call</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => onCommunicate(apt, 'video')}
                    style={[styles.commBtn, { backgroundColor: '#8B5CF6' }]}
                  >
                    <Video size={13} color="#FFFFFF" style={{ marginRight: 5 }} />
                    <Text style={styles.commBtnText}>Video Call</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </PlayfulCard>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyCard: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    marginTop: 8,
  },
  itemCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lawyerGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lawyerName: {
    fontSize: 15,
    fontWeight: '700',
  },
  specText: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  cardDivider: {
    height: 1,
    marginVertical: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  feeText: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  commRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  commBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  commBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
