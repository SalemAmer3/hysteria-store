import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middleware/errorHandler';
import { requireJsonContentType, sanitizeBody, sanitizeQuery } from './middleware/sanitize';
import { env } from './config/env';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import categoryRoutes from './modules/categories/category.routes';
import productRoutes from './modules/products/product.routes';
import brandRoutes from './modules/brands/brand.routes';
import productOptionRoutes from './modules/product-options/productOption.routes';
import productImageRoutes from './modules/product-images/productImage.routes';
import sliderRoutes from './modules/sliders/slider.routes';
import couponRoutes from './modules/coupons/coupon.routes';
import adRoutes from './modules/ads/ad.routes';
import uploadRoutes from './modules/uploads/upload.routes';
import tickerRoutes from './modules/ticker/ticker.routes';
import translateRoutes from './modules/translate/translate.routes';

const app = express();

// ── Security: Helmet (HTTP headers hardening) ──────────────────────────────
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            imgSrc:     ["'self'", 'data:', 'blob:', env.R2_PUBLIC_URL],
            scriptSrc:  ["'self'"],
            styleSrc:   ["'self'", "'unsafe-inline'"],
            connectSrc: ["'self'"],
            frameSrc:   ["'none'"],
            objectSrc:  ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false, // keep compatible with swagger-ui
}));

// ── Security: CORS ─────────────────────────────────────────────────────────
const allowedOrigins = env.CORS_ORIGIN === '*'
    ? true
    : env.CORS_ORIGIN.split(',').map(o => o.trim());

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

// ═══════════════════════════════════════════════════════════════════════════
// RATE LIMITING
// Each limiter targets a specific surface area so legitimate traffic is
// never affected while abuse / brute-force is blocked quickly.
// ═══════════════════════════════════════════════════════════════════════════

// 1. Auth — brute-force protection
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 20,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' },
    skipSuccessfulRequests: true,
});

// 2. General public API (read-heavy, generous limit)
const apiLimiter = rateLimit({
    windowMs: 60 * 1000,  // 1 min
    max: 300,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Please slow down.' },
    skip: (req: Request) => req.path === '/health',
});

// 3. Admin write operations (POST / PUT / DELETE on /admin/*)
//    Tighter than the public API — admins rarely need >60 writes/min.
const adminWriteLimiter = rateLimit({
    windowMs: 60 * 1000,  // 1 min
    max: 60,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, message: 'Too many admin write requests. Please slow down.' },
    skip: (req: Request) => req.method === 'GET', // reads are not write operations
});

// 4. File uploads — expensive on CPU/storage, keep low
const uploadLimiter = rateLimit({
    windowMs: 60 * 1000,  // 1 min
    max: 30,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, message: 'Too many upload requests. Please slow down.' },
});

// 5. Translation proxy — calls an external API on every request,
//    so we keep it tight to avoid exhausting the MyMemory daily quota.
const translateLimiter = rateLimit({
    windowMs: 60 * 1000,  // 1 min
    max: 15,              // 15 translation requests per minute per IP
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, message: 'Too many translation requests. Please wait a moment.' },
});

// Apply limiters (order matters — more specific paths applied after the broad one)
app.use('/api',                     apiLimiter);
app.use('/api/auth',                authLimiter);
app.use('/api/admin',               adminWriteLimiter);
app.use('/api/admin/uploads',       uploadLimiter);
app.use('/api/admin/translate',     translateLimiter);

// ── Body parsing ────────────────────────────────────────────────────────────
// 1 MB cap prevents oversized payload attacks (JSON bombs, etc.)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ═══════════════════════════════════════════════════════════════════════════
// INPUT SANITIZATION (runs after body parsing, before routes)
// ═══════════════════════════════════════════════════════════════════════════

// Reject wrong Content-Type on mutation requests
app.use(requireJsonContentType);

// Strip XSS vectors from all parsed JSON bodies
app.use(sanitizeBody);

// Strip XSS vectors from all query parameters
app.use(sanitizeQuery);

// ── Swagger docs ────────────────────────────────────────────────────────────
app.get('/api-docs.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Histeria API Docs',
    swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
    },
}));

// ── Health check ────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API routes ───────────────────────────────────────────────────────────────
const API_BASE = '/api';
app.use(`${API_BASE}/auth`,  authRoutes);
app.use(API_BASE,            categoryRoutes);
app.use(API_BASE,            productRoutes);
app.use(API_BASE,            brandRoutes);
app.use(API_BASE,            productOptionRoutes);
app.use(API_BASE,            productImageRoutes);
app.use(API_BASE,            sliderRoutes);
app.use(API_BASE,            couponRoutes);
app.use(API_BASE,            adRoutes);
app.use(API_BASE,            uploadRoutes);
app.use(API_BASE,            tickerRoutes);
app.use(API_BASE,            translateRoutes);

// ── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global error handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

export default app;
