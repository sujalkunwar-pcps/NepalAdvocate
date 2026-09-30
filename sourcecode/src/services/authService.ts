import { apiClient } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CLIENT' | 'LAWYER' | 'ADMIN';
  phone?: string;
  profilePicture?: string;
  googleId?: string;
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
  role: string;
  firstName: string;
  lastName: string;
  phone?: string;
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface GoogleAuthPayload {
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role?: 'CLIENT' | 'LAWYER';
  credential?: string;
  picture?: string;
}

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      // Attempt real backend registration
      const response = await apiClient.post<AuthResponse>('/auth/register', payload);
      const data = response.data;
      if (data.success && data.data) {
        await AsyncStorage.setItem('auth_token', data.data.token);
        await AsyncStorage.setItem('user_role', data.data.user.role);
        await AsyncStorage.setItem('user_data', JSON.stringify(data.data.user));
        return data;
      }
    } catch (error: any) {
      // If server returned a business error (e.g. email in use), throw it
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      console.log('Backend not reachable, falling back to mock registration:', error.message);
    }

    // Frontend-Only Mock Mode Fallback
    const mockUser: User = {
      id: `usr_${Date.now()}`,
      email: payload.email,
      firstName: payload.firstName || 'User',
      lastName: payload.lastName || 'Member',
      role: (payload.role as 'CLIENT' | 'LAWYER' | 'ADMIN') || 'CLIENT',
      phone: payload.phone,
      profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    };

    const mockToken = `mock_token_${Date.now()}`;
    await AsyncStorage.setItem('auth_token', mockToken);
    await AsyncStorage.setItem('user_role', mockUser.role);
    await AsyncStorage.setItem('user_data', JSON.stringify(mockUser));

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
      // Attempt real backend login
      const response = await apiClient.post<AuthResponse>('/auth/login', payload);
      const data = response.data;
      if (data.success && data.data) {
        await AsyncStorage.setItem('auth_token', data.data.token);
        await AsyncStorage.setItem('user_role', data.data.user.role);
        await AsyncStorage.setItem('user_data', JSON.stringify(data.data.user));
        return data;
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      console.log('Backend not reachable, falling back to mock login:', error.message);
    }

    // Frontend-Only Mock Mode Fallback
    const nameParts = payload.email.split('@')[0].split('.');
    const firstName = nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : 'Aarav';
    const lastName = nameParts[1] ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : 'Sharma';

    const mockUser: User = {
      id: 'usr_101',
      email: payload.email,
      firstName,
      lastName,
      role: 'CLIENT',
      phone: '+977 9841234567',
      profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    };

    const mockToken = `mock_token_${Date.now()}`;
    await AsyncStorage.setItem('auth_token', mockToken);
    await AsyncStorage.setItem('user_role', mockUser.role);
    await AsyncStorage.setItem('user_data', JSON.stringify(mockUser));

    return {
      success: true,
      message: 'Login successful',
      data: {
        token: mockToken,
        user: mockUser,
      },
    };
  },

  async googleLogin(payload: GoogleAuthPayload): Promise<AuthResponse> {
    try {
      // Attempt real backend Google authentication
      const response = await apiClient.post<AuthResponse>('/auth/google', payload);
      const data = response.data;
      if (data.success && data.data) {
        await AsyncStorage.setItem('auth_token', data.data.token);
        await AsyncStorage.setItem('user_role', data.data.user.role);
        await AsyncStorage.setItem('user_data', JSON.stringify(data.data.user));
        return data;
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      console.log('Backend not reachable, falling back to mock Google sign-in:', error.message);
    }

    // Frontend-Only Google Mock Mode Fallback
    const email = payload.email || 'user.google@nepaladvocate.com';
    const nameParts = (payload.name || 'Sujal Kunwar').split(' ');
    const firstName = payload.firstName || nameParts[0] || 'Sujal';
    const lastName = payload.lastName || nameParts.slice(1).join(' ') || 'Kunwar';
    const role = payload.role || 'CLIENT';

    const mockUser: User = {
      id: `usr_g_${Date.now()}`,
      email,
      firstName,
      lastName,
      role,
      googleId: `google_${Date.now()}`,
      phone: '+977 9801234567',
      profilePicture: payload.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400',
    };

    const mockToken = `google_token_${Date.now()}`;
    await AsyncStorage.setItem('auth_token', mockToken);
    await AsyncStorage.setItem('user_role', mockUser.role);
    await AsyncStorage.setItem('user_data', JSON.stringify(mockUser));

    return {
      success: true,
      message: 'Google Sign-In successful',
      data: {
        token: mockToken,
        user: mockUser,
      },
    };
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get('/auth/me');
      if (response.data?.success && response.data?.data?.user) {
        const user = response.data.data.user as User;
        await AsyncStorage.setItem('user_data', JSON.stringify(user));
        return user;
      }
    } catch {
      // Use local storage
    }
    return await this.getStoredUser();
  },

  async getStoredUser(): Promise<User | null> {
    try {
      const raw = await AsyncStorage.getItem('user_data');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user_role');
    await AsyncStorage.removeItem('user_data');
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem('auth_token');
    return !!token;
  },
};
