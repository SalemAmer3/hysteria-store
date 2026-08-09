import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';

export interface AdminPayload {
    id: string;
    username: string;
}

export interface AuthenticatedRequest extends Request {
    admin?: AdminPayload;
}

export const authenticateAdmin = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({ success: false, message: 'Unauthorized: Missing token' });
            return;
        }

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            res.status(401).json({ success: false, message: 'Unauthorized: Invalid token format' });
            return;
        }

        const token = parts[1];

        let decoded: any;
        try {
            decoded = jwt.verify(token, env.JWT_SECRET);
        } catch (err: any) {
            if (err.name === 'TokenExpiredError') {
                res.status(401).json({ success: false, message: 'Unauthorized: Token expired' });
                return;
            }
            res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
            return;
        }

        if (!decoded || !decoded.id || !decoded.username) {
            res.status(401).json({ success: false, message: 'Unauthorized: Invalid token payload' });
            return;
        }

        // Verify admin still exists and is active in DB
        const admin = await prisma.adminUser.findUnique({
            where: { id: decoded.id },
        });

        if (!admin || !admin.is_active) {
            res.status(401).json({ success: false, message: 'Unauthorized: Admin user inactive or not found' });
            return;
        }

        // Attach admin to request
        req.admin = {
            id: admin.id,
            username: admin.username,
        };

        next();
    } catch (error) {
        next(error);
    }
};
