import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface UserRecord {
  id: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: 'CLIENT' | 'LAWYER' | 'ADMIN';
  phone?: string;
  profilePicture?: string;
  googleId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface LawyerRecord {
  id: string;
  userId?: string;
  name: string;
  specialization: string;
  barNumber: string;
  barLicenseNumber?: string;
  rating: number;
  experience: number;
  hourlyRate: number;
  officeLocation: string;
  isVerified: boolean;
  image: string;
  bio?: string;
  phone?: string;
  email?: string;
}

export interface AppointmentRecord {
  id: string;
  clientId: string;
  clientName: string;
  lawyerId: string;
  lawyerName: string;
  specialization: string;
  date: string;
  timeSlot: string;
  status: 'UPCOMING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  fee: number;
  notes?: string;
  paymentMethod: 'KHALTI' | 'ESEWA' | 'CASH';
  paymentStatus: 'PAID' | 'PENDING';
  createdAt: string;
}

export interface DocumentRecord {
  id: string;
  userId: string;
  title: string;
  titleNepali?: string;
  category: 'Contracts' | 'Identity' | 'Court Forms' | 'Tax Docs' | 'Statutes';
  fileSize: string;
  status: 'VERIFIED' | 'ENCRYPTED' | 'DRAFT';
  updatedAt: string;
  contentSnippet?: string;
  downloadUrl?: string;
}

export interface AiQueryRecord {
  id: string;
  userId?: string;
  question: string;
  response: string;
  citations: string[];
  confidenceScore: number;
  category: string;
  timestamp: string;
}

interface DatabaseSchema {
  users: UserRecord[];
  lawyers: LawyerRecord[];
  appointments: AppointmentRecord[];
  documents: DocumentRecord[];
  aiQueries: AiQueryRecord[];
}

const DB_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DB_DIR, 'database.json');

const defaultHashedPassword = bcrypt.hashSync('password123', 10);

const SEED_DATA: DatabaseSchema = {
  users: [],
  lawyers: [
    {
      id: 'law_01',
      name: 'Adv. Bikram Thapa',
      specialization: 'Corporate & Tax Law',
      barNumber: 'NBA-5421',
      rating: 4.9,
      experience: 12,
      hourlyRate: 2500,
      officeLocation: 'Anamnagar, Kathmandu',
      isVerified: true,
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
      bio: 'Senior Corporate Advocate specializing in FDI, company mergers, commercial leases, and Nepal Inland Revenue compliance.',
      phone: '+977 9851098765',
      email: 'bikram.thapa@nepaladvocate.com',
    },
    {
      id: 'law_02',
      name: 'Adv. Sunita Shrestha',
      specialization: 'Property & Civil Law',
      barNumber: 'NBA-6189',
      rating: 4.8,
      experience: 9,
      hourlyRate: 3000,
      officeLocation: 'New Baneshwor, Kathmandu',
      isVerified: true,
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
      bio: 'Expert in land revenue disputes (Malpot), Lalpurja verification, boundary titling, and civil property inheritance litigation.',
      phone: '+977 9841887766',
      email: 'sunita.shrestha@nepaladvocate.com',
    },
    {
      id: 'law_03',
      name: 'Adv. Rajesh Adhikari',
      specialization: 'Criminal & Family Law',
      barNumber: 'NBA-3920',
      rating: 4.95,
      experience: 15,
      hourlyRate: 3500,
      officeLocation: 'Kumaripati, Lalitpur',
      isVerified: true,
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400',
      bio: 'Practicing Supreme Court & District Court attorney specializing in criminal defense, domestic relations, and bail applications.',
      phone: '+977 9851239988',
      email: 'rajesh.adhikari@nepaladvocate.com',
    },
    {
      id: 'law_04',
      name: 'Adv. Priyanka Karki',
      specialization: 'Immigration & Labor Law',
      barNumber: 'NBA-7452',
      rating: 4.75,
      experience: 7,
      hourlyRate: 2200,
      officeLocation: 'Putalisadak, Kathmandu',
      isVerified: true,
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
      bio: 'Specialist in foreign employment rights, non-resident Nepali business visas, and workplace arbitration under Labor Act 2074.',
      phone: '+977 9849112233',
      email: 'priyanka.karki@nepaladvocate.com',
    },
    {
      id: 'law_05',
      name: 'Adv. Dipesh Regmi',
      specialization: 'Constitutional & Administrative Law',
      barNumber: 'NBA-2891',
      rating: 4.9,
      experience: 18,
      hourlyRate: 4000,
      officeLocation: 'Maitighar, Kathmandu',
      isVerified: true,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
      bio: 'Senior constitutional counsel for writ petitions, fundamental rights enforcement, and public interest litigation (PIL).',
      phone: '+977 9851044556',
      email: 'dipesh.regmi@nepaladvocate.com',
    },
  ],
  appointments: [],
  documents: [],
  aiQueries: [],
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.data = this.loadDatabase();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error reading database file, resetting to seed data:', e);
    }
    this.persist(SEED_DATA);
    return SEED_DATA;
  }

  private persist(dataToSave?: DatabaseSchema) {
    try {
      const data = dataToSave || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing to database file:', e);
    }
  }

  // Users
  get users(): UserRecord[] {
    return this.data.users;
  }

  findUserByEmail(email: string): UserRecord | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string): UserRecord | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  findUserByGoogleId(googleId: string): UserRecord | undefined {
    return this.data.users.find((u) => u.googleId === googleId);
  }

  createUser(user: UserRecord): UserRecord {
    this.data.users.push(user);
    this.persist();
    return user;
  }

  updateUser(id: string, updates: Partial<UserRecord>): UserRecord | undefined {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.persist();
    return this.data.users[idx];
  }

  // Lawyers
  get lawyers(): LawyerRecord[] {
    return this.data.lawyers;
  }

  findLawyerById(id: string): LawyerRecord | undefined {
    return this.data.lawyers.find((l) => l.id === id);
  }

  findLawyerByUserId(userId: string): LawyerRecord | undefined {
    return this.data.lawyers.find((l) => l.userId === userId || l.id === userId);
  }

  createLawyer(lawyer: LawyerRecord): LawyerRecord {
    this.data.lawyers.push(lawyer);
    this.persist();
    return lawyer;
  }

  // Appointments
  get appointments(): AppointmentRecord[] {
    return this.data.appointments;
  }

  findAppointmentsByUserId(userId: string): AppointmentRecord[] {
    const lawyer = this.findLawyerByUserId(userId);
    const lawyerId = lawyer?.id;
    return this.data.appointments.filter(
      (a) => a.clientId === userId || a.lawyerId === userId || (lawyerId && a.lawyerId === lawyerId)
    );
  }

  createAppointment(apt: AppointmentRecord): AppointmentRecord {
    this.data.appointments.unshift(apt);
    this.persist();
    return apt;
  }

  findAppointmentById(id: string): AppointmentRecord | undefined {
    return this.data.appointments.find((a) => a.id === id);
  }

  updateAppointment(id: string, updates: Partial<AppointmentRecord>): AppointmentRecord | undefined {
    const idx = this.data.appointments.findIndex((a) => a.id === id);
    if (idx === -1) return undefined;
    this.data.appointments[idx] = { ...this.data.appointments[idx], ...updates };
    this.persist();
    return this.data.appointments[idx];
  }

  deleteAppointment(id: string): boolean {
    const prevLen = this.data.appointments.length;
    this.data.appointments = this.data.appointments.filter((a) => a.id !== id);
    if (this.data.appointments.length !== prevLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // Documents
  get documents(): DocumentRecord[] {
    return this.data.documents;
  }

  findDocumentsByUserId(userId: string): DocumentRecord[] {
    return this.data.documents.filter((d) => d.userId === userId);
  }

  createDocument(doc: DocumentRecord): DocumentRecord {
    this.data.documents.unshift(doc);
    this.persist();
    return doc;
  }

  // AI Queries
  get aiQueries(): AiQueryRecord[] {
    return this.data.aiQueries;
  }

  logAiQuery(q: AiQueryRecord): AiQueryRecord {
    this.data.aiQueries.unshift(q);
    this.persist();
    return q;
  }
}

export const db = new Database();
