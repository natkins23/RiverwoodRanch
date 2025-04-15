import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
  credential: cert({
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    token_uri: 'https://oauth2.googleapis.com/token',
  } as any),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
};

const app = initializeApp(firebaseConfig);
const bucket = getStorage().bucket();
const db = getFirestore();

export { bucket, db };
  