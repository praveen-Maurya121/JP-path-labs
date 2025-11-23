// Quick script to check MongoDB connection
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lab-booking';

console.log('🔍 Checking MongoDB connection...');
console.log('📍 URI:', MONGODB_URI.replace(/\/\/.*@/, '//***@')); // Hide credentials

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connection successful!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed!');
    console.error('Error:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Make sure MongoDB is running');
    console.log('   2. macOS: brew services start mongodb-community');
    console.log('   3. Linux: sudo systemctl start mongod');
    console.log('   4. Windows: Check MongoDB service in Services');
    console.log('   5. Or use MongoDB Atlas cloud connection');
    process.exit(1);
  });

