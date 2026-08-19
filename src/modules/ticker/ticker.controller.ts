import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { CustomError } from '../../middleware/errorHandler';
import { getPaginationQuery, buildPaginatedResponse } from '../../lib/pagination';

const tickerSchema = z.object({
    text: z.string().min(1, 'Ticker text is required'),
    arabic: z.string().nullable().optional(),
    hebrew: z.string().nullable().optional(),
    is_active: z.boolean().default(true),
    order: z.preprocess((v) => (v === undefined || v === '' || v === null ? 0 : Number(v)), z.number().int().default(0)),
});

const updateTickerSchema = tickerSchema.partial();

export class TickerController {
    static async listPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const tickers = await prisma.ticker.findMany({
                where: { is_active: true },
                orderBy: [{ order: 'asc' }, { created_at: 'asc' }],
            });
            res.status(200).json({ success: true, data: tickers });
        } catch (error) { next(error); }
    }

    static async listAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, skip } = getPaginationQuery(req);
            const [tickers, total] = await Promise.all([
                prisma.ticker.findMany({ skip, take: limit, orderBy: [{ order: 'asc' }, { created_at: 'asc' }] }),
                prisma.ticker.count(),
            ]);
            res.status(200).json(buildPaginatedResponse(tickers, total, page, limit));
        } catch (error) { next(error); }
    }

    static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const body = tickerSchema.parse(req.body);
            const ticker = await prisma.ticker.create({
                data: {
                    text: body.text,
                    arabic: body.arabic ?? null,
                    hebrew: body.hebrew ?? null,
                    is_active: body.is_active,
                    order: body.order,
                },
            });
            res.status(201).json({ success: true, data: ticker });
        } catch (error) { next(error); }
    }

    static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            const body = updateTickerSchema.parse(req.body);
            const ticker = await prisma.ticker.findUnique({ where: { id } });
            if (!ticker) throw new CustomError(404, 'Ticker not found');
            const updated = await prisma.ticker.update({
                where: { id },
                data: {
                    text: body.text ?? ticker.text,
                    arabic: body.arabic !== undefined ? body.arabic : ticker.arabic,
                    hebrew: body.hebrew !== undefined ? body.hebrew : ticker.hebrew,
                    is_active: body.is_active ?? ticker.is_active,
                    order: body.order ?? ticker.order,
                },
            });
            res.status(200).json({ success: true, data: updated });
        } catch (error) { next(error); }
    }

    static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            const ticker = await prisma.ticker.findUnique({ where: { id } });
            if (!ticker) throw new CustomError(404, 'Ticker not found');
            await prisma.ticker.delete({ where: { id } });
            res.status(200).json({ success: true, data: {} });
        } catch (error) { next(error); }
    }
}
