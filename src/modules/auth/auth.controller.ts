import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { env } from '../../config/env';
import { CustomError } from '../../middleware/errorHandler';

const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
});

export class AuthController {
    static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const body = loginSchema.parse(req.body);

            const admin = await prisma.adminUser.findUnique({
                where: { username: body.username },
            });

            if (!admin || !admin.is_active) {
                throw new CustomError(401, 'Invalid username or password');
            }

            const isPasswordValid = await bcrypt.compare(body.password, admin.password_hash);
            if (!isPasswordValid) {
                throw new CustomError(401, 'Invalid username or password');
            }

            const token = jwt.sign(
                {
                    id: admin.id,
                    username: admin.username,
                },
                env.JWT_SECRET,
                {
                    expiresIn: env.JWT_EXPIRES_IN as any,
                }
            );

            res.status(200).json({
                success: true,
                data: {
                    token,
                },
            });
        } catch (error) {
            next(error);
        }
    }
}
