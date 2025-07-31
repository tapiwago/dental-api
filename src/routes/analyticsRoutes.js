const express = require('express');
const router = express.Router();
const controller = require('../../controllers/analyticsController');

/**
 * @swagger
 * /api/analytics/onboarding:
 *   get:
 *     summary: Get onboarding case analytics
 *     tags: [Analytics]
 *     parameters:
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
 *       - in: query
 *         name: championId
 *         schema:
 *           type: string
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Onboarding analytics data
 */
router.get('/onboarding', controller.getOnboardingAnalytics);

/**
 * @swagger
 * /api/analytics/tasks:
 *   get:
 *     summary: Get task performance analytics
 *     tags: [Analytics]
 *     parameters:
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
 *       - in: query
 *         name: championId
 *         schema:
 *           type: string
 *       - in: query
 *         name: stageId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task analytics data
 */
router.get('/tasks', controller.getTaskAnalytics);

/**
 * @swagger
 * /api/analytics/users/{userId}/performance:
 *   get:
 *     summary: Get user performance analytics
 *     tags: [Analytics]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
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
 *         description: User performance data
 */
router.get('/users/:userId/performance', controller.getUserPerformance);

/**
 * @swagger
 * /api/analytics/guides:
 *   get:
 *     summary: Get workflow guide effectiveness analytics
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: industryType
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Guide analytics data
 */
router.get('/guides', controller.getGuideAnalytics);

/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     summary: Get dashboard summary for user
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dashboard summary data
 */
router.get('/dashboard', controller.getDashboardSummary);

module.exports = router;
