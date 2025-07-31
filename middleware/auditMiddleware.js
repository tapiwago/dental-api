const AuditLog = require('../models/AuditLog');
const { v4: uuidv4 } = require('uuid');

/**
 * Middleware to automatically log all API actions for audit purposes
 */
const auditMiddleware = (options = {}) => {
  return async (req, res, next) => {
    const startTime = Date.now();
    
    // Store original res.json to capture response
    const originalJson = res.json;
    let responseData = null;
    
    res.json = function(data) {
      responseData = data;
      return originalJson.call(this, data);
    };
    
    // Continue with request
    next();
    
    // Log after response is sent
    res.on('finish', async () => {
      try {
        // Skip audit logging for certain routes if specified
        if (options.skipRoutes && options.skipRoutes.some(route => req.path.includes(route))) {
          return;
        }
        
        // Extract entity information from request
        const { entityType, action } = extractEntityInfo(req);
        
        if (!entityType || !action) return; // Skip if we can't determine entity type
        
        const auditData = {
          logId: uuidv4(),
          action,
          entityType,
          entityId: req.params.id || 'unknown',
          userId: req.user?.id || req.body?.userId || req.query?.userId,
          userEmail: req.user?.email,
          userRole: req.user?.role,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent'),
          sessionId: req.sessionID,
          requestId: req.get('X-Request-ID') || uuidv4(),
          description: `${action} ${entityType}${req.params.id ? ` with ID ${req.params.id}` : ''}`,
          metadata: {
            requestMethod: req.method,
            requestUrl: req.originalUrl,
            responseStatus: res.statusCode,
            duration: Date.now() - startTime,
            dataSize: JSON.stringify(responseData || {}).length
          },
          riskLevel: determineRiskLevel(req, res),
          category: 'Business',
          complianceFlags: determineComplianceFlags(req, entityType)
        };
        
        // Add change tracking for UPDATE operations
        if (action === 'UPDATE' && req.body) {
          auditData.changes = Object.keys(req.body).map(field => ({
            field,
            newValue: req.body[field],
            oldValue: null // Would need to fetch old value from DB
          }));
        }
        
        await AuditLog.create(auditData);
      } catch (error) {
        console.error('Audit logging failed:', error);
        // Don't fail the request if audit logging fails
      }
    });
  };
};

/**
 * Extract entity type and action from request
 */
function extractEntityInfo(req) {
  const path = req.path.toLowerCase();
  const method = req.method.toUpperCase();
  
  // Map URL paths to entity types
  const entityMap = {
    'onboarding-cases': 'OnboardingCase',
    'clients': 'Client',
    'stages': 'Stage',
    'tasks': 'Task',
    'documents': 'Document',
    'workflow-guides': 'WorkflowGuide',
    'guide-steps': 'GuideStep',
    'case-guide-links': 'CaseGuideLink',
    'users': 'User',
    'notifications': 'Notification',
    'templates': 'Template'
  };
  
  // Find entity type from path
  let entityType = null;
  for (const [pathSegment, entity] of Object.entries(entityMap)) {
    if (path.includes(pathSegment)) {
      entityType = entity;
      break;
    }
  }
  
  // Map HTTP methods to actions
  const actionMap = {
    'GET': 'VIEW',
    'POST': 'CREATE',
    'PUT': 'UPDATE',
    'PATCH': 'UPDATE',
    'DELETE': 'DELETE'
  };
  
  const action = actionMap[method];
  
  return { entityType, action };
}

/**
 * Determine risk level based on request characteristics
 */
function determineRiskLevel(req, res) {
  // High risk scenarios
  if (res.statusCode >= 400) return 'High';
  if (req.method === 'DELETE') return 'Medium';
  if (req.path.includes('admin') || req.path.includes('sensitive')) return 'High';
  if (req.user?.role === 'Admin') return 'Medium';
  
  return 'Low';
}

/**
 * Determine compliance flags based on entity type and action
 */
function determineComplianceFlags(req, entityType) {
  const flags = [];
  
  // HIPAA compliance for medical data
  if (['Client', 'OnboardingCase', 'Document'].includes(entityType)) {
    flags.push('HIPAA');
  }
  
  // SOX compliance for financial or business records
  if (['AuditLog', 'Template'].includes(entityType)) {
    flags.push('SOX');
  }
  
  // GDPR for personal data
  if (['User', 'Client'].includes(entityType)) {
    flags.push('GDPR');
  }
  
  return flags;
}

module.exports = auditMiddleware;
