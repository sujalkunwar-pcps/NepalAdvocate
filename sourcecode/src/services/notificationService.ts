import safeStorage from '../utils/safeStorage';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'CONSULTATION' | 'DOCUMENT' | 'HEARING' | 'SYSTEM';
  timestamp: string;
  read: boolean;
  clientId?: string;
  clientName?: string;
}

const STORAGE_KEY = 'nepaladvocate_notifications_list_v2';

const INITIAL_NOTIFICATIONS: AppNotification[] = [];

class NotificationService {
  async getNotifications(): Promise<AppNotification[]> {
    try {
      const raw = await safeStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }
      return JSON.parse(raw) as AppNotification[];
    } catch {
      return [];
    }
  }

  async getUnreadCount(): Promise<number> {
    const list = await this.getNotifications();
    return list.filter((n) => !n.read).length;
  }

  async addNotification(notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): Promise<AppNotification> {
    const list = await this.getNotifications();
    const newNotif: AppNotification = {
      ...notif,
      id: `notif_${Date.now()}`,
      timestamp: 'Just now',
      read: false,
    };
    list.unshift(newNotif);
    await safeStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return newNotif;
  }

  async markAsRead(id: string): Promise<void> {
    const list = await this.getNotifications();
    const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n));
    await safeStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  async markAllAsRead(): Promise<void> {
    const list = await this.getNotifications();
    const updated = list.map((n) => ({ ...n, read: true }));
    await safeStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  async clearAll(): Promise<void> {
    await safeStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
}

export const notificationService = new NotificationService();
export default notificationService;
