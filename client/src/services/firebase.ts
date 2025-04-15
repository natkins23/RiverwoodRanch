// Event types and API interfaces
// This file provides type definitions and API client functions
// We're not directly using Firebase client-side to avoid exposing API keys

import { getBaseApiUrl } from "@/lib/utils";

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

// Create a new event
export const createEvent = async (eventData: Omit<Event, "id" | "createdAt">) => {
  const baseApiUrl = getBaseApiUrl();
  const response = await fetch(`${baseApiUrl}/api/events`, {
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

// Placeholder API functions for auth - these aren't actually used in our app currently
// as we use the passcode system instead
export const signIn = async (email: string, password: string) => {
  console.warn('Firebase auth is not implemented on the client - using PIN system instead');
  throw new Error('Firebase auth not implemented');
};

export const signOutUser = async () => {
  console.warn('Firebase auth is not implemented on the client - using PIN system instead');
}; 