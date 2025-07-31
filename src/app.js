const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();


// Swagger setup (must be after app is initialized)
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dental Intelligence Onboarding API',
      version: '2.0.0',
      description: 'Comprehensive Node.js API for managing client onboarding processes with advanced workflow guidance, notifications, and analytics.',
      contact: {
        name: 'Dental Intelligence API Support',
        email: 'support@dentalintelligence.com'
      }
    },
    servers: [
      { 
        url: 'http://localhost:' + (process.env.PORT || 3000),
        description: 'Development server'
      }
    ],
    tags: [
      {
        name: 'Onboarding Cases',
        description: 'Main onboarding case management operations'
      },
      {
        name: 'Onboarding Cases - Workflow',
        description: 'Workflow-specific operations for onboarding cases'
      },
      {
        name: 'Onboarding Cases - Analytics',
        description: 'Analytics and reporting for onboarding cases'
      },
      {
        name: 'Tasks',
        description: 'Task management operations'
      },
      {
        name: 'Tasks - Workflow',
        description: 'Champion and team member task workflow operations'
      },
      {
        name: 'Tasks - Analytics',
        description: 'Task performance and analytics'
      },
      {
        name: 'Clients',
        description: 'Client and practice management'
      },
      {
        name: 'Stages',
        description: 'Onboarding stage management'
      },
      {
        name: 'Documents',
        description: 'Document upload and management'
      },
      {
        name: 'Guide Steps',
        description: 'Workflow guide step management'
      },
      {
        name: 'Guide Steps - Contextual Hints',
        description: 'Smart contextual hints and guidance system'
      },
      {
        name: 'Guide Steps - Analytics',
        description: 'Guide effectiveness and usage analytics'
      },
      {
        name: 'Workflow Guides',
        description: 'Custom workflow guide creation and management'
      },
      {
        name: 'Notifications',
        description: 'Multi-channel notification system'
      },
      {
        name: 'Analytics',
        description: 'Comprehensive reporting and analytics'
      },
      {
        name: 'Audit Logs',
        description: 'Audit trail and compliance logging'
      },
      {
        name: 'Templates',
        description: 'Reusable onboarding templates'
      },
      {
        name: 'Users',
        description: 'User management and authentication'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js', './routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);


// User routes
const userRoutes = require('./routes/userRoutes');
// Office location routes
// const officeLocationRoutes = require('./routes/officeLocationRoutes');

// Onboarding and workflow guide routes
const onboardingCaseRoutes = require('./routes/onboardingCaseRoutes');
const clientRoutes = require('./routes/clientRoutes');
const stageRoutes = require('./routes/stageRoutes');
const taskRoutes = require('./routes/taskRoutes');
const documentRoutes = require('./routes/documentRoutes');
const workflowGuideRoutes = require('./routes/workflowGuideRoutes');
const guideStepRoutes = require('./routes/guideStepRoutes');
const caseGuideLinkRoutes = require('./routes/caseGuideLinkRoutes');

// System and admin routes
const notificationRoutes = require('./routes/notificationRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');
const templateRoutes = require('./routes/templateRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dental_db';
const DB_NAME = process.env.DB_NAME || 'dental_db';

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// User API routes
app.use('/api/users', userRoutes);
// Office location API routes
// app.use('/api/offices', officeLocationRoutes);

// Onboarding and workflow guide API routes
app.use('/api/onboarding-cases', onboardingCaseRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/stages', stageRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/workflow-guides', workflowGuideRoutes);
app.use('/api/guide-steps', guideStepRoutes);
app.use('/api/case-guide-links', caseGuideLinkRoutes);

// System and admin API routes
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/analytics', analyticsRoutes);

// Enhanced logging for database connection
console.log('Starting Dental API...');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Port:', PORT);

// Check if using Atlas or local MongoDB
const isAtlas = MONGODB_URI.includes('mongodb+srv://');
const isLocal = MONGODB_URI.includes('localhost') || MONGODB_URI.includes('127.0.0.1');
const isDocker = MONGODB_URI.includes('mongo:27017');

console.log('Database Configuration:');
console.log('- Type:', isAtlas ? 'MongoDB Atlas (Cloud)' : isDocker ? 'Docker MongoDB' : isLocal ? 'Local MongoDB' : 'Custom MongoDB');
console.log('- Database Name:', DB_NAME);
console.log('- Auto-create database:', 'Enabled');

if (MONGODB_URI.includes('<db_username>') || MONGODB_URI.includes('<db_password>')) {
  console.error('❌ ERROR: Please update your .env file with actual MongoDB credentials!');
  console.error('Replace <db_username> and <db_password> with your actual values.');
  process.exit(1);
}

// Database connection
console.log('Connecting to MongoDB...');
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: DB_NAME, // Explicitly specify database name
})
.then(async () => {
  console.log('✓ Connected to MongoDB successfully');
  
  // Get database name from connection
  const dbName = mongoose.connection.db.databaseName;
  console.log(`✓ Using database: ${dbName}`);
  
  // For Atlas, the database will be created automatically when first data is inserted
  try {
    // List collections to check if database exists and has collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log(`📝 Database '${dbName}' exists but is empty - will initialize with sample data`);
    } else {
      console.log(`✓ Database '${dbName}' is ready with ${collections.length} collections: ${collections.map(c => c.name).join(', ')}`);
    }
    
    // Initialize database with sample data if needed
    await initializeDatabase();
  } catch (error) {
    console.log(`📝 Initializing new database '${dbName}'...`);
    await initializeDatabase();
  }
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error.message);
  
  if (isAtlas) {
    console.error('Atlas connection tips:');
    console.error('1. Check your username and password in the connection string');
    console.error('2. Ensure your IP address is whitelisted in Atlas');
    console.error('3. Verify the cluster is running');
  } else if (isLocal) {
    console.error('Local MongoDB tips:');
    console.error('1. Make sure MongoDB is installed and running');
    console.error('2. Check if MongoDB service is started');
  } else if (isDocker) {
    console.error('Docker MongoDB tips:');
    console.error('1. Make sure MongoDB container is running');
    console.error('2. Check docker-compose services');
  }
  
  process.exit(1);
});

// Initialize database with collections and sample data
async function initializeDatabase() {
  try {
    console.log('🔧 Initializing database...');
    
    // Import the Patient model to ensure collection exists
    const Patient = require('./models/Patient');
    
    // Check if patients collection exists and has data
    const patientCount = await Patient.countDocuments();
    
    if (patientCount === 0) {
      console.log('📝 Creating initial patient data...');
      
      // Create sample patients
      const samplePatients = [
        {
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          phone: "+1234567890",
          dateOfBirth: new Date("1985-06-15"),
          address: {
            street: "123 Main St",
            city: "Anytown",
            state: "CA",
            zipCode: "12345",
            country: "USA"
          },
          emergencyContact: {
            name: "Jane Doe",
            phone: "+1234567899",
            relationship: "Spouse"
          }
        },
        {
          firstName: "Jane",
          lastName: "Smith",
          email: "jane.smith@example.com",
          phone: "+1234567891",
          dateOfBirth: new Date("1990-03-22"),
          address: {
            street: "456 Oak Ave",
            city: "Somewhere",
            state: "NY",
            zipCode: "67890",
            country: "USA"
          },
          emergencyContact: {
            name: "Bob Smith",
            phone: "+1234567892",
            relationship: "Brother"
          }
        },
        {
          firstName: "Mike",
          lastName: "Johnson",
          email: "mike.johnson@example.com",
          phone: "+1234567893",
          dateOfBirth: new Date("1978-11-10"),
          address: {
            street: "789 Pine Rd",
            city: "Elsewhere",
            state: "TX",
            zipCode: "54321",
            country: "USA"
          },
          medicalHistory: [{
            condition: "Diabetes Type 2",
            medications: ["Metformin"],
            allergies: ["Penicillin"],
            notes: "Regular blood sugar monitoring required"
          }]
        }
      ];
      
      await Patient.insertMany(samplePatients);
      console.log(`✓ Created ${samplePatients.length} sample patients`);
      console.log('✓ Database will be automatically created in MongoDB Atlas');
    } else {
      console.log(`✓ Found ${patientCount} existing patients in database`);
    }
    
    console.log('✅ Database initialization complete');
  } catch (error) {
    console.log('⚠️  Database initialization warning:', error.message);
    // Don't exit on initialization errors, just log them
    // Atlas will create the database when first document is inserted
  }
}

// Health check route
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const dbName = mongoose.connection.db?.databaseName || 'dental_db';
    
    let collections = [];
    let patientCount = 0;
    
    if (mongoose.connection.readyState === 1) {
      try {
        // Get collection information
        collections = await mongoose.connection.db.listCollections().toArray();
        
        // Get patient count if Patient model exists
        const Patient = require('./models/Patient');
        patientCount = await Patient.countDocuments();
      } catch (error) {
        console.log('Error getting database stats:', error.message);
      }
    }
    
    const healthData = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: dbStatus,
        name: dbName,
        collections: collections.map(col => col.name),
        patientCount: patientCount,
        connected: mongoose.connection.readyState === 1
      },
      environment: process.env.NODE_ENV || 'development',
      version: require('../package.json').version,
      endpoints: {
        health: '/health',
        api: '/api',
        patients: '/api/patients'
      }
    };

    res.status(200).json(healthData);
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message,
      database: {
        status: 'error',
        connected: false
      }
    });
  }
});

// Basic API routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Dental Intelligence Onboarding API',
    version: '2.0.0',
    features: [
      'Comprehensive Onboarding Tracker',
      'Custom Workflow Guides & Contextual Hints',
      'Role-based Access Control',
      'Real-time Notifications',
      'Audit Logging & Compliance',
      'Analytics & Reporting',
      'Template Management',
      'Document Management',
      'Health monitoring',
      'Patient management',
      'MongoDB integration',
      'Automatic database creation'
    ],
    endpoints: {
      health: '/health',
      documentation: '/api-docs',
      api: '/api',
      // Core onboarding features
      onboardingCases: {
        // Basic operations
        list: 'GET /api/onboarding-cases',
        create: 'POST /api/onboarding-cases',
        get: 'GET /api/onboarding-cases/:id',
        update: 'PUT /api/onboarding-cases/:id',
        delete: 'DELETE /api/onboarding-cases/:id',
        // Workflow operations
        assignTeam: 'POST /api/onboarding-cases/:id/assign-team',
        updateStatus: 'PUT /api/onboarding-cases/:id/status',
        dashboard: 'GET /api/onboarding-cases/dashboard/summary',
        progressReport: 'GET /api/onboarding-cases/:id/progress-report',
        sendReminders: 'POST /api/onboarding-cases/:id/send-reminders'
      },
      clients: {
        list: 'GET /api/clients',
        create: 'POST /api/clients',
        get: 'GET /api/clients/:id',
        update: 'PUT /api/clients/:id',
        delete: 'DELETE /api/clients/:id'
      },
      stages: {
        list: 'GET /api/stages',
        create: 'POST /api/stages',
        get: 'GET /api/stages/:id',
        update: 'PUT /api/stages/:id',
        delete: 'DELETE /api/stages/:id'
      },
      tasks: {
        // Basic operations
        list: 'GET /api/tasks',
        create: 'POST /api/tasks',
        get: 'GET /api/tasks/:id',
        update: 'PUT /api/tasks/:id',
        delete: 'DELETE /api/tasks/:id',
        // Workflow operations
        updateStatus: 'PUT /api/tasks/:id/status',
        myTasks: 'GET /api/tasks/user/:userId/my-tasks',
        assign: 'POST /api/tasks/:id/assign',
        addComment: 'POST /api/tasks/:id/comments',
        analytics: 'GET /api/tasks/analytics'
      },
      documents: {
        list: 'GET /api/documents',
        create: 'POST /api/documents',
        get: 'GET /api/documents/:id',
        update: 'PUT /api/documents/:id',
        delete: 'DELETE /api/documents/:id'
      },
      // Workflow guide features
      workflowGuides: {
        list: 'GET /api/workflow-guides',
        create: 'POST /api/workflow-guides',
        get: 'GET /api/workflow-guides/:id',
        update: 'PUT /api/workflow-guides/:id',
        delete: 'DELETE /api/workflow-guides/:id'
      },
      guideSteps: {
        // Basic operations
        list: 'GET /api/guide-steps',
        create: 'POST /api/guide-steps',
        get: 'GET /api/guide-steps/:id',
        update: 'PUT /api/guide-steps/:id',
        delete: 'DELETE /api/guide-steps/:id',
        // Contextual hints
        stageHints: 'GET /api/guide-steps/hints/stage/:stageId',
        taskHints: 'GET /api/guide-steps/hints/task/:taskId',
        markViewed: 'PUT /api/guide-steps/hints/:stepId/viewed',
        feedback: 'POST /api/guide-steps/hints/:stepId/feedback',
        caseSummary: 'GET /api/guide-steps/case/:caseId/summary',
        caseUsage: 'GET /api/guide-steps/case/:caseId/usage'
      },
      caseGuideLinks: {
        list: 'GET /api/case-guide-links',
        create: 'POST /api/case-guide-links',
        get: 'GET /api/case-guide-links/:id',
        update: 'PUT /api/case-guide-links/:id',
        delete: 'DELETE /api/case-guide-links/:id'
      },
      // System features
      notifications: {
        list: 'GET /api/notifications',
        create: 'POST /api/notifications',
        userNotifications: 'GET /api/notifications/user/:userId',
        markRead: 'PUT /api/notifications/:id/read',
        dismiss: 'PUT /api/notifications/:id/dismiss'
      },
      auditLogs: {
        list: 'GET /api/audit-logs',
        entity: 'GET /api/audit-logs/entity/:entityType/:entityId',
        securityAlerts: 'GET /api/audit-logs/security/alerts',
        complianceReport: 'GET /api/audit-logs/compliance/report'
      },
      templates: {
        list: 'GET /api/templates',
        create: 'POST /api/templates',
        clone: 'POST /api/templates/:id/clone',
        publish: 'PUT /api/templates/:id/publish',
        recommendations: 'GET /api/templates/recommendations'
      },
      analytics: {
        onboarding: 'GET /api/analytics/onboarding',
        tasks: 'GET /api/analytics/tasks',
        userPerformance: 'GET /api/analytics/users/:userId/performance',
        guides: 'GET /api/analytics/guides',
        dashboard: 'GET /api/analytics/dashboard'
      },
      // Legacy endpoints
      patients: {
        list: 'GET /api/patients',
        create: 'POST /api/patients',
        get: 'GET /api/patients/:id'
      },
      users: {
        list: 'GET /api/users',
        create: 'POST /api/users',
        get: 'GET /api/users/:id',
        authenticate: 'POST /api/users/auth/login'
      }
    },
    database: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      autoCreate: true
    },
    userRoles: {
      Admin: 'Full system access, can manage all onboarding cases and guides',
      Champion: 'Owns stages/tasks, can update status and manage assigned work',
      'Team Member': 'Can update assigned tasks and upload documents',
      'Senior Champion': 'Can create and manage workflow guides'
    }
  });
});

// API routes placeholder
app.get('/api', (req, res) => {
  res.json({
    message: 'Dental Intelligence Onboarding API is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    features: {
      onboardingTracker: 'Complete onboarding case management with stages and tasks',
      workflowGuides: 'Custom guides with contextual hints and tutorials',
      notifications: 'Real-time notifications for task assignments and updates',
      analytics: 'Comprehensive reporting and performance metrics',
      auditLogging: 'Full audit trail for compliance and security',
      templates: 'Reusable templates for onboarding processes',
      roleBasedAccess: 'Granular permissions for different user types'
    },
    endpoints: {
      // Core onboarding
      onboardingCases: '/api/onboarding-cases',
      clients: '/api/clients',
      stages: '/api/stages',
      tasks: '/api/tasks',
      documents: '/api/documents',
      // Workflow guides
      workflowGuides: '/api/workflow-guides',
      guideSteps: '/api/guide-steps',
      caseGuideLinks: '/api/case-guide-links',
      // System
      notifications: '/api/notifications',
      auditLogs: '/api/audit-logs',
      templates: '/api/templates',
      analytics: '/api/analytics',
      // Legacy
      patients: '/api/patients',
      users: '/api/users'
    },
    documentation: '/api-docs'
  });
});

// Patients API routes
app.get('/api/patients', async (req, res) => {
  try {
    const Patient = require('./models/Patient');
    const patients = await Patient.find().select('-__v').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/patients', async (req, res) => {
  try {
    const Patient = require('./models/Patient');
    const patient = new Patient(req.body);
    await patient.save();
    
    res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      data: patient
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        error: 'Patient with this email already exists'
      });
    } else {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
});

app.get('/api/patients/:id', async (req, res) => {
  try {
    const Patient = require('./models/Patient');
    const patient = await Patient.findById(req.params.id).select('-__v');
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }
    
    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Dental API server is running on port ${PORT}`);
  console.log(`Health check available at: http://localhost:${PORT}/health`);
});

module.exports = app;
