import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { R2Service } from '../../services/r2.service';
import { CustomError } from '../../middleware/errorHandler';
import { getPaginationQuery, buildPaginatedResponse } from '../../lib/pagination';

const productImageSchema = z.object({
    product_id: z.string().uuid('Invalid product_id format'),
    image_url: z.string().url('image_url must be a valid URL'),
});

const updateProductImageSchema = productImageSchema.partial();

export class ProductImageController {
    static async listPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, skip } = getPaginationQuery(req);
            const [images, total] = await Promise.all([
                prisma.productImage.findMany({ skip, take: limit, orderBy: { created_at: 'desc' } }),
                prisma.productImage.count(),
            ]);
            res.status(200).json(buildPaginatedResponse(images, total, page, limit));
        } catch (error) { next(error); }
    }

    static async getPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            const image = await prisma.productImage.findUnique({ where: { id } });
            if (!image) throw new CustomError(404, 'Product image not found');
            res.status(200).json({ success: true, data: image });
        } catch (error) { next(error); }
    }

    static async listAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, skip } = getPaginationQuery(req);
            const [images, total] = await Promise.all([
                prisma.productImage.findMany({
                    skip, take: limit, orderBy: { created_at: 'desc' },
                    include: { product: { select: { id: true, name: true } } },
                }),
                prisma.productImage.count(),
            ]);
            res.status(200).json(buildPaginatedResponse(images, total, page, limit));
        } catch (error) { next(error); }
    }

    static async getAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            const image = await prisma.productImage.findUnique({ where: { id }, include: { product: true } });
            if (!image) throw new CustomError(404, 'Product image not found');
            res.status(200).json({ success: true, data: image });
        } catch (error) { next(error); }
    }

    static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const body = productImageSchema.parse(req.body);
            const productExists = await prisma.product.findUnique({ where: { id: body.product_id } });
            if (!productExists) throw new CustomError(400, 'Referenced product does not exist');

            const image = await prisma.productImage.create({
                data: { product_id: body.product_id, image_url: body.image_url },
            });
            res.status(201).json({ success: true, data: image });
        } catch (error) { next(error); }
    }

    static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            const body = updateProductImageSchema.parse(req.body);
            const image = await prisma.productImage.findUnique({ where: { id } });
            if (!image) throw new CustomError(404, 'Product image not found');

            if (body.product_id) {
                const exists = await prisma.product.findUnique({ where: { id: body.product_id } });
                if (!exists) throw new CustomError(400, 'Referenced product does not exist');
            }

            let oldImageUrl: string | null = null;
            if (body.image_url !== undefined && body.image_url !== image.image_url) {
                oldImageUrl = image.image_url;
            }

            const updatedImage = await prisma.productImage.update({
                where: { id },
                data: {
                    product_id: body.product_id ?? image.product_id,
                    image_url: body.image_url ?? image.image_url,
                },
            });

            if (oldImageUrl) {
                try { await R2Service.deleteImage(oldImageUrl); }
                catch (r2Error) { console.error(`Failed to clean up old product image: ${oldImageUrl}`, r2Error); }
            }

            res.status(200).json({ success: true, data: updatedImage });
        } catch (error) { next(error); }
    }

    static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            const image = await prisma.productImage.findUnique({ where: { id } });
            if (!image) throw new CustomError(404, 'Product image not found');

            await prisma.productImage.delete({ where: { id } });

            if (image.image_url) {
                try { await R2Service.deleteImage(image.image_url); }
                catch (r2Error) { console.error(`Failed to delete product image from R2: ${image.image_url}`, r2Error); }
            }

            res.status(200).json({ success: true, data: {} });
        } catch (error) { next(error); }
    }
}
