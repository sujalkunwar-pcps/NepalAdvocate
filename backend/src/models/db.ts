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
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
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
  users: [
    {
      id: 'usr_101',
      email: 'client@nepaladvocate.com',
      password: defaultHashedPassword,
      firstName: 'Aarav',
      lastName: 'Sharma',
      role: 'CLIENT',
      phone: '+977 9841234567',
      profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      isActive: true,
      createdAt: '2025-01-15T08:00:00.000Z',
    },
    {
      id: 'usr_102',
      email: 'bikram.thapa@nepaladvocate.com',
      password: defaultHashedPassword,
      firstName: 'Bikram',
      lastName: 'Thapa',
      role: 'LAWYER',
      phone: '+977 9851098765',
      profilePicture: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
      isActive: true,
      createdAt: '2025-01-20T08:00:00.000Z',
    },
    {
      id: 'usr_103',
      email: 'sujalkunwar@nepaladvocate.com',
      password: defaultHashedPassword,
      firstName: 'Sujal',
      lastName: 'Kunwar',
      role: 'CLIENT',
      phone: '+977 9801234567',
      profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400',
      isActive: true,
      createdAt: '2025-02-01T08:00:00.000Z',
    },
  ],
  lawyers: [
    {
      id: 'law_01',
      userId: 'usr_102',
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
  appointments: [
    {
      id: 'apt_01',
      clientId: 'usr_101',
      clientName: 'Aarav Sharma',
      lawyerId: 'law_01',
      lawyerName: 'Adv. Bikram Thapa',
      specialization: 'Corporate & Tax Law',
      date: 'Oct 05, 2026',
      timeSlot: '10:30 AM - 11:30 AM',
      status: 'UPCOMING',
      fee: 2500,
      notes: 'Consultation regarding business registration and IP filing in Nepal.',
      paymentMethod: 'ESEWA',
      paymentStatus: 'PAID',
      createdAt: '2026-09-28T10:00:00.000Z',
    },
    {
      id: 'apt_02',
      clientId: 'usr_101',
      clientName: 'Aarav Sharma',
      lawyerId: 'law_02',
      lawyerName: 'Adv. Sunita Shrestha',
      specialization: 'Property & Civil Law',
      date: 'Oct 08, 2026',
      timeSlot: '02:00 PM - 03:00 PM',
      status: 'UPCOMING',
      fee: 3000,
      notes: 'Land ownership deed verification and boundary dispute review.',
      paymentMethod: 'KHALTI',
      paymentStatus: 'PAID',
      createdAt: '2026-09-29T14:30:00.000Z',
    },
  ],
  documents: [
    {
      id: 'doc_101',
      userId: 'usr_101',
      title: 'Commercial Lease Agreement 2026',
      titleNepali: 'व्यापारिक भाडा सम्झौता २०८३',
      category: 'Contracts',
      fileSize: '1.8 MB',
      status: 'VERIFIED',
      updatedAt: 'Sep 28, 2026',
      contentSnippet: 'Standard registered lease between commercial landlord and lessee adhering to Chapter 9 of Muluki Civil Code 2074.',
    },
    {
      id: 'doc_102',
      userId: 'usr_101',
      title: 'Company Articles of Association (Draft)',
      titleNepali: 'कम्पनी प्रबन्धपत्र तथा नियमावली मस्यौदा',
      category: 'Contracts',
      fileSize: '850 KB',
      status: 'DRAFT',
      updatedAt: 'Sep 25, 2026',
      contentSnippet: 'Drafted Memorandum & Articles of Association for private tech startup registering under Company Act 2063.',
    },
    {
      id: 'doc_103',
      userId: 'usr_101',
      title: 'Power of Attorney Deed (Warisnama)',
      titleNepali: 'अधिकृत वारिसनामा लिखत',
      category: 'Court Forms',
      fileSize: '2.4 MB',
      status: 'VERIFIED',
      updatedAt: 'Sep 20, 2026',
      contentSnippet: 'Notarized Warisnama authorization for court proceedings in Kathmandu District Court under Muluki Civil Procedure Code.',
    },
    {
      id: 'doc_104',
      userId: 'usr_101',
      title: 'Land Ownership Certificate (Lalpurja Copy)',
      titleNepali: 'जग्गाधनी प्रमाण पुर्जा (लालपुर्जा प्रतिलिपि)',
      category: 'Identity',
      fileSize: '3.1 MB',
      status: 'ENCRYPTED',
      updatedAt: 'Sep 15, 2026',
      contentSnippet: 'High-resolution scan of Lalpurja plot #402, Ward 4, Budhanilkantha, Kathmandu.',
    },
  ],
  aiQueries: [
    {
      id: 'q_01',
      userId: 'usr_101',
      question: 'What are the legal requirements to register a Pvt Ltd company in Nepal?',
      response: 'To incorporate a Private Limited company in Nepal under the Companies Act 2063: 1) Reserve proposed name at Office of Company Registrar (OCR). 2) Draft Memorandum of Association (MOA) and Articles of Association (AOA). 3) Submit founder citizenship documents and registered office address. 4) Obtain Certificate of Incorporation and register PAN with Inland Revenue Department.',
      citations: ['Companies Act 2063 (Section 3, 4, 5)', 'Department of Industry Guidelines 2080'],
      confidenceScore: 0.96,
      category: 'Corporate Law',
      timestamp: '2026-09-29T16:00:00.000Z',
    },
  ],
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
    return this.data.appointments.filter((a) => a.clientId === userId || a.lawyerId === userId);
  }

  createAppointment(apt: AppointmentRecord): AppointmentRecord {
    this.data.appointments.unshift(apt);
    this.persist();
    return apt;
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
