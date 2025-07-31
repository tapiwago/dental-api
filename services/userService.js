const User = require('../models/User');

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Created user object
 */
async function registerUser({ firstName, lastName, middleName, password, role, email, phone }) {
  // Check if user with same firstName already exists
  const existingUser = await User.findOne({ firstName });
  if (existingUser) {
    throw new Error('User with this first name already exists');
  }

  // Check if email is provided and already exists
  if (email) {
    const existingEmailUser = await User.findOne({ email });
    if (existingEmailUser) {
      throw new Error('User with this email already exists');
    }
  }

  const user = new User({ 
    firstName, 
    lastName, 
    middleName, 
    password, 
    role: role || 'Team Member',
    email,
    phone 
  });
  
  await user.save();
  return user;
}

/**
 * Authenticate a user
 * @param {Object} credentials - User credentials
 * @returns {Promise<Object>} Authenticated user object
 */
async function authenticateUser({ firstName, password }) {
  const user = await User.findOne({ firstName, isActive: true });
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }
  
  return user;
}

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User object
 */
async function getUserById(userId) {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
}

/**
 * Get all users
 * @returns {Promise<Array>} Array of user objects
 */
async function getAllUsers() {
  return User.find({ isActive: true }).select('-password');
}

/**
 * Update user
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated user object
 */
async function updateUser(userId, updateData) {
  const user = await User.findByIdAndUpdate(
    userId, 
    updateData, 
    { new: true, runValidators: true }
  ).select('-password');
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
}

/**
 * Deactivate user (soft delete)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Deactivated user object
 */
async function deactivateUser(userId) {
  const user = await User.findByIdAndUpdate(
    userId, 
    { isActive: false }, 
    { new: true }
  ).select('-password');
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
}

module.exports = {
  registerUser,
  authenticateUser,
  getUserById,
  getAllUsers,
  updateUser,
  deactivateUser
};
