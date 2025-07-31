const express = require('express');
const router = express.Router();
const officeLocationController = require('../controllers/officeLocationController');

// Create a new office location
router.post('/', officeLocationController.createOfficeLocation);

// Get all office locations
router.get('/', officeLocationController.getOfficeLocations);

// Get a single office location by ID
router.get('/:id', officeLocationController.getOfficeLocationById);

// Update an office location
router.put('/:id', officeLocationController.updateOfficeLocation);

// Delete an office location
router.delete('/:id', officeLocationController.deleteOfficeLocation);

module.exports = router;
