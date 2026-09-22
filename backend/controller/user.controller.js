import User from '../models/user.model.js';

export const getUserProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user }); // password already stripped via toJSON
    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const { bio, avatarUrl, githubUsername } = req.body;

        // Only allow editing your own profile — req.user comes from the protect middleware
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (bio !== undefined) user.bio = bio;
        if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
        if (githubUsername !== undefined) user.githubUsername = githubUsername;

        await user.save();

        res.status(200).json({ message: 'Profile updated', user });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        console.error('Update profile error:', err);
        res.status(500).json({ message: 'Server error updating profile' });
    }
};