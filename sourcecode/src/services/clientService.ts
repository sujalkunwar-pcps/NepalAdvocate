import safeStorage from '../utils/safeStorage';

export interface ChatMessage {
  id: string;
  sender: 'lawyer' | 'client' | 'system';
  text: string;
  timestamp: string;
  attachment?: {
    title: string;
    type: string;
    size: string;
  };
}

export interface ClientRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  caseTitle: string;
  caseType: string;
  status: 'CONFIRMED' | 'PENDING' | 'IN_PROGRESS' | 'CLOSED';
  appointmentDate: string;
  appointmentTime: string;
  fee: number;
  notes?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  messages: ChatMessage[];
}

const STORAGE_KEY = 'nepaladvocate_clients_list_v2';

const INITIAL_CLIENTS: ClientRecord[] = [];

export type ClientListener = (clients: ClientRecord[]) => void;

class ClientService {
  private listeners: Set<ClientListener> = new Set();

  subscribe(listener: ClientListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(clients: ClientRecord[]) {
    this.listeners.forEach((fn) => {
      try {
        fn(clients);
      } catch (e) {
        console.error('Error in client listener:', e);
      }
    });
  }

  async getClients(): Promise<ClientRecord[]> {
    try {
      const raw = await safeStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }
      return JSON.parse(raw) as ClientRecord[];
    } catch {
      return [];
    }
  }

  async getClientById(id: string): Promise<ClientRecord | null> {
    const clients = await this.getClients();
    return clients.find((c) => c.id === id) || null;
  }

  async confirmClientConsultation(appointment: {
    id: string;
    clientName: string;
    specialization?: string;
    date: string;
    timeSlot: string;
    fee?: number;
    notes?: string;
  }): Promise<ClientRecord> {
    const clients = await this.getClients();
    const existingIndex = clients.findIndex(
      (c) => c.name.toLowerCase() === appointment.clientName.toLowerCase()
    );

    let client: ClientRecord;

    if (existingIndex >= 0) {
      client = {
        ...clients[existingIndex],
        status: 'CONFIRMED',
        appointmentDate: appointment.date,
        appointmentTime: appointment.timeSlot,
        fee: appointment.fee || clients[existingIndex].fee,
        notes: appointment.notes || clients[existingIndex].notes,
      };
      // Add confirmation system message
      client.messages.push({
        id: `sys_${Date.now()}`,
        sender: 'system',
        text: `Consultation confirmed for ${appointment.date} (${appointment.timeSlot}). Direct messaging & calling are active.`,
        timestamp: 'Just now',
      });
      clients[existingIndex] = client;
    } else {
      client = {
        id: `cli_${Date.now()}`,
        name: appointment.clientName,
        email: `${appointment.clientName.toLowerCase().replace(/\s+/g, '.')}@nepaladvocate.com`,
        phone: '+977 98' + Math.floor(10000000 + Math.random() * 90000000),
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300',
        caseTitle: appointment.specialization || 'General Legal Consultation',
        caseType: appointment.specialization || 'Civil Law',
        status: 'CONFIRMED',
        appointmentDate: appointment.date,
        appointmentTime: appointment.timeSlot,
        fee: appointment.fee || 2500,
        notes: appointment.notes,
        lastMessage: 'Consultation confirmed. You can now communicate directly.',
        lastMessageTime: 'Just now',
        unreadCount: 0,
        messages: [
          {
            id: `sys_${Date.now()}`,
            sender: 'system',
            text: `Consultation confirmed for ${appointment.date} (${appointment.timeSlot}). Audio & Video consultation room is ready.`,
            timestamp: 'Just now',
          },
        ],
      };
      clients.unshift(client);
    }

    await safeStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
    this.notify(clients);
    return client;
  }

  async sendMessage(
    clientId: string,
    text: string,
    sender: 'lawyer' | 'client' = 'lawyer',
    attachment?: { title: string; type: string; size: string }
  ): Promise<ChatMessage> {
    const clients = await this.getClients();
    const idx = clients.findIndex((c) => c.id === clientId);
    if (idx === -1) {
      throw new Error('Client not found');
    }

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachment,
    };

    clients[idx].messages.push(newMessage);
    clients[idx].lastMessage = text;
    clients[idx].lastMessageTime = newMessage.timestamp;

    await safeStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
    this.notify(clients);
    return newMessage;
  }

  async clearAllClients(): Promise<void> {
    await safeStorage.removeItem(STORAGE_KEY);
    this.notify([]);
  }
}

export const clientService = new ClientService();
export default clientService;
