const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateJWT } = require('../middlewares/auth');

// Protect all payment routes with JWT authentication
router.use(authenticateJWT);

router.post('/initiate', paymentController.initiatePayment);
router.post('/verify-esewa', paymentController.verifyEsewa);
router.post('/verify-khalti', paymentController.verifyKhalti);

module.exports = router;
