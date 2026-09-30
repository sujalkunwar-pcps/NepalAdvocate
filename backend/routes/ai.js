const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticateJWT } = require('../middlewares/auth');
const { anyFileUpload } = require('../middlewares/upload');

// Protect all AI routes with JWT authentication
router.use(authenticateJWT);

router.get('/history', aiController.getChatHistory);
router.post('/chat', aiController.chatWithAi);
router.delete('/history', aiController.clearChatHistory);
router.post('/analyze-case', anyFileUpload.single('file'), aiController.analyzeCasePdf);

module.exports = router;
