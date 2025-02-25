import admin from 'firebase-admin';

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
  const { readFileSync } = require('fs');
  const { join } = require('path');
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  serviceAccount = JSON.parse(
    readFileSync(join(process.cwd(), serviceAccountPath), 'utf-8')
  );
} else {
  throw new Error('Neither FIREBASE_SERVICE_ACCOUNT nor FIREBASE_SERVICE_ACCOUNT_PATH is set');
}

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export const auth = app.auth();
