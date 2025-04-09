import express from 'express';
import { getFirestore } from 'firebase-admin/firestore';

const router = express.Router();
const db = getFirestore();

// Get all events
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('events').get();
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Create a new event
router.post('/', async (req, res) => {
  try {
    const { title, date, time, location, description } = req.body;
    const docRef = await db.collection('events').add({
      title,
      date,
      time,
      location,
      description,
      createdAt: new Date()
    });
    res.json({ id: docRef.id, ...req.body });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

export default router; 