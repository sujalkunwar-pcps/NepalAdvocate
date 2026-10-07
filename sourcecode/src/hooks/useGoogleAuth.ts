import { useState } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { GOOGLE_CONFIG, getGoogleClientId, getRedirectUri, getReturnUrl } from '../config/authConfig';
import { useAuth } from '../context/AuthContext';

// Ensure web auth redirects & popups complete cleanly
WebBrowser.maybeCompleteAuthSession();

export interface LawyerAuthDetails {
  barLicenseNumber?: string;
  specialization?: string;
  experience?: number;
  hourlyRate?: number;
  officeLocation?: string;
  bio?: string;
}

export interface GoogleProfileResult {
  email: string;
  name: string;
  avatar?: string;
  idToken?: string;
}

export interface GoogleAuthResult {
  isLoading: boolean;
  signInWithGoogle: (
    role?: 'CLIENT' | 'LAWYER',
    lawyerData?: LawyerAuthDetails
  ) => Promise<{ success: boolean; message?: string }>;
  promptGoogleProfile: () => Promise<GoogleProfileResult | null>;
}

export const useGoogleAuth = (onSuccess?: () => void): GoogleAuthResult => {
  const { googleLogin } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const clientId = getGoogleClientId();
  const redirectUri = getRedirectUri();
  const returnUrl = getReturnUrl();

  /**
   * Launch real Google authentication in system browser
   * and fetch real verified user profile from Google
   */
  const getGoogleProfileFromOAuth = async (): Promise<GoogleProfileResult | null> => {
    setIsAuthenticating(true);
    try {
      const isWeb = Platform.OS === 'web';

      // 1. Core Google OAuth 2.0 authorization endpoint
      const googleAuthUrl =
        `${GOOGLE_CONFIG.discovery.authorizationEndpoint}?` +
        `client_id=${encodeURIComponent(clientId)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=token%20id_token&` +
        `scope=${encodeURIComponent('openid profile email')}&` +
        `nonce=${Date.now()}&` +
        `prompt=select_account`;

      let startUrl = googleAuthUrl;
      let sessionReturnUrl = redirectUri;

      if (!isWeb) {
        // In Expo Go on mobile (iOS/Android), the Expo auth proxy (auth.expo.io) requires
        // initializing the session at the `/start` endpoint with `authUrl` and `returnUrl`.
        // This sets the necessary session cookie on auth.expo.io so that when Google redirects back,
        // auth.expo.io can forward the tokens directly to the app at `returnUrl`.
        // Direct calls without `/start` trigger:
        // "Something went wrong trying to finish signing in. Please close this screen to go back to the app."
        const startParams = new URLSearchParams({
          authUrl: googleAuthUrl,
          returnUrl: returnUrl,
        });
        startUrl = `${redirectUri}/start?${startParams.toString()}`;
        sessionReturnUrl = returnUrl;
      }

      const result = await WebBrowser.openAuthSessionAsync(startUrl, sessionReturnUrl);

      if (result.type !== 'success' || !result.url) {
        setIsAuthenticating(false);
        return null;
      }

      // Check for error codes in query params
      const fullUrl = result.url;
      const queryPart = fullUrl.includes('?') ? fullUrl.split('?')[1].split('#')[0] : '';
      const hashPart = fullUrl.includes('#') ? fullUrl.split('#')[1] : '';

      const searchParams = new URLSearchParams(queryPart);
      const hashParams = new URLSearchParams(hashPart);

      const errorCode = searchParams.get('errorCode') || searchParams.get('error') || hashParams.get('error');
      if (errorCode) {
        setIsAuthenticating(false);
        console.warn('Google Auth returned error code:', errorCode);
        return null;
      }

      const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
      const idToken = hashParams.get('id_token') || searchParams.get('id_token');


      let profile: { email: string; name: string; avatar?: string } | null = null;

      // 1. Fetch user profile from Google UserInfo API using access_token
      if (accessToken) {
        try {
          const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (userInfoRes.ok) {
            const data = await userInfoRes.json();
            profile = {
              email: data.email,
              name:
                data.name ||
                (data.given_name ? `${data.given_name} ${data.family_name || ''}`.trim() : 'Google User'),
              avatar: data.picture,
            };
          }
        } catch (err) {
          console.log('Error fetching userinfo from Google:', err);
        }
      }

      // 2. Fallback: Parse Google id_token payload
      if (!profile && idToken) {
        try {
          const parts = idToken.split('.');
          if (parts.length === 3) {
            const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            // Decode base64 unicode
            const jsonStr = decodeURIComponent(
              atob(payloadBase64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
            const decoded = JSON.parse(jsonStr);
            profile = {
              email: decoded.email,
              name:
                decoded.name ||
                (decoded.given_name ? `${decoded.given_name} ${decoded.family_name || ''}`.trim() : 'Google User'),
              avatar: decoded.picture,
            };
          }
        } catch (err) {
          console.log('Error parsing Google id_token:', err);
        }
      }

      setIsAuthenticating(false);

      if (profile && profile.email) {
        return {
          email: profile.email.toLowerCase(),
          name: profile.name,
          avatar: profile.avatar,
          idToken: idToken || undefined,
        };
      }

      return null;
    } catch (error) {
      setIsAuthenticating(false);
      console.error('Google OAuth error:', error);
      return null;
    }
  };

  /**
   * Complete 1-tap Google Login (used on LoginScreen)
   */
  const signInWithGoogle = async (
    role?: 'CLIENT' | 'LAWYER',
    lawyerData?: LawyerAuthDetails
  ): Promise<{ success: boolean; message?: string }> => {
    const profile = await getGoogleProfileFromOAuth();
    if (!profile) {
      return { success: false, message: 'Google sign-in was cancelled.' };
    }

    const success = await googleLogin({
      credential: profile.idToken,
      email: profile.email,
      name: profile.name,
      picture: profile.avatar,
      role,
      ...lawyerData,
    });

    if (success && onSuccess) {
      onSuccess();
    }

    return { success: !!success };
  };

  /**
   * Launch real Google Authentication and return verified Google Profile (used on RegisterScreen)
   */
  const promptGoogleProfile = async (): Promise<GoogleProfileResult | null> => {
    return await getGoogleProfileFromOAuth();
  };

  return {
    isLoading: isAuthenticating,
    signInWithGoogle,
    promptGoogleProfile,
  };
};

export default useGoogleAuth;
