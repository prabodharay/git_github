import dotenv from 'dotenv';

dotenv.config();

const requiredVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY'
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
  platformFee: Number(process.env.PLATFORM_FEE || 25),
  defaultSurgeMultiplier: Number(process.env.DEFAULT_SURGE_MULTIPLIER || 1),
  driverMatchRadiusKm: Number(process.env.DRIVER_MATCH_RADIUS_KM || 15)
};
