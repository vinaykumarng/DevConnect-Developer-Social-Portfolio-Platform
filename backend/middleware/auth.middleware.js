// backend/middleware/authMiddleware.js
// Requires a valid JWT. Attaches the user (without passwordHash) to req.user.

import jwt from 'jsonwebtoken';
import prisma from '../database/prisma.js';

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    req.user = user;
    next();
  } catch (err) {
    // Bad signature, expired token, or an id that isn't a valid UUID all land here
    return res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};