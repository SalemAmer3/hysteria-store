/**
 * Search Ranking System
 * 
 * Ranks search results by relevance similar to SHEIN/AliExpress
 */

import { normalizeForSearch, tokenizeQuery } from './arabicNormalization';
import { similarityScore } from './fuzzyMatch';

export interface SearchableProduct {
    id: string;
    name: string;
    arabic?: string | null;
    hebrew?: string | null;
    description?: string | null;
    arabic_description?: string | null;
    hebrew_description?: string | null;
    search_keywords?: string[];
    sku?: string | null;
    category?: {
        name: string;
        arabic?: string | null;
        hebrew?: string | null;
    } | null;
    brand?: {
        name: string;
    } | null;
}

export interface RankedProduct extends SearchableProduct {
    relevanceScore: number;
    matchType: 'exact' | 'starts_with' | 'contains' | 'keyword' | 'category' | 'brand' | 'description' | 'fuzzy';
}

/**
 * Calculate relevance score for a product against search query
 */
export function calculateRelevanceScore(
    product: SearchableProduct,
    query: string
): { score: number; matchType: string } {
    const normalizedQuery = normalizeForSearch(query);
    const queryTokens = tokenizeQuery(query);
    
    let maxScore = 0;
    let bestMatchType = 'none';
    
    // Helper to check and score a field
    const scoreField = (
        value: string | null | undefined,
        baseScore: number,
        matchType: string
    ): void => {
        if (!value) return;
        
        const normalized = normalizeForSearch(value);
        
        // Exact match (highest priority)
        if (normalized === normalizedQuery) {
            const score = baseScore + 100;
            if (score > maxScore) {
                maxScore = score;
                bestMatchType = `exact_${matchType}`;
            }
            return;
        }
        
        // Starts with query
        if (normalized.startsWith(normalizedQuery)) {
            const score = baseScore + 80;
            if (score > maxScore) {
                maxScore = score;
                bestMatchType = `starts_${matchType}`;
            }
            return;
        }
        
        // Contains query as whole
        if (normalized.includes(normalizedQuery)) {
            const score = baseScore + 60;
            if (score > maxScore) {
                maxScore = score;
                bestMatchType = `contains_${matchType}`;
            }
        }
        
        // Multi-word: all tokens present
        if (queryTokens.length > 1) {
            const allTokensPresent = queryTokens.every(token => normalized.includes(token));
            if (allTokensPresent) {
                const score = baseScore + 50;
                if (score > maxScore) {
                    maxScore = score;
                    bestMatchType = `tokens_${matchType}`;
                }
            }
        }
        
        // Fuzzy match (last resort)
        const similarity = similarityScore(normalizedQuery, normalized);
        if (similarity >= 0.7) {
            const score = baseScore + (similarity * 40);
            if (score > maxScore) {
                maxScore = score;
                bestMatchType = `fuzzy_${matchType}`;
            }
        }
        
        // Partial token matches
        queryTokens.forEach(token => {
            if (normalized.includes(token)) {
                const score = baseScore + 20;
                if (score > maxScore) {
                    maxScore = score;
                    bestMatchType = `partial_${matchType}`;
                }
            }
        });
    };
    
    // Score product name (highest priority)
    scoreField(product.name, 1000, 'name');
    scoreField(product.arabic, 1000, 'name');
    scoreField(product.hebrew, 900, 'name');
    
    // Score SKU
    scoreField(product.sku, 800, 'sku');
    
    // Score search keywords
    if (product.search_keywords && product.search_keywords.length > 0) {
        product.search_keywords.forEach(keyword => {
            scoreField(keyword, 700, 'keyword');
        });
    }
    
    // Score category name
    if (product.category) {
        scoreField(product.category.name, 500, 'category');
        scoreField(product.category.arabic, 500, 'category');
        scoreField(product.category.hebrew, 450, 'category');
    }
    
    // Score brand name
    if (product.brand) {
        scoreField(product.brand.name, 400, 'brand');
    }
    
    // Score description (lowest priority - but important)
    scoreField(product.description, 200, 'description');
    scoreField(product.arabic_description, 200, 'description');
    scoreField(product.hebrew_description, 180, 'description');
    
    return {
        score: maxScore,
        matchType: bestMatchType,
    };
}

/**
 * Rank products by relevance
 */
export function rankProducts(
    products: SearchableProduct[],
    query: string
): RankedProduct[] {
    const ranked = products
        .map(product => {
            const { score, matchType } = calculateRelevanceScore(product, query);
            return {
                ...product,
                relevanceScore: score,
                matchType: matchType as any,
            };
        })
        .filter(p => p.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    return ranked;
}

/**
 * Simple match type classification (for backwards compatibility)
 */
export function classifyMatchType(matchType: string): 'exact' | 'starts_with' | 'contains' | 'keyword' | 'category' | 'brand' | 'description' | 'fuzzy' {
    if (matchType.includes('exact')) return 'exact';
    if (matchType.includes('starts')) return 'starts_with';
    if (matchType.includes('keyword')) return 'keyword';
    if (matchType.includes('category')) return 'category';
    if (matchType.includes('brand')) return 'brand';
    if (matchType.includes('description')) return 'description';
    if (matchType.includes('fuzzy')) return 'fuzzy';
    return 'contains';
}
