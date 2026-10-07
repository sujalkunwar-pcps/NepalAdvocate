import { apiClient } from './api';
import safeStorage from '../utils/safeStorage';
import biometricService from './biometricService';

export interface LawyerProfileInfo {
  id?: string;
  userId?: string;
  barLicenseNumber: string;
  specialization: string | string[];
  experience: number;
  hourlyRate: number;
  officeLocation?: string;
  bio?: string;
  rating?: number;
  isVerified?: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CLIENT' | 'LAWYER' | 'ADMIN';
  phone?: string;
  profilePicture?: string;
  googleId?: string;
  lawyerProfile?: LawyerProfileInfo;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    user: User;
  };
  errors?: Array<{ msg: string }>;
}

export interface RegisterPayload {
  email: string;
  password: string;
  role: 'CLIENT' | 'LAWYER';
  firstName: string;
  lastName: string;
  phone?: string;
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
  // Lawyer specific fields
  barLicenseNumber?: string;
  specialization?: string;
  experience?: number;
  hourlyRate?: number;
  officeLocation?: string;
  bio?: string;
  saveBiometric?: boolean;
}

export interface LoginPayload {
  email: string;
  password?: string;
  expectedRole?: 'CLIENT' | 'LAWYER';
  saveBiometric?: boolean;
}

export interface GoogleAuthPayload {
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role?: 'CLIENT' | 'LAWYER';
  credential?: string;
  picture?: string;
  barLicenseNumber?: string;
  specialization?: string;
  experience?: number;
  hourlyRate?: number;
  officeLocation?: string;
  bio?: string;
  saveBiometric?: boolean;
}

const LOCAL_USERS_KEY = 'nepaladvocate_local_users_v2';

// Pre-seeded local accounts
const INITIAL_DEMO_USERS: User[] = [];

async function getRegisteredLocalUsers(): Promise<User[]> {
  try {
    const raw = await safeStorage.getItem(LOCAL_USERS_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function saveRegisteredLocalUser(user: User): Promise<void> {
  try {
    const current = await getRegisteredLocalUsers();
    const filtered = current.filter((u) => u.email.toLowerCase() !== user.email.toLowerCase());
    filtered.push(user);
    await safeStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Error saving local user:', e);
  }
}

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      // 1. Attempt real backend registration
      const response = await apiClient.post<AuthResponse>('/auth/register', payload);
      const data = response.data;
      if (data.success && data.data) {
        await safeStorage.setItem('auth_token', data.data.token);
        await safeStorage.setItem('user_role', data.data.user.role);
        await safeStorage.setItem('user_data', JSON.stringify(data.data.user));
        await saveRegisteredLocalUser(data.data.user);

        if (payload.saveBiometric !== false) {
          await biometricService.saveCredentials({
            email: data.data.user.email,
            role: data.data.user.role,
            token: data.data.token,
            user: data.data.user,
          });
        }

        return data;
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      console.log('Backend not reachable, falling back to local registration:', error.message);
    }

    // 2. Frontend Local / Offline Registration Mode
    const assignedRole: 'CLIENT' | 'LAWYER' = payload.role === 'LAWYER' ? 'LAWYER' : 'CLIENT';

    const lawyerProfile: LawyerProfileInfo | undefined =
      assignedRole === 'LAWYER'
        ? {
            barLicenseNumber: payload.barLicenseNumber || `NBA-${Math.floor(1000 + Math.random() * 9000)}`,
            specialization: payload.specialization || 'Corporate & Civil Law',
            experience: payload.experience || 1,
            hourlyRate: payload.hourlyRate || 2500,
            officeLocation: payload.officeLocation || 'Kathmandu, Nepal',
            bio: payload.bio || 'Registered Legal Advocate, Nepal Bar Council',
            rating: 5.0,
            isVerified: true,
          }
        : undefined;

    const mockUser: User = {
      id: `usr_${Date.now()}`,
      email: payload.email.trim().toLowerCase(),
      firstName: payload.firstName.trim() || 'User',
      lastName: payload.lastName.trim() || 'Member',
      role: assignedRole,
      phone: payload.phone,
      profilePicture:
        assignedRole === 'LAWYER'
          ? 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      lawyerProfile,
    };

    const mockToken = `token_${assignedRole.toLowerCase()}_${Date.now()}`;
    await safeStorage.setItem('auth_token', mockToken);
    await safeStorage.setItem('user_role', mockUser.role);
    await safeStorage.setItem('user_data', JSON.stringify(mockUser));
    await saveRegisteredLocalUser(mockUser);

    if (payload.saveBiometric !== false) {
      await biometricService.saveCredentials({
        email: mockUser.email,
        role: mockUser.role,
        token: mockToken,
        user: mockUser,
      });
    }

    return {
      success: true,
      message: 'Registration successful',
      data: {
        token: mockToken,
        user: mockUser,
      },
    };
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      // 1. Attempt real backend login
      const response = await apiClient.post<AuthResponse>('/auth/login', payload);
      const data = response.data;
      if (data.success && data.data) {
        await safeStorage.setItem('auth_token', data.data.token);
        await safeStorage.setItem('user_role', data.data.user.role);
        await safeStorage.setItem('user_data', JSON.stringify(data.data.user));
        await saveRegisteredLocalUser(data.data.user);

        if (payload.saveBiometric !== false) {
          await biometricService.saveCredentials({
            email: data.data.user.email,
            role: data.data.user.role,
            token: data.data.token,
            user: data.data.user,
          });
        }

        return data;
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      console.log('Backend not reachable, falling back to local login verification:', error.message);
    }

    // 2. Local fallback - Check if this user was registered locally
    const localUsers = await getRegisteredLocalUsers();
    const existing = localUsers.find(
      (u) => u.email.toLowerCase() === payload.email.trim().toLowerCase()
    );

    let activeUser: User;
    if (existing) {
      // Use existing user profile with exact role and lawyer data
      activeUser = existing;
    } else {
      // Create user respecting expectedRole or email cues
      const nameParts = payload.email.split('@')[0].split('.');
      const firstName = nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : 'Advocate';
      const lastName = nameParts[1] ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : 'Lawyer';

      const isLawyerEmail =
        payload.expectedRole === 'LAWYER' ||
        payload.email.toLowerCase().includes('bikram') ||
        payload.email.toLowerCase().includes('lawyer') ||
        payload.email.toLowerCase().includes('advocate');

      const role: 'CLIENT' | 'LAWYER' = isLawyerEmail ? 'LAWYER' : 'CLIENT';

      activeUser = {
        id: `usr_${Date.now()}`,
        email: payload.email.trim().toLowerCase(),
        firstName,
        lastName,
        role,
        phone: '+977 9851000000',
        profilePicture:
          role === 'LAWYER'
            ? 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400'
            : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        lawyerProfile:
          role === 'LAWYER'
            ? {
                barLicenseNumber: 'NBA-5421',
                specialization: 'Corporate & Civil Law',
                experience: 10,
                hourlyRate: 2500,
                officeLocation: 'Kathmandu, Nepal',
                bio: 'Licensed legal advocate registered with the Nepal Bar Council.',
                rating: 4.9,
                isVerified: true,
              }
            : undefined,
      };
      await saveRegisteredLocalUser(activeUser);
    }

    const mockToken = `token_${activeUser.role.toLowerCase()}_${Date.now()}`;
    await safeStorage.setItem('auth_token', mockToken);
    await safeStorage.setItem('user_role', activeUser.role);
    await safeStorage.setItem('user_data', JSON.stringify(activeUser));

    if (payload.saveBiometric !== false) {
      await biometricService.saveCredentials({
        email: activeUser.email,
        role: activeUser.role,
        token: mockToken,
        user: activeUser,
      });
    }

    return {
      success: true,
      message: 'Login successful',
      data: {
        token: mockToken,
        user: activeUser,
      },
    };
  },

  async googleLogin(payload: GoogleAuthPayload): Promise<AuthResponse> {
    try {
      // 1. Attempt real backend Google authentication
      const response = await apiClient.post<AuthResponse>('/auth/google', payload);
      const data = response.data;
      if (data.success && data.data) {
        await safeStorage.setItem('auth_token', data.data.token);
        await safeStorage.setItem('user_role', data.data.user.role);
        await safeStorage.setItem('user_data', JSON.stringify(data.data.user));
        await saveRegisteredLocalUser(data.data.user);

        if (payload.saveBiometric !== false) {
          await biometricService.saveCredentials({
            email: data.data.user.email,
            role: data.data.user.role,
            token: data.data.token,
            user: data.data.user,
          });
        }

        return data;
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      console.log('Backend not reachable, falling back to local Google sign-in:', error.message);
    }

    // 2. Frontend Google Mock Mode Fallback
    const email = (payload.email || 'user.google@nepaladvocate.com').toLowerCase();
    const nameParts = (payload.name || 'Advocate Sujal Kunwar').split(' ');
    const firstName = payload.firstName || nameParts[0] || 'Sujal';
    const lastName = payload.lastName || nameParts.slice(1).join(' ') || 'Kunwar';
    const localUsers = await getRegisteredLocalUsers();
    const existing = localUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    const matchedRole: 'CLIENT' | 'LAWYER' | undefined =
      existing?.role === 'LAWYER' || existing?.role === 'CLIENT' ? existing.role : undefined;
    const assignedRole: 'CLIENT' | 'LAWYER' =
      payload.role ||
      matchedRole ||
      (email.includes('advocate') || email.includes('bikram') ? 'LAWYER' : 'CLIENT');

    const lawyerProfile: LawyerProfileInfo | undefined =
      assignedRole === 'LAWYER'
        ? {
            barLicenseNumber: payload.barLicenseNumber || `NBA-${Math.floor(1000 + Math.random() * 9000)}`,
            specialization: payload.specialization || 'Corporate & Civil Law',
            experience: payload.experience || 2,
            hourlyRate: payload.hourlyRate || 2500,
            officeLocation: payload.officeLocation || 'Kathmandu, Nepal',
            bio: payload.bio || 'Licensed legal advocate registered with Nepal Bar Council.',
            rating: 5.0,
            isVerified: true,
          }
        : undefined;

    const mockUser: User = {
      id: `usr_g_${Date.now()}`,
      email,
      firstName,
      lastName,
      role: assignedRole,
      googleId: `google_${Date.now()}`,
      phone: '+977 9801234567',
      profilePicture:
        payload.picture ||
        (assignedRole === 'LAWYER'
          ? 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400'),
      lawyerProfile,
    };

    const mockToken = `google_token_${assignedRole.toLowerCase()}_${Date.now()}`;
    await safeStorage.setItem('auth_token', mockToken);
    await safeStorage.setItem('user_role', mockUser.role);
    await safeStorage.setItem('user_data', JSON.stringify(mockUser));
    await saveRegisteredLocalUser(mockUser);

    if (payload.saveBiometric !== false) {
      await biometricService.saveCredentials({
        email: mockUser.email,
        role: mockUser.role,
        token: mockToken,
        user: mockUser,
      });
    }

    return {
      success: true,
      message: 'Google Sign-In successful',
      data: {
        token: mockToken,
        user: mockUser,
      },
    };
  },

  /**
   * Biometric Fast Login
   */
  async loginWithBiometrics(skipPrompt = false): Promise<AuthResponse> {
    const creds = await biometricService.getSavedCredentials();
    if (!creds) {
      throw new Error('No saved account found for biometric sign-in. Please sign in with email, password, or Google first.');
    }

    if (!skipPrompt) {
      const displayName = creds.user?.firstName
        ? `${creds.user.firstName} (${creds.email})`
        : creds.email;

      const authResult = await biometricService.authenticate(
        `Sign in as ${displayName}`
      );

      if (!authResult.success) {
        throw new Error(authResult.error || 'Biometric verification cancelled or failed.');
      }
    }

    let activeUser = creds.user;
    try {
      const response = await apiClient.get('/auth/me', {
        headers: { Authorization: `Bearer ${creds.token}` },
      });
      if (response.data?.success && response.data?.data?.user) {
        activeUser = response.data.data.user;
      }
    } catch {
      // Offline fallback: use stored creds.user
    }

    // Set active session
    await safeStorage.setItem('auth_token', creds.token);
    await safeStorage.setItem('user_role', activeUser.role || creds.role);
    await safeStorage.setItem('user_data', JSON.stringify(activeUser));

    await biometricService.saveCredentials({
      email: activeUser.email || creds.email,
      role: activeUser.role || creds.role,
      token: creds.token,
      user: activeUser,
    });

    return {
      success: true,
      message: 'Biometric sign-in successful',
      data: {
        token: creds.token,
        user: activeUser,
      },
    };
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = await safeStorage.getItem('auth_token');
      if (!token) {
        return null;
      }
      const response = await apiClient.get('/auth/me');
      if (response.data?.success && response.data?.data?.user) {
        const user = response.data.data.user as User;
        await safeStorage.setItem('user_data', JSON.stringify(user));
        await safeStorage.setItem('user_role', user.role);
        return user;
      }
    } catch (err: any) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        // Token belongs to deleted user, clear storage and log out
        await this.logout();
        return null;
      }
      // Offline fallback
      return await this.getStoredUser();
    }
    return null;
  },

  async getStoredUser(): Promise<User | null> {
    try {
      const raw = await safeStorage.getItem('user_data');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    await safeStorage.removeItem('auth_token');
    await safeStorage.removeItem('user_role');
    await safeStorage.removeItem('user_data');
    await safeStorage.removeItem(LOCAL_USERS_KEY);
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await safeStorage.getItem('auth_token');
    return !!token;
  },
};
