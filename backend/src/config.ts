import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

let googleClientId = process.env.GOOGLE_CLIENT_ID || '';
let googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

try {
  // Check if any client_secret json file exists in backend root directory
  const backendDir = path.resolve(__dirname, '..');
  const files = fs.readdirSync(backendDir);
  const secretFile = files.find(f => f.startsWith('client_secret_') && f.endsWith('.json'));
  if (secretFile) {
    const raw = JSON.parse(fs.readFileSync(path.join(backendDir, secretFile), 'utf8'));
    if (raw.web) {
      googleClientId = raw.web.client_id || googleClientId;
      googleClientSecret = raw.web.client_secret || googleClientSecret;
    } else if (raw.installed) {
      googleClientId = raw.installed.client_id || googleClientId;
      googleClientSecret = raw.installed.client_secret || googleClientSecret;
    }
  }
} catch (e) {
  // Graceful fallback to env config
}


export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'nepal_advocate_jwt_super_secret_key_2026',
  jwtExpiresIn: '7d',
  googleClientId,
  googleClientSecret,
  corsOrigin: process.env.CORS_ORIGIN || '*',
};
