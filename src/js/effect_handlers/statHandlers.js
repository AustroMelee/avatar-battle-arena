/**
 * @fileoverview Stat-Based Effect Handlers
 * @description Handlers for all effects that modify character stats (HP, energy, momentum, etc.).
 * @version 1.0
 */

"use strict";

import { clampValue } from "../constants_consolidated.js";
import { generateCollateralDamageEvent } from "../narrative/environmentNarrative.js";
import { handleStatChange } from "./statChangeConfig.js";

/**
 * Handles DAMAGE effect using unified context.
 * @param {object} ctx - The unified effect context
 * @returns {object} Handler result
 */
export function handleDamage(ctx) {
    const { effect, primaryTarget } = ctx;
    if (!primaryTarget) return { success: false, message: "Invalid target." };
    primaryTarget.damageLevel = clampValue(primaryTarget.damageLevel + effect.value, 0, 100);
    return { success: true, message: `${primaryTarget.name} takes ${effect.value} damage.` };
}

/**
 * Handles HEAL effect using unified context.
 * @param {object} ctx - The unified effect context
 * @returns {object} Handler result
 */
export function handleHeal(ctx) {
    return handleStatChange({ ...ctx, effect: { ...ctx.effect, stat: "hp" } });
}

/**
 * Handles ENERGY_CHANGE effect using unified context.
 * @param {object} ctx - The unified effect context
 * @returns {object} Handler result
 */
export function handleEnergyChange(ctx) {
    return handleStatChange({ ...ctx, effect: { ...ctx.effect, stat: "energy" } });
}

/**
 * Handles MOMENTUM_CHANGE effect using unified context.
 * @param {object} ctx - The unified effect context
 * @returns {object} Handler result
 */
export function handleMomentumChange(ctx) {
    const { effect, actor, target } = ctx;
    
    if (!effect.targetId) {
        ctx.log("Momentum change effect requires a targetId", "warn");
        return { success: false, message: "Momentum change effect requires a targetId." };
    }
    
    // Resolve the target character
    let targetCharacter = null;
    if (actor?.id === effect.targetId) {
        targetCharacter = actor;
    } else if (target?.id === effect.targetId) {
        targetCharacter = target;
    }
    
    if (!targetCharacter) {
        ctx.log(`Character with ID ${effect.targetId} not found among battle participants`, "warn");
        return { success: false, message: `Character with ID ${effect.targetId} not found.` };
    }
    
    const momentumCtx = { ...ctx, primaryTarget: targetCharacter, effect: { ...effect, stat: "momentum" } };
    return handleStatChange(momentumCtx);
}

/**
 * Handles STUN effect using unified context.
 * @param {object} ctx - The unified effect context
 * @returns {object} Handler result
 */
export function handleStun(ctx) {
    const { effect, primaryTarget } = ctx;
    
    if (!primaryTarget) {
        return { success: false, message: "Invalid target for stun effect." };
    }
    
    const oldStunDuration = primaryTarget.stunDuration || 0;
    primaryTarget.stunDuration = oldStunDuration + effect.duration;
    primaryTarget.consecutiveStuns = (primaryTarget.consecutiveStuns || 0) + 1;
    primaryTarget.stunImmunityTurns = 2; // TODO: Make configurable
    
    const message = `${primaryTarget.name} is stunned for ${effect.duration} turns.`;
    ctx.addStatusEvent("stun_status_change", oldStunDuration, primaryTarget.stunDuration, "stunDuration");
    
    return { success: true, message };
}

/**
 * Handles ENVIRONMENTAL_DAMAGE effect using unified context.
 * @param {object} ctx - The unified effect context
 * @returns {object} Handler result
 */
export function handleEnvironmentalDamage(ctx) {
    const { effect, actor, target, primaryTarget, battleState } = ctx;
    
    if (!primaryTarget || typeof primaryTarget.damageLevel !== "number") {
        return { success: false, message: "Invalid target for environmental damage effect." };
    }
    
    primaryTarget.damageLevel = clampValue(primaryTarget.damageLevel + effect.value, 0, 100);
    const message = `Environmental damage increases by ${effect.value}.`;
    
    // Trigger detailed environmental narrative event
    const collateralEvent = generateCollateralDamageEvent(
        effect.sourceMove, 
        actor, 
        { effectiveness: { label: "Normal" }, effects: [effect] },
        battleState.locationConditions, 
        battleState
    );
    if (collateralEvent) ctx.generatedEvents.push(collateralEvent);
    
    return { success: true, message };
} 