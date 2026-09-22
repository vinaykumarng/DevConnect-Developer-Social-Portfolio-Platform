import express from 'express';
import { getUserProfile, updateUserProfile } from '../controller/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/:username', getUserProfile);
router.put('/me', protect, updateUserProfile);

export default router;