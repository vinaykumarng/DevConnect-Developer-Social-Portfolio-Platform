import prisma from '../database/prisma.js';
import { isUuid, parsePagination, buildPagination, authorSelect } from '../utils/http.js';

const MAX_COMMENT_LENGTH = 300;

export const createComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';

        if (!content) {
            return res.status(400).json({ message: 'Comment content is required' });
        }
        if (content.length > MAX_COMMENT_LENGTH) {
            return res.status(400).json({ message: `Comment must be ${MAX_COMMENT_LENGTH} characters or fewer` });
        }
        if (!isUuid(postId)) return res.status(404).json({ message: 'Post not found' });

        const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } });
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const comment = await prisma.comment.create({
            data: { content, postId, authorId: req.user.id },
            include: { author: { select: authorSelect } },
        });

        res.status(201).json({ message: 'Comment added', comment });
    } catch (err) {
        console.error('Create comment error:', err);
        res.status(500).json({ message: 'Server error adding comment' });
    }
};

export const getCommentsForPost = async (req, res) => {
    try {
        const { postId } = req.params;
        if (!isUuid(postId)) return res.status(404).json({ message: 'Post not found' });

        const pg = parsePagination(req.query, 20);

        const [comments, total] = await Promise.all([
            prisma.comment.findMany({
                where: { postId },
                orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
                skip: pg.skip,
                take: pg.limit,
                include: { author: { select: authorSelect } },
            }),
            prisma.comment.count({ where: { postId } }),
        ]);

        res.status(200).json({ comments, pagination: buildPagination(pg, total, comments.length) });
    } catch (err) {
        console.error('Get comments error:', err);
        res.status(500).json({ message: 'Server error fetching comments' });
    }
};

export const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(404).json({ message: 'Comment not found' });

        const comment = await prisma.comment.findUnique({ where: { id }, select: { authorId: true } });
        if (!comment) return res.status(404).json({ message: 'Comment not found' });
        if (comment.authorId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        await prisma.comment.delete({ where: { id } });
        res.status(200).json({ message: 'Comment deleted' });
    } catch (err) {
        console.error('Delete comment error:', err);
        res.status(500).json({ message: 'Server error deleting comment' });
    }
};
