import express from 'express';
import Prescription from '../models/Prescription.js';
import Booking from '../models/Booking.js';
import Test from '../models/Test.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// User uploads prescription
router.post('/', authMiddleware, [
  body('imageUrl').notEmpty().withMessage('Prescription image is required'),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { imageUrl, notes } = req.body;

    const prescription = new Prescription({
      user: req.user.userId,
      imageUrl,
      notes: notes || '',
      status: 'pending'
    });

    await prescription.save();
    await prescription.populate('user', 'name phone email');

    res.status(201).json({
      message: 'Prescription uploaded successfully',
      prescription
    });
  } catch (error) {
    console.error('Upload prescription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// User gets their prescriptions
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .populate('booking', 'status appointmentDate appointmentTime');
    
    res.json(prescriptions);
  } catch (error) {
    console.error('Get user prescriptions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin gets all prescriptions
router.get('/admin', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) {
      query.status = status;
    }

    const prescriptions = await Prescription.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'name phone email address')
      .populate('booking', 'status appointmentDate appointmentTime');
    
    res.json(prescriptions);
  } catch (error) {
    console.error('Get admin prescriptions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin updates prescription status
router.put('/:id/status', authMiddleware, adminMiddleware, [
  body('status').isIn(['pending', 'reviewed', 'booked', 'rejected']).withMessage('Invalid status'),
  body('adminNotes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, adminNotes } = req.body;
    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      { status, adminNotes: adminNotes || '' },
      { new: true, runValidators: true }
    ).populate('user', 'name phone email address')
     .populate('booking', 'status appointmentDate appointmentTime');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.json({
      message: 'Prescription status updated',
      prescription
    });
  } catch (error) {
    console.error('Update prescription status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin creates booking from prescription
router.post('/:id/create-booking', authMiddleware, adminMiddleware, [
  body('tests').isArray().notEmpty().withMessage('Tests are required'),
  body('appointmentDate').notEmpty().withMessage('Appointment date is required'),
  body('appointmentTime').notEmpty().withMessage('Appointment time is required'),
  body('patientName').optional().trim(),
  body('address').optional().trim(),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const prescription = await Prescription.findById(req.params.id).populate('user');
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    const {
      tests,
      appointmentDate,
      appointmentTime,
      patientName,
      address,
      notes
    } = req.body;

    // Calculate total price
    let totalPrice = 0;
    for (const item of tests) {
      const test = await Test.findById(item.test);
      if (!test || !test.isActive) {
        return res.status(400).json({ message: `Test ${item.test} not found or inactive` });
      }
      totalPrice += test.price * (item.quantity || 1);
    }

    // Combine date and time into a single Date object
    // appointmentDate is in format YYYY-MM-DD, appointmentTime is in format HH:mm
    const [year, month, day] = appointmentDate.split('-').map(Number);
    const [hours, minutes] = appointmentTime.split(':').map(Number);
    const appointmentDateTime = new Date(year, month - 1, day, hours, minutes);

    // Create booking
    const booking = new Booking({
      user: prescription.user._id,
      tests,
      appointmentDate: appointmentDateTime,
      patientName: patientName || prescription.user.name,
      patientPhone: prescription.user.phone || '',
      address: address || prescription.user.address || '',
      notes: notes || '',
      totalPrice,
      status: 'confirmed'
    });

    await booking.save();

    // Update prescription
    prescription.status = 'booked';
    prescription.booking = booking._id;
    await prescription.save();

    await booking.populate('tests.test', 'name price');
    await booking.populate('user', 'name phone email address');
    await prescription.populate('user', 'name phone email address');

    res.status(201).json({
      message: 'Booking created from prescription successfully',
      booking,
      prescription
    });
  } catch (error) {
    console.error('Create booking from prescription error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Admin deletes prescription
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const prescription = await Prescription.findByIdAndDelete(req.params.id);
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    res.json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    console.error('Delete prescription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

