/**
 * Lightweight Express route for fetching all stored document records.
 *
 * Key responsibilities:
 * - Exposes a GET route at `/` that returns all available records.
 * - Uses the in-memory `storage` class to pull synced or fallback records.
 * - Handles internal errors and responds with 500 if retrieval fails.
 */


import express from 'express';
import { storage } from '../storage';

const router = express.Router();

// Get all records
router.get('/', async (req, res) => {
  try {
    // Use our storage class which has fallback records
    const records = await storage.getAllRecords();
    res.json(records);
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

export default router;