import prisma from '../database/prisma.js';

const publicUserSelect = { id: true, username: true, avatarUrl: true, bio: true };

const findTarget = (username) =>
    prisma.user.findUnique({ where: { username }, select: { id: true, username: true } });

export const followUser = async (req, res) => {
    try {
        const target = await findTarget(req.params.username);
        if (!target) return res.status(404).json({ message: 'User not found' });

        if (target.id === req.user.id) {
            return res.status(400).json({ message: "You can't follow yourself" });
        }

        try {
            await prisma.follow.create({
                data: { followerId: req.user.id, followingId: target.id },
            });
        } catch (err) {
            // Composite primary key violation = already following (race-safe, no check-then-insert)
            if (err.code === 'P2002') {
                return res.status(409).json({ message: 'Already following this user' });
            }
            throw err;
        }

        res.status(201).json({ message: `Now following ${target.username}` });
    } catch (err) {
        console.error('Follow error:', err);
        res.status(500).json({ message: 'Server error following user' });
    }
};

export const unfollowUser = async (req, res) => {
    try {
        const target = await findTarget(req.params.username);
        if (!target) return res.status(404).json({ message: 'User not found' });

        try {
            await prisma.follow.delete({
                where: {
                    followerId_followingId: { followerId: req.user.id, followingId: target.id },
                },
            });
        } catch (err) {
            if (err.code === 'P2025') {
                return res.status(400).json({ message: 'You are not following this user' });
            }
            throw err;
        }

        res.status(200).json({ message: `Unfollowed ${target.username}` });
    } catch (err) {
        console.error('Unfollow error:', err);
        res.status(500).json({ message: 'Server error unfollowing user' });
    }
};

export const getFollowStatus = async (req, res) => {
    try {
        const target = await findTarget(req.params.username);
        if (!target) return res.status(404).json({ message: 'User not found' });

        const [followersCount, followingCount, relation] = await Promise.all([
            prisma.follow.count({ where: { followingId: target.id } }),
            prisma.follow.count({ where: { followerId: target.id } }),
            req.user
                ? prisma.follow.findUnique({
                    where: {
                        followerId_followingId: { followerId: req.user.id, followingId: target.id },
                    },
                    select: { followerId: true },
                })
                : null,
        ]);

        res.status(200).json({ followersCount, followingCount, isFollowing: !!relation });
    } catch (err) {
        console.error('Follow status error:', err);
        res.status(500).json({ message: 'Server error fetching follow status' });
    }
};

export const getFollowers = async (req, res) => {
    try {
        const target = await findTarget(req.params.username);
        if (!target) return res.status(404).json({ message: 'User not found' });

        const follows = await prisma.follow.findMany({
            where: { followingId: target.id },
            orderBy: { createdAt: 'desc' },
            include: { follower: { select: publicUserSelect } },
        });

        res.status(200).json({ users: follows.map((f) => f.follower) });
    } catch (err) {
        console.error('Get followers error:', err);
        res.status(500).json({ message: 'Server error fetching followers' });
    }
};

export const getFollowing = async (req, res) => {
    try {
        const target = await findTarget(req.params.username);
        if (!target) return res.status(404).json({ message: 'User not found' });

        const follows = await prisma.follow.findMany({
            where: { followerId: target.id },
            orderBy: { createdAt: 'desc' },
            include: { following: { select: publicUserSelect } },
        });

        res.status(200).json({ users: follows.map((f) => f.following) });
    } catch (err) {
        console.error('Get following error:', err);
        res.status(500).json({ message: 'Server error fetching following' });
    }
};
