/**
 * @fileoverview Narrative Effect Handlers
 * @description Handlers for all narrative, AI, and non-game-state effects.
 * @version 1.0
 */

'use strict';

import { generateLogEvent } from '../utils_log_event.js';
import { clamp } from '../utils_math.js';

/**
 * Handles TRIGGER_NARRATIVE_EVENT effect using unified context.
 * @param {object} ctx - The unified effect context
 * @returns {object} Handler result
 */
export function handleTriggerNarrativeEvent(ctx) {
    const { effect } = ctx;
    
    ctx.generatedEvents.push({ 
        type: 'narrative_event', 
        eventId: effect.eventId, 
        text: effect.message || "" 
    });
    const message = effect.message || "Narrative event triggered.";
    
    return { success: true, message };
}

/**
 * Handles ADJUST_AI_PROFILE effect using unified context.
 * @param {object} ctx - The unified effect context
 * @returns {object} Handler result
 */
export function handleAdjustAiProfile(ctx) {
    const { effect, primaryTarget } = ctx;
    
    if (!primaryTarget?.personalityProfile || !effect.adjustments) {
        ctx.log('ADJUST_AI_PROFILE requires a target with personalityProfile and adjustments', 'warn');
        return { success: false, message: 'ADJUST_AI_PROFILE requires a target with personalityProfile and adjustments.' };
    }
    
    Object.keys(effect.adjustments).forEach(trait => {
        if (trait in primaryTarget.personalityProfile) {
            primaryTarget.personalityProfile[trait] = clamp(
                primaryTarget.personalityProfile[trait] + effect.adjustments[trait], 
                0, 
                1
            );
        }
    });
    
    const message = `${primaryTarget.name}'s AI profile adjusted.`;
    return { success: true, message };
}

/**
 * Handles NARRATIVE_ONLY effect using unified context.
 * @param {object} ctx - The unified effect context
 * @returns {object} Handler result
 */
export function handleNarrativeOnly(ctx) {
    const { effect, battleState } = ctx;
    
    ctx.generatedEvents.push(generateLogEvent(battleState, { 
        type: 'narrative_event', 
        eventId: effect.eventId, 
        text: effect.message || "" 
    }));
    
    return { success: true, message: "Narrative event processed." };
} 