import { Request } from 'express';

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PaginatedResult<T> {
    success: boolean;
    data: T[];
    pagination: PaginationMeta;
}

export function getPaginationQuery(req: Request) {
    const page  = Math.max(1, parseInt(req.query.page  as string) || 1);
    // Admin endpoints keep 100 max; public product listing allows up to 1000
    // so the frontend can fetch all matching products in one request.
    const maxLimit = req.path?.includes('/admin/') ? 100 : 1000;
    const limit = Math.max(1, Math.min(maxLimit, parseInt(req.query.limit as string) || 20));
    const skip  = (page - 1) * limit;
    return { page, limit, skip };
}

export function buildPaginatedResponse<T>(
    data: T[],
    total: number,
    page: number,
    limit: number
): PaginatedResult<T> {
    const totalPages = Math.ceil(total / limit);
    return {
        success: true,
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages,
        },
    };
}
