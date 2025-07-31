# Dental Intelligence API - Authentication Documentation

## Overview
The Dental Intelligence API provides a robust authentication system for managing users in the dental management platform. The system uses JWT (JSON Web Tokens) for secure authentication and authorization.

## Base URL
```
http://localhost:5000
```

## Authentication System Features

### Key Features
- **firstName-based Authentication**: Users log in with their first name instead of email
- **JWT Token Management**: Secure token-based authentication
- **Role-based Access**: Support for Admin, Champion, Team Member, and Senior Champion roles
- **Password Security**: Automatic password hashing using bcrypt
- **Input Validation**: Comprehensive request validation middleware
- **Error Handling**: Detailed error responses for debugging and user feedback

### User Roles
- **Admin**: Full system access and user management
- **Champion**: Team leadership and workflow management
- **Team Member**: Standard access for daily operations
- **Senior Champion**: Advanced permissions for senior team members

## API Endpoints

### 1. User Registration
**POST** `/api/users/register`

Creates a new user account in the system.

#### Request Body
```json
{
  "firstName": "John",           // Required: User's first name (used for login)
  "lastName": "Doe",             // Required: User's last name
  "middleName": "Michael",       // Optional: User's middle name
  "password": "securePass123",   // Required: Minimum 6 characters
  "email": "john@example.com",   // Optional: Valid email format
  "phone": "+1234567890",        // Optional: Phone number
  "role": "Team Member"          // Optional: Defaults to "Team Member"
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "648a1b5c8f1e7c2d3e4f5a6b",
    "firstName": "John",
    "lastName": "Doe",
    "middleName": "Michael",
    "role": "Team Member",
    "email": "john@example.com",
    "phone": "+1234567890",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Error Responses
- **400 Bad Request**: Missing required fields, invalid email, short password
- **409 Conflict**: User with email already exists

### 2. User Sign In
**POST** `/api/users/signin`

Authenticates a user and returns a JWT token.

#### Request Body
```json
{
  "firstName": "John",           // Required: User's first name
  "password": "securePass123"    // Required: User's password
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "User signed in successfully",
  "user": {
    "id": "648a1b5c8f1e7c2d3e4f5a6b",
    "firstName": "John",
    "lastName": "Doe",
    "middleName": "Michael",
    "role": "Team Member",
    "email": "john@example.com",
    "phone": "+1234567890",
    "lastLogin": "2024-01-15T14:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Error Responses
- **400 Bad Request**: Missing credentials, empty fields
- **401 Unauthorized**: User not found, invalid password, inactive account
- **500 Internal Server Error**: Server-side errors

## Security Features

### Password Security
- Passwords are hashed using bcrypt with salt rounds
- Minimum password length of 6 characters
- Passwords are never returned in API responses

### JWT Token Management
- Tokens are generated with user ID and role information
- Tokens should be included in Authorization header: `Bearer <token>`
- Token expiration and refresh logic (implementation dependent)

### Input Validation
- All input fields are trimmed of whitespace
- Email format validation when provided
- Role validation against allowed values
- Comprehensive error messages for invalid input

## Frontend Integration

### AuthFetch Middleware
The frontend uses an `authFetch` middleware that:
- Automatically includes JWT tokens in requests
- Handles token refresh and authentication errors
- Provides convenient methods: `authGet`, `authPost`, `authPut`, `authDelete`
- Logs authentication events for debugging

### Example Usage
```javascript
import { authPost } from './authFetch';

// Register new user
const registerUser = async (userData) => {
  const response = await authPost('/api/users/register', userData);
  return response;
};

// Sign in user
const signInUser = async (credentials) => {
  const response = await authPost('/api/users/signin', credentials);
  return response;
};
```

## Database Schema

### User Model
```javascript
{
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  middleName: { type: String },
  email: { type: String, sparse: true },  // Optional and unique
  phone: { type: String },
  password: { type: String, required: true },  // Hashed
  role: { 
    type: String, 
    enum: ['Admin', 'Champion', 'Team Member', 'Senior Champion'],
    default: 'Team Member'
  },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

## Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "error": "Descriptive error message"
}
```

### Common Error Scenarios
1. **Missing Required Fields**: firstName, lastName, password not provided
2. **Invalid Email Format**: Email doesn't match regex pattern
3. **Short Password**: Password less than 6 characters
4. **User Not Found**: firstName doesn't match any user
5. **Invalid Credentials**: Password doesn't match
6. **Duplicate User**: Email already exists in system
7. **Inactive Account**: User account is deactivated

## Testing with Swagger

Access the API documentation at:
```
http://localhost:5000/api-docs
```

The Swagger interface provides:
- Interactive API testing
- Request/response examples
- Schema definitions
- Authentication testing capabilities

## Development Guidelines

### Adding Authentication to Routes
```javascript
// Protect routes with JWT authentication
app.use('/api/protected', authenticateToken);

// JWT middleware example
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};
```

### Environment Variables
```bash
JWT_SECRET=your-secret-key-here
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dental-intelligence
```

## Troubleshooting

### Common Issues
1. **Port 3000 vs 5000**: Ensure frontend is configured for port 5000
2. **CORS Issues**: Verify CORS settings in backend app.js
3. **Token Expiration**: Implement token refresh logic
4. **Database Connection**: Check MongoDB connection string
5. **Environment Variables**: Ensure .env file is properly loaded

### Debug Logging
The system includes comprehensive logging:
- Authentication attempts
- API request/response cycles
- Error conditions with stack traces
- Token generation and validation events

This documentation provides a complete overview of the authentication system. The API is designed to be secure, user-friendly, and easily integrable with the frontend React application.
