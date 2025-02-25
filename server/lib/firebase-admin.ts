import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const getServiceAccount = () => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    let fixedJson = '';
    try {
      // Remove escaped quotes and add commas
      fixedJson = rawJson
        .replace(/\\"/g, '"') // Remove escaped quotes
        .replace(/"{/g, '{') // Remove leading quote
        .replace(/}"/g, '}') // Remove trailing quote
        .replace(/"([^"]+)":/g, '"$1":') // Fix property names
        .replace(/}({|")/g, '},$1'); // Add commas between objects/properties
      return JSON.parse(fixedJson);
    } catch (error) {
      console.error('Error parsing FIREBASE_SERVICE_ACCOUNT:', error);
      console.error('Raw JSON:', process.env.FIREBASE_SERVICE_ACCOUNT);
      console.error('Fixed JSON:', fixedJson);
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
