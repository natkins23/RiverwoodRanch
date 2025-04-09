import express from 'express';
import { getFirestore } from 'firebase-admin/firestore';

const router = express.Router();
const db = getFirestore();

// Get all blog posts
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('blog').get();
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(posts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

// Create a new blog post
router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body;
    const docRef = await db.collection('blog').add({
      title,
      content,
      date: new Date(),
      excerpt: content.substring(0, 200) + '...'
    });
    res.json({ id: docRef.id, ...req.body });
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ error: 'Failed to create blog post' });
  }
});

export default router; 