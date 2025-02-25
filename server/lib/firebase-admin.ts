import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Parse service account from environment variable
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (error) {
    console.error('Error parsing FIREBASE_SERVICE_ACCOUNT:', error);
    throw error;
  }
} else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
  // Read from file if path is provided (for local development)
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  serviceAccount = JSON.parse(
    readFileSync(join(__dirname, '..', '..', serviceAccountPath), 'utf-8')
  );
} else {
  throw new Error('Neither FIREBASE_SERVICE_ACCOUNT nor FIREBASE_SERVICE_ACCOUNT_PATH is set');
}

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export const auth = app.auth();
