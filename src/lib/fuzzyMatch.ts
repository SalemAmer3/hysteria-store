/**
 * Fuzzy Matching using Levenshtein Distance
 * 
 * Allows matching with small typos and variations
 */

/**
 * Calculate Levenshtein distance between two strings
 */
export function levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    
    // Create 2D array
    const matrix: number[][] = Array.from({ length: len1 + 1 }, () => 
        Array(len2 + 1).fill(0)
    );
    
    // Initialize first row and column
    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;
    
    // Fill matrix
    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,      // deletion
                matrix[i][j - 1] + 1,      // insertion
                matrix[i - 1][j - 1] + cost // substitution
            );
        }
    }
    
    return matrix[len1][len2];
}

/**
 * Calculate similarity score (0-1, where 1 is identical)
 */
export function similarityScore(str1: string, str2: string): number {
    if (str1 === str2) return 1;
    
    const maxLen = Math.max(str1.length, str2.length);
    if (maxLen === 0) return 1;
    
    const distance = levenshteinDistance(str1, str2);
    return 1 - distance / maxLen;
}

/**
 * Check if two strings are fuzzy match within threshold
 * @param threshold - 0.7 = 70% similar (default)
 */
export function isFuzzyMatch(
    str1: string,
    str2: string,
    threshold: number = 0.7
): boolean {
    return similarityScore(str1, str2) >= threshold;
}

/**
 * Find fuzzy matches in an array of strings
 */
export function findFuzzyMatches(
    query: string,
    candidates: string[],
    threshold: number = 0.7
): Array<{ text: string; score: number }> {
    return candidates
        .map(candidate => ({
            text: candidate,
            score: similarityScore(query, candidate),
        }))
        .filter(item => item.score >= threshold)
        .sort((a, b) => b.score - a.score);
}

/**
 * Check if query fuzzy matches any token in text
 */
export function fuzzyMatchTokens(
    query: string,
    text: string,
    threshold: number = 0.75
): boolean {
    const textTokens = text.toLowerCase().split(/\s+/);
    const queryLower = query.toLowerCase();
    
    return textTokens.some(token => 
        isFuzzyMatch(queryLower, token, threshold)
    );
}
