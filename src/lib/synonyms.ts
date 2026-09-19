/**
 * Synonyms System for Enhanced Search
 * 
 * Maps search terms to their synonyms to improve search coverage
 * Example: "مسكارا" → ["ماسكارا", "رموش"]
 */

import { normalizeForSearch } from './arabicNormalization';

/**
 * Synonym dictionary
 * Key: normalized term
 * Value: array of synonyms (will be normalized automatically)
 */
const SYNONYM_MAP: Record<string, string[]> = {
    // Mascara variants
    'مسكارا': ['ماسكارا', 'مسكرا', 'ماسكرا'],
    'ماسكارا': ['مسكارا', 'مسكرا', 'ماسكرا'],
    
    // Lipstick
    'روج': ['احمر شفاه', 'احمر الشفاه', 'لون شفاه'],
    'احمر شفاه': ['روج', 'لون شفاه'],
    
    // Foundation
    'فاونديشن': ['كريم اساس', 'كريم الاساس', 'اساس مكياج'],
    'كريم اساس': ['فاونديشن', 'اساس مكياج'],
    
    // Eyeshadow
    'ايشادو': ['ظلال عيون', 'ظلال العيون', 'الوان عيون'],
    'ظلال عيون': ['ايشادو', 'ظلال العيون'],
    
    // Eyeliner
    'ايلاينر': ['محدد عيون', 'محدد العيون', 'كحل'],
    'كحل': ['ايلاينر', 'محدد عيون'],
    
    // Blush
    'بلاشر': ['احمر خدود', 'احمر الخدود'],
    'احمر خدود': ['بلاشر', 'احمر الخدود'],
    
    // Concealer
    'كونسيلر': ['خافي عيوب', 'خافي العيوب'],
    'خافي عيوب': ['كونسيلر', 'خافي العيوب'],
    
    // Powder
    'بودرة': ['بودره', 'باودر'],
    'باودر': ['بودرة', 'بودره'],
    
    // Primer
    'برايمر': ['قاعدة مكياج', 'قاعدة'],
    
    // Highlighter
    'هايلايتر': ['مضيء', 'لمعة'],
    
    // Contour
    'كونتور': ['تحديد', 'محدد الوجه'],
    
    // Setting spray
    'سبراي تثبيت': ['مثبت مكياج', 'رذاذ تثبيت'],
    
    // Makeup remover
    'مزيل مكياج': ['منظف مكياج', 'ديمكياج'],
    
    // Skincare
    'عناية': ['عنايه', 'كير'],
    'مرطب': ['كريم مرطب', 'ترطيب'],
    'تونر': ['تونيك', 'ماء ورد'],
    'سيروم': ['مصل'],
    
    // Colors - Arabic
    'اسود': ['اسود', 'بلاك'],
    'ابيض': ['ابيض', 'وايت'],
    'احمر': ['احمر', 'احمر', 'ريد'],
    'وردي': ['وردي', 'بينك', 'روز'],
    'بني': ['بني', 'براون'],
    'بيج': ['بيج', 'نيود'],
    'ذهبي': ['ذهبي', 'جولد'],
    'فضي': ['فضي', 'سيلفر'],
    
    // Colors - English
    'black': ['اسود'],
    'white': ['ابيض'],
    'red': ['احمر', 'ريد'],
    'pink': ['وردي', 'بينك'],
    'brown': ['بني'],
    'beige': ['بيج', 'نيود'],
    'gold': ['ذهبي'],
    'silver': ['فضي'],
    'nude': ['نيود', 'بيج'],
};

/**
 * Get all synonyms for a given term (including the term itself)
 */
export function getSynonyms(term: string): string[] {
    const normalized = normalizeForSearch(term);
    const synonyms = SYNONYM_MAP[normalized] || [];
    
    // Return unique set including the original term
    const allTerms = [normalized, ...synonyms.map(s => normalizeForSearch(s))];
    return Array.from(new Set(allTerms));
}

/**
 * Expand a search query to include synonyms
 * Example: "مسكارا" → ["مسكارا", "ماسكارا", "مسكرا"]
 */
export function expandQueryWithSynonyms(query: string): string[] {
    const tokens = query
        .split(/\s+/)
        .filter(t => t.length > 0);
    
    // For single word, return all synonyms
    if (tokens.length === 1) {
        return getSynonyms(tokens[0]);
    }
    
    // For multiple words, expand each word separately
    // Then combine them (this can get complex, so we'll keep it simple for now)
    const expandedTerms: string[] = [];
    
    // Add original query
    expandedTerms.push(normalizeForSearch(query));
    
    // Add queries with each word replaced by its synonyms
    tokens.forEach((token, index) => {
        const synonyms = getSynonyms(token);
        synonyms.forEach(synonym => {
            const newTokens = [...tokens];
            newTokens[index] = synonym;
            expandedTerms.push(normalizeForSearch(newTokens.join(' ')));
        });
    });
    
    return Array.from(new Set(expandedTerms));
}

/**
 * Add a new synonym mapping (for future admin interface)
 */
export function addSynonym(term: string, synonyms: string[]): void {
    const normalized = normalizeForSearch(term);
    if (!SYNONYM_MAP[normalized]) {
        SYNONYM_MAP[normalized] = [];
    }
    SYNONYM_MAP[normalized].push(...synonyms);
    SYNONYM_MAP[normalized] = Array.from(new Set(SYNONYM_MAP[normalized]));
}
