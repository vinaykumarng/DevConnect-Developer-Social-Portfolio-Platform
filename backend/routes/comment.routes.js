import express from 'express';
import { createComment, getCommentsForPost, deleteComment } from '../controller/comment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/post/:postId', getCommentsForPost);
router.post('/post/:postId', protect, createComment);
router.delete('/:id', protect, deleteComment);

export default router;