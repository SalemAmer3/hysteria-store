import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    PORT: z.coerce.number().default(3000),
    JWT_SECRET: z.string().min(8),
    JWT_EXPIRES_IN: z.string().default('1d'),
    ADMIN_USERNAME: z.string().default('admin'),
    ADMIN_PASSWORD: z.string().default('admin123'),
    R2_ENDPOINT: z.string(),
    R2_ACCESS_KEY_ID: z.string(),
    R2_SECRET_ACCESS_KEY: z.string(),
    R2_BUCKET_NAME: z.string(),
    R2_PUBLIC_URL: z.string().url(),
    CORS_ORIGIN: z.string().default('*'),
});

const envResult = envSchema.safeParse(process.env);

if (!envResult.success) {
    console.error('❌ Invalid environment variables:', envResult.error.format());
    process.exit(1);
}

export const env = envResult.data;
export type Env = z.infer<typeof envSchema>;
