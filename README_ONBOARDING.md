# Dental Intelligence Onboarding API

A comprehensive Node.js API for managing client onboarding processes with advanced workflow guidance, notifications, and analytics.

## 🚀 Features

### ✅ Feature 1: Onboarding Tracker
- **Complete Case Management**: Track entire onboarding journey from start to finish
- **Stage-based Organization**: Logical grouping of tasks with dependencies
- **Task Assignment & Tracking**: Assign tasks to team members with due dates and progress tracking
- **Document Management**: Upload, organize, and track vital documents
- **Champion System**: Assign responsible champions for stages and cases
- **Progress Monitoring**: Real-time progress tracking with visual indicators
- **Compliance Support**: Built-in compliance flags and audit trails

### ✅ Feature 2: Custom Workflow Guides & Contextual Hints
- **Guide Creation**: Senior users can create custom workflow guides
- **Contextual Hints**: Pop-up hints and tutorials during task execution
- **Rich Content Support**: Text, links, videos, files, and multimedia
- **Conditional Display**: Show hints based on context and conditions
- **Analytics**: Track guide effectiveness and user engagement
- **Template System**: Reusable guide templates for different scenarios

### 🔧 Additional Features
- **Role-based Access Control**: Admin, Champion, Team Member, Senior Champion roles
- **Real-time Notifications**: Email, in-app, SMS, and push notifications
- **Comprehensive Analytics**: Performance metrics and reporting
- **Audit Logging**: Full compliance-ready audit trails
- **Template Management**: Reusable onboarding templates
- **REST API**: Complete RESTful API with Swagger documentation

## 🏗️ Architecture

### Core Entities
- **OnboardingCase**: Main tracking entity for client onboarding
- **Client**: Client information and practice details
- **Stage**: Logical grouping of tasks (Initial Contact, Credentialing, etc.)
- **Task**: Individual actionable items with assignments and deadlines
- **Document**: File management with security and compliance features
- **User**: Team members with role-based permissions

### Workflow Guide Entities
- **WorkflowGuide**: Custom guides with metadata and targeting
- **GuideStep**: Individual steps with rich content and conditions
- **CaseGuideLink**: Links guides to specific onboarding cases

### System Entities
- **Notification**: Multi-channel notification system
- **AuditLog**: Comprehensive audit and compliance logging
- **Template**: Reusable templates for onboarding processes

## 🚦 User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access, create/manage all onboarding cases, assign tasks, attach guides, oversee all progress |
| **Champion** | Own stages/tasks, update status, upload/view documents, add notes, manage assigned work |
| **Team Member** | Update assigned tasks, upload documents, add notes for own work |
| **Senior Champion** | All Champion permissions + create and assign Workflow Guides |

## 📊 API Endpoints

### Core Onboarding
- `GET /api/onboarding-cases` - List all onboarding cases
- `POST /api/onboarding-cases` - Create new onboarding case
- `GET /api/onboarding-cases/:id` - Get case details
- `PUT /api/onboarding-cases/:id` - Update case
- `DELETE /api/onboarding-cases/:id` - Delete case

### Clients
- `GET /api/clients` - List clients
- `POST /api/clients` - Create client
- `GET /api/clients/:id` - Get client details
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Stages & Tasks
- `GET /api/stages` - List stages
- `POST /api/stages` - Create stage
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task

### Documents
- `GET /api/documents` - List documents
- `POST /api/documents` - Upload document
- `GET /api/documents/:id` - Get document details
- `PUT /api/documents/:id` - Update document metadata

### Workflow Guides
- `GET /api/workflow-guides` - List guides
- `POST /api/workflow-guides` - Create guide (Senior Champion+)
- `GET /api/guide-steps` - List guide steps
- `POST /api/case-guide-links` - Assign guide to case

### Notifications
- `GET /api/notifications/user/:userId` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/:id/dismiss` - Dismiss notification

### Analytics
- `GET /api/analytics/onboarding` - Onboarding performance metrics
- `GET /api/analytics/tasks` - Task completion analytics
- `GET /api/analytics/users/:userId/performance` - User performance
- `GET /api/analytics/dashboard` - Dashboard summary

### Templates
- `GET /api/templates` - List templates
- `POST /api/templates` - Create template
- `POST /api/templates/:id/clone` - Clone template
- `GET /api/templates/recommendations` - Get recommended templates

### System
- `GET /api/audit-logs` - Audit trail (Admin only)
- `GET /api/audit-logs/security/alerts` - Security alerts
- `GET /api/audit-logs/compliance/report` - Compliance reporting

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 16+
- MongoDB (Atlas or local)
- Docker (optional)

### Environment Variables
Create a `.env` file:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
DB_NAME=dental_onboarding
NODE_ENV=development
JWT_SECRET=your_jwt_secret
```

### Running the Application

#### Local Development
```bash
npm install
npm start
```

#### With Docker
```bash
docker build -t dental-api .
docker run -p 3000:3000 dental-api
```

#### Using PM2 (Production)
```bash
npm install -g pm2
pm2 start src/app.js --name dental-api
```

## 📖 API Documentation

Interactive API documentation is available at:
- **Swagger UI**: `http://localhost:3000/api-docs`
- **Health Check**: `http://localhost:3000/health`
- **API Overview**: `http://localhost:3000/api`

## 🔒 Security & Compliance

### Security Features
- Role-based access control (RBAC)
- Encrypted document storage
- Full audit logging
- Input validation and sanitization
- Rate limiting and DDoS protection

### Compliance Support
- HIPAA compliance for medical data
- SOX compliance for business records
- GDPR compliance for personal data
- Configurable data retention policies
- Audit trail with tamper detection

## 📈 Analytics & Reporting

### Available Metrics
- **Onboarding Performance**: Completion rates, average times, success metrics
- **Task Analytics**: Task completion rates, overdue tracking, performance by user
- **User Performance**: Individual productivity metrics and workload analysis
- **Guide Effectiveness**: Guide usage, ratings, and improvement suggestions
- **System Health**: API performance, error rates, resource utilization

### Dashboard Features
- Real-time progress tracking
- Visual progress indicators
- Gantt-style timeline views
- Customizable alerts and notifications
- Executive summary reports

## 🔄 Workflow Examples

### Creating an Onboarding Case
1. Admin creates new client
2. Admin creates onboarding case for client
3. Admin defines stages and tasks
4. Admin assigns champion and team members
5. Admin attaches relevant workflow guides
6. Team executes tasks with guided assistance
7. System tracks progress and sends notifications
8. Admin monitors completion and generates reports

### Custom Workflow Guide Creation
1. Senior Champion identifies need for custom guidance
2. Creates new workflow guide with steps
3. Adds contextual hints for specific tasks/stages
4. Tests guide with sample case
5. Publishes guide for team use
6. Assigns guide to relevant onboarding cases
7. Monitors guide effectiveness through analytics

## 🚀 Deployment

### GitHub Actions CI/CD
Automated deployment pipeline included:
- Build and test on push
- Deploy to DigitalOcean droplet
- Health checks and rollback capability
- Environment-specific configurations

### Production Considerations
- Use PM2 for process management
- Configure MongoDB Atlas for production
- Set up proper environment variables
- Enable monitoring and alerting
- Configure backup strategies

## 📝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Update documentation
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Check the API documentation at `/api-docs`
- Review the health endpoint at `/health`
- Check system logs and audit trails
- Contact the development team

---

**Version**: 2.0.0  
**Last Updated**: July 31, 2025  
**API Status**: Production Ready
