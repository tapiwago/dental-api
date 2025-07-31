const express = require('express');
const router = express.Router();
const controller = require('../../controllers/auditLogController');

/**
 * @swagger
 * components:
 *   schemas:
 *     AuditLog:
 *       type: object
 *       required:
 *         - action
 *         - entityType
 *         - entityId
 *         - userId
 *       properties:
 *         logId:
 *           type: string
 *         action:
 *           type: string
 *           enum: [CREATE, UPDATE, DELETE, VIEW, LOGIN, LOGOUT]
 *         entityType:
 *           type: string
 *           enum: [OnboardingCase, Task, Stage, Document, WorkflowGuide, User, Client]
 *         entityId:
 *           type: string
 *         userId:
 *           type: string
 *         riskLevel:
 *           type: string
 *           enum: [Low, Medium, High, Critical]
 */

/**
 * @swagger
 * /api/audit-logs:
 *   post:
 *     summary: Create an audit log entry
 *     tags: [Audit Logs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuditLog'
 *     responses:
 *       201:
 *         description: Audit log created successfully
 */
router.post('/', controller.create);

/**
 * @swagger
 * /api/audit-logs:
 *   get:
 *     summary: Get audit logs with filtering
 *     tags: [Audit Logs]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: entityType
 *         schema:
 *           type: string
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *       - in: query
 *         name: riskLevel
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: List of audit logs
 */
router.get('/', controller.getAll);

/**
 * @swagger
 * /api/audit-logs/{id}:
 *   get:
 *     summary: Get audit log by ID
 *     tags: [Audit Logs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Audit log details
 */
router.get('/:id', controller.getById);

/**
 * @swagger
 * /api/audit-logs/entity/{entityType}/{entityId}:
 *   get:
 *     summary: Get audit logs for a specific entity
 *     tags: [Audit Logs]
 *     parameters:
 *       - in: path
 *         name: entityType
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Entity audit logs
 */
router.get('/entity/:entityType/:entityId', controller.getByEntity);

/**
 * @swagger
 * /api/audit-logs/{id}/review:
 *   put:
 *     summary: Mark audit log as reviewed
 *     tags: [Audit Logs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reviewedBy:
 *                 type: string
 *               reviewNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Audit log marked as reviewed
 */
router.put('/:id/review', controller.markAsReviewed);

/**
 * @swagger
 * /api/audit-logs/security/alerts:
 *   get:
 *     summary: Get security alerts (high/critical risk audit logs)
 *     tags: [Audit Logs]
 *     responses:
 *       200:
 *         description: Security alerts
 */
router.get('/security/alerts', controller.getSecurityAlerts);

/**
 * @swagger
 * /api/audit-logs/compliance/report:
 *   get:
 *     summary: Get compliance report
 *     tags: [Audit Logs]
 *     parameters:
 *       - in: query
 *         name: complianceFlag
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Compliance report with statistics
 */
router.get('/compliance/report', controller.getComplianceReport);

module.exports = router;
