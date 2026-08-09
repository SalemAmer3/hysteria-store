import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middleware/errorHandler';

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

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger docs
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

// Health check
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
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

// 404 handler
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
