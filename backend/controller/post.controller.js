import prisma from '../database/prisma.js';
import { uploadBufferToCloudinary } from '../utils/uploadToCloudinary.js';
import { isUuid, parsePagination, buildPagination, authorSelect } from '../utils/http.js';

const MAX_POST_LENGTH = 1000;

// Author (public fields) plus the number of comments, for the comment button.
const postInclude = {
    author: { select: authorSelect },
    _count: { select: { comments: true } },
};

export const createPost = async (req, res) => {
    try {
        const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';
        if (!content) {
            return res.status(400).json({ message: 'Post content is required' });
        }
        if (content.length > MAX_POST_LENGTH) {
            return res.status(400).json({ message: `Post must be ${MAX_POST_LENGTH} characters or fewer` });
        }

        let imageUrl = null;
        if (req.file) {
            const result = await uploadBufferToCloudinary(req.file.buffer, 'devconnect/posts');
            imageUrl = result.secure_url;
        }

        const post = await prisma.post.create({
            data: { content, imageUrl, authorId: req.user.id },
            include: postInclude,
        });

        res.status(201).json({ message: 'Post created', post });
    } catch (err) {
        console.error('Create post error:', err);
        res.status(500).json({ message: 'Server error creating post' });
    }
};

export const getFeed = async (req, res) => {
    try {
        const pg = parsePagination(req.query);

        // ?following=true -> posts from people you follow, plus your own
        let where = {};
        if (req.query.following === 'true') {
            if (!req.user) {
                return res.status(401).json({ message: 'Log in to see the people you follow' });
            }
            where = {
                OR: [
                    { authorId: req.user.id },
                    { author: { followsReceived: { some: { followerId: req.user.id } } } },
                ],
            };
        }

        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where,
                orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], // id tiebreaker keeps pages stable
                skip: pg.skip,
                take: pg.limit,
                include: postInclude,
            }),
            prisma.post.count({ where }),
        ]);

        res.status(200).json({ posts, pagination: buildPagination(pg, total, posts.length) });
    } catch (err) {
        console.error('Get feed error:', err);
        res.status(500).json({ message: 'Server error fetching feed' });
    }
};

export const getUserPosts = async (req, res) => {
    try {
        const pg = parsePagination(req.query);

        const user = await prisma.user.findUnique({
            where: { username: req.params.username },
            select: { id: true },
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where: { authorId: user.id },
                orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
                skip: pg.skip,
                take: pg.limit,
                include: postInclude,
            }),
            prisma.post.count({ where: { authorId: user.id } }),
        ]);

        res.status(200).json({ posts, pagination: buildPagination(pg, total, posts.length) });
    } catch (err) {
        console.error('Get user posts error:', err);
        res.status(500).json({ message: 'Server error fetching user posts' });
    }
};

export const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(404).json({ message: 'Post not found' });

        const post = await prisma.post.findUnique({ where: { id }, select: { authorId: true } });
        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.authorId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to edit this post' });
        }

        const data = {};
        if (req.body.content !== undefined) {
            const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';
            if (!content || content.length > MAX_POST_LENGTH) {
                return res.status(400).json({ message: `Content must be 1-${MAX_POST_LENGTH} characters` });
            }
            data.content = content;
        }
        // Image editing is intentionally not supported yet (see TODOs).

        const updated = await prisma.post.update({
            where: { id },
            data,
            include: postInclude,
        });

        res.status(200).json({ message: 'Post updated', post: updated });
    } catch (err) {
        console.error('Update post error:', err);
        res.status(500).json({ message: 'Server error updating post' });
    }
};

export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(404).json({ message: 'Post not found' });

        const post = await prisma.post.findUnique({ where: { id }, select: { authorId: true } });
        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.authorId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        await prisma.post.delete({ where: { id } }); // comments cascade at the DB level
        res.status(200).json({ message: 'Post deleted' });
    } catch (err) {
        console.error('Delete post error:', err);
        res.status(500).json({ message: 'Server error deleting post' });
    }
};
