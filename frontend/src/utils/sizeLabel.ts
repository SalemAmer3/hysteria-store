/**
 * Converts a raw size string into a display label with a unit type hint.
 *
 * Rules (case-insensitive):
 *   ends with g / gr / gram / grams  →  label = value + "g",  type = "سعة" / "Weight"
 *   ends with ml / milliliter        →  label = value + "ml", type = "حجم" / "Volume"
 *   ends with l / liter              →  label = value + "L",  type = "حجم" / "Volume"
 *   ends with cm / mm / m            →  label = value + unit, type = "قياس" / "Size"
 *   purely numeric                   →  label = value,        type = null  (no hint)
 *   anything else                    →  label = original,     type = null
 *
 * @param raw   The raw size string stored in the DB  e.g. "120g", "50ml", "M", "XL"
 * @param lang  Active language for the type hint ("ar" | "he" | "en")
 */
export function parseSizeLabel(
    raw: string | null | undefined,
    lang: 'ar' | 'he' | 'en' = 'en',
): { label: string; typeHint: string | null } {
    if (!raw) return { label: '', typeHint: null };

    const trimmed = raw.trim();

    // ── Weight: g / gr / gram / grams ────────────────────────
    const weightMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*(g|gr|gram|grams)$/i);
    if (weightMatch) {
        const num   = weightMatch[1];
        const label = `${num}g`;
        const hint  = lang === 'ar' ? 'سعة' : lang === 'he' ? 'משקל' : 'Weight';
        return { label, typeHint: hint };
    }

    // ── Volume: ml ───────────────────────────────────────────
    const mlMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*ml$/i);
    if (mlMatch) {
        const num   = mlMatch[1];
        const label = `${num}ml`;
        const hint  = lang === 'ar' ? 'حجم' : lang === 'he' ? 'נפח' : 'Volume';
        return { label, typeHint: hint };
    }

    // ── Volume: l / liter ────────────────────────────────────
    const lMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*l(?:iter)?$/i);
    if (lMatch) {
        const num   = lMatch[1];
        const label = `${num}L`;
        const hint  = lang === 'ar' ? 'حجم' : lang === 'he' ? 'נפח' : 'Volume';
        return { label, typeHint: hint };
    }

    // ── Length: cm / mm / m ──────────────────────────────────
    const lengthMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*(cm|mm|m)$/i);
    if (lengthMatch) {
        const num   = lengthMatch[1];
        const unit  = lengthMatch[2].toLowerCase();
        const label = `${num}${unit}`;
        const hint  = lang === 'ar' ? 'قياس' : lang === 'he' ? 'מידה' : 'Size';
        return { label, typeHint: hint };
    }

    // ── Purely numeric (bare number, no unit) ────────────────
    if (/^\d+(?:\.\d+)?$/.test(trimmed)) {
        return { label: trimmed, typeHint: null };
    }

    // ── Everything else (XS, S, M, L, XL, custom text…) ─────
    return { label: trimmed, typeHint: null };
}
