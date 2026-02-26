// Firebase configuration
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Initialize Firebase Admin SDK
let serviceAccount;

// Try to read from .env file (for local development)
// In production (Render), use environment variables directly
try {
  const envPath = path.join(__dirname, '../../../.env');
  
  if (fs.existsSync(envPath)) {
    // Local development - read from .env file
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/FIREBASE_SERVICE_ACCOUNT=({[\s\S]*?})\s*$/m);
    if (match) {
      serviceAccount = JSON.parse(match[1]);
    } else {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    }
  } else {
    // Production - use environment variable directly
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }
} catch (error) {
  // Fallback to environment variable if file reading fails
  console.log('Reading service account from environment variable');
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

const db = admin.firestore();

export { admin, db };
