/**
 * @fileoverview Avatar Battle Arena - Contextual Narrative Filters
 * @description Contextual filtering strategies (strict context, environment, phase) for narrative variant selection.
 * These filters prioritize variants based on immediate battle context and environmental conditions.
 * @version 1.0
 */

'use strict';

/**
 * Filter for strict context matches (Crit, Miss, Humor, etc.)
 * These have the highest priority for narrative selection.
 */
export function strictContextFilter(variants, context, reasons) {
    const { turnContext, NARRATIVE_TAGS } = context;
    const strictContextTags = [];
    
    if (turnContext?.isCrit) strictContextTags.push(NARRATIVE_TAGS.CRIT);
    if (turnContext?.isMiss) strictContextTags.push(NARRATIVE_TAGS.MISS);
    if (turnContext?.humorTrigger) strictContextTags.push(NARRATIVE_TAGS.HUMOR);
    if (turnContext?.lowHp) strictContextTags.push(NARRATIVE_TAGS.DESPERATE);

    if (strictContextTags.length > 0) {
        const matches = variants.filter(v =>
            v.tags && strictContextTags.every(tag => v.tags.includes(tag))
        );
        if (matches.length > 0) {
            reasons.push(`Strict context match: ${strictContextTags.join(', ')}`);
            return matches;
        }
    }
    
    return null; // No matches found, continue to next filter
}

/**
 * Filter for environment-based matches.
 * Matches variants that have environmental tags matching the current environment.
 */
export function environmentFilter(variants, context, reasons) {
    const { environment } = context;
    
    const matches = variants.filter(v => {
        if (v.environmentTags && environment?.tags) {
            const commonTags = v.environmentTags.filter(tag => environment.tags.includes(tag));
            if (commonTags.length > 0) {
                reasons.push(`Environment: ${commonTags.join(', ')}`);
                return true;
            }
        }
        return false;
    });
    
    return matches.length > 0 ? matches : null;
}

/**
 * Filter for phase-based matches.
 * Matches variants that are appropriate for the current battle phase.
 */
export function phaseFilter(variants, context, reasons) {
    const { turnContext } = context;
    
    const matches = variants.filter(v => {
        if (v.tags && turnContext?.phase) {
            if (v.tags.includes(turnContext.phase.toLowerCase())) {
                reasons.push(`Phase: ${turnContext.phase}`);
                return true;
            }
        }
        return false;
    });
    
    return matches.length > 0 ? matches : null;
} 