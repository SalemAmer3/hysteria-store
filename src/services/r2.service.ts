import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env';
import crypto from 'crypto';

// Only instantiate S3Client if we are not mocking or testing.
// However, to make sure it always runs without crash, we wrap the creation.
let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
    if (!s3Client) {
        s3Client = new S3Client({
            region: 'auto',
            endpoint: env.R2_ENDPOINT,
            credentials: {
                accessKeyId: env.R2_ACCESS_KEY_ID,
                secretAccessKey: env.R2_SECRET_ACCESS_KEY,
            },
            forcePathStyle: true,
        });
    }
    return s3Client;
}

export class R2Service {
    /**
     * Uploads an image buffer to Cloudflare R2
     * @param buffer File buffer
     * @param mimeType MIME type of the file
     * @param folder Destination folder, e.g. 'uploads', 'products'
     */
    static async uploadImage(buffer: Buffer, mimeType: string, folder: string = 'uploads'): Promise<string> {
        const extension = this.getExtensionFromMimeType(mimeType);
        const filename = `${crypto.randomUUID()}.${extension}`;

        // Prevent path traversal by sanitizing folder name
        const sanitizedFolder = folder.replace(/\.\./g, '').replace(/[\/\\]/g, '');
        const objectKey = `${sanitizedFolder}/${filename}`;

        // For local tests or dev with mock credentials, return a mock URL
        if (env.R2_ENDPOINT === 'mock-endpoint' || process.env.NODE_ENV === 'test') {
            const publicUrl = env.R2_PUBLIC_URL.replace(/\/$/, '');
            return `${publicUrl}/${objectKey}`;
        }

        const client = getS3Client();
        await client.send(
            new PutObjectCommand({
                Bucket: env.R2_BUCKET_NAME,
                Key: objectKey,
                Body: buffer,
                ContentType: mimeType,
            })
        );

        const publicUrl = env.R2_PUBLIC_URL.replace(/\/$/, '');
        return `${publicUrl}/${objectKey}`;
    }

    /**
     * Deletes an image from Cloudflare R2
     * @param imageUrl Public URL of the image
     */
    static async deleteImage(imageUrl: string): Promise<void> {
        // If the image is not hosted on our R2_PUBLIC_URL, ignore or skip deleted
        const publicUrlBase = env.R2_PUBLIC_URL.replace(/\/$/, '');
        if (!imageUrl.startsWith(publicUrlBase)) {
            console.warn(`Attempted to delete image not matching R2 public URL base: ${imageUrl}`);
            return;
        }

        // Extract object key
        const objectKey = imageUrl.substring(publicUrlBase.length + 1);

        // If mock, just log and return
        if (env.R2_ENDPOINT === 'mock-endpoint' || process.env.NODE_ENV === 'test') {
            console.log(`[Mock R2] Deleted object: ${objectKey}`);
            return;
        }

        const client = getS3Client();
        await client.send(
            new DeleteObjectCommand({
                Bucket: env.R2_BUCKET_NAME,
                Key: objectKey,
            })
        );
    }

    /**
     * Helper to map mime typings to extensions
     */
    private static getExtensionFromMimeType(mimeType: string): string {
        switch (mimeType) {
            case 'image/jpeg':
            case 'image/jpg':
                return 'jpg';
            case 'image/png':
                return 'png';
            case 'image/webp':
                return 'webp';
            default:
                return 'jpg';
        }
    }
}
