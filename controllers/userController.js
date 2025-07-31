const userService = require('../services/userService');

const jwtService = require('../services/jwtService');

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, middleName, password, role } = req.body;
    const user = await userService.registerUser({ firstName, lastName, middleName, password, role });
    const token = jwtService.generateToken(user);
    res.status(201).json({
      success: true,
      user: { id: user._id, firstName: user.firstName, lastName: user.lastName, middleName: user.middleName, role: user.role },
      token
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.signin = async (req, res) => {
  try {
    const { firstName, password } = req.body;
    const user = await userService.authenticateUser({ firstName, password });
    const token = jwtService.generateToken(user);
    // Exclude password from response
    const { password: _, ...userData } = user.toObject();
    res.json({
      success: true,
      user: {
        id: userData._id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        middleName: userData.middleName,
        role: userData.role,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      },
      token
    });
  } catch (error) {
    res.status(401).json({ success: false, error: error.message });
  }
};
