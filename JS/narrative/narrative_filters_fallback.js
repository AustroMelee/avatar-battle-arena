/**
 * @fileoverview Avatar Battle Arena - Fallback Narrative Filters
 * @description Fallback filtering strategies (generic, ultimate) for narrative variant selection.
 * These filters ensure that narrative selection always returns a result when specific filters fail.
 * @version 1.0
 */

'use strict';

/**
 * Fallback filter for generic variants.
 * Returns variants that have no specific tags or conditions.
 */
export function genericFilter(variants, context, reasons) {
    const matches = variants.filter(v => !v.tags || v.tags.length === 0);
    if (matches.length > 0) {
        reasons.push("Fallback: Generic (no specific tags)");
        return matches;
    }
    return null;
}

/**
 * Final fallback filter that returns any available variant.
 * This ensures we always have something to show.
 */
export function ultimateFallbackFilter(variants, context, reasons) {
    if (variants.length > 0) {
        reasons.push("Ultimate Fallback: Using any available variant.");
        return variants;
    }
    reasons.push("No variants available, falling back to move name.");
    return [];
} 