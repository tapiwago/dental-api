const express = require('express');
const router = express.Router();
const guideStepController = require('../controllers/guideStepController');

// Basic CRUD routes
router.post('/', guideStepController.create);
router.get('/', guideStepController.getAll);
router.get('/:id', guideStepController.getById);
router.put('/:id', guideStepController.update);
router.delete('/:id', guideStepController.delete);

// Contextual hints and guidance routes
router.get('/hints/stage/:stageId', guideStepController.getStageHints);
router.get('/hints/task/:taskId', guideStepController.getTaskHints);
router.put('/hints/:stepId/viewed', guideStepController.markHintViewed);
router.post('/hints/:stepId/feedback', guideStepController.submitHintFeedback);

// Case-specific guide analytics
router.get('/case/:caseId/summary', guideStepController.getCaseHintsSummary);
router.get('/case/:caseId/usage', guideStepController.getGuideUsageForCase);

module.exports = router;
