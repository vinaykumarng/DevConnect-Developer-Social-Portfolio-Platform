import express from 'express';
import { getUserProfile, updateUserProfile, uploadAvatar, getSuggestions } from '../controller/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { optionalAuth } from '../middleware/optionalAuth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();

// Must stay above '/:username', otherwise "suggestions" is treated as a username
router.get('/suggestions', optionalAuth, getSuggestions);
router.get('/:username', getUserProfile);
router.put('/me', protect, updateUserProfile);
router.post('/me/avatar', protect, upload.single('avatar'), uploadAvatar);

export default router;
