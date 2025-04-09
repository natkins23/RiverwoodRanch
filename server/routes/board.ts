import express from 'express';
import { getFirestore } from 'firebase-admin/firestore';

const router = express.Router();
const db = getFirestore();

// Get all board members
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('board').get();
    const members = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(members);
  } catch (error) {
    console.error('Error fetching board members:', error);
    res.status(500).json({ error: 'Failed to fetch board members' });
  }
});

export default router; 