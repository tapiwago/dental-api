const express = require('express');
const router = express.Router();
const guideStepController = require('../controllers/guideStepController');

/**
 * @swagger
 * components:
 *   schemas:
 *     GuideStep:
 *       type: object
 *       required:
 *         - guideId
 *         - title
 *         - content
 *       properties:
 *         guideId:
 *           type: string
 *           description: Associated workflow guide ID
 *         title:
 *           type: string
 *           description: Step title
 *         content:
 *           type: string
 *           description: Step content (HTML/Markdown)
 *         sequence:
 *           type: integer
 *           description: Step order in the guide
 *         referenceType:
 *           type: string
 *           enum: [Stage, Task, General]
 *           description: What this step references
 *         stageOrTaskRef:
 *           type: string
 *           description: Stage or Task ID if applicable
 *         isActive:
 *           type: boolean
 *           description: Whether this step is active
 *         viewCount:
 *           type: integer
 *           description: Number of times viewed
 *         helpfulVotes:
 *           type: integer
 *           description: Number of helpful votes
 *         notHelpfulVotes:
 *           type: integer
 *           description: Number of not helpful votes
 */

/**
 * @swagger
 * /api/guide-steps:
 *   post:
 *     summary: Create a new guide step
 *     tags: [Guide Steps]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GuideStep'
 *     responses:
 *       201:
 *         description: Guide step created successfully
 *       400:
 *         description: Bad request
 */
router.post('/', guideStepController.create);

/**
 * @swagger
 * /api/guide-steps:
 *   get:
 *     summary: Get all guide steps with filtering
 *     tags: [Guide Steps]
 *     parameters:
 *       - in: query
 *         name: guideId
 *         schema:
 *           type: string
 *         description: Filter by guide ID
 *       - in: query
 *         name: referenceType
 *         schema:
 *           type: string
 *           enum: [Stage, Task, General]
 *         description: Filter by reference type
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of guide steps
 */
router.get('/', guideStepController.getAll);

/**
 * @swagger
 * /api/guide-steps/{id}:
 *   get:
 *     summary: Get guide step by ID
 *     tags: [Guide Steps]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Guide step ID
 *     responses:
 *       200:
 *         description: Guide step details
 *       404:
 *         description: Guide step not found
 */
router.get('/:id', guideStepController.getById);

/**
 * @swagger
 * /api/guide-steps/{id}:
 *   put:
 *     summary: Update guide step
 *     tags: [Guide Steps]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Guide step ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GuideStep'
 *     responses:
 *       200:
 *         description: Guide step updated successfully
 *       404:
 *         description: Guide step not found
 */
router.put('/:id', guideStepController.update);

/**
 * @swagger
 * /api/guide-steps/{id}:
 *   delete:
 *     summary: Delete guide step
 *     tags: [Guide Steps]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Guide step ID
 *     responses:
 *       200:
 *         description: Guide step deleted successfully
 *       404:
 *         description: Guide step not found
 */
router.delete('/:id', guideStepController.delete);

/**
 * @swagger
 * /api/guide-steps/hints/stage/{stageId}:
 *   get:
 *     summary: Get contextual hints for a specific stage
 *     tags: [Guide Steps - Contextual Hints]
 *     parameters:
 *       - in: path
 *         name: stageId
 *         required: true
 *         schema:
 *           type: string
 *         description: Stage ID
 *       - in: query
 *         name: caseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Onboarding case ID
 *     responses:
 *       200:
 *         description: Contextual hints for the stage
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stageId:
 *                   type: string
 *                 hintsCount:
 *                   type: integer
 *                 hints:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/GuideStep'
 *                       - type: object
 *                         properties:
 *                           guideTitle:
 *                             type: string
 *                           guidePriority:
 *                             type: string
 */
router.get('/hints/stage/:stageId', guideStepController.getStageHints);

/**
 * @swagger
 * /api/guide-steps/hints/task/{taskId}:
 *   get:
 *     summary: Get contextual hints for a specific task
 *     tags: [Guide Steps - Contextual Hints]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *       - in: query
 *         name: caseId
 *         schema:
 *           type: string
 *         description: Onboarding case ID (optional if task contains case reference)
 *     responses:
 *       200:
 *         description: Contextual hints for the task
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 taskId:
 *                   type: string
 *                 taskName:
 *                   type: string
 *                 hintsCount:
 *                   type: integer
 *                 hints:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/GuideStep'
 *                       - type: object
 *                         properties:
 *                           guideTitle:
 *                             type: string
 *                           guidePriority:
 *                             type: string
 *       404:
 *         description: Task not found
 */
router.get('/hints/task/:taskId', guideStepController.getTaskHints);

/**
 * @swagger
 * /api/guide-steps/hints/{stepId}/viewed:
 *   put:
 *     summary: Mark a hint as viewed by user
 *     tags: [Guide Steps - Contextual Hints]
 *     parameters:
 *       - in: path
 *         name: stepId
 *         required: true
 *         schema:
 *           type: string
 *         description: Guide step ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of user viewing the hint
 *     responses:
 *       200:
 *         description: Hint marked as viewed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 viewCount:
 *                   type: integer
 *       404:
 *         description: Guide step not found
 */
router.put('/hints/:stepId/viewed', guideStepController.markHintViewed);

/**
 * @swagger
 * /api/guide-steps/hints/{stepId}/feedback:
 *   post:
 *     summary: Submit feedback on a hint
 *     tags: [Guide Steps - Contextual Hints]
 *     parameters:
 *       - in: path
 *         name: stepId
 *         required: true
 *         schema:
 *           type: string
 *         description: Guide step ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of user providing feedback
 *               helpful:
 *                 type: boolean
 *                 description: Whether the hint was helpful
 *               comment:
 *                 type: string
 *                 description: Optional detailed feedback
 *     responses:
 *       200:
 *         description: Feedback submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 helpfulVotes:
 *                   type: integer
 *                 notHelpfulVotes:
 *                   type: integer
 *       404:
 *         description: Guide step not found
 */
router.post('/hints/:stepId/feedback', guideStepController.submitHintFeedback);

/**
 * @swagger
 * /api/guide-steps/case/{caseId}/summary:
 *   get:
 *     summary: Get hints dashboard for case overview
 *     tags: [Guide Steps - Analytics]
 *     parameters:
 *       - in: path
 *         name: caseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Onboarding case ID
 *     responses:
 *       200:
 *         description: Case hints summary with counts per stage/task
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 caseId:
 *                   type: string
 *                 clientName:
 *                   type: string
 *                 linkedGuides:
 *                   type: integer
 *                 totalHints:
 *                   type: integer
 *                 stages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       hintsCount:
 *                         type: integer
 *                 tasks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       hintsCount:
 *                         type: integer
 *       404:
 *         description: Case not found
 */
router.get('/case/:caseId/summary', guideStepController.getCaseHintsSummary);

/**
 * @swagger
 * /api/guide-steps/case/{caseId}/usage:
 *   get:
 *     summary: Get guide usage analytics for a case
 *     tags: [Guide Steps - Analytics]
 *     parameters:
 *       - in: path
 *         name: caseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Onboarding case ID
 *     responses:
 *       200:
 *         description: Guide usage analytics and effectiveness metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 caseId:
 *                   type: string
 *                 guides:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       guide:
 *                         type: object
 *                       linkStatus:
 *                         type: string
 *                       completionRate:
 *                         type: string
 *                       totalViews:
 *                         type: integer
 *                       avgStepRating:
 *                         type: string
 *       404:
 *         description: Case not found
 */
router.get('/case/:caseId/usage', guideStepController.getGuideUsageForCase);

module.exports = router;
