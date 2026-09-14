import { Request, Response, NextFunction } from 'express';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Strips the most dangerous XSS vectors from a string:
 *   - <script …> … </script> blocks
 *   - Inline event handlers (onclick=, onerror=, onload= …)
 *   - javascript: URI scheme
 *   - Null bytes
 *   - HTML comments <!-- … -->
 *
 * We intentionally do NOT strip all HTML tags here because some fields
 * (e.g. product descriptions) may legitimately contain < or >.
 * The goal is to neutralise active script injection, not sanitise markup.
 */
function sanitizeString(value: string): string {
    return value
        // Null bytes
        .replace(/\0/g, '')
        // <script> blocks (case-insensitive, multiline)
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
        // Standalone <script …> without closing tag
        .replace(/<script\b[^>]*>/gi, '')
        // Inline event handlers: on[event]=… (covers onclick, onerror, onload, etc.)
        .replace(/\bon\w+\s*=\s*["']?[^"'>]*/gi, '')
        // javascript: URI scheme
        .replace(/javascript\s*:/gi, '')
        // data: URI (can carry base64-encoded payloads)
        .replace(/data\s*:/gi, '')
        // HTML comments
        .replace(/<!--[\s\S]*?-->/g, '');
}

/**
 * Recursively walks any JSON-parsed body value and sanitizes every string.
 * Non-string primitives are returned untouched.
 * Throws a RangeError if nesting exceeds maxDepth (JSON bomb protection).
 */
function sanitizeValue(value: unknown, depth = 0, maxDepth = 12): unknown {
    if (depth > maxDepth) {
        throw new RangeError('Request body nesting too deep');
    }
    if (typeof value === 'string') {
        return sanitizeString(value);
    }
    if (Array.isArray(value)) {
        return value.map(item => sanitizeValue(item, depth + 1, maxDepth));
    }
    if (value !== null && typeof value === 'object') {
        const sanitized: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(value)) {
            // Also sanitize the key itself
            const safeKey = sanitizeString(k);
            sanitized[safeKey] = sanitizeValue(v, depth + 1, maxDepth);
        }
        return sanitized;
    }
    return value; // number, boolean, null — untouched
}

// ─── Middleware ───────────────────────────────────────────────────────────────

/**
 * 1. Content-Type check — POST / PUT / PATCH requests that send a body
 *    must declare application/json (or multipart/form-data for uploads).
 *    Rejects anything else (text/plain, application/xml, etc.) with 415.
 */
export const requireJsonContentType = (
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    const methodsWithBody = ['POST', 'PUT', 'PATCH'];
    if (!methodsWithBody.includes(req.method)) {
        next();
        return;
    }

    const ct = req.headers['content-type'] || '';

    // Allow multipart (file uploads) and json; reject everything else
    if (
        ct.startsWith('application/json') ||
        ct.startsWith('multipart/form-data') ||
        ct === '' // body-less POST (e.g. query-param only) — fine
    ) {
        next();
        return;
    }

    res.status(415).json({
        success: false,
        message: 'Unsupported Media Type: Content-Type must be application/json',
    });
};

/**
 * 2. Body sanitization — walks the parsed JSON body and removes XSS vectors.
 *    Must run AFTER express.json() so req.body is already parsed.
 *    Skips multipart requests (files handled by multer separately).
 */
export const sanitizeBody = (
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    // Skip non-JSON and file-upload requests
    const ct = req.headers['content-type'] || '';
    if (!ct.startsWith('application/json')) {
        next();
        return;
    }

    if (!req.body || typeof req.body !== 'object') {
        next();
        return;
    }

    try {
        req.body = sanitizeValue(req.body) as Record<string, unknown>;
        next();
    } catch (err) {
        if (err instanceof RangeError) {
            res.status(400).json({
                success: false,
                message: 'Request body is too deeply nested',
            });
            return;
        }
        next(err);
    }
};

/**
 * 3. Query-string sanitization — sanitizes every string in req.query.
 *    Prevents XSS via crafted search parameters.
 */
export const sanitizeQuery = (
    req: Request,
    _res: Response,
    next: NextFunction,
): void => {
    if (req.query && typeof req.query === 'object') {
        for (const [key, val] of Object.entries(req.query)) {
            if (typeof val === 'string') {
                (req.query as any)[key] = sanitizeString(val);
            }
        }
    }
    next();
};
