const userService = require('../services/userService');
const jwtService = require('../services/jwtService');

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, middleName, password, role, email, phone } = req.body;

    // Basic validation
    if (!firstName || !lastName || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'firstName, lastName, and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password must be at least 6 characters long' 
      });
    }

    const user = await userService.registerUser({ 
      firstName, 
      lastName, 
      middleName, 
      password, 
      role,
      email,
      phone 
    });

    const token = jwtService.generateToken(user);

    // Format response to match frontend expectations for registration
    // Frontend expects: { user, access_token }
    res.status(201).json({
      user: { 
        id: user._id.toString(), 
        firstName: user.firstName, 
        lastName: user.lastName, 
        middleName: user.middleName, 
        role: user.role,
        email: user.email,
        phone: user.phone,
        photoURL: user.profilePicture || '',
        loginRedirectUrl: '/dashboard',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      access_token: token
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle duplicate user error
    if (error.code === 11000) {
      return res.status(409).json({ 
        success: false, 
        error: 'User with this email already exists' 
      });
    }

    res.status(400).json({ 
      success: false, 
      error: error.message || 'Registration failed' 
    });
  }
};

/**
 * Sign in a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.signin = async (req, res) => {
  try {
    const { firstName, password } = req.body;

    // Basic validation
    if (!firstName || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'firstName and password are required' 
      });
    }

    const user = await userService.authenticateUser({ firstName, password });
    const token = jwtService.generateToken(user);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Exclude password from response
    const { password: _, ...userData } = user.toObject();

    // Format response to match frontend expectations for signin
    // Frontend expects: { success: boolean, user: User, token: string }
    res.json({
      success: true,
      user: {
        id: userData._id.toString(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        middleName: userData.middleName,
        role: userData.role,
        email: userData.email,
        phone: userData.phone,
        photoURL: userData.profilePicture || '',
        loginRedirectUrl: '/dashboard',
        lastLogin: userData.lastLogin,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      },
      token
    });
  } catch (error) {
    console.error('Sign in error:', error);
    
    // Don't reveal whether user exists or not for security
    res.status(401).json({ 
      success: false, 
      error: 'Invalid credentials' 
    });
  }
};

/**
 * Sign in with token (for auto-login)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.signinWithToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    // Verify and decode the token
    const decoded = jwtService.verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    // Get user from database
    const user = await userService.getUserById(decoded.id);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'User not found or inactive'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Exclude password from response
    const { password: _, ...userData } = user.toObject();

    // Return user data in the format expected by frontend
    res.json({
      id: userData._id.toString(),
      firstName: userData.firstName,
      lastName: userData.lastName,
      middleName: userData.middleName,
      role: userData.role,
      email: userData.email,
      phone: userData.phone,
      photoURL: userData.profilePicture || '',
      loginRedirectUrl: '/dashboard',
      lastLogin: userData.lastLogin,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt
    });

  } catch (error) {
    console.error('Token sign-in error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

/**
 * Get all users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    
    // Format users data to match frontend expectations
    const formattedUsers = users.map(user => ({
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      profilePicture: user.profilePicture || '',
      department: user.department,
      skills: user.skills,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    res.json({
      success: true,
      users: formattedUsers
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve users'
    });
  }
};

/**
 * Get user by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    
    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        middleName: user.middleName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        profilePicture: user.profilePicture || '',
        department: user.department,
        skills: user.skills,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user'
    });
  }
};

/**
 * Update user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remove password from update data if empty
    if (updateData.password === '') {
      delete updateData.password;
    }
    
    const user = await userService.updateUser(id, updateData);
    
    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        middleName: user.middleName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        profilePicture: user.profilePicture || '',
        department: user.department,
        skills: user.skills,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to update user'
    });
  }
};

/**
 * Delete user (deactivate)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.deactivateUser(id);
    
    res.json({
      success: true,
      message: 'User deactivated successfully',
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        middleName: user.middleName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        profilePicture: user.profilePicture || '',
        department: user.department,
        skills: user.skills,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to deactivate user'
    });
  }
};
