const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dental-intelligence', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createTestUser() {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ firstName: 'Jane' });
    if (existingUser) {
      console.log('Test user Jane already exists');
      return;
    }

    // Create test user
    const testUser = new User({
      firstName: 'Jane',
      lastName: 'Smith',
      password: 'password123',
      role: 'Team Member',
      email: 'jane.smith@test.com'
    });

    await testUser.save();
    console.log('Test user Jane created successfully');
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestUser();
