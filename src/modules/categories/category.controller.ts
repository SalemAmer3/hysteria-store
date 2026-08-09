import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { R2Service } from '../../services/r2.service';
import { CustomError } from '../../middleware/errorHandler';
import { getPaginationQuery, buildPaginatedResponse } from '../../lib/pagination';

const categorySchema = z.object({
    name: z.string().min(1, 'Category name is required'),
    description: z.string().nullable().optional(),
    order: z.preprocess((val) => (val === undefined || val === '' || val === null ? 0 : Number(val)), z.number().int().default(0)),
    image_url: z.string().url().nullable().optional(),
    is_active: z.boolean().default(true),
    parent_id: z.string().uuid().nullable().optional(),
    arabic: z.string().nullable().optional(),
    hebrew: z.string().nullable().optional(),
});

const updateCategorySchema = categorySchema.partial();

async function isDescendant(possibleChildId: string, ancestorId: string): Promise<boolean> {
    let currentId: string | null = possibleChildId;
    const visited = new Set<string>();
    while (currentId) {
        if (currentId === ancestorId) return true;
        if (visited.has(currentId)) break;
        visited.add(currentId);
        const cat: { parent_id: string | null } | null = await prisma.category.findUnique({ where: { id: currentId }, select: { parent_id: true } });
        if (!cat || !cat.parent_id) break;
        currentId = cat.parent_id;
    }
    return false;
}

export class CategoryController {
    static async listPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, skip } = getPaginationQuery(req);
            const where = { is_active: true };
            const [categories, total] = await Promise.all([
                prisma.category.findMany({ where, skip, take: limit, orderBy: { order: 'asc' }, include: { parent: true } }),
                prisma.category.count({ where }),
            ]);
            res.status(200).json(buildPaginatedResponse(categories, total, page, limit));
        } catch (error) { next(error); }
    }

    static async getPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            const category = await prisma.category.findFirst({
                where: { id, is_active: true },
                include: { parent: true, children: { where: { is_active: true } } },
            });
            if (!category) throw new CustomError(404, 'Category not found or inactive');
            res.status(200).json({ success: true, data: category });
        } catch (error) { next(error); }
    }

    static async listAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, skip } = getPaginationQuery(req);
            const [categories, total] = await Promise.all([
                prisma.category.findMany({ skip, take: limit, orderBy: { order: 'asc' }, include: { parent: true } }),
                prisma.category.count(),
            ]);
            res.status(200).json(buildPaginatedResponse(categories, total, page, limit));
        } catch (error) { next(error); }
    }

    static async getAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            const category = await prisma.category.findUnique({
                where: { id },
                include: { parent: true, children: true },
            });
            if (!category) throw new CustomError(404, 'Category not found');
            res.status(200).json({ success: true, data: category });
        } catch (error) { next(error); }
    }

    static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const body = categorySchema.parse(req.body);
            if (body.parent_id) {
                const parentExists = await prisma.category.findUnique({ where: { id: body.parent_id } });
                if (!parentExists) throw new CustomError(400, 'Parent category does not exist');
            }
            const category = await prisma.category.create({
                data: {
                    name: body.name,
                    description: body.description ?? null,
                    order: body.order,
                    image_url: body.image_url ?? null,
                    is_active: body.is_active,
                    parent_id: body.parent_id ?? null,
                    arabic: body.arabic ?? null,
                    hebrew: body.hebrew ?? null,
                },
            });
            res.status(201).json({ success: true, data: category });
        } catch (error) { next(error); }
    }

    static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            const body = updateCategorySchema.parse(req.body);
            const category = await prisma.category.findUnique({ where: { id } });
            if (!category) throw new CustomError(404, 'Category not found');

            if (body.parent_id) {
                if (body.parent_id === id) throw new CustomError(400, 'A category cannot be its own parent');
                const parentExists = await prisma.category.findUnique({ where: { id: body.parent_id } });
                if (!parentExists) throw new CustomError(400, 'Parent category does not exist');
                const circular = await isDescendant(body.parent_id, id);
                if (circular) throw new CustomError(400, 'Invalid parent_id: creates a circular relationship');
            }

            let oldImageUrl: string | null = null;
            if (body.image_url !== undefined && body.image_url !== category.image_url) {
                oldImageUrl = category.image_url;
            }

            const updatedCategory = await prisma.category.update({
                where: { id },
                data: {
                    name: body.name ?? category.name,
                    description: body.description !== undefined ? body.description : category.description,
                    order: body.order ?? category.order,
                    image_url: body.image_url !== undefined ? body.image_url : category.image_url,
                    is_active: body.is_active ?? category.is_active,
                    parent_id: body.parent_id !== undefined ? body.parent_id : category.parent_id,
                    arabic: body.arabic !== undefined ? body.arabic : category.arabic,
                    hebrew: body.hebrew !== undefined ? body.hebrew : category.hebrew,
                },
            });

            if (oldImageUrl) {
                try { await R2Service.deleteImage(oldImageUrl); }
                catch (r2Error) { console.error(`Failed to delete old category image: ${oldImageUrl}`, r2Error); }
            }

            res.status(200).json({ success: true, data: updatedCategory });
        } catch (error) { next(error); }
    }

    static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            const category = await prisma.category.findUnique({ where: { id } });
            if (!category) throw new CustomError(404, 'Category not found');

            await prisma.category.delete({ where: { id } });

            if (category.image_url) {
                try { await R2Service.deleteImage(category.image_url); }
                catch (r2Error) { console.error(`Failed to delete category image from R2: ${category.image_url}`, r2Error); }
            }

            res.status(200).json({ success: true, data: {} });
        } catch (error) { next(error); }
    }
}
