import express from 'express';
import {
    followUser,
    unfollowUser,
    getFollowStatus,
    getFollowers,
    getFollowing,
} from '../controller/follow.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { optionalAuth } from '../middleware/optionalAuth.middleware.js';

const router = express.Router();

router.get('/:username/status', optionalAuth, getFollowStatus);
router.get('/:username/followers', getFollowers);
router.get('/:username/following', getFollowing);
router.post('/:username/follow', protect, followUser);
router.delete('/:username/follow', protect, unfollowUser);

export default router;