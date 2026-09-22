import Follow from '../models/follow.model.js';
import User from '../models/user.model.js';

export const followUser = async (req, res) => {
    try {
        const { username } = req.params;

        const targetUser = await User.findOne({ username });
        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (targetUser._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: "You can't follow yourself" });
        }

        const existing = await Follow.findOne({ follower: req.user._id, following: targetUser._id });
        if (existing) {
            return res.status(409).json({ message: 'Already following this user' });
        }

        await Follow.create({ follower: req.user._id, following: targetUser._id });

        res.status(201).json({ message: `Now following ${targetUser.username}` });
    } catch (err) {
        console.error('Follow error:', err);
        res.status(500).json({ message: 'Server error following user' });
    }
};

export const unfollowUser = async (req, res) => {
    try {
        const { username } = req.params;

        const targetUser = await User.findOne({ username });
        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const result = await Follow.findOneAndDelete({
            follower: req.user._id,
            following: targetUser._id,
        });

        if (!result) {
            return res.status(400).json({ message: 'You are not following this user' });
        }

        res.status(200).json({ message: `Unfollowed ${targetUser.username}` });
    } catch (err) {
        console.error('Unfollow error:', err);
        res.status(500).json({ message: 'Server error unfollowing user' });
    }
};

// Returns follow status + counts for a profile page
export const getFollowStatus = async (req, res) => {
    try {
        const { username } = req.params;

        const targetUser = await User.findOne({ username });
        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const [followersCount, followingCount, isFollowing] = await Promise.all([
            Follow.countDocuments({ following: targetUser._id }),
            Follow.countDocuments({ follower: targetUser._id }),
            req.user
                ? Follow.exists({ follower: req.user._id, following: targetUser._id })
                : false,
        ]);

        res.status(200).json({
            followersCount,
            followingCount,
            isFollowing: !!isFollowing,
        });
    } catch (err) {
        console.error('Follow status error:', err);
        res.status(500).json({ message: 'Server error fetching follow status' });
    }
};

export const getFollowers = async (req, res) => {
    try {
        const { username } = req.params;
        const targetUser = await User.findOne({ username });
        if (!targetUser) return res.status(404).json({ message: 'User not found' });

        const follows = await Follow.find({ following: targetUser._id }).populate(
            'follower',
            'username avatarUrl bio'
        );

        res.status(200).json({ users: follows.map((f) => f.follower) });
    } catch (err) {
        console.error('Get followers error:', err);
        res.status(500).json({ message: 'Server error fetching followers' });
    }
};

export const getFollowing = async (req, res) => {
    try {
        const { username } = req.params;
        const targetUser = await User.findOne({ username });
        if (!targetUser) return res.status(404).json({ message: 'User not found' });

        const follows = await Follow.find({ follower: targetUser._id }).populate(
            'following',
            'username avatarUrl bio'
        );

        res.status(200).json({ users: follows.map((f) => f.following) });
    } catch (err) {
        console.error('Get following error:', err);
        res.status(500).json({ message: 'Server error fetching following' });
    }
};