import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { R2Service } from '../../services/r2.service';
import { CustomError } from '../../middleware/errorHandler';
import { getPaginationQuery, buildPaginatedResponse } from '../../lib/pagination';

const brandSchema = z.object({
    name: z.string().min(1, 'Brand name is required'),
    order: z.preprocess((val) => (val === undefined || val === '' || val === null ? 0 : Number(val)), z.number().int().default(0)),
    link: z.string().url().nullable().optional(),
    image_url: z.string().url().nullable().optional(),
});

const updateBrandSchema = brandSchema.partial();

export class BrandController {
    static async listPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, skip } = getPaginationQuery(req);
            const [brands, total] = await Promise.all([
                prisma.brand.findMany({ skip, take: limit, orderBy: { order: 'asc' } }),
                prisma.brand.count(),
            ]);
            res.status(200).json(buildPaginatedResponse(brands, total, page, limit));
        } catch (error) { next(error); }
    }

    static async getPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            const brand = await prisma.brand.findUnique({ where: { id } });
            if (!brand) throw new CustomError(404, 'Brand not found');
            res.status(200).json({ success: true, data: brand });
        } catch (error) { next(error); }
    }

    static async listAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, skip } = getPaginationQuery(req);
            const [brands, total] = await Promise.all([
                prisma.brand.findMany({ skip, take: limit, orderBy: { order: 'asc' } }),
                prisma.brand.count(),
            ]);
            res.status(200).json(buildPaginatedResponse(brands, total, page, limit));
        } catch (error) { next(error); }
    }

    static async getAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            const brand = await prisma.brand.findUnique({ where: { id } });
            if (!brand) throw new CustomError(404, 'Brand not found');
            res.status(200).json({ success: true, data: brand });
        } catch (error) { next(error); }
    }

    static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const body = brandSchema.parse(req.body);
            const brand = await prisma.brand.create({
                data: { name: body.name, order: body.order, link: body.link ?? null, image_url: body.image_url ?? null },
            });
            res.status(201).json({ success: true, data: brand });
        } catch (error) { next(error); }
    }

    static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            const body = updateBrandSchema.parse(req.body);
            const brand = await prisma.brand.findUnique({ where: { id } });
            if (!brand) throw new CustomError(404, 'Brand not found');

            let oldImageUrl: string | null = null;
            if (body.image_url !== undefined && body.image_url !== brand.image_url) {
                oldImageUrl = brand.image_url;
            }

            const updatedBrand = await prisma.brand.update({
                where: { id },
                data: {
                    name: body.name ?? brand.name,
                    order: body.order ?? brand.order,
                    link: body.link !== undefined ? body.link : brand.link,
                    image_url: body.image_url !== undefined ? body.image_url : brand.image_url,
                },
            });

            if (oldImageUrl) {
                try { await R2Service.deleteImage(oldImageUrl); }
                catch (r2Error) { console.error(`Failed to clean up old brand image: ${oldImageUrl}`, r2Error); }
            }

            res.status(200).json({ success: true, data: updatedBrand });
        } catch (error) { next(error); }
    }

    static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            const brand = await prisma.brand.findUnique({ where: { id } });
            if (!brand) throw new CustomError(404, 'Brand not found');

            await prisma.brand.delete({ where: { id } });

            if (brand.image_url) {
                try { await R2Service.deleteImage(brand.image_url); }
                catch (r2Error) { console.error(`Failed to delete brand image from R2: ${brand.image_url}`, r2Error); }
            }

            res.status(200).json({ success: true, data: {} });
        } catch (error) { next(error); }
    }
}
