const express = require('express');
const router = express.Router();
const controller = require('../../controllers/templateController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Template:
 *       type: object
 *       required:
 *         - name
 *         - type
 *         - createdBy
 *       properties:
 *         templateId:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         type:
 *           type: string
 *           enum: [OnboardingCase, Stage, Task, WorkflowGuide]
 *         industryType:
 *           type: string
 *           enum: [Dental, Medical, Veterinary, General]
 *         status:
 *           type: string
 *           enum: [Draft, Published, Deprecated, Archived]
 *         isDefault:
 *           type: boolean
 */

/**
 * @swagger
 * /api/templates:
 *   post:
 *     summary: Create a new template
 *     tags: [Templates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Template'
 *     responses:
 *       201:
 *         description: Template created successfully
 */
router.post('/', controller.create);

/**
 * @swagger
 * /api/templates:
 *   get:
 *     summary: Get all templates with filtering
 *     tags: [Templates]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: industryType
 *         schema:
 *           type: string
 *       - in: query
 *         name: isDefault
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of templates
 */
router.get('/', controller.getAll);

/**
 * @swagger
 * /api/templates/{id}:
 *   get:
 *     summary: Get template by ID
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Template details
 */
router.get('/:id', controller.getById);

/**
 * @swagger
 * /api/templates/{id}:
 *   put:
 *     summary: Update template
 *     tags: [Templates]
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
 *             $ref: '#/components/schemas/Template'
 *     responses:
 *       200:
 *         description: Template updated successfully
 */
router.put('/:id', controller.update);

/**
 * @swagger
 * /api/templates/{id}/clone:
 *   post:
 *     summary: Clone an existing template
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               createdBy:
 *                 type: string
 *     responses:
 *       201:
 *         description: Template cloned successfully
 */
router.post('/:id/clone', controller.clone);

/**
 * @swagger
 * /api/templates/{id}/publish:
 *   put:
 *     summary: Publish a template
 *     tags: [Templates]
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
 *               approvedBy:
 *                 type: string
 *     responses:
 *       200:
 *         description: Template published successfully
 */
router.put('/:id/publish', controller.publish);

/**
 * @swagger
 * /api/templates/{id}/set-default:
 *   put:
 *     summary: Set template as default for its type
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Template set as default
 */
router.put('/:id/set-default', controller.setAsDefault);

/**
 * @swagger
 * /api/templates/recommendations:
 *   get:
 *     summary: Get template recommendations
 *     tags: [Templates]
 *     parameters:
 *       - in: query
 *         name: industryType
 *         schema:
 *           type: string
 *       - in: query
 *         name: clientSize
 *         schema:
 *           type: string
 *       - in: query
 *         name: complexity
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recommended templates
 */
router.get('/recommendations', controller.getRecommendations);

/**
 * @swagger
 * /api/templates/{id}/usage:
 *   put:
 *     summary: Update template usage statistics
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *               completionTime:
 *                 type: number
 *     responses:
 *       200:
 *         description: Usage statistics updated
 */
router.put('/:id/usage', controller.updateUsageStats);

/**
 * @swagger
 * /api/templates/{id}:
 *   delete:
 *     summary: Delete a template
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Template deleted
 */
router.delete('/:id', controller.delete);

module.exports = router;
