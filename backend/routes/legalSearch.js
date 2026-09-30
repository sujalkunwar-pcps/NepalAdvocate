const express = require('express');
const router = express.Router();
const legalSearchController = require('../controllers/legalSearchController');

// Search precedent database
router.get('/', legalSearchController.searchPrecedents);

// Get specific precedent
router.get('/:id', legalSearchController.getPrecedentById);

module.exports = router;
