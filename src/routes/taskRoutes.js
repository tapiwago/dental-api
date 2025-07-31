const express = require('express');
const router = express.Router();
const controller = require('../../controllers/taskController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - name
 *         - onboardingCaseId
 *       properties:
 *         name:
 *           type: string
 *           description: Task name
 *         description:
 *           type: string
 *           description: Task description
 *         onboardingCaseId:
 *           type: string
 *           description: Associated onboarding case ID
 *         stageId:
 *           type: string
 *           description: Associated stage ID
 *         assignedTo:
 *           type: string
 *           description: Assigned user ID
 *         status:
 *           type: string
 *           enum: [Not Started, In Progress, Completed, On Hold]
 *           description: Task status
 *         priority:
 *           type: string
 *           enum: [Critical, High, Medium, Low]
 *           description: Task priority
 *         dueDate:
 *           type: string
 *           format: date
 *           description: Due date
 *         estimatedDuration:
 *           type: number
 *           description: Estimated duration in hours
 */

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Bad request
 */
router.post('/', controller.create);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks with filtering and pagination
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Not Started, In Progress, Completed, On Hold]
 *         description: Filter by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [Critical, High, Medium, Low]
 *         description: Filter by priority
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *         description: Filter by assigned user ID
 *       - in: query
 *         name: onboardingCaseId
 *         schema:
 *           type: string
 *         description: Filter by case ID
 *       - in: query
 *         name: overdue
 *         schema:
 *           type: boolean
 *         description: Filter overdue tasks
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
 *         description: List of tasks with pagination
 */
router.get('/', controller.getAll);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get task by ID with documents
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task details with associated documents
 *       404:
 *         description: Task not found
 */
router.get('/:id', controller.getById);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       404:
 *         description: Task not found
 */
router.put('/:id', controller.update);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 */
router.delete('/:id', controller.delete);

/**
 * @swagger
 * /api/tasks/{id}/status:
 *   put:
 *     summary: Update task status (Champion workflow)
 *     tags: [Tasks - Workflow]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Not Started, In Progress, Completed, On Hold]
 *                 description: New task status
 *               updatedBy:
 *                 type: string
 *                 description: ID of user updating status
 *               comments:
 *                 type: string
 *                 description: Optional comments about status change
 *               timeSpent:
 *                 type: number
 *                 description: Time spent on task in hours
 *     responses:
 *       200:
 *         description: Task status updated successfully
 *       403:
 *         description: User not assigned to this task
 *       404:
 *         description: Task not found
 */
router.put('/:id/status', controller.updateStatus);

/**
 * @swagger
 * /api/tasks/user/{userId}/my-tasks:
 *   get:
 *     summary: Get tasks assigned to a specific user
 *     tags: [Tasks - Workflow]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Not Started, In Progress, Completed, On Hold]
 *         description: Filter by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [Critical, High, Medium, Low]
 *         description: Filter by priority
 *       - in: query
 *         name: overdue
 *         schema:
 *           type: boolean
 *         description: Show only overdue tasks
 *     responses:
 *       200:
 *         description: User's assigned tasks grouped by status
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
 *                     total:
 *                       type: integer
 *                     overdue:
 *                       type: integer
 *                     byStatus:
 *                       type: object
 *                     tasks:
 *                       type: array
 */
router.get('/user/:userId/my-tasks', controller.getMyTasks);

/**
 * @swagger
 * /api/tasks/{id}/assign:
 *   post:
 *     summary: Assign task to a user
 *     tags: [Tasks - Workflow]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               assignedTo:
 *                 type: string
 *                 description: User ID to assign task to
 *               assignedBy:
 *                 type: string
 *                 description: ID of user making the assignment
 *               priority:
 *                 type: string
 *                 enum: [Critical, High, Medium, Low]
 *                 description: Task priority
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Due date
 *     responses:
 *       200:
 *         description: Task assigned successfully
 *       404:
 *         description: Task not found
 */
router.post('/:id/assign', controller.assignTask);

/**
 * @swagger
 * /api/tasks/{id}/comments:
 *   post:
 *     summary: Add comment to a task
 *     tags: [Tasks - Workflow]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *                 description: Comment text
 *               userId:
 *                 type: string
 *                 description: ID of user adding comment
 *     responses:
 *       200:
 *         description: Comment added successfully
 *       404:
 *         description: Task not found
 */
router.post('/:id/comments', controller.addComment);

/**
 * @swagger
 * /api/tasks/analytics:
 *   get:
 *     summary: Get task analytics and metrics
 *     tags: [Tasks - Analytics]
 *     parameters:
 *       - in: query
 *         name: caseId
 *         schema:
 *           type: string
 *         description: Filter by case ID
 *       - in: query
 *         name: stageId
 *         schema:
 *           type: string
 *         description: Filter by stage ID
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *     responses:
 *       200:
 *         description: Task analytics and performance metrics
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
 *                     total:
 *                       type: integer
 *                     byStatus:
 *                       type: object
 *                     byPriority:
 *                       type: object
 *                     overdue:
 *                       type: integer
 *                     completionRate:
 *                       type: number
 *                     avgTimeToComplete:
 *                       type: number
 */
router.get('/analytics', controller.getTaskAnalytics);

module.exports = router;
