import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const getServiceAccount = () => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT;
      // Add missing commas between properties
      const fixedJson = rawJson.replace(/"\s+"(?=[a-z])/g, '", "');
      return JSON.parse(fixedJson);
    } catch (error) {
      console.error('Error parsing FIREBASE_SERVICE_ACCOUNT:', error);
      throw error;
    }
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    return JSON.parse(
      readFileSync(join(__dirname, '..', '..', serviceAccountPath), 'utf-8')
    );
  }

  throw new Error('Neither FIREBASE_SERVICE_ACCOUNT nor FIREBASE_SERVICE_ACCOUNT_PATH is set');
};

const serviceAccount = getServiceAccount();

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export const auth = app.auth();
