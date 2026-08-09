import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { R2Service } from '../../services/r2.service';
import { CustomError } from '../../middleware/errorHandler';
import { getPaginationQuery, buildPaginatedResponse } from '../../lib/pagination';

const sliderSchema = z.object({
    name: z.string().min(1, 'Slider name is required'),
    description: z.string().nullable().optional(),
    interval: z.preprocess((val) => (val === undefined || val === '' || val === null ? 5000 : Number(val)), z.number().int().default(5000)),
    image_url: z.string().url('image_url must be a valid URL'),
    is_active: z.boolean().default(true),
    arabic: z.string().nullable().optional(),
    hebrew: z.string().nullable().optional(),
});

const updateSliderSchema = sliderSchema.partial();

export class SliderController {
    static async listPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, skip } = getPaginationQuery(req);
            const where = { is_active: true };
            const [sliders, total] = await Promise.all([
                prisma.slider.findMany({ where, skip, take: limit, orderBy: { created_at: 'desc' } }),
                prisma.slider.count({ where }),
            ]);
            res.status(200).json(buildPaginatedResponse(sliders, total, page, limit));
        } catch (error) { next(error); }
    }

    static async getPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            const slider = await prisma.slider.findFirst({ where: { id, is_active: true } });
            if (!slider) throw new CustomError(404, 'Slider not found or inactive');
            res.status(200).json({ success: true, data: slider });
        } catch (error) { next(error); }
    }

    static async listAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, skip } = getPaginationQuery(req);
            const [sliders, total] = await Promise.all([
                prisma.slider.findMany({ skip, take: limit, orderBy: { created_at: 'desc' } }),
                prisma.slider.count(),
            ]);
            res.status(200).json(buildPaginatedResponse(sliders, total, page, limit));
        } catch (error) { next(error); }
    }

    static async getAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            const slider = await prisma.slider.findUnique({ where: { id } });
            if (!slider) throw new CustomError(404, 'Slider not found');
            res.status(200).json({ success: true, data: slider });
        } catch (error) { next(error); }
    }

    static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const body = sliderSchema.parse(req.body);
            const slider = await prisma.slider.create({
                data: {
                    name: body.name,
                    description: body.description ?? null,
                    interval: body.interval,
                    image_url: body.image_url,
                    is_active: body.is_active,
                    arabic: body.arabic ?? null,
                    hebrew: body.hebrew ?? null,
                },
            });
            res.status(201).json({ success: true, data: slider });
        } catch (error) { next(error); }
    }

    static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            const body = updateSliderSchema.parse(req.body);
            const slider = await prisma.slider.findUnique({ where: { id } });
            if (!slider) throw new CustomError(404, 'Slider not found');

            let oldImageUrl: string | null = null;
            if (body.image_url !== undefined && body.image_url !== slider.image_url) {
                oldImageUrl = slider.image_url;
            }

            const updatedSlider = await prisma.slider.update({
                where: { id },
                data: {
                    name: body.name ?? slider.name,
                    description: body.description !== undefined ? body.description : slider.description,
                    interval: body.interval ?? slider.interval,
                    image_url: body.image_url ?? slider.image_url,
                    is_active: body.is_active ?? slider.is_active,
                    arabic: body.arabic !== undefined ? body.arabic : slider.arabic,
                    hebrew: body.hebrew !== undefined ? body.hebrew : slider.hebrew,
                },
            });

            if (oldImageUrl) {
                try { await R2Service.deleteImage(oldImageUrl); }
                catch (r2Error) { console.error(`Failed to clean up old slider image: ${oldImageUrl}`, r2Error); }
            }

            res.status(200).json({ success: true, data: updatedSlider });
        } catch (error) { next(error); }
    }

    static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            const slider = await prisma.slider.findUnique({ where: { id } });
            if (!slider) throw new CustomError(404, 'Slider not found');

            await prisma.slider.delete({ where: { id } });

            if (slider.image_url) {
                try { await R2Service.deleteImage(slider.image_url); }
                catch (r2Error) { console.error(`Failed to delete slider image from R2: ${slider.image_url}`, r2Error); }
            }

            res.status(200).json({ success: true, data: {} });
        } catch (error) { next(error); }
    }
}
