import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import testRoutes from './routes/tests.js';
import bookingRoutes from './routes/bookings.js';
import noteRoutes from './routes/notes.js';
import galleryRoutes from './routes/gallery.js';
import testimonialRoutes from './routes/testimonials.js';
import userRoutes from './routes/users.js';
import profileRoutes from './routes/profile.js';
import doctorRoutes from './routes/doctors.js';
import prescriptionRoutes from './routes/prescriptions.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware - CORS configuration
// Simplified CORS for development - allow all localhost origins
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like Postman, mobile apps, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // In development, allow all localhost and 127.0.0.1 origins
    const isDevelopment = process.env.NODE_ENV !== 'production';
    if (isDevelopment) {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }
    
    // Production: only allow specific origins
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'https://jppathlabs.in',
      'http://jppathlabs.in',
      'https://www.jppathlabs.in',
      'http://www.jppathlabs.in',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ].filter(Boolean);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Explicitly handle preflight OPTIONS requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(204);
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    cors: 'enabled',
    timestamp: new Date().toISOString()
  });
});

// Simple CORS test endpoint
app.get('/api/test-cors', (req, res) => {
  res.json({ 
    message: 'CORS is working!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Add request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
  next();
});

// Start server first, then connect to MongoDB
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`🌐 Production domains: https://jppathlabs.in, http://jppathlabs.in`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n💡 Test server: http://localhost:${PORT}/api/health\n`);
  
  // Connect to MongoDB after server starts
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lab-booking')
    .then(() => {
      console.log('✅ Connected to MongoDB');
    })
    .catch((error) => {
      console.error('❌ MongoDB connection error:', error.message);
      console.warn('⚠️  Server is running but MongoDB is not connected. Some features may not work.');
      console.warn('💡 Make sure MongoDB is running: brew services start mongodb-community (macOS) or sudo systemctl start mongod (Linux)');
    });
});

export default app;

