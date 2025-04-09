import express from 'express';
import { storage } from '../storage';

const router = express.Router();

// Get all documents
router.get('/', async (req, res) => {
  try {
    // Use our storage class which has fallback documents
    const documents = await storage.getAllDocuments();
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

export default router;