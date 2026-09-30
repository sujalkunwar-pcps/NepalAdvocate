const express = require('express');
const router = express.Router();
const {
  getDashboardData,
  uploadProfilePicture,
  deleteProfilePicture,
} = require('../controllers/profileController');
const { authenticateJWT } = require('../middlewares/auth');
const { imageUpload } = require('../middlewares/upload');

router.get('/dashboard', authenticateJWT, getDashboardData);
router.post('/picture', authenticateJWT, imageUpload.single('image'), uploadProfilePicture);
router.delete('/picture', authenticateJWT, deleteProfilePicture);

module.exports = router;

