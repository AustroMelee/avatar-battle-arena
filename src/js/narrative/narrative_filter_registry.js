/**
 * @fileoverview Avatar Battle Arena - Narrative Filter Registry
 * @description Composes the filter strategy chain from modular components and provides the main execution interface.
 * This registry implements the Chain of Responsibility pattern without defining filters inline.
 * @version 1.0
 */

"use strict";

// --- CONTEXTUAL FILTERS ---
import { 
    strictContextFilter,
    environmentFilter,
    phaseFilter
} from "./narrative_filters_contextual.js";

// --- CHARACTER FILTERS ---
import {
    personalityFilter,
    situationalFilter
} from "./narrative_filters_character.js";

// --- FALLBACK FILTERS ---
import {
    genericFilter,
    ultimateFallbackFilter
} from "./narrative_filters_fallback.js";

/**
 * Chain of Responsibility: Array of filter strategies in priority order.
 * Each filter gets a chance to find matching variants before moving to the next.
 */
export const filterStrategies = [
    strictContextFilter,
    personalityFilter,
    environmentFilter,
    phaseFilter,
    situationalFilter,
    genericFilter,
    ultimateFallbackFilter
];

/**
 * Executes the Chain of Responsibility pattern to filter variants.
 * @param {Array} variants - All available variants to filter from
 * @param {Object} context - Context object containing all necessary data
 * @returns {Object} Object with filtered candidates and reasons for selection
 */
export function executeFilterChain(variants, context) {
    const reasons = [];
    
    // Fail-fast validation
    if (!Array.isArray(variants) || (variants.length > 0 && typeof variants[0]?.text !== "string")) {
        throw new Error("Malformed actionVariants structure for move: " + (context.move?.name || "Unknown Move") + ". Expected array of objects with 'text' property.");
    }
    
    // Execute filter chain
    for (const filterStrategy of filterStrategies) {
        const result = filterStrategy(variants, context, reasons);
        if (result && result.length > 0) {
            return { candidates: result, reasons };
        }
    }
    
    // This should never happen due to ultimateFallbackFilter, but just in case
    return { candidates: [], reasons };
} 