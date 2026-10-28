// backend/controller/userController.js
// Profiles on Prisma/Postgres.

import prisma from '../database/prisma.js';
import { uploadBufferToCloudinary } from '../utils/uploadToCloudinary.js';

// Fields safe to show to anyone. Email stays private.
const publicProfileSelect = {
    id: true,
    username: true,
    avatarUrl: true,
    bio: true,
    githubUsername: true,
    createdAt: true,
};

// GitHub's rules: letters, digits and single hyphens, no leading or trailing
// hyphen, at most 39 characters.
const GITHUB_USERNAME_RE = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

export const getUserProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { username: req.params.username },
            select: publicProfileSelect,
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const { bio, githubUsername } = req.body;
        const data = {};

        if (bio !== undefined) {
            if (typeof bio !== 'string' || bio.trim().length > 200) {
                return res.status(400).json({ message: 'Bio must be text of at most 200 characters' });
            }
            data.bio = bio.trim() || null; // empty string becomes NULL ("not set")
        }

        if (githubUsername !== undefined) {
            if (typeof githubUsername !== 'string') {
                return res.status(400).json({ message: 'GitHub username must be text' });
            }
            const value = githubUsername.trim();
            if (value && !GITHUB_USERNAME_RE.test(value)) {
                return res.status(400).json({ message: 'That does not look like a valid GitHub username' });
            }
            data.githubUsername = value || null;
        }

        const user = await prisma.user.update({
            where: { id: req.user.id },
            data,
        });

        res.status(200).json({ message: 'Profile updated', user });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ message: 'Server error updating profile' });
    }
};

export const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        const result = await uploadBufferToCloudinary(req.file.buffer, 'devconnect/avatars');

        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: { avatarUrl: result.secure_url },
        });

        res.status(200).json({ message: 'Avatar updated', user });
    } catch (err) {
        console.error('Avatar upload error:', err);
        res.status(500).json({ message: 'Server error uploading avatar' });
    }
};