import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import {
  X,
  Bell,
  Calendar,
  FileText,
  Scale,
  Shield,
  CheckCircle2,
  Trash2,
  MessageSquare,
  ChevronRight,
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import notificationService, { AppNotification } from '../services/notificationService';

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenClient?: (clientId: string, clientName?: string) => void;
  onUnreadChange?: (count: number) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  visible,
  onClose,
  onOpenClient,
  onUnreadChange,
}) => {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
      const unread = data.filter((n) => !n.read).length;
      if (onUnreadChange) onUnreadChange(unread);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadNotifications();
    }
  }, [visible]);

  const handleMarkAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    const unread = updated.filter((n) => !n.read).length;
    if (onUnreadChange) onUnreadChange(unread);
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    if (onUnreadChange) onUnreadChange(0);
  };

  const handleClearAll = async () => {
    await notificationService.clearAll();
    setNotifications([]);
    if (onUnreadChange) onUnreadChange(0);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'CONSULTATION':
        return <Calendar size={18} color="#2563EB" />;
      case 'DOCUMENT':
        return <FileText size={18} color="#10B981" />;
      case 'HEARING':
        return <Scale size={18} color="#F59E0B" />;
      default:
        return <Shield size={18} color="#8B5CF6" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.cardBackground, borderBottomColor: theme.cardBorder }]}>
          <View style={styles.headerLeft}>
            <View style={[styles.bellBox, { backgroundColor: '#2563EB18' }]}>
              <Bell size={20} color="#2563EB" />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Notifications</Text>
              <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
                {unreadCount > 0 ? `${unreadCount} unread alerts` : 'All caught up'}
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleMarkAllRead}
                style={[styles.actionBtn, { borderColor: theme.cardBorder, backgroundColor: theme.toggleBg }]}
              >
                <CheckCircle2 size={14} color={theme.textPrimary} style={{ marginRight: 4 }} />
                <Text style={[styles.actionBtnText, { color: theme.textPrimary }]}>Mark all read</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity activeOpacity={0.7} onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.toggleBg }]}>
              <X size={18} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
              <Bell size={32} color={theme.textSecondary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No notifications yet</Text>
            <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
              New consultation bookings, client messages, and hearing dates will appear here.
            </Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
            {notifications.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => {
                  handleMarkAsRead(item.id);
                  if (item.clientId && onOpenClient) {
                    onClose();
                    onOpenClient(item.clientId, item.clientName);
                  }
                }}
                style={[
                  styles.notifCard,
                  {
                    backgroundColor: item.read ? theme.cardBackground : theme.mode === 'dark' ? '#1E293B' : '#F1F5F9',
                    borderColor: item.read ? theme.cardBorder : '#2563EB40',
                  },
                ]}
              >
                <View style={[styles.iconWrapper, { backgroundColor: theme.toggleBg }]}>
                  {getIconForType(item.type)}
                </View>

                <View style={styles.notifBody}>
                  <View style={styles.notifTopRow}>
                    <Text style={[styles.notifTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={[styles.notifTime, { color: theme.textSecondary }]}>
                      {item.timestamp}
                    </Text>
                  </View>

                  <Text style={[styles.notifMessage, { color: theme.textSecondary }]}>
                    {item.message}
                  </Text>

                  {item.clientId && (
                    <View style={styles.talkActionRow}>
                      <View style={[styles.talkBadge, { backgroundColor: '#2563EB' }]}>
                        <MessageSquare size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                        <Text style={styles.talkBadgeText}>Open Room with {item.clientName || 'Client'}</Text>
                      </View>
                      <ChevronRight size={14} color="#2563EB" />
                    </View>
                  )}
                </View>

                {!item.read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleClearAll}
              style={[styles.clearBtn, { borderColor: theme.cardBorder }]}
            >
              <Trash2 size={14} color={theme.textSecondary} style={{ marginRight: 6 }} />
              <Text style={[styles.clearBtnText, { color: theme.textSecondary }]}>Clear all notifications</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bellBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  headerSub: {
    fontSize: 12,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  listContent: {
    padding: 16,
  },
  notifCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    position: 'relative',
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notifBody: {
    flex: 1,
  },
  notifTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  notifTime: {
    fontSize: 11,
    fontWeight: '500',
  },
  notifMessage: {
    fontSize: 12,
    lineHeight: 18,
  },
  talkActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(148, 163, 184, 0.2)',
  },
  talkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  talkBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  unreadDot: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
    marginBottom: 30,
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default NotificationsModal;
