import axios from 'axios';
import safeStorage from '../utils/safeStorage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Local development IP handling:
// - Android emulator uses 10.0.2.2:3000
// - Web uses localhost:3000
// - Physical device (Expo Go on iPhone/Android) uses the computer's LAN IP from Expo hostUri
const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:3000/api';
  }

  if (Platform.OS === 'android') {
    // Check if running on Android emulator vs physical device
    const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoClient?.hostUri;
    if (hostUri) {
      const hostIp = hostUri.split(':')[0];
      return `http://${hostIp}:3000/api`;
    }
    return 'http://10.0.2.2:3000/api';
  }

  // iOS (Simulator or physical iPhone via Expo Go)
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoClient?.hostUri;
  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    return `http://${hostIp}:3000/api`;
  }

  // Default to machine's active local Wi-Fi IP with localhost fallback
  return 'http://192.168.10.70:3000/api';
};

export const API_BASE_URL = getBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Auth Token safely
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await safeStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {}
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to clear stale sessions when user was deleted or token invalidated
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await safeStorage.removeItem('auth_token');
        await safeStorage.removeItem('user_data');
        await safeStorage.removeItem('user_role');
      } catch {}
    }
    return Promise.reject(error);
  }
);

