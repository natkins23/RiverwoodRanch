import express from 'express';
import { getFirestore } from 'firebase-admin/firestore';

const router = express.Router();
const db = getFirestore();

// Get all documents
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('documents').get();
    const documents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

export default router; 