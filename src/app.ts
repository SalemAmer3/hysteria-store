import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middleware/errorHandler';
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

const app = express();

// ── Security: Helmet (HTTP headers hardening) ──────────────────────────────
app.use(helmet({
    // Allow images from R2 CDN and same origin
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'blob:', env.R2_PUBLIC_URL],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            connectSrc: ["'self'"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
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

// ── Security: Rate limiting ────────────────────────────────────────────────
// Strict limiter for auth endpoints (brute-force protection)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,   // 15 minutes
    max: 20,                     // max 20 login attempts per window per IP
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' },
    skipSuccessfulRequests: true, // don't count successful logins against the limit
});

// General API limiter (prevents scraping / DoS)
const apiLimiter = rateLimit({
    windowMs: 60 * 1000,  // 1 minute
    max: 300,             // 300 requests per minute per IP
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Please slow down.' },
    skip: (req) => req.path === '/health', // don't rate-limit health checks
});

// Tighter limiter for upload endpoint
const uploadLimiter = rateLimit({
    windowMs: 60 * 1000,  // 1 minute
    max: 30,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, message: 'Too many upload requests. Please slow down.' },
});

app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/admin/uploads', uploadLimiter);

// ── Body parsing ────────────────────────────────────────────────────────────
// Limit body size to 1MB to prevent oversized payload attacks
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ── Swagger docs ────────────────────────────────────────────────────────────
app.get('/api-docs.json', (_req, res) => {
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
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API routes ───────────────────────────────────────────────────────────────
const API_BASE = '/api';
app.use(`${API_BASE}/auth`, authRoutes);
app.use(API_BASE, categoryRoutes);
app.use(API_BASE, productRoutes);
app.use(API_BASE, brandRoutes);
app.use(API_BASE, productOptionRoutes);
app.use(API_BASE, productImageRoutes);
app.use(API_BASE, sliderRoutes);
app.use(API_BASE, couponRoutes);
app.use(API_BASE, adRoutes);
app.use(API_BASE, uploadRoutes);
app.use(API_BASE, tickerRoutes);

// ── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global error handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

export default app;
