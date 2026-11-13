// backend/controller/auth.Controller.js
// Login + "who am I" on Prisma/Postgres.
// There is deliberately no signup here: new accounts will be created through
// Google login (step 5). Test accounts come from scripts/seed.js.

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../database/prisma.js';

// Compared against whenever there is no real hash to check (unknown email, or a
// Google-only account with no password). That keeps every failed login taking
// about the same time, so response timing can't reveal which emails exist.
const DUMMY_HASH = await bcrypt.hash('not-a-real-password', 10);

const generateToken = (userId) =>
    jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

export const login = async (req, res) => {
    try {
        // `identifier` is an email or a username (`email` still works for older clients)
        const { identifier, email, password } = req.body;
        const login_id = identifier ?? email;

        if (typeof login_id !== 'string' || typeof password !== 'string' || !login_id.trim() || !password) {
            return res.status(400).json({ message: 'Email or username and password are required' });
        }

        const value = login_id.trim();
        const where = value.includes('@') ? { email: value.toLowerCase() } : { username: value };

        // passwordHash is omitted from every query by default (see database/prisma.js).
        // This is the one place that opts back in.
        const user = await prisma.user.findUnique({
            where,
            omit: { passwordHash: false },
        });

        const passwordMatches = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

        // Same response for: unknown email, account without a password, wrong password
        if (!user || !user.passwordHash || !passwordMatches) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const { passwordHash, ...safeUser } = user;

        res.status(200).json({
            message: 'Login successful',
            token: generateToken(user.id),
            user: safeUser,
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// req.user is attached by the protect middleware
export const getMe = (req, res) => {
    res.json({ user: req.user });
};