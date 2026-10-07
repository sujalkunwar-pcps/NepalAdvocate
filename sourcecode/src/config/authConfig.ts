import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';

/**
 * Google OAuth 2.0 Client Configuration
 * 
 * Replace these Client IDs with your credentials from Google Cloud Console:
 * https://console.cloud.google.com/apis/credentials
 * 
 * For Web: Create an 'OAuth 2.0 Client ID' of type 'Web application'
 * - Authorized JavaScript origins:
 *     http://localhost:8081
 *     http://localhost:19006
 *     http://localhost:3000
 * - Authorized redirect URIs:
 *     http://localhost:8081
 *     https://auth.expo.io/@anonymous/nepal-advocate
 */
export const GOOGLE_CONFIG = {
  // Web client ID from Google Cloud Console (nepaladvocate-510302)
  webClientId: '769300149624-0jh4u88131vpjmcsdetoul1iu9jn4san.apps.googleusercontent.com',
  // Optional Android / iOS client IDs if building standalone mobile APK / IPA
  androidClientId: '',
  iosClientId: '',
  
  // Custom deep link scheme defined in app.json
  scheme: 'nepaladvocate',

  // Google OAuth 2.0 OpenID Endpoints
  discovery: {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
    userInfoEndpoint: 'https://openidconnect.googleapis.com/v1/userinfo',
  },
};

/**
 * Get active client ID for current platform
 */
export const getGoogleClientId = (): string => {
  if (Platform.OS === 'android' && GOOGLE_CONFIG.androidClientId) {
    return GOOGLE_CONFIG.androidClientId;
  }
  if (Platform.OS === 'ios' && GOOGLE_CONFIG.iosClientId) {
    return GOOGLE_CONFIG.iosClientId;
  }
  return GOOGLE_CONFIG.webClientId;
};

/**
 * Generate standard redirect URI
 */
export const getRedirectUri = (): string => {
  if (Platform.OS === 'web') {
    return AuthSession.makeRedirectUri({
      preferLocalhost: true,
    });
  }
  return 'https://auth.expo.io/@suzza/nepal-advocate';
};
