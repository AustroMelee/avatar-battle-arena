// FILE: engine_momentum.js
'use strict';

// ============================================================
// MOMENTUM SYSTEM
// ============================================================
// Defines and manages the momentum stat for characters.
// Momentum influences AI decision-making and critical hit chance.

// Constants
export const MAX_MOMENTUM = 5;
export const MIN_MOMENTUM = -5;
export const MOMENTUM_CRIT_MODIFIER_PER_POINT = 0.05; // 5% crit chance per momentum point

/**
 * Modifies a character's momentum, ensuring it stays within defined bounds.
 * @param {object} actor - The character whose momentum is being modified.
 * @param {number} delta - The amount by which to change the momentum (can be positive or negative).
 * @param {string} reason - A string explaining why the momentum changed (for logging).
 */
export function modifyMomentum(actor, delta, reason = 'General change') {
    const oldMomentum = actor.momentum;
    let newMomentum = actor.momentum + delta;

    // Clamp momentum to min/max bounds
    newMomentum = Math.max(MIN_MOMENTUM, Math.min(MAX_MOMENTUM, newMomentum));

    if (newMomentum !== oldMomentum) {
        actor.momentum = newMomentum;
        actor.aiLog.push(`[Momentum]: ${actor.name}'s momentum changed from ${oldMomentum} to ${newMomentum} due to: ${reason}.`);
        // Signal UI update (UI module will pick this up)
        actor.momentumChanged = true;
    } else if (delta !== 0) {
        // Log if momentum change was attempted but capped
        actor.aiLog.push(`[Momentum]: ${actor.name}'s momentum attempted to change by ${delta} but was capped at ${oldMomentum}. Reason: ${reason}.`);
    }
}

/**
 * Resets a character's momentum to zero.
 * @param {object} actor - The character whose momentum is being reset.
 * @param {string} reason - A string explaining why the momentum was reset.
 */
export function resetMomentum(actor, reason = 'Reset') {
    if (actor.momentum !== 0) {
        const oldMomentum = actor.momentum;
        actor.momentum = 0;
        actor.aiLog.push(`[Momentum]: ${actor.name}'s momentum reset from ${oldMomentum} to 0 due to: ${reason}.`);
        // Signal UI update
        actor.momentumChanged = true;
    }
}

/**
 * Calculates the critical hit chance modifier based on the actor's current momentum.
 * @param {object} actor - The character for whom to calculate the modifier.
 * @returns {number} The critical hit chance modifier (e.g., 0.1 for +10%).
 */
export function getMomentumCritModifier(actor) {
    return actor.momentum * MOMENTUM_CRIT_MODIFIER_PER_POINT;
}