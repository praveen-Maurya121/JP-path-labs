import express from 'express';
import Booking from '../models/Booking.js';
import Test from '../models/Test.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Create booking (user)
router.post('/', authMiddleware, [
  body('tests').isArray({ min: 1 }).withMessage('At least one test is required'),
  body('appointmentDate').isISO8601().withMessage('Valid appointment date is required'),
  body('patientName').trim().notEmpty().withMessage('Patient name is required'),
  body('patientPhone').trim().notEmpty().withMessage('Patient phone is required'),
  body('address').trim().notEmpty().withMessage('Address is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tests, appointmentDate, patientName, patientPhone, address, notes } = req.body;

    // Calculate total price
    let totalPrice = 0;
    for (const item of tests) {
      const test = await Test.findById(item.test);
      if (!test || !test.isActive) {
        return res.status(400).json({ message: `Test ${item.test} not found or inactive` });
      }
      totalPrice += test.price * item.quantity;
    }

    const booking = new Booking({
      user: req.user.userId,
      tests,
      appointmentDate,
      patientName,
      patientPhone,
      address,
      notes,
      totalPrice
    });

    await booking.save();
    await booking.populate('tests.test', 'name price');
    await booking.populate('user', 'name email');

    res.status(201).json(booking);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's bookings
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = { user: req.user.userId };

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { patientName: { $regex: search, $options: 'i' } },
        { patientPhone: { $regex: search, $options: 'i' } }
      ];
    }

    const bookings = await Booking.find(query)
      .populate('tests.test', 'name price')
      .populate('testReports.uploadedBy', 'name')
      .sort({ appointmentDate: -1 });
    res.json(bookings);
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all bookings (admin)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { patientName: { $regex: search, $options: 'i' } },
        { patientPhone: { $regex: search, $options: 'i' } }
      ];
    }

    const bookings = await Booking.find(query)
      .populate('user', 'name email phone address')
      .populate('tests.test', 'name price')
      .populate('testReports.uploadedBy', 'name')
      .sort({ appointmentDate: -1 });
    res.json(bookings);
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update booking status (admin)
router.put('/:id/status', authMiddleware, adminMiddleware, [
  body('status').isIn(['pending', 'confirmed', 'completed', 'cancelled']).withMessage('Valid status is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    )
      .populate('user', 'name email')
      .populate('tests.test', 'name price');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload test report (admin)
router.post('/:id/reports', authMiddleware, adminMiddleware, [
  body('testName').trim().notEmpty().withMessage('Test name is required'),
  body('reportUrl').notEmpty().withMessage('Report URL is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { testName, reportUrl } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.testReports.push({
      testName,
      reportUrl,
      uploadedBy: req.user.userId
    });

    await booking.save();
    await booking.populate('user', 'name email');
    await booking.populate('tests.test', 'name price');
    await booking.populate('testReports.uploadedBy', 'name');

    res.json(booking);
  } catch (error) {
    console.error('Upload test report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete test report (admin)
router.delete('/:id/reports/:reportId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.testReports = booking.testReports.filter(
      report => report._id.toString() !== req.params.reportId
    );

    await booking.save();
    res.json({ message: 'Test report deleted successfully', booking });
  } catch (error) {
    console.error('Delete test report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

