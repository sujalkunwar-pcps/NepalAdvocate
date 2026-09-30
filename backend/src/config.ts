import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'nepal_advocate_jwt_super_secret_key_2026',
  jwtExpiresIn: '7d',
  googleClientId: process.env.GOOGLE_CLIENT_ID || 'nepal-advocate-google-client-id.apps.googleusercontent.com',
  corsOrigin: process.env.CORS_ORIGIN || '*',
};
