const express = require('express');
const router = express.Router();
const controller = require('../../controllers/workflowTypeController');

/**
 * @swagger
 * components:
 *   schemas:
 *     WorkflowType:
 *       type: object
 *       required:
 *         - name
 *         - prefix
 *       properties:
 *         name:
 *           type: string
 *           description: The workflow type name
 *           example: "Onboarding"
 *         prefix:
 *           type: string
 *           description: The prefix for case IDs (max 3 characters)
 *           example: "OB"
 *         description:
 *           type: string
 *           description: Description of the workflow type
 *         isActive:
 *           type: boolean
 *           description: Whether the workflow type is active
 *           default: true
 *         isDefault:
 *           type: boolean
 *           description: Whether this is the default workflow type
 *           default: false
 *         color:
 *           type: string
 *           description: Color for UI display
 *           default: "#1976d2"
 */

/**
 * @swagger
 * /api/workflow-types:
 *   post:
 *     summary: Create a new workflow type
 *     tags: [WorkflowTypes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorkflowType'
 *     responses:
 *       201:
 *         description: Workflow type created successfully
 *       400:
 *         description: Bad request
 */
router.post('/', controller.create);

/**
 * @swagger
 * /api/workflow-types:
 *   get:
 *     summary: Get all workflow types
 *     tags: [WorkflowTypes]
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name, prefix, or description
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: name
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of workflow types
 */
router.get('/', controller.getAll);

/**
 * @swagger
 * /api/workflow-types/active:
 *   get:
 *     summary: Get active workflow types for dropdown
 *     tags: [WorkflowTypes]
 *     responses:
 *       200:
 *         description: List of active workflow types
 */
router.get('/active', controller.getActive);

/**
 * @swagger
 * /api/workflow-types/default:
 *   get:
 *     summary: Get the default workflow type
 *     tags: [WorkflowTypes]
 *     responses:
 *       200:
 *         description: Default workflow type
 *       404:
 *         description: No default workflow type found
 */
router.get('/default', controller.getDefault);

/**
 * @swagger
 * /api/workflow-types/{id}:
 *   get:
 *     summary: Get workflow type by ID
 *     tags: [WorkflowTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workflow type ID
 *     responses:
 *       200:
 *         description: Workflow type details
 *       404:
 *         description: Workflow type not found
 */
router.get('/:id', controller.getById);

/**
 * @swagger
 * /api/workflow-types/{id}:
 *   put:
 *     summary: Update workflow type
 *     tags: [WorkflowTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workflow type ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorkflowType'
 *     responses:
 *       200:
 *         description: Workflow type updated successfully
 *       404:
 *         description: Workflow type not found
 */
router.put('/:id', controller.update);

/**
 * @swagger
 * /api/workflow-types/{id}/set-default:
 *   put:
 *     summary: Set workflow type as default
 *     tags: [WorkflowTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workflow type ID
 *     responses:
 *       200:
 *         description: Default workflow type updated
 *       404:
 *         description: Workflow type not found
 */
router.put('/:id/set-default', controller.setDefault);

/**
 * @swagger
 * /api/workflow-types/{id}:
 *   delete:
 *     summary: Delete workflow type
 *     tags: [WorkflowTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workflow type ID
 *     responses:
 *       200:
 *         description: Workflow type deleted successfully
 *       404:
 *         description: Workflow type not found
 *       400:
 *         description: Cannot delete - workflow type is in use
 */
router.delete('/:id', controller.delete);

module.exports = router;
