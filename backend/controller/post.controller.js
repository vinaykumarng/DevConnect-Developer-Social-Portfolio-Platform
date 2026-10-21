import Post from '../models/post.model.js';
import User from '../models/user.model.js';
import { uploadBufferToCloudinary } from '../utils/uploadToCloudinary.js';

// Create a post
export const createPost = async (req, res) => {
    try {
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: 'Post content is required' });
        }

        let imageUrl = '';
        if (req.file) {
            const result = await uploadBufferToCloudinary(req.file.buffer, 'devconnect/posts');
            imageUrl = result.secure_url;
        }

        const post = await Post.create({
            content: content.trim(),
            imageUrl,
            author: req.user._id,
        });

        const populatedPost = await post.populate('author', 'username avatarUrl');

        res.status(201).json({ message: 'Post created', post: populatedPost });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        console.error('Create post error:', err);
        res.status(500).json({ message: 'Server error creating post' });
    }
};

// updatePost stays as-is for text edits; image editing on existing posts
// is intentionally left out for now — keeps scope contained

// Get paginated feed (all posts, newest first)
export const getFeed = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [posts, total] = await Promise.all([
            Post.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('author', 'username avatarUrl'),
            Post.countDocuments(),
        ]);

        res.status(200).json({
            posts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: skip + posts.length < total,
            },
        });
    } catch (err) {
        console.error('Get feed error:', err);
        res.status(500).json({ message: 'Server error fetching feed' });
    }
};

// Get posts by a specific user (for their profile page)
export const getUserPosts = async (req, res) => {
    try {
        const { username } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const [posts, total] = await Promise.all([
            Post.find({ author: user._id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('author', 'username avatarUrl'),
            Post.countDocuments({ author: user._id }),
        ]);

        res.status(200).json({
            posts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: skip + posts.length < total,
            },
        });
    } catch (err) {
        console.error('Get user posts error:', err);
        res.status(500).json({ message: 'Server error fetching user posts' });
    }
};

// Update a post (author only)
export const updatePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to edit this post' });
        }

        const { content, imageUrl } = req.body;
        if (content !== undefined) post.content = content.trim();
        if (imageUrl !== undefined) post.imageUrl = imageUrl;

        await post.save();
        const populatedPost = await post.populate('author', 'username avatarUrl');

        res.status(200).json({ message: 'Post updated', post: populatedPost });
    } catch (err) {
        console.error('Update post error:', err);
        res.status(500).json({ message: 'Server error updating post' });
    }
};

// Delete a post (author only)
export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        await post.deleteOne();
        res.status(200).json({ message: 'Post deleted' });
    } catch (err) {
        console.error('Delete post error:', err);
        res.status(500).json({ message: 'Server error deleting post' });
    }
};