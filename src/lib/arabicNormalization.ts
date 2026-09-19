/**
 * Arabic Text Normalization for Search
 * 
 * Normalizes Arabic text to improve search matching by:
 * - Removing diacritics (تشكيل)
 * - Normalizing Arabic letters with variants
 * - Removing extra spaces
 * - Converting to lowercase for Latin text
 */

/**
 * Remove Arabic diacritics (tashkeel)
 */
function removeDiacritics(text: string): string {
    return text.replace(/[\u064B-\u065F\u0670]/g, '');
}

/**
 * Normalize Arabic letter variants
 */
function normalizeArabicLetters(text: string): string {
    return text
        // Normalize Alef variants: أ إ آ ٱ → ا
        .replace(/[أإآٱ]/g, 'ا')
        // Normalize Taa Marbuta and Haa: ة → ه (careful - only at word end)
        .replace(/ة(?=\s|$)/g, 'ه')
        // Normalize Alef Maksura and Yaa: ى → ي
        .replace(/ى/g, 'ي');
}

/**
 * Remove tatweel (ـ)
 */
function removeTatweel(text: string): string {
    return text.replace(/ـ/g, '');
}

/**
 * Normalize whitespace
 */
function normalizeWhitespace(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
}

/**
 * Full normalization for search
 */
export function normalizeForSearch(text: string): string {
    if (!text) return '';
    
    let normalized = text;
    
    // Remove diacritics
    normalized = removeDiacritics(normalized);
    
    // Remove tatweel
    normalized = removeTatweel(normalized);
    
    // Normalize Arabic letters
    normalized = normalizeArabicLetters(normalized);
    
    // Lowercase for Latin characters
    normalized = normalized.toLowerCase();
    
    // Normalize whitespace
    normalized = normalizeWhitespace(normalized);
    
    return normalized;
}

/**
 * Split search query into tokens
 */
export function tokenizeQuery(query: string): string[] {
    const normalized = normalizeForSearch(query);
    return normalized
        .split(/\s+/)
        .filter(token => token.length > 0);
}

/**
 * Check if text contains all tokens (for multi-word search)
 */
export function containsAllTokens(text: string, tokens: string[]): boolean {
    const normalizedText = normalizeForSearch(text);
    return tokens.every(token => normalizedText.includes(token));
}
