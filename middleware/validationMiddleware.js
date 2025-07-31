/**
 * Middleware for validating user authentication requests
 */

const validateRegister = (req, res, next) => {
  const { firstName, lastName, password, email, role } = req.body;
  
  // Check required fields
  if (!firstName || !lastName || !password) {
    return res.status(400).json({
      success: false,
      error: 'firstName, lastName, and password are required'
    });
  }

  // Trim whitespace from string fields
  req.body.firstName = firstName.trim();
  req.body.lastName = lastName.trim();
  if (req.body.middleName) req.body.middleName = req.body.middleName.trim();
  if (email) req.body.email = email.trim();

  // Validate firstName and lastName are not empty after trimming
  if (!req.body.firstName || !req.body.lastName) {
    return res.status(400).json({
      success: false,
      error: 'firstName and lastName cannot be empty'
    });
  }

  // Validate password length
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 6 characters long'
    });
  }

  // Validate email format if provided
  if (email && !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid email address'
    });
  }

  // Validate role if provided
  const validRoles = ['Admin', 'Champion', 'Team Member', 'Senior Champion'];
  if (role && !validRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      error: `Role must be one of: ${validRoles.join(', ')}`
    });
  }

  next();
};

const validateSignin = (req, res, next) => {
  const { firstName, password } = req.body;
  
  // Check required fields
  if (!firstName || !password) {
    return res.status(400).json({
      success: false,
      error: 'firstName and password are required'
    });
  }

  // Trim whitespace
  req.body.firstName = firstName.trim();

  // Validate firstName is not empty after trimming
  if (!req.body.firstName) {
    return res.status(400).json({
      success: false,
      error: 'firstName cannot be empty'
    });
  }

  next();
};

module.exports = {
  validateRegister,
  validateSignin
};
