import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { getAuth, setPersistence, browserLocalPersistence, signInWithEmailAndPassword, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Set persistence to LOCAL (7 days)
setPersistence(auth, browserLocalPersistence);

// Event types
export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  createdAt: number;
}

// Events collection
export const eventsCollection = collection(db, "events");

// Create a new event
export const createEvent = async (eventData: Omit<Event, "id" | "createdAt">) => {
  const response = await fetch('/api/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventData),
  });
  if (!response.ok) {
    throw new Error('Failed to create event');
  }
  return response.json();
};

// Get all events
export const getEvents = async () => {
  const response = await fetch('/api/events');
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }
  return response.json() as Promise<Event[]>;
};

// Auth functions
export const signIn = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signOutUser = async () => {
  await signOut(auth);
}; 