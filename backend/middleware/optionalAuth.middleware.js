import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

// Like `protect`, but doesn't reject the request if there's no token —
// just leaves req.user undefined for logged-out visitors.
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id);
        }
    } catch {
        // invalid/expired token on an optional route — just proceed as logged-out
    }
    next();
};