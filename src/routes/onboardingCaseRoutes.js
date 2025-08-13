const express = require('express');
const router = express.Router();
const controller = require('../../controllers/onboardingCaseController');

/**
 * @swagger
 * components:
 *   schemas:
 *     OnboardingCase:
 *       type: object
 *       required:
 *         - title
 *         - clientId
 *       properties:
 *         title:
 *           type: string
 *           description: Case title
 *         description:
 *           type: string
 *           description: Case description
 *         clientId:
 *           type: string
 *           description: Client ID
 *         status:
 *           type: string
 *           enum: [Planning, In Progress, Completed, On Hold]
 *           description: Case status
 *         priority:
 *           type: string
 *           enum: [Critical, High, Medium, Low]
 *           description: Case priority
 *         assignedTeam:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of assigned team member IDs
 *         expectedCompletionDate:
 *           type: string
 *           format: date
 *           description: Expected completion date
 */

/**
 * @swagger
 * /api/onboarding-cases:
 *   post:
 *     summary: Create a new onboarding case
 *     tags: [Onboarding Cases]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OnboardingCase'
 *     responses:
 *       201:
 *         description: Case created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/OnboardingCase'
 *       400:
 *         description: Bad request
 */
router.post('/', controller.create);

/**
 * @swagger
 * /api/onboarding-cases:
 *   get:
 *     summary: Get all onboarding cases with filtering and pagination
 *     tags: [Onboarding Cases]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Planning, In Progress, Completed, On Hold]
 *         description: Filter by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [Critical, High, Medium, Low]
 *         description: Filter by priority
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *         description: Filter by client ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of onboarding cases
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OnboardingCase'
 *                 pagination:
 *                   type: object
 */
router.get('/', controller.getAll);

/**
 * @swagger
 * /api/onboarding-cases/{id}:
 *   get:
 *     summary: Get onboarding case by ID with full details
 *     tags: [Onboarding Cases]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Case ID
 *     responses:
 *       200:
 *         description: Case details with stages, tasks, and documents
 *       404:
 *         description: Case not found
 */
router.get('/:id', controller.getById);

/**
 * @swagger
 * /api/onboarding-cases/{id}:
 *   put:
 *     summary: Update onboarding case
 *     tags: [Onboarding Cases]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Case ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OnboardingCase'
 *     responses:
 *       200:
 *         description: Case updated successfully
 *       404:
 *         description: Case not found
 */
router.put('/:id', controller.update);

/**
 * @swagger
 * /api/onboarding-cases/{id}:
 *   delete:
 *     summary: Delete onboarding case
 *     tags: [Onboarding Cases]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Case ID
 *     responses:
 *       200:
 *         description: Case deleted successfully
 *       404:
 *         description: Case not found
 */
router.delete('/:id', controller.delete);

/**
 * @swagger
 * /api/onboarding-cases/{id}/assign-team:
 *   post:
 *     summary: Assign team members to a case
 *     tags: [Onboarding Cases - Workflow]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Case ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               teamMemberIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of team member IDs to assign
 *               assignedBy:
 *                 type: string
 *                 description: ID of user making the assignment
 *     responses:
 *       200:
 *         description: Team assigned successfully
 *       404:
 *         description: Case not found
 */
router.post('/:id/assign-team', controller.assignTeam);

/**
 * @swagger
 * /api/onboarding-cases/{id}/status:
 *   put:
 *     summary: Update case status with notifications
 *     tags: [Onboarding Cases - Workflow]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Case ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Planning, In Progress, Completed, On Hold]
 *                 description: New status
 *               updatedBy:
 *                 type: string
 *                 description: ID of user updating status
 *               comments:
 *                 type: string
 *                 description: Optional comments about status change
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       404:
 *         description: Case not found
 */
router.put('/:id/status', controller.updateStatus);

/**
 * @swagger
 * /api/onboarding-cases/dashboard/summary:
 *   get:
 *     summary: Get admin dashboard summary
 *     tags: [Onboarding Cases - Analytics]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: User ID for role-specific data
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [Admin, Champion, Team Member, Senior Champion]
 *         description: User role
 *     responses:
 *       200:
 *         description: Dashboard summary with metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         byStatus:
 *                           type: object
 *                         byPriority:
 *                           type: object
 *                         overdue:
 *                           type: integer
 *                     recentCases:
 *                       type: array
 *                     overdueCases:
 *                       type: array
 */
router.get('/dashboard/summary', controller.getDashboard);

/**
 * @swagger
 * /api/onboarding-cases/{id}/progress-report:
 *   get:
 *     summary: Get detailed progress report for a case
 *     tags: [Onboarding Cases - Analytics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Case ID
 *     responses:
 *       200:
 *         description: Detailed progress report
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     case:
 *                       $ref: '#/components/schemas/OnboardingCase'
 *                     progress:
 *                       type: object
 *                     timeline:
 *                       type: array
 *                     estimates:
 *                       type: object
 *       404:
 *         description: Case not found
 */
router.get('/:id/progress-report', controller.getProgressReport);

/**
 * @swagger
 * /api/onboarding-cases/{id}/send-reminders:
 *   post:
 *     summary: Send reminder notifications for overdue tasks
 *     tags: [Onboarding Cases - Workflow]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Case ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reminderType:
 *                 type: string
 *                 default: overdue
 *                 description: Type of reminder to send
 *               userId:
 *                 type: string
 *                 description: ID of user sending reminders
 *     responses:
 *       200:
 *         description: Reminders sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     overdueTasksCount:
 *                       type: integer
 *                     remindersSent:
 *                       type: integer
 */
router.post('/:id/send-reminders', controller.sendReminders);

/**
 * @swagger
 * /api/onboarding-cases/migrate-workflow-types:
 *   post:
 *     summary: Migrate cases to ensure all have workflow types
 *     tags: [OnboardingCases]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               adminId:
 *                 type: string
 *                 description: Admin user ID for audit logging
 *     responses:
 *       200:
 *         description: Migration completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     casesUpdated:
 *                       type: integer
 *                     defaultWorkflowType:
 *                       type: string
 */
router.post('/migrate-workflow-types', controller.migrateWorkflowTypes);

module.exports = router;
