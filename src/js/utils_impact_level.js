/**
 * @fileoverview Impact Level and Visual Effects Utilities
 * @description Centralized utilities for determining impact levels and visual effects for moves
 * @version 1.0
 */

'use strict';

/**
 * Impact level constants for consistent categorization
 */
export const IMPACT_LEVELS = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
};

/**
 * Effectiveness label mappings to impact levels
 */
const EFFECTIVENESS_TO_IMPACT = {
    'critical': IMPACT_LEVELS.CRITICAL,
    'strong': IMPACT_LEVELS.HIGH,
    'normal': IMPACT_LEVELS.MEDIUM,
    'weak': IMPACT_LEVELS.LOW
};

/**
 * Move type mappings to emojis
 */
export const MOVE_TYPE_EMOJIS = {
    fire: '🔥',
    water: '💧',
    ice: '❄️',
    earth: '🪨',
    metal: '⚙️',
    air: '💨',
    lightning: '⚡',
    physical: '⚔️',
    utility: '🛠️',
    special: '✨',
    offense: '⚔️',
    defense: '🛡️'
};

/**
 * Effectiveness label mappings to emojis
 */
export const EFFECTIVENESS_EMOJIS = {
    critical: '💥',
    strong: '🔥',
    normal: '⚔️',
    weak: '🛡️'
};

/**
 * Default emoji for unknown types
 */
export const DEFAULT_EMOJI = '➡️';

/**
 * Determines the visual impact level for an animation based on the move's effectiveness and type.
 * 
 * @param {string} effectivenessLabel - The effectiveness of the move (e.g., 'Critical', 'Strong')
 * @param {string} moveType - The type of the move (e.g., 'Finisher', 'Offense')
 * @returns {string} The impact level ('low', 'medium', 'high', 'critical')
 * 
 * @example
 * determineImpactLevel('Critical', 'Offense'); // Returns 'critical'
 * determineImpactLevel('Normal', 'Finisher'); // Returns 'high'
 * determineImpactLevel('Weak', 'Utility'); // Returns 'low'
 */
export function determineImpactLevel(effectivenessLabel, moveType) {
    if (!effectivenessLabel || typeof effectivenessLabel !== 'string') {
        console.debug(`[Impact Level] Invalid effectiveness provided, defaulting to LOW`);
        return IMPACT_LEVELS.LOW;
    }
    
    console.debug(`[Impact Level] Determining impact for effectiveness: ${effectivenessLabel}, moveType: ${moveType}`);
    const label = effectivenessLabel.toLowerCase();
    
    // Check effectiveness first
    if (EFFECTIVENESS_TO_IMPACT[label]) {
        const baseImpact = EFFECTIVENESS_TO_IMPACT[label];
        
        // Special case: Normal effectiveness with Finisher type gets upgraded to high
        if (label === 'normal' && moveType && moveType.toLowerCase() === 'finisher') {
            return IMPACT_LEVELS.HIGH;
        }
        
        console.debug(`[Impact Level] Final impact level: ${baseImpact}`);
        return baseImpact;
    }
    
    // Fallback to low impact for unknown effectiveness
    console.debug(`[Impact Level] Unknown effectiveness, defaulting to LOW`);
    return IMPACT_LEVELS.LOW;
}

/**
 * Gets the appropriate emoji for a move type and effectiveness combination.
 * Prioritizes effectiveness over move type for visual clarity.
 * 
 * @param {string} moveType - The type of the move
 * @param {string} effectivenessLabel - The effectiveness label
 * @returns {string} The appropriate emoji
 * 
 * @example
 * getEmojiForMove('fire', 'Critical'); // Returns '💥' (effectiveness takes priority)
 * getEmojiForMove('fire', 'Normal'); // Returns '🔥' (move type)
 * getEmojiForMove('unknown', 'unknown'); // Returns '➡️' (default)
 */
export function getEmojiForMove(moveType, effectivenessLabel) {
    // Effectiveness emojis take priority for visual impact
    if (effectivenessLabel && typeof effectivenessLabel === 'string') {
        const effectivenessEmoji = EFFECTIVENESS_EMOJIS[effectivenessLabel.toLowerCase()];
        if (effectivenessEmoji) {
            return effectivenessEmoji;
        }
    }
    
    // Fall back to move type emoji
    if (moveType && typeof moveType === 'string') {
        const moveTypeEmoji = MOVE_TYPE_EMOJIS[moveType.toLowerCase()];
        if (moveTypeEmoji) {
            return moveTypeEmoji;
        }
    }
    
    // Default emoji for unknown types
    return DEFAULT_EMOJI;
}

/**
 * Configuration object for impact level settings that can be easily modified
 */
export const IMPACT_CONFIG = {
    // Pause durations for different impact levels (in milliseconds)
    pauseDurations: {
        [IMPACT_LEVELS.LOW]: 500,
        [IMPACT_LEVELS.MEDIUM]: 800,
        [IMPACT_LEVELS.HIGH]: 1200,
        [IMPACT_LEVELS.CRITICAL]: 2000
    },
    
    // CSS classes for styling different impact levels
    cssClasses: {
        [IMPACT_LEVELS.LOW]: 'impact-low',
        [IMPACT_LEVELS.MEDIUM]: 'impact-medium',
        [IMPACT_LEVELS.HIGH]: 'impact-high',
        [IMPACT_LEVELS.CRITICAL]: 'impact-critical'
    }
};

/**
 * Gets the pause duration for a given impact level
 * 
 * @param {string} impactLevel - The impact level
 * @returns {number} Pause duration in milliseconds
 */
export function getPauseDurationForImpact(impactLevel) {
    return IMPACT_CONFIG.pauseDurations[impactLevel] || IMPACT_CONFIG.pauseDurations[IMPACT_LEVELS.LOW];
}

/**
 * Gets the CSS class for a given impact level
 * 
 * @param {string} impactLevel - The impact level
 * @returns {string} CSS class name
 */
export function getCssClassForImpact(impactLevel) {
    return IMPACT_CONFIG.cssClasses[impactLevel] || IMPACT_CONFIG.cssClasses[IMPACT_LEVELS.LOW];
} 