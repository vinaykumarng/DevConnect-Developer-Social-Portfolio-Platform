import Comment from '../models/comment.model.js';
import Post from '../models/post.model.js';

export const createComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: 'Comment content is required' });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comment = await Comment.create({
            content: content.trim(),
            author: req.user._id,
            post: postId,
        });

        const populated = await comment.populate('author', 'username avatarUrl');

        res.status(201).json({ message: 'Comment added', comment: populated });
    } catch (err) {
        console.error('Create comment error:', err);
        res.status(500).json({ message: 'Server error adding comment' });
    }
};

export const getCommentsForPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [comments, total] = await Promise.all([
            Comment.find({ post: postId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('author', 'username avatarUrl'),
            Comment.countDocuments({ post: postId }),
        ]);

        res.status(200).json({
            comments,
            pagination: {
                page,
                limit,
                total,
                hasMore: skip + comments.length < total,
            },
        });
    } catch (err) {
        console.error('Get comments error:', err);
        res.status(500).json({ message: 'Server error fetching comments' });
    }
};

export const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        await comment.deleteOne();
        res.status(200).json({ message: 'Comment deleted' });
    } catch (err) {
        console.error('Delete comment error:', err);
        res.status(500).json({ message: 'Server error deleting comment' });
    }
};