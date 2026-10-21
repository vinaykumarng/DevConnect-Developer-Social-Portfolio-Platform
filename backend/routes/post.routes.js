import express from 'express';
import {
    createPost,
    getFeed,
    getUserPosts,
    updatePost,
    deletePost,
} from '../controller/post.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import {upload} from '../middleware/upload.middleware.js';

const router = express.Router();

router.get('/', getFeed);
router.get('/user/:username', getUserPosts);
router.post('/', protect, upload.single('image'), createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

export default router;