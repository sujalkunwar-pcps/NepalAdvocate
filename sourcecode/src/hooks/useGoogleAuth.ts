import { useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { GOOGLE_CONFIG, getGoogleClientId, getRedirectUri } from '../config/authConfig';
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

  /**
   * Launch real Google authentication in system browser
   * and fetch real verified user profile from Google
   */
  const getGoogleProfileFromOAuth = async (): Promise<GoogleProfileResult | null> => {
    setIsAuthenticating(true);
    try {
      const authUrl =
        `${GOOGLE_CONFIG.discovery.authorizationEndpoint}?` +
        `client_id=${encodeURIComponent(clientId)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=token%20id_token&` +
        `scope=${encodeURIComponent('openid profile email')}&` +
        `nonce=${Date.now()}&` +
        `prompt=select_account`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type !== 'success' || !result.url) {
        setIsAuthenticating(false);
        return null;
      }

      const hash = result.url.split('#')[1];
      const query = result.url.split('?')[1];
      const params = new URLSearchParams(hash || query || '');
      const accessToken = params.get('access_token');
      const idToken = params.get('id_token');

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
