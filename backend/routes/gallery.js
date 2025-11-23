import express from 'express';
import GalleryItem from '../models/GalleryItem.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all gallery items (public)
router.get('/', async (req, res) => {
  try {
    const { activeOnly, heroOnly } = req.query;
    let query = {};
    if (activeOnly === 'true') query.isActive = true;
    if (heroOnly === 'true') query.isHero = true;

    const items = await GalleryItem.find(query).sort({ isHero: -1, createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error('Get gallery error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create gallery item (admin)
router.post('/', authMiddleware, adminMiddleware, [
  body('title').trim().notEmpty().withMessage('Title is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Handle multiple images
    const { images, imageUrl, isHero, ...rest } = req.body;
    
    // If setting a hero image, unset all other hero images
    if (isHero === true) {
      await GalleryItem.updateMany({}, { $set: { isHero: false } });
    }
    
    if (images && Array.isArray(images) && images.length > 0) {
      const items = await Promise.all(
        images.map((imgUrl, index) => {
          // Only the first image can be hero if isHero is true
          const itemIsHero = isHero === true && index === 0;
          return new GalleryItem({ ...rest, imageUrl: imgUrl, isHero: itemIsHero }).save();
        })
      );
      return res.status(201).json(items);
    }

    // Handle single imageUrl
    if (imageUrl) {
      const item = new GalleryItem({ ...rest, imageUrl });
      await item.save();
      return res.status(201).json(item);
    }

    // If neither images nor imageUrl provided
    return res.status(400).json({ 
      message: 'Either images array or imageUrl is required' 
    });
  } catch (error) {
    console.error('Create gallery item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update gallery item (admin)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // If setting this as hero, unset all other hero images
    if (req.body.isHero === true) {
      await GalleryItem.updateMany({ _id: { $ne: req.params.id } }, { $set: { isHero: false } });
    }
    
    const item = await GalleryItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!item) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Update gallery item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete gallery item (admin)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const item = await GalleryItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }
    res.json({ message: 'Gallery item deleted successfully' });
  } catch (error) {
    console.error('Delete gallery item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

