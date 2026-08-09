import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { R2Service } from '../../services/r2.service';
import { CustomError } from '../../middleware/errorHandler';
import { getPaginationQuery, buildPaginatedResponse } from '../../lib/pagination';

const adSchema = z.object({
    description: z.string().nullable().optional(),
    display_order: z.preprocess((val) => (val === undefined || val === '' || val === null ? 0 : Number(val)), z.number().int().default(0)),
    image_url: z.string().url('image_url must be a valid URL'),
    is_active: z.boolean().default(true),
    arabic: z.string().nullable().optional(),
    hebrew: z.string().nullable().optional(),
});

const updateAdSchema = adSchema.partial();

export class AdController {
    static async listPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, skip } = getPaginationQuery(req);
            const where = { is_active: true };
            const [ads, total] = await Promise.all([
                prisma.ad.findMany({ where, skip, take: limit, orderBy: [{ display_order: 'asc' }, { created_at: 'desc' }] }),
                prisma.ad.count({ where }),
            ]);
            res.status(200).json(buildPaginatedResponse(ads, total, page, limit));
        } catch (error) { next(error); }
    }

    static async getPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            const ad = await prisma.ad.findFirst({ where: { id, is_active: true } });
            if (!ad) throw new CustomError(404, 'Ad not found or inactive');
            res.status(200).json({ success: true, data: ad });
        } catch (error) { next(error); }
    }

    static async listAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, skip } = getPaginationQuery(req);
            const [ads, total] = await Promise.all([
                prisma.ad.findMany({ skip, take: limit, orderBy: [{ display_order: 'asc' }, { created_at: 'desc' }] }),
                prisma.ad.count(),
            ]);
            res.status(200).json(buildPaginatedResponse(ads, total, page, limit));
        } catch (error) { next(error); }
    }

    static async getAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            const ad = await prisma.ad.findUnique({ where: { id } });
            if (!ad) throw new CustomError(404, 'Ad not found');
            res.status(200).json({ success: true, data: ad });
        } catch (error) { next(error); }
    }

    static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const body = adSchema.parse(req.body);
            const ad = await prisma.ad.create({
                data: {
                    description: body.description ?? null,
                    display_order: body.display_order,
                    image_url: body.image_url,
                    is_active: body.is_active,
                    arabic: body.arabic ?? null,
                    hebrew: body.hebrew ?? null,
                },
            });
            res.status(201).json({ success: true, data: ad });
        } catch (error) { next(error); }
    }

    static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            const body = updateAdSchema.parse(req.body);
            const ad = await prisma.ad.findUnique({ where: { id } });
            if (!ad) throw new CustomError(404, 'Ad not found');

            let oldImageUrl: string | null = null;
            if (body.image_url !== undefined && body.image_url !== ad.image_url) {
                oldImageUrl = ad.image_url;
            }

            const updatedAd = await prisma.ad.update({
                where: { id },
                data: {
                    description: body.description !== undefined ? body.description : ad.description,
                    display_order: body.display_order ?? ad.display_order,
                    image_url: body.image_url ?? ad.image_url,
                    is_active: body.is_active ?? ad.is_active,
                    arabic: body.arabic !== undefined ? body.arabic : ad.arabic,
                    hebrew: body.hebrew !== undefined ? body.hebrew : ad.hebrew,
                },
            });

            if (oldImageUrl) {
                try { await R2Service.deleteImage(oldImageUrl); }
                catch (r2Error) { console.error(`Failed to clean up old ad image: ${oldImageUrl}`, r2Error); }
            }

            res.status(200).json({ success: true, data: updatedAd });
        } catch (error) { next(error); }
    }

    static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            const ad = await prisma.ad.findUnique({ where: { id } });
            if (!ad) throw new CustomError(404, 'Ad not found');

            await prisma.ad.delete({ where: { id } });

            if (ad.image_url) {
                try { await R2Service.deleteImage(ad.image_url); }
                catch (r2Error) { console.error(`Failed to delete ad image from R2: ${ad.image_url}`, r2Error); }
            }

            res.status(200).json({ success: true, data: {} });
        } catch (error) { next(error); }
    }
}
