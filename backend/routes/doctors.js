import express from 'express';
import Doctor from '../models/Doctor.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all active doctors (public)
router.get('/', async (req, res) => {
  try {
    const { activeOnly = 'true' } = req.query;
    let query = {};
    
    if (activeOnly === 'true') {
      query.isActive = true;
    }

    const doctors = await Doctor.find(query)
      .sort({ order: 1, createdAt: -1 });
    
    res.json(doctors);
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all doctors for admin (including inactive)
router.get('/admin', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .sort({ order: 1, createdAt: -1 });
    
    res.json(doctors);
  } catch (error) {
    console.error('Get doctors admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single doctor
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create doctor (admin)
router.post('/', authMiddleware, adminMiddleware, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('specialization').trim().notEmpty().withMessage('Specialization is required'),
  body('imageUrl').notEmpty().withMessage('Image URL is required'),
  body('review').trim().notEmpty().withMessage('Review is required'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const doctor = new Doctor(req.body);
    await doctor.save();
    res.status(201).json(doctor);
  } catch (error) {
    console.error('Create doctor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update doctor (admin)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    console.error('Update doctor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete doctor (admin)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Delete doctor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

