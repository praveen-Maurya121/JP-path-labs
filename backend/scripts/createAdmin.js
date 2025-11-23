import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lab-booking');
    
    const phone = process.argv[2];
    const password = process.argv[3] || 'admin123'; // Default password
    const name = process.argv[4] || 'Admin User';
    
    if (!phone) {
      console.error('Usage: node createAdmin.js <phone> [password] [name]');
      console.error('Example: node createAdmin.js 1234567890 admin123 "Admin Name"');
      process.exit(1);
    }

    // Check if user already exists
    let user = await User.findOne({ phone });
    
    if (user) {
      // User exists, just promote to admin
      user.role = 'admin';
      if (password && password !== 'admin123') {
        user.password = await bcrypt.hash(password, 10);
      }
      await user.save();
      console.log(`✅ User with phone ${phone} has been promoted to admin.`);
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(password, 10);
      user = new User({
        name,
        phone,
        password: hashedPassword,
        role: 'admin'
      });
      await user.save();
      console.log(`✅ Admin user created successfully!`);
      console.log(`   Phone: ${phone}`);
      console.log(`   Password: ${password}`);
      console.log(`   Name: ${name}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 11000) {
      console.error('   Phone number already exists. Use existing phone to promote to admin.');
    }
    process.exit(1);
  }
};

createAdmin();
