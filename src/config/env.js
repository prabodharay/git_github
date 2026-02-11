import dotenv from 'dotenv';

dotenv.config();

const requiredVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_WEB_API_KEY',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET'
];

for (const variable of requiredVars) {
  if (!process.env[variable]) {
    throw new Error(`Missing required environment variable: ${variable}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  firebaseWebApiKey: process.env.FIREBASE_WEB_API_KEY,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessTtl: process.env.JWT_ACCESS_TTL || '15m',
  jwtRefreshTtl: process.env.JWT_REFRESH_TTL || '30d',
  platformFee: Number(process.env.PLATFORM_FEE || 25),
  defaultSurgeMultiplier: Number(process.env.DEFAULT_SURGE_MULTIPLIER || 1),
  driverMatchRadiusKm: Number(process.env.DRIVER_MATCH_RADIUS_KM || 15)
};
