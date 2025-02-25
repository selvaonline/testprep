import admin from 'firebase-admin';
import { join } from 'path';
import { readFileSync } from 'fs';

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
if (!serviceAccountPath) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH environment variable is not set');
}

const serviceAccount = JSON.parse(
  readFileSync(join(process.cwd(), serviceAccountPath), 'utf-8')
);

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export const auth = app.auth();
