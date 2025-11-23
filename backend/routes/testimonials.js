import express from 'express';
import Testimonial from '../models/Testimonial.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all testimonials (public - only approved and active)
router.get('/', async (req, res) => {
  try {
    const { activeOnly } = req.query;
    let query = { status: 'approved' }; // Only show approved testimonials publicly
    if (activeOnly === 'true') query.isActive = true;

    const testimonials = await Testimonial.find(query).sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    console.error('Get testimonials error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create testimonial by user (public, requires authentication)
router.post('/user', authMiddleware, [
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Get user info
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const testimonial = new Testimonial({
      name: user.name,
      message: req.body.message,
      rating: req.body.rating,
      location: req.body.location || '',
      avatarUrl: user.profilePicture || '',
      user: req.user.userId,
      status: 'pending', // User testimonials need approval
      isActive: false // Inactive until approved
    });
    await testimonial.save();
    res.status(201).json({ message: 'Testimonial submitted successfully. It will be reviewed by admin.', testimonial });
  } catch (error) {
    console.error('Create user testimonial error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create testimonial (admin - auto-approved)
router.post('/', authMiddleware, adminMiddleware, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const testimonial = new Testimonial({
      ...req.body,
      status: 'approved' // Admin-created testimonials are auto-approved
    });
    await testimonial.save();
    res.status(201).json(testimonial);
  } catch (error) {
    console.error('Create testimonial error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update testimonial (admin)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }
    res.json(testimonial);
  } catch (error) {
    console.error('Update testimonial error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve testimonial (admin)
router.put('/:id/approve', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', isActive: true },
      { new: true }
    );
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }
    res.json({ message: 'Testimonial approved successfully', testimonial });
  } catch (error) {
    console.error('Approve testimonial error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject testimonial (admin)
router.put('/:id/reject', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', isActive: false },
      { new: true }
    );
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }
    res.json({ message: 'Testimonial rejected successfully', testimonial });
  } catch (error) {
    console.error('Reject testimonial error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all testimonials for admin (including pending)
router.get('/admin', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, activeOnly } = req.query;
    let query = {};
    if (status) query.status = status;
    if (activeOnly === 'true') query.isActive = true;

    const testimonials = await Testimonial.find(query)
      .populate('user', 'name email profilePicture')
      .sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    console.error('Get admin testimonials error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete testimonial (admin)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }
    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

