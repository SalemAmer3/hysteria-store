import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export class CustomError extends Error {
    constructor(public statusCode: number, message: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // If headers already sent, delegate to default express handler
    if (res.headersSent) {
        return next(err);
    }

    // 1. Zod Validation Error
    if (err instanceof ZodError) {
        const errorMessages = err.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
        res.status(400).json({
            success: false,
            message: `Validation Error: ${errorMessages}`,
        });
        return;
    }

    // 2. Custom App Error
    if (err instanceof CustomError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
        return;
    }

    // 2.5. Multer Error
    if (err.name === 'MulterError' || err.code === 'LIMIT_FILE_SIZE') {
        const message = err.code === 'LIMIT_FILE_SIZE'
            ? 'File size exceeds limit of 5 MB'
            : err.message || 'File upload error';
        res.status(400).json({
            success: false,
            message,
        });
        return;
    }

    // 3. Prisma Error
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation (e.g. duplicate username, brand, category, coupon code)
        if (err.code === 'P2002') {
            const target = (err.meta?.target as string[])?.join(', ') || 'field';
            res.status(409).json({
                success: false,
                message: `Conflict: A record with this '${target}' already exists.`,
            });
            return;
        }
        // Foreign key constraint failed
        if (err.code === 'P2003') {
            res.status(400).json({
                success: false,
                message: `Database constraint violation. Check referenced relations.`,
            });
            return;
        }
        // Record not found
        if (err.code === 'P2025') {
            res.status(404).json({
                success: false,
                message: err.message || 'Record not found',
            });
            return;
        }
    }

    // 4. Default Fallback Internal Server Error
    console.error('Unhandled Server Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
    });
};
