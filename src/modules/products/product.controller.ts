import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { R2Service } from '../../services/r2.service';
import { CustomError } from '../../middleware/errorHandler';
import { getPaginationQuery, buildPaginatedResponse } from '../../lib/pagination';
import { normalizeForSearch } from '../../lib/arabicNormalization';
import { expandQueryWithSynonyms } from '../../lib/synonyms';
import { rankProducts, SearchableProduct } from '../../lib/searchRanking';

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
    search_keywords: z.array(z.string()).optional(),
});

const updateProductSchema = productSchema.partial();

export class ProductController {
    /**
     * Autocomplete/Suggestions endpoint
     * Returns quick search suggestions based on query
     */
    static async autocomplete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const query = req.query.q ? String(req.query.q).trim() : '';
            const limit = req.query.limit ? Math.min(Number(req.query.limit), 10) : 5;
            
            if (!query || query.length < 2) {
                res.status(200).json({ success: true, data: { suggestions: [], products: [] } });
                return;
            }
            
            const normalizedQuery = normalizeForSearch(query);
            const expandedTerms = expandQueryWithSynonyms(query);
            
            // Build search conditions
            const searchConditions: any[] = [];
            expandedTerms.forEach(term => {
                searchConditions.push(
                    { name:    { contains: term, mode: 'insensitive' } },
                    { arabic:  { contains: term, mode: 'insensitive' } },
                    { search_keywords: { has: term } },
                );
            });
            
            searchConditions.push(
                { name:    { contains: normalizedQuery, mode: 'insensitive' } },
                { arabic:  { contains: normalizedQuery, mode: 'insensitive' } },
            );
            
            // Fetch matching products
            const products = await prisma.product.findMany({
                where: { OR: searchConditions },
                include: {
                    category: { select: { id: true, name: true, arabic: true } },
                    brand:    { select: { id: true, name: true } },
                    images:   { select: { image_url: true }, take: 1 },
                    options:  { select: { price: true }, take: 1 },
                },
                take: limit * 3, // Fetch more for ranking
            });
            
            // Rank products
            const ranked = rankProducts(products as SearchableProduct[], query);
            
            // Extract unique suggestions from product names
            const suggestions = Array.from(
                new Set(
                    ranked
                        .slice(0, limit)
                        .map(p => p.arabic || p.name)
                )
            ).slice(0, limit);
            
            // Return top products with images
            const topProducts = ranked.slice(0, limit).map(p => ({
                id: p.id,
                name: p.arabic || p.name,
                image: (p as any).images?.[0]?.image_url || null,
                price: (p as any).options?.[0]?.price || null,
                category: p.category?.arabic || p.category?.name || null,
            }));
            
            res.status(200).json({
                success: true,
                data: {
                    suggestions,
                    products: topProducts,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    static async listPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, skip } = getPaginationQuery(req);
            const search     = req.query.search ? String(req.query.search) : undefined;
            const brandId    = req.query.brand  ? String(req.query.brand)  : undefined;

            // category_ids = comma-separated list of UUIDs (selected category + all its
            // descendants, resolved client-side from the category tree).
            // Falls back to legacy single `category` param for backwards compat.
            let categoryIds: string[] | undefined;
            if (req.query.category_ids) {
                categoryIds = String(req.query.category_ids)
                    .split(',')
                    .map(s => s.trim())
                    .filter(Boolean);
            } else if (req.query.category) {
                categoryIds = [String(req.query.category)];
            }

            const where: any = {};

            // Apply category and brand filters first
            if (categoryIds && categoryIds.length === 1) {
                where.category_id = categoryIds[0];
            } else if (categoryIds && categoryIds.length > 1) {
                where.category_id = { in: categoryIds };
            }

            if (brandId) where.brand_id = brandId;

            // If search query provided, use advanced search with ranking
            if (search && search.trim().length > 0) {
                // Step 1: Build broad PostgreSQL query to get candidate products
                const normalizedQuery = normalizeForSearch(search);
                const expandedTerms = expandQueryWithSynonyms(search);
                
                // Build OR conditions for all expanded terms
                const searchConditions: any[] = [];
                
                expandedTerms.forEach(term => {
                    searchConditions.push(
                        { name:               { contains: term, mode: 'insensitive' } },
                        { arabic:             { contains: term, mode: 'insensitive' } },
                        { hebrew:             { contains: term, mode: 'insensitive' } },
                        { sku:                { contains: term, mode: 'insensitive' } },
                        { description:        { contains: term, mode: 'insensitive' } },
                        { arabic_description: { contains: term, mode: 'insensitive' } },
                        { hebrew_description: { contains: term, mode: 'insensitive' } },
                        { search_keywords:    { has: term } },
                    );
                });
                
                // Also check normalized versions
                searchConditions.push(
                    { name:               { contains: normalizedQuery, mode: 'insensitive' } },
                    { arabic:             { contains: normalizedQuery, mode: 'insensitive' } },
                    { hebrew:             { contains: normalizedQuery, mode: 'insensitive' } },
                );
                
                where.OR = searchConditions;
                
                // Step 2: Fetch all matching products (without pagination first)
                const allProducts = await prisma.product.findMany({
                    where,
                    include: {
                        category: { select: { id: true, name: true, arabic: true, hebrew: true, is_active: true } },
                        brand:    { select: { id: true, name: true } },
                        options:  true,
                        images:   true,
                    },
                });
                
                // Step 3: Rank products by relevance
                const rankedProducts = rankProducts(
                    allProducts as SearchableProduct[],
                    search
                );
                
                // Step 4: Apply pagination to ranked results
                const total = rankedProducts.length;
                const paginatedProducts = rankedProducts.slice(skip, skip + limit);
                
                res.status(200).json(buildPaginatedResponse(paginatedProducts, total, page, limit));
            } else {
                // No search query - return normal listing
                const [products, total] = await Promise.all([
                    prisma.product.findMany({
                        where, skip, take: limit,
                        include: {
                            category: { select: { id: true, name: true, is_active: true } },
                            brand:    { select: { id: true, name: true } },
                            options:  true,
                            images:   true,
                        },
                        orderBy: { created_at: 'desc' },
                    }),
                    prisma.product.count({ where }),
                ]);
                res.status(200).json(buildPaginatedResponse(products, total, page, limit));
            }
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
            const search = req.query.search ? String(req.query.search) : undefined;

            const where: any = {};
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { arabic: { contains: search, mode: 'insensitive' } },
                    { sku: { contains: search, mode: 'insensitive' } },
                ];
            }

            const [products, total] = await Promise.all([
                prisma.product.findMany({
                    where, skip, take: limit,
                    include: {
                        category: { select: { id: true, name: true } },
                        brand: { select: { id: true, name: true } },
                        options: true,
                        images: true,
                    },
                    orderBy: { created_at: 'desc' },
                }),
                prisma.product.count({ where }),
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
                    search_keywords: body.search_keywords ?? [],
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
                    name:                body.name             !== undefined ? body.name             : product.name,
                    sku:                 body.sku              !== undefined ? body.sku              : (product as any).sku,
                    description:         body.description      !== undefined ? body.description      : product.description,
                    category_id:         body.category_id      !== undefined ? body.category_id      : product.category_id,
                    brand_id:            body.brand_id         !== undefined ? body.brand_id         : product.brand_id,
                    arabic:              body.arabic           !== undefined ? body.arabic           : product.arabic,
                    hebrew:              body.hebrew           !== undefined ? body.hebrew           : product.hebrew,
                    arabic_description:  body.arabic_description  !== undefined ? body.arabic_description  : (product as any).arabic_description,
                    hebrew_description:  body.hebrew_description  !== undefined ? body.hebrew_description  : (product as any).hebrew_description,
                    search_keywords:     body.search_keywords  !== undefined ? body.search_keywords  : (product as any).search_keywords,
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
