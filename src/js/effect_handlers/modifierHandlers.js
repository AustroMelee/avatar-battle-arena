/**
 * @fileoverview Modifier Effect Handlers
 * @description Handlers for all modifier effects (evasion, damage, defense, accuracy, etc.).
 * @version 1.0
 */

"use strict";

/**
 * Handles all modifier effects using unified context.
 * These effects add modifiers to the character's activeModifiers array.
 * @param {object} ctx - The unified effect context
 * @returns {object} Handler result
 */
export function handleModifier(ctx) {
    const { effect, actor, primaryTarget } = ctx;
    
    ctx.log(`Applying modifier ${effect.type} with value ${effect.value} to ${primaryTarget?.name || "global"}`);
    const message = `${primaryTarget?.name || "Target"} gains ${effect.type.replace("_", " ").toLowerCase()} modifier.`;
    
    // Add to character's active modifiers
    if (primaryTarget && !primaryTarget.activeModifiers) primaryTarget.activeModifiers = [];
    if (primaryTarget) {
        primaryTarget.activeModifiers.push({ 
            type: effect.type, 
            value: effect.value, 
            duration: effect.duration, 
            source: actor?.id 
        });
    }
    
    return { success: true, message };
} 