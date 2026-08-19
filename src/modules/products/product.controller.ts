import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { R2Service } from '../../services/r2.service';
import { CustomError } from '../../middleware/errorHandler';
import { getPaginationQuery, buildPaginatedResponse } from '../../lib/pagination';

const productSchema = z.object({
    name: z.string().min(1, 'Product name is required'),
    sku: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    category_id: z.string().uuid('Invalid category_id format'),
    brand_id: z.string().uuid('Invalid brand_id format').nullable().optional(),
    arabic: z.string().nullable().optional(),
    hebrew: z.string().nullable().optional(),
    arabic_description: z.string().nullable().optional(),
    hebrew_description: z.string().nullable().optional(),
});

const updateProductSchema = productSchema.partial();

export class ProductController {
    static async listPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, skip } = getPaginationQuery(req);
            const [products, total] = await Promise.all([
                prisma.product.findMany({
                    skip, take: limit,
                    include: {
                        category: { select: { id: true, name: true, is_active: true } },
                        brand: { select: { id: true, name: true } },
                        options: true,
                        images: true,
                    },
                    orderBy: { created_at: 'desc' },
                }),
                prisma.product.count(),
            ]);
            res.status(200).json(buildPaginatedResponse(products, total, page, limit));
        } catch (error) { next(error); }
    }

    static async getPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            const product = await prisma.product.findUnique({
                where: { id },
                include: {
                    category: { select: { id: true, name: true, is_active: true } },
                    brand: { select: { id: true, name: true } },
                    options: true,
                    images: true,
                },
            });
            if (!product) throw new CustomError(404, 'Product not found');
            res.status(200).json({ success: true, data: product });
        } catch (error) { next(error); }
    }

    static async listAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, skip } = getPaginationQuery(req);
            const [products, total] = await Promise.all([
                prisma.product.findMany({
                    skip, take: limit,
                    include: {
                        category: { select: { id: true, name: true } },
                        brand: { select: { id: true, name: true } },
                        options: true,
                        images: true,
                    },
                    orderBy: { created_at: 'desc' },
                }),
                prisma.product.count(),
            ]);
            res.status(200).json(buildPaginatedResponse(products, total, page, limit));
        } catch (error) { next(error); }
    }

    static async getAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            const product = await prisma.product.findUnique({
                where: { id },
                include: { category: true, brand: true, options: true, images: true },
            });
            if (!product) throw new CustomError(404, 'Product not found');
            res.status(200).json({ success: true, data: product });
        } catch (error) { next(error); }
    }

    static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const body = productSchema.parse(req.body);
            const [categoryExists, brandExists] = await Promise.all([
                prisma.category.findUnique({ where: { id: body.category_id } }),
                body.brand_id ? prisma.brand.findUnique({ where: { id: body.brand_id } }) : Promise.resolve(true),
            ]);
            if (!categoryExists) throw new CustomError(400, 'Referenced category does not exist');
            if (body.brand_id && !brandExists) throw new CustomError(400, 'Referenced brand does not exist');

            const product = await prisma.product.create({
                data: {
                    name: body.name,
                    sku: body.sku ?? null,
                    description: body.description ?? null,
                    category_id: body.category_id,
                    brand_id: body.brand_id ?? null,
                    arabic: body.arabic ?? null,
                    hebrew: body.hebrew ?? null,
                    arabic_description: body.arabic_description ?? null,
                    hebrew_description: body.hebrew_description ?? null,
                },
            });
            res.status(201).json({ success: true, data: product });
        } catch (error) { next(error); }
    }

    static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            const body = updateProductSchema.parse(req.body);
            const product = await prisma.product.findUnique({ where: { id } });
            if (!product) throw new CustomError(404, 'Product not found');

            if (body.category_id) {
                const exists = await prisma.category.findUnique({ where: { id: body.category_id } });
                if (!exists) throw new CustomError(400, 'Referenced category does not exist');
            }
            if (body.brand_id) {
                const exists = await prisma.brand.findUnique({ where: { id: body.brand_id } });
                if (!exists) throw new CustomError(400, 'Referenced brand does not exist');
            }

            const updatedProduct = await prisma.product.update({
                where: { id },
                data: {
                    name: body.name ?? product.name,
                    sku: body.sku !== undefined ? body.sku : (product as any).sku,
                    description: body.description !== undefined ? body.description : product.description,
                    category_id: body.category_id ?? product.category_id,
                    brand_id: body.brand_id ?? product.brand_id,
                    arabic: body.arabic !== undefined ? body.arabic : product.arabic,
                    hebrew: body.hebrew !== undefined ? body.hebrew : product.hebrew,
                    arabic_description: body.arabic_description !== undefined ? body.arabic_description : (product as any).arabic_description,
                    hebrew_description: body.hebrew_description !== undefined ? body.hebrew_description : (product as any).hebrew_description,
                },
            });
            res.status(200).json({ success: true, data: updatedProduct });
        } catch (error) { next(error); }
    }

    static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            const product = await prisma.product.findUnique({
                where: { id },
                include: {
                    options: { select: { image_url: true } },
                    images: { select: { image_url: true } },
                },
            });
            if (!product) throw new CustomError(404, 'Product not found');

            const imagesToDelete: string[] = [];
            product.images.forEach((img: { image_url: string }) => { if (img.image_url) imagesToDelete.push(img.image_url); });
            product.options.forEach((opt: { image_url: string | null }) => { if (opt.image_url) imagesToDelete.push(opt.image_url); });

            await prisma.product.delete({ where: { id } });

            for (const url of imagesToDelete) {
                try { await R2Service.deleteImage(url); }
                catch (r2Error) { console.error(`Failed to clean up product image from R2: ${url}`, r2Error); }
            }

            res.status(200).json({ success: true, data: {} });
        } catch (error) { next(error); }
    }
}
