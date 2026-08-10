import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { R2Service } from '../../services/r2.service';
import { CustomError } from '../../middleware/errorHandler';
import { getPaginationQuery, buildPaginatedResponse } from '../../lib/pagination';

const productOptionSchema = z.object({
    product_id: z.string().uuid('Invalid product_id format'),
    color_name: z.string().nullable().optional(),
    shade: z.string().nullable().optional(),
    size: z.string().nullable().optional(),
    price: z.preprocess((val) => (val === undefined || val === '' || val === null ? NaN : Number(val)), z.number().positive('Price must be greater than 0')),
    color: z.string().nullable().optional(),
    image_url: z.string().url().nullable().optional(),
    arabic: z.string().nullable().optional(),
    hebrew: z.string().nullable().optional(),
});

const updateProductOptionSchema = productOptionSchema.partial();

export class ProductOptionController {
    static async listPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, skip } = getPaginationQuery(req);
            const [options, total] = await Promise.all([
                prisma.productOption.findMany({ skip, take: limit, orderBy: { created_at: 'desc' } }),
                prisma.productOption.count(),
            ]);
            res.status(200).json(buildPaginatedResponse(options, total, page, limit));
        } catch (error) { next(error); }
    }

    static async getPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            const option = await prisma.productOption.findUnique({ where: { id } });
            if (!option) throw new CustomError(404, 'Product option not found');
            res.status(200).json({ success: true, data: option });
        } catch (error) { next(error); }
    }

    static async listAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, skip } = getPaginationQuery(req);
            const [options, total] = await Promise.all([
                prisma.productOption.findMany({
                    skip, take: limit, orderBy: { created_at: 'desc' },
                    include: { product: { select: { id: true, name: true } } },
                }),
                prisma.productOption.count(),
            ]);
            res.status(200).json(buildPaginatedResponse(options, total, page, limit));
        } catch (error) { next(error); }
    }

    static async getAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            const option = await prisma.productOption.findUnique({ where: { id }, include: { product: true } });
            if (!option) throw new CustomError(404, 'Product option not found');
            res.status(200).json({ success: true, data: option });
        } catch (error) { next(error); }
    }

    static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const body = productOptionSchema.parse(req.body);
            const productExists = await prisma.product.findUnique({ where: { id: body.product_id } });
            if (!productExists) throw new CustomError(400, 'Referenced product does not exist');

            const option = await prisma.productOption.create({
                data: {
                    product_id: body.product_id,
                    color_name: body.color_name ?? null,
                    shade: body.shade ?? null,
                    size: body.size ?? null,
                    price: body.price,
                    color: body.color ?? null,
                    image_url: body.image_url ?? null,
                    arabic: body.arabic ?? null,
                    hebrew: body.hebrew ?? null,
                },
            });
            res.status(201).json({ success: true, data: option });
        } catch (error) { next(error); }
    }

    static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            const body = updateProductOptionSchema.parse(req.body);
            const option = await prisma.productOption.findUnique({ where: { id } });
            if (!option) throw new CustomError(404, 'Product option not found');

            if (body.product_id) {
                const exists = await prisma.product.findUnique({ where: { id: body.product_id } });
                if (!exists) throw new CustomError(400, 'Referenced product does not exist');
            }

            let oldImageUrl: string | null = null;
            if (body.image_url !== undefined && body.image_url !== option.image_url) {
                oldImageUrl = option.image_url;
            }

            const updatedOption = await prisma.productOption.update({
                where: { id },
                data: {
                    product_id: body.product_id ?? option.product_id,
                    color_name: body.color_name !== undefined ? body.color_name : option.color_name,
                    shade: body.shade !== undefined ? body.shade : option.shade,
                    size: body.size !== undefined ? body.size : option.size,
                    price: body.price ?? option.price,
                    color: body.color !== undefined ? body.color : option.color,
                    image_url: body.image_url !== undefined ? body.image_url : option.image_url,
                    arabic: body.arabic !== undefined ? body.arabic : option.arabic,
                    hebrew: body.hebrew !== undefined ? body.hebrew : option.hebrew,
                },
            });

            if (oldImageUrl) {
                try { await R2Service.deleteImage(oldImageUrl); }
                catch (r2Error) { console.error(`Failed to clean up old product option image: ${oldImageUrl}`, r2Error); }
            }

            res.status(200).json({ success: true, data: updatedOption });
        } catch (error) { next(error); }
    }

    static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            const option = await prisma.productOption.findUnique({ where: { id } });
            if (!option) throw new CustomError(404, 'Product option not found');

            await prisma.productOption.delete({ where: { id } });

            if (option.image_url) {
                try { await R2Service.deleteImage(option.image_url); }
                catch (r2Error) { console.error(`Failed to delete option image from R2: ${option.image_url}`, r2Error); }
            }

            res.status(200).json({ success: true, data: {} });
        } catch (error) { next(error); }
    }
}
