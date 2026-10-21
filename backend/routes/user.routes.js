import express from 'express';
import { getUserProfile, updateUserProfile, uploadAvatar} from '../controller/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();

router.get('/:username', getUserProfile);
router.put('/me', protect, updateUserProfile);
router.post('/me/avatar', protect, upload.single('avatar'), uploadAvatar);

export default router;