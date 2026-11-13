// backend/middleware/optionalAuth.js
// Like protect, but never rejects the request: logged-out visitors (or visitors
// with a bad/expired token) just get no req.user.

import jwt from 'jsonwebtoken';
import prisma from '../database/prisma.js';

export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await prisma.user.findUnique({ where: { id: decoded.id } });
        }
    } catch {
        // invalid or expired token on an optional route: carry on as logged out
    }
    next();
};