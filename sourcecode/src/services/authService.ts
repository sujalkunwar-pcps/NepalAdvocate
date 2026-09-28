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

// Set to true when ready to connect live backend REST API
const USE_REAL_BACKEND = false;

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    if (USE_REAL_BACKEND) {
      try {
        const response = await apiClient.post<AuthResponse>('/auth/register', payload);
        const data = response.data;
        if (data.success && data.data) {
          await AsyncStorage.setItem('auth_token', data.data.token);
          await AsyncStorage.setItem('user_role', data.data.user.role);
          await AsyncStorage.setItem('user_data', JSON.stringify(data.data.user));
        }
        return data;
      } catch (error: any) {
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        }
        throw new Error(error.message || 'Registration failed');
      }
    }

    // Frontend-Only Mock Mode (No backend request sent)
    const mockUser: User = {
      id: `usr_${Date.now()}`,
      email: payload.email,
      firstName: payload.firstName || 'User',
      lastName: payload.lastName || 'Member',
      role: (payload.role as 'CLIENT' | 'LAWYER' | 'ADMIN') || 'CLIENT',
      phone: payload.phone,
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
    if (USE_REAL_BACKEND) {
      try {
        const response = await apiClient.post<AuthResponse>('/auth/login', payload);
        const data = response.data;
        if (data.success && data.data) {
          await AsyncStorage.setItem('auth_token', data.data.token);
          await AsyncStorage.setItem('user_role', data.data.user.role);
          await AsyncStorage.setItem('user_data', JSON.stringify(data.data.user));
        }
        return data;
      } catch (error: any) {
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        }
        throw new Error(error.message || 'Invalid email or password');
      }
    }

    // Frontend-Only Mock Mode (No backend request sent)
    const nameParts = payload.email.split('@')[0].split('.');
    const firstName = nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : 'Aarav';
    const lastName = nameParts[1] ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : 'Sharma';

    const mockUser: User = {
      id: 'usr_101',
      email: payload.email,
      firstName,
      lastName,
      role: 'CLIENT',
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

  async getCurrentUser(): Promise<User | null> {
    if (USE_REAL_BACKEND) {
      try {
        const response = await apiClient.get('/auth/me');
        if (response.data?.success && response.data?.data?.user) {
          const user = response.data.data.user as User;
          await AsyncStorage.setItem('user_data', JSON.stringify(user));
          return user;
        }
        return await this.getStoredUser();
      } catch {
        return await this.getStoredUser();
      }
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
