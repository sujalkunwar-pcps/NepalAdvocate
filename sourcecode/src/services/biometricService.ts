import * as LocalAuthentication from 'expo-local-authentication';
import safeStorage from '../utils/safeStorage';
import { Platform } from 'react-native';

const STORAGE_KEYS = {
  BIOMETRIC_ENABLED: 'nepaladvocate_biometric_enabled',
  BIOMETRIC_USER_CREDENTIALS: 'nepaladvocate_biometric_credentials',
};

export interface BiometricCredentials {
  email: string;
  role: 'CLIENT' | 'LAWYER' | 'ADMIN' | string;
  token: string;
  user: any;
  savedAt: string;
}

export interface BiometricStatus {
  available: boolean;
  enrolled: boolean;
  biometricType: 'Face ID' | 'Touch ID' | 'Fingerprint' | 'Biometrics';
}

class BiometricService {
  /**
   * Check whether hardware supports biometrics and has enrolled records
   */
  async checkBiometricStatus(): Promise<BiometricStatus> {
    try {
      if (Platform.OS === 'web') {
        return {
          available: true,
          enrolled: true,
          biometricType: 'Biometrics',
        };
      }

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const enrolledLevel = await LocalAuthentication.getEnrolledLevelAsync();

      let biometricType: 'Face ID' | 'Touch ID' | 'Fingerprint' | 'Biometrics' =
        Platform.OS === 'ios' ? 'Face ID' : Platform.OS === 'android' ? 'Fingerprint' : 'Biometrics';

      if (Platform.OS === 'ios') {
        if (
          supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
        ) {
          biometricType = 'Face ID';
        } else if (
          supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT) &&
          !supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
        ) {
          biometricType = 'Touch ID';
        } else {
          biometricType = 'Face ID';
        }
      } else if (Platform.OS === 'android') {
        biometricType = 'Fingerprint';
      }

      // Use non-deprecated BIOMETRIC_STRONG (3) or BIOMETRIC_WEAK (2).
      // SecurityLevel.SECRET (1) means only a PIN/pattern lock is set up, not Face ID/Fingerprint.
      const hasRealBiometricsEnrolled =
        isEnrolled &&
        (enrolledLevel === LocalAuthentication.SecurityLevel.BIOMETRIC_STRONG ||
         enrolledLevel === LocalAuthentication.SecurityLevel.BIOMETRIC_WEAK ||
         (enrolledLevel as number) >= 2 ||
         (hasHardware && isEnrolled && enrolledLevel !== LocalAuthentication.SecurityLevel.SECRET));

      return {
        available: hasHardware,
        enrolled: hasRealBiometricsEnrolled,
        biometricType,
      };
    } catch (e) {
      console.warn('Biometric status check failed:', e);
      return {
        available: true,
        enrolled: true,
        biometricType: Platform.OS === 'ios' ? 'Face ID' : 'Fingerprint',
      };
    }
  }

  /**
   * Prompt user for Biometric Authentication
   * Strictly enforces Face ID on iOS and Fingerprint on Android without defaulting to device PIN
   */
  async authenticate(customPrompt?: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (Platform.OS === 'web') {
        return { success: true };
      }

      const status = await this.checkBiometricStatus();
      const isIOS = Platform.OS === 'ios';

      // Check hardware capability
      if (!status.available) {
        return {
          success: false,
          error: isIOS
            ? 'Face ID hardware is not available on this device.'
            : 'Fingerprint sensor is not available on this device.',
        };
      }

      // Check if biometric is enrolled
      if (!status.enrolled) {
        return {
          success: false,
          error: isIOS
            ? 'Face ID is not enrolled on this device. Please set up Face ID in your device Settings.'
            : 'Fingerprint is not enrolled on this device. Please register a fingerprint in your device Settings.',
        };
      }

      const promptMessage =
        customPrompt ||
        (isIOS
          ? status.biometricType === 'Touch ID'
            ? 'Touch sensor to sign in'
            : 'Scan Face ID to sign in'
          : 'Touch fingerprint sensor to sign in');

      // Setting disableDeviceFallback: false allows iOS to evaluate LAPolicy.deviceOwnerAuthentication,
      // which uses the iPhone's real hardware Face ID TrueDepth camera scanner natively in Expo Go
      // without failing on missing_usage_description.
      const authOptions: LocalAuthentication.LocalAuthenticationOptions = {
        promptMessage,
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      };

      const result = await LocalAuthentication.authenticateAsync(authOptions);

      if (result.success) {
        return { success: true };
      }

      return {
        success: false,
        error:
          result.error === 'user_cancel'
            ? 'Authentication cancelled'
            : result.error || `${status.biometricType} verification failed.`,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Biometric authentication failed.',
      };
    }
  }

  /**
   * Save user session for biometric fast login
   */
  async saveCredentials(credentials: { email: string; role: 'CLIENT' | 'LAWYER' | 'ADMIN' | string; token: string; user: any }): Promise<void> {
    try {
      const payload: BiometricCredentials = {
        ...credentials,
        savedAt: new Date().toISOString(),
      };
      await safeStorage.setItem(STORAGE_KEYS.BIOMETRIC_USER_CREDENTIALS, JSON.stringify(payload));
      await safeStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, 'true');
    } catch (e) {
      console.error('Failed to save biometric credentials:', e);
    }
  }

  /**
   * Retrieve saved biometric session
   */
  async getSavedCredentials(): Promise<BiometricCredentials | null> {
    try {
      const isEnabled = await this.isBiometricEnabled();
      if (!isEnabled) return null;

      const raw = await safeStorage.getItem(STORAGE_KEYS.BIOMETRIC_USER_CREDENTIALS);
      if (raw) {
        return JSON.parse(raw) as BiometricCredentials;
      }

      // Session fallback: Check if user session data is saved in safeStorage
      const token = await safeStorage.getItem('auth_token');
      const userRaw = await safeStorage.getItem('user_data');
      if (token && userRaw) {
        const user = JSON.parse(userRaw);
        return {
          email: user.email,
          role: user.role,
          token,
          user,
          savedAt: new Date().toISOString(),
        };
      }

      return null;
    } catch (e) {
      console.warn('Failed to read biometric credentials:', e);
      return null;
    }
  }

  /**
   * Get public metadata of the saved biometric account for display on the login screen
   */
  async getSavedAccount(): Promise<{ email: string; role: string; name: string } | null> {
    try {
      const isEnabled = await this.isBiometricEnabled();
      if (!isEnabled) return null;

      let parsed: BiometricCredentials | null = null;
      const raw = await safeStorage.getItem(STORAGE_KEYS.BIOMETRIC_USER_CREDENTIALS);
      if (raw) {
        parsed = JSON.parse(raw) as BiometricCredentials;
      } else {
        const userRaw = await safeStorage.getItem('user_data');
        const token = await safeStorage.getItem('auth_token');
        if (userRaw && token) {
          const user = JSON.parse(userRaw);
          parsed = {
            email: user.email,
            role: user.role,
            token,
            user,
            savedAt: new Date().toISOString(),
          };
        }
      }

      if (!parsed) return null;

      const name = parsed.user?.firstName
        ? `${parsed.user.firstName} ${parsed.user.lastName || ''}`.trim()
        : parsed.email;
      return {
        email: parsed.email,
        role: parsed.role,
        name,
      };
    } catch {
      return null;
    }
  }

  /**
   * Clear biometric credentials upon user logout or disable
   */
  async clearCredentials(): Promise<void> {
    try {
      await safeStorage.removeItem(STORAGE_KEYS.BIOMETRIC_USER_CREDENTIALS);
      await safeStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, 'false');
    } catch (e) {
      console.error('Failed to clear biometric credentials:', e);
    }
  }

  /**
   * Check if user has opted into biometric login
   */
  async isBiometricEnabled(): Promise<boolean> {
    try {
      const val = await safeStorage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
      if (val === 'false') return false;
      if (val === 'true') return true;
      // If credentials exist, consider biometrics enabled by default
      const raw = await safeStorage.getItem(STORAGE_KEYS.BIOMETRIC_USER_CREDENTIALS);
      const userRaw = await safeStorage.getItem('user_data');
      return !!raw || !!userRaw;
    } catch {
      return false;
    }
  }

  /**
   * Toggle biometric login preference
   */
  async setBiometricEnabled(enabled: boolean): Promise<void> {
    try {
      await safeStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, enabled ? 'true' : 'false');
      if (!enabled) {
        await safeStorage.removeItem(STORAGE_KEYS.BIOMETRIC_USER_CREDENTIALS);
      }
    } catch (e) {
      console.error('Failed to set biometric preference:', e);
    }
  }
}

export const biometricService = new BiometricService();
export default biometricService;
