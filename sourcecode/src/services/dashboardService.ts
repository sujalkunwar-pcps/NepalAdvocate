import { DashboardData, AppointmentData, LegalDocumentData } from '../types/dashboard';
import { apiClient } from './api';

// Realistic Mock Data matching backend Express models
const MOCK_DASHBOARD_DATA: DashboardData = {
  user: {
    id: 'usr_101',
    email: 'client@nepaladvocate.com',
    firstName: 'Aarav',
    lastName: 'Sharma',
    role: 'CLIENT',
    phone: '+977 9841234567',
    profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    isActive: true,
    createdAt: '2025-01-15T08:00:00.000Z',
  },
  stats: {
    totalAppointments: 12,
    activeCases: 3,
    savedDocuments: 8,
    consultationHours: 24,
  },
  upcomingAppointments: [
    {
      id: 'apt_01',
      clientName: 'Aarav Sharma',
      lawyerName: 'Adv. Bikram Thapa',
      specialization: 'Corporate & Tax Law',
      date: 'Sep 22, 2026',
      timeSlot: '10:30 AM - 11:30 AM',
      status: 'UPCOMING',
      fee: 2500,
      notes: 'Consultation regarding business registration and IP filing in Nepal.',
    },
    {
      id: 'apt_02',
      clientName: 'Aarav Sharma',
      lawyerName: 'Adv. Sunita Shrestha',
      specialization: 'Property & Civil Law',
      date: 'Sep 25, 2026',
      timeSlot: '02:00 PM - 03:00 PM',
      status: 'UPCOMING',
      fee: 3000,
      notes: 'Land ownership deed verification and boundary dispute review.',
    },
  ],
  recentDocuments: [
    {
      id: 'doc_101',
      title: 'Commercial Lease Agreement 2026',
      category: 'Property Law',
      fileSize: '1.8 MB',
      updatedAt: 'Sep 18, 2026',
      status: 'VERIFIED',
    },
    {
      id: 'doc_102',
      title: 'Company Articles of Association (Draft)',
      category: 'Corporate Law',
      fileSize: '850 KB',
      updatedAt: 'Sep 15, 2026',
      status: 'DRAFT',
    },
    {
      id: 'doc_103',
      title: 'Power of Attorney Deed',
      category: 'Civil Law',
      fileSize: '2.4 MB',
      updatedAt: 'Sep 10, 2026',
      status: 'VERIFIED',
    },
  ],
  recommendedLawyers: [
    {
      id: 'law_01',
      name: 'Adv. Bikram Thapa',
      specialization: 'Corporate & Tax Law',
      rating: 4.9,
      hourlyRate: 2500,
      officeLocation: 'Anamnagar, Kathmandu',
      isVerified: true,
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
    },
    {
      id: 'law_02',
      name: 'Adv. Sunita Shrestha',
      specialization: 'Property & Civil Law',
      rating: 4.8,
      hourlyRate: 3000,
      officeLocation: 'New Baneshwor, Kathmandu',
      isVerified: true,
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    },
    {
      id: 'law_03',
      name: 'Adv. Rajesh Adhikari',
      specialization: 'Criminal & Family Law',
      rating: 4.95,
      hourlyRate: 3500,
      officeLocation: 'Kumaripati, Lalitpur',
      isVerified: true,
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400',
    },
  ],
};

class DashboardService {
  /**
   * Fetch complete dashboard data for the current user from backend API,
   * falling back to mock data if offline or unavailable.
   */
  async getDashboardData(): Promise<DashboardData> {
    try {
      const response = await apiClient.get('/profile/dashboard');
      if (response.data && response.data.success && response.data.data) {
        return response.data.data as DashboardData;
      }
    } catch (error) {
      console.log('API call for dashboard failed, using mock data fallback:', error);
    }
    return MOCK_DASHBOARD_DATA;
  }

  async getUpcomingAppointments(): Promise<AppointmentData[]> {
    try {
      const data = await this.getDashboardData();
      return data.upcomingAppointments;
    } catch (error) {
      return MOCK_DASHBOARD_DATA.upcomingAppointments;
    }
  }

  async getRecentDocuments(): Promise<LegalDocumentData[]> {
    try {
      const data = await this.getDashboardData();
      return data.recentDocuments;
    } catch (error) {
      return MOCK_DASHBOARD_DATA.recentDocuments;
    }
  }
}

export default new DashboardService();
