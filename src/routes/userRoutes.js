const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
// const { validateRegister, validateSignin } = require('../../middleware/validationMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the user
 *           example: "648a1b5c8f1e7c2d3e4f5a6b"
 *         firstName:
 *           type: string
 *           description: User's first name
 *           example: "John"
 *         lastName:
 *           type: string
 *           description: User's last name
 *           example: "Doe"
 *         middleName:
 *           type: string
 *           description: User's middle name (optional)
 *           example: "Michael"
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address (optional)
 *           example: "john.doe@example.com"
 *         phone:
 *           type: string
 *           description: User's phone number (optional)
 *           example: "+1234567890"
 *         role:
 *           type: string
 *           enum: [Admin, Champion, Team Member, Senior Champion]
 *           description: User's role in the system
 *           example: "Team Member"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *           example: "2024-01-15T10:30:00.000Z"
 *         lastLogin:
 *           type: string
 *           format: date-time
 *           description: Last login timestamp
 *           example: "2024-01-15T10:30:00.000Z"
 *     
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indicates if the operation was successful
 *           example: true
 *         user:
 *           $ref: '#/components/schemas/User'
 *         token:
 *           type: string
 *           description: JWT authentication token
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     
 *     RegisterResponse:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/User'
 *         access_token:
 *           type: string
 *           description: JWT authentication token
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Always false for error responses
 *           example: false
 *         error:
 *           type: string
 *           description: Error message
 *           example: "Invalid credentials"
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user account
 *     description: Creates a new user account in the dental management system. Passwords are automatically hashed before storage.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 minLength: 1
 *                 description: User's first name (used for login)
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 minLength: 1
 *                 description: User's last name
 *                 example: "Doe"
 *               middleName:
 *                 type: string
 *                 description: User's middle name (optional)
 *                 example: "Michael"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: User's password (minimum 6 characters)
 *                 example: "securePassword123"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address (optional)
 *                 example: "john.doe@dentalclinic.com"
 *               phone:
 *                 type: string
 *                 description: User's phone number (optional)
 *                 example: "+1234567890"
 *               role:
 *                 type: string
 *                 enum: [Admin, Champion, Team Member, Senior Champion]
 *                 description: User's role in the system (defaults to Team Member)
 *                 example: "Team Member"
 *           examples:
 *             basicUser:
 *               summary: Basic user registration
 *               value:
 *                 firstName: "Jane"
 *                 lastName: "Smith"
 *                 password: "password123"
 *                 role: "Team Member"
 *             fullUser:
 *               summary: Complete user registration
 *               value:
 *                 firstName: "Dr.Sarah"
 *                 lastName: "Johnson"
 *                 middleName: "Ann"
 *                 password: "securePass456"
 *                 email: "sarah.johnson@dentalclinic.com"
 *                 phone: "+1555123456"
 *                 role: "Admin"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterResponse'
 *             example:
 *               user:
 *                 id: "648a1b5c8f1e7c2d3e4f5a6b"
 *                 firstName: "John"
 *                 lastName: "Doe"
 *                 middleName: "Michael"
 *                 role: "Team Member"
 *                 email: "john.doe@dentalclinic.com"
 *                 phone: "+1234567890"
 *                 photoURL: ""
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T10:30:00.000Z"
 *               access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingFields:
 *                 summary: Missing required fields
 *                 value:
 *                   success: false
 *                   error: "firstName, lastName, and password are required"
 *               shortPassword:
 *                 summary: Password too short
 *                 value:
 *                   success: false
 *                   error: "Password must be at least 6 characters long"
 *       409:
 *         description: Conflict - user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "User with this email already exists"
 */
router.post('/register', userController.register);

/**
 * @swagger
 * /api/users/signin:
 *   post:
 *     summary: Sign in user to the system
 *     description: Authenticates a user with firstName and password credentials. Returns a JWT token for authenticated API access.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 minLength: 1
 *                 description: User's first name (primary login identifier)
 *                 example: "John"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: User's password
 *                 example: "securePassword123"
 *           examples:
 *             adminUser:
 *               summary: Admin user login
 *               value:
 *                 firstName: "Dr.Sarah"
 *                 password: "adminPass123"
 *             teamMember:
 *               summary: Team member login
 *               value:
 *                 firstName: "Jane"
 *                 password: "password123"
 *     responses:
 *       200:
 *         description: User signed in successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               success: true
 *               user:
 *                 id: "648a1b5c8f1e7c2d3e4f5a6b"
 *                 firstName: "John"
 *                 lastName: "Doe"
 *                 middleName: "Michael"
 *                 role: "Team Member"
 *                 email: "john.doe@dentalclinic.com"
 *                 phone: "+1234567890"
 *                 photoURL: ""
 *                 lastLogin: "2024-01-15T14:30:00.000Z"
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingCredentials:
 *                 summary: Missing login credentials
 *                 value:
 *                   success: false
 *                   error: "firstName and password are required"
 *               emptyFields:
 *                 summary: Empty field values
 *                 value:
 *                   success: false
 *                   error: "firstName and password cannot be empty"
 *       401:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               userNotFound:
 *                 summary: User does not exist
 *                 value:
 *                   success: false
 *                   error: "User not found"
 *               invalidPassword:
 *                 summary: Incorrect password
 *                 value:
 *                   success: false
 *                   error: "Invalid credentials"
 *               inactiveAccount:
 *                 summary: Account is inactive
 *                 value:
 *                   success: false
 *                   error: "Account is inactive"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Internal server error"
 */
router.post('/signin', userController.signin);

/**
 * @swagger
 * /api/users/signin-with-token:
 *   get:
 *     summary: Sign in user with JWT token (auto-login)
 *     description: Validates a JWT token and returns user data for automatic login
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid, user data returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/signin-with-token', userController.signinWithToken);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieves a list of all active users in the system
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', userController.getUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieves a specific user by their ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Successfully retrieved user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', userController.getUser);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user
 *     description: Updates user information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *               middleName:
 *                 type: string
 *                 example: "Michael"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@dentalclinic.com"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               role:
 *                 type: string
 *                 enum: [Admin, Champion, Team Member, Senior Champion]
 *                 example: "Team Member"
 *               department:
 *                 type: string
 *                 example: "Operations"
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Customer Service", "Data Analysis"]
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', userController.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user (deactivate)
 *     description: Deactivates a user account (soft delete)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User deactivated successfully"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', userController.deleteUser);

module.exports = router;
