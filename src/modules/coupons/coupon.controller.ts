import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { CustomError } from '../../middleware/errorHandler';
import { getPaginationQuery, buildPaginatedResponse } from '../../lib/pagination';

const couponSchema = z.object({
    name: z.string().min(1, 'Coupon name is required'),
    code: z.string().min(1, 'Coupon code is required').toUpperCase(),
    from_date: z.preprocess(
        (val) => (val ? new Date(val as string) : null),
        z.date().nullable().optional()
    ),
    to_date: z.preprocess(
        (val) => (val ? new Date(val as string) : null),
        z.date().nullable().optional()
    ),
    amount: z.preprocess(
        (val) => (val === undefined || val === null || val === '' ? null : Number(val)),
        z.number().nonnegative('Amount must be positive').nullable().optional()
    ),
    percentage: z.preprocess(
        (val) => (val === undefined || val === null || val === '' ? null : Number(val)),
        z.number().int().min(0).max(100).nullable().optional()
    ),
    is_active: z.boolean().default(true),
}).refine(
    (data) => {
        const hasAmount = data.amount !== null && data.amount !== undefined;
        const hasPercentage = data.percentage !== null && data.percentage !== undefined;
        return (hasAmount && !hasPercentage) || (!hasAmount && hasPercentage);
    },
    { message: 'Coupons must specify either an amount OR a percentage, but not both.', path: ['amount'] }
);

const updateCouponSchema = z.object({
    name: z.string().min(1).optional(),
    code: z.string().min(1).toUpperCase().optional(),
    from_date: z.preprocess(
        (val) => (val ? new Date(val as string) : null),
        z.date().nullable().optional()
    ),
    to_date: z.preprocess(
        (val) => (val ? new Date(val as string) : null),
        z.date().nullable().optional()
    ),
    amount: z.preprocess(
        (val) => (val === undefined || val === null || val === '' ? null : Number(val)),
        z.number().nonnegative('Amount must be positive').nullable().optional()
    ),
    percentage: z.preprocess(
        (val) => (val === undefined || val === null || val === '' ? null : Number(val)),
        z.number().int().min(0).max(100).nullable().optional()
    ),
    is_active: z.boolean().optional(),
});

export class CouponController {
    static async checkCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const code = String(req.params.code).toUpperCase();
            const coupon = await prisma.coupon.findUnique({ where: { code } });
            const now = new Date();

            if (!coupon || !coupon.is_active) {
                res.status(404).json({ success: false, message: 'Invalid or expired coupon' });
                return;
            }
            if (coupon.from_date && now < coupon.from_date) {
                res.status(400).json({ success: false, message: 'Invalid or expired coupon' });
                return;
            }
            if (coupon.to_date && now > coupon.to_date) {
                res.status(400).json({ success: false, message: 'Invalid or expired coupon' });
                return;
            }

            const responseData: Record<string, unknown> = { code: coupon.code };
            if (coupon.percentage !== null && coupon.percentage !== undefined) {
                responseData.percentage = coupon.percentage;
            } else if (coupon.amount !== null && coupon.amount !== undefined) {
                responseData.amount = Number(coupon.amount);
            }

            res.status(200).json({ success: true, data: responseData });
        } catch (error) { next(error); }
    }

    static async listAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, skip } = getPaginationQuery(req);
            const [coupons, total] = await Promise.all([
                prisma.coupon.findMany({ skip, take: limit, orderBy: { created_at: 'desc' } }),
                prisma.coupon.count(),
            ]);
            res.status(200).json(buildPaginatedResponse(coupons, total, page, limit));
        } catch (error) { next(error); }
    }

    static async getAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            const coupon = await prisma.coupon.findUnique({ where: { id } });
            if (!coupon) throw new CustomError(404, 'Coupon not found');
            res.status(200).json({ success: true, data: coupon });
        } catch (error) { next(error); }
    }

    static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const body = couponSchema.parse(req.body);
            const coupon = await prisma.coupon.create({
                data: {
                    name: body.name,
                    code: body.code,
                    from_date: body.from_date ?? null,
                    to_date: body.to_date ?? null,
                    amount: body.amount ?? null,
                    percentage: body.percentage ?? null,
                    is_active: body.is_active,
                },
            });
            res.status(201).json({ success: true, data: coupon });
        } catch (error) { next(error); }
    }

    static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            const parsedBody = updateCouponSchema.parse(req.body);
            const coupon = await prisma.coupon.findUnique({ where: { id } });
            if (!coupon) throw new CustomError(404, 'Coupon not found');

            const finalAmount = parsedBody.amount !== undefined ? parsedBody.amount : (coupon.amount ? Number(coupon.amount) : null);
            const finalPercentage = parsedBody.percentage !== undefined ? parsedBody.percentage : coupon.percentage;
            const hasAmount = finalAmount !== null && finalAmount !== undefined;
            const hasPercentage = finalPercentage !== null && finalPercentage !== undefined;

            if ((hasAmount && hasPercentage) || (!hasAmount && !hasPercentage)) {
                throw new CustomError(400, 'Coupon must specify either an amount OR a percentage, but not both.');
            }

            const updatedCoupon = await prisma.coupon.update({
                where: { id },
                data: {
                    name: parsedBody.name ?? coupon.name,
                    code: parsedBody.code ?? coupon.code,
                    from_date: parsedBody.from_date !== undefined ? parsedBody.from_date : coupon.from_date,
                    to_date: parsedBody.to_date !== undefined ? parsedBody.to_date : coupon.to_date,
                    amount: parsedBody.amount !== undefined ? parsedBody.amount : coupon.amount,
                    percentage: parsedBody.percentage !== undefined ? parsedBody.percentage : coupon.percentage,
                    is_active: parsedBody.is_active ?? coupon.is_active,
                },
            });
            res.status(200).json({ success: true, data: updatedCoupon });
        } catch (error) { next(error); }
    }

    static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            const coupon = await prisma.coupon.findUnique({ where: { id } });
            if (!coupon) throw new CustomError(404, 'Coupon not found');
            await prisma.coupon.delete({ where: { id } });
            res.status(200).json({ success: true, data: {} });
        } catch (error) { next(error); }
    }
}
