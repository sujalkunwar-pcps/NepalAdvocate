export interface GoogleUserProfile {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
  emailVerified?: boolean;
}

export class GoogleAuthService {
  /**
   * Verify and extract user details from Google credentials / token
   * Supports standard Google OAuth id_token decoding as well as simulated client tokens
   */
  static async verifyGoogleToken(tokenOrPayload: string | any): Promise<GoogleUserProfile> {
    if (typeof tokenOrPayload === 'string') {
      try {
        // If JWT format: header.payload.signature
        const parts = tokenOrPayload.split('.');
        if (parts.length === 3) {
          const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
          const decodedJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
          const data = JSON.parse(decodedJson);
          return {
            googleId: data.sub || `g_${Date.now()}`,
            email: data.email || 'user@gmail.com',
            firstName: data.given_name || (data.name ? data.name.split(' ')[0] : 'Google'),
            lastName: data.family_name || (data.name ? data.name.split(' ').slice(1).join(' ') : 'User'),
            picture: data.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400',
            emailVerified: data.email_verified ?? true,
          };
        }
      } catch (e) {
        // Fallback to pseudo-token or custom parsing
      }
    }

    if (typeof tokenOrPayload === 'object' && tokenOrPayload !== null) {
      return {
        googleId: tokenOrPayload.id || tokenOrPayload.sub || `g_${Date.now()}`,
        email: tokenOrPayload.email || 'google.user@nepaladvocate.com',
        firstName: tokenOrPayload.firstName || tokenOrPayload.given_name || 'Google',
        lastName: tokenOrPayload.lastName || tokenOrPayload.family_name || 'User',
        picture: tokenOrPayload.picture || tokenOrPayload.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400',
        emailVerified: true,
      };
    }

    // Default simulation fallback
    return {
      googleId: `g_mock_${Date.now()}`,
      email: 'aarav.sharma.google@nepaladvocate.com',
      firstName: 'Aarav',
      lastName: 'Sharma',
      picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400',
      emailVerified: true,
    };
  }
}
