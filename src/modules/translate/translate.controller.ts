import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../../middleware/auth';

const translateSchema = z.object({
    text: z.string()
        .min(1, 'Text is required')
        .max(500, 'Text must be 500 characters or less'),
    from: z.string().min(2).max(5).default('ar'),
    to: z.enum(['en', 'he', 'ar'], { error: 'Target language must be one of: en, he, ar' }),
});

/**
 * Server-side proxy to MyMemory translation API.
 *
 * Why server-side?
 *  1. Hides the API endpoint from browser network tab (easy to abuse/scrape).
 *  2. Lets us add caching, fallback, and proper error responses.
 *  3. MyMemory grants higher rate limits to server IPs vs. random browser IPs.
 *  4. We can swap the provider (e.g. to LibreTranslate or DeepL) without
 *     changing any frontend code.
 *
 * POST /api/admin/translate
 * Body: { text: string, from: 'ar', to: 'en' | 'he' | 'ar' }
 */
export class TranslateController {
    static async translate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const body = translateSchema.parse(req.body);

            const langpair = `${body.from}|${body.to}`;
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(body.text)}&langpair=${langpair}&de=histeria-store@noreply.com`;

            let data: any;
            try {
                const upstream = await fetch(url, {
                    signal: AbortSignal.timeout(8000), // 8-second hard timeout
                });

                if (!upstream.ok) {
                    res.status(502).json({
                        success: false,
                        message: 'Translation service temporarily unavailable',
                    });
                    return;
                }

                data = await upstream.json();
            } catch (fetchErr: any) {
                // Timeout or network error
                res.status(504).json({
                    success: false,
                    message: 'Translation service timed out. Please try again.',
                });
                return;
            }

            // MyMemory returns responseStatus 200 on success, 403/429 on quota exceeded
            const status = data?.responseStatus;
            if (status === 403) {
                res.status(429).json({
                    success: false,
                    message: 'Daily translation quota exceeded. Please try again tomorrow or fill the field manually.',
                });
                return;
            }
            if (status === 429) {
                res.status(429).json({
                    success: false,
                    message: 'Too many translation requests. Please wait a moment.',
                });
                return;
            }

            const translated: string = data?.responseData?.translatedText || '';

            // MyMemory sometimes returns the original text or error markers on failure
            if (!translated || translated === body.text) {
                res.status(422).json({
                    success: false,
                    message: 'Translation returned empty or identical result. Fill the field manually.',
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: { translated },
            });
        } catch (error) {
            next(error);
        }
    }
}
