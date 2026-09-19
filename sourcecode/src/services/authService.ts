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

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
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
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const messages = errorData.errors.map((e: any) => e.msg || String(e)).join(', ');
          throw new Error(messages);
        }
        if (errorData.message) {
          throw new Error(errorData.message);
        }
      }
      throw new Error(error.message || 'Registration failed');
    }
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
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
      if (error.response?.statusCode === 502) {
        throw new Error('Backend service is spinning up. Please wait 30 seconds and try again.');
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'Invalid email or password');
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get('/auth/me');
      if (response.data?.success && response.data?.data?.user) {
        const user = response.data.data.user as User;
        await AsyncStorage.setItem('user_data', JSON.stringify(user));
        return user;
      }
      return await this.getStoredUser();
    } catch (e) {
      return await this.getStoredUser();
    }
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
  }
};
