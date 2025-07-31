const User = require('../models/User');

async function registerUser({ firstName, lastName, middleName, password, role }) {
  const user = new User({ firstName, lastName, middleName, password, role });
  await user.save();
  return user;
}

async function authenticateUser({ firstName, password }) {
  const user = await User.findOne({ firstName });
  if (!user) throw new Error('User not found');
  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new Error('Invalid password');
  return user;
}

module.exports = {
  registerUser,
  authenticateUser
};
