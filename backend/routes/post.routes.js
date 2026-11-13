import express from 'express';
import {
    createPost,
    getFeed,
    getUserPosts,
    updatePost,
    deletePost,
} from '../controller/post.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { optionalAuth } from '../middleware/optionalAuth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();

// optionalAuth: the feed is public, but ?following=true needs to know who is asking
router.get('/', optionalAuth, getFeed);
router.get('/user/:username', getUserPosts);
router.post('/', protect, upload.single('image'), createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

export default router;
