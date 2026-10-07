export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CLIENT' | 'LAWYER' | 'ADMIN';
  phone?: string;
  profilePicture?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface LawyerProfileData {
  id: string;
  userId: string;
  barLicenseNumber: string;
  specialization: string[];
  experience: number;
  hourlyRate: number; // in NPR
  bio: string;
  education: Array<{ degree: string; institution: string; year: number }>;
  languages: string[];
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  casesWon: number;
  officeLocation: string;
}

export interface AppointmentData {
  id: string;
  clientName: string;
  lawyerName: string;
  specialization: string;
  date: string;
  timeSlot: string;
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED' | 'CONFIRMED';
  fee: number;
  notes?: string;
}

export interface LegalDocumentData {
  id: string;
  title: string;
  category: string;
  fileSize: string;
  updatedAt: string;
  status: 'VERIFIED' | 'PENDING' | 'DRAFT';
}

export interface DashboardStats {
  totalAppointments: number;
  activeCases: number;
  savedDocuments: number;
  consultationHours: number;
  rating?: number;
}

export interface DashboardData {
  user: UserProfile;
  lawyerDetails?: LawyerProfileData;
  stats: DashboardStats;
  upcomingAppointments: AppointmentData[];
  recentDocuments: LegalDocumentData[];
  recommendedLawyers?: Array<{
    id: string;
    name: string;
    specialization: string;
    rating: number;
    hourlyRate: number;
    officeLocation: string;
    isVerified: boolean;
    image?: string;
  }>;
}
