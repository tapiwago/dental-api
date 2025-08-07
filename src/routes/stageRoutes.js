const express = require('express');
const router = express.Router();
const controller = require('../../controllers/stageController');

router.post('/', controller.create);
router.post('/multiple', controller.createMultiple);
router.post('/with-tasks', controller.createWithTasks);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
