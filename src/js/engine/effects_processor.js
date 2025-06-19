"use strict";

/**
 * @fileoverview Turn Effects Processor
 * @description This module is responsible for applying all status effects (like
 *   poison or regeneration), environmental effects, and passive state changes
 *   (like energy regeneration) that occur during a fighter's turn. It
 *   differentiates between effects that trigger before a main action and those
 *   that trigger after.
 * @version 1.0.0
 */

// ============================================================================
// TYPE IMPORTS
// ============================================================================
/**
 * @typedef {import('../types.js').BattleState} BattleState
 * @typedef {import('../types.js').Fighter} Fighter
 * @typedef {import('../types.js').TurnOptions} TurnOptions
 * @typedef {import('../types.js').StatusEffect} StatusEffect
 * @typedef {import('../types.js').Effect} Effect
 * @typedef {import('../types.js').ActionContext} ActionContext
 */

// ============================================================================
// IMPORTS
// ============================================================================
import { clamp } from "../utils_math.js";
import { generateLogEvent } from "../utils_log_event.js";


// ============================================================================
// EFFECT PROCESSING ORCHESTRATION
// ============================================================================

/**
 * Orchestrates the processing of all effects that occur *before* a fighter
 * takes their main action for the turn. This ensures that effects like stun or
 * pre-turn damage are applied before the fighter can act.
 *
 * @param {BattleState} battleState The current battle state.
 * @param {Fighter} activeFighter The fighter whose turn it is.
 * @param {TurnOptions} options The options for the current turn.
 * @returns {Promise<BattleState>} The updated battle state.
 */
async function processPreTurnEffects(battleState, activeFighter, options) {
    let state = await processStatusEffects(battleState, activeFighter, "pre-turn", options);
    state = await processEnvironmentalEffects(state, activeFighter, "pre-turn", options);
    return state;
}

/**
 * Orchestrates the processing of all effects that occur *after* a fighter has
 * completed their main action. This is the phase for end-of-turn damage,
 * passive regeneration, and cooldown reduction.
 *
 * @param {BattleState} battleState The current battle state.
 * @param {Fighter} activeFighter The fighter who just acted.
 * @param {TurnOptions} options The options for the current turn.
 * @returns {Promise<BattleState>} The updated battle state.
 */
async function processPostTurnEffects(battleState, activeFighter, options) {
    let state = await processStatusEffects(battleState, activeFighter, "post-turn", options);
    state = await processEnvironmentalEffects(state, activeFighter, "post-turn", options);
    state = processEnergyRegeneration(state, activeFighter, options);
    state = processCooldownDecrements(state, activeFighter, options);
    return state;
}

// ============================================================================
// GENERIC EFFECT PROCESSORS
// ============================================================================

/**
 * Iterates through a fighter's active status effects and applies any that are
 * scheduled for the current timing phase (e.g., 'pre-turn'). After applying
 * the effects, it cleans up any that have expired (duration <= 0).
 *
 * @param {BattleState} battleState The current battle state.
 * @param {Fighter} fighter The fighter being affected.
 * @param {'pre-turn' | 'post-turn'} timing The specific timing phase to process.
 * @param {TurnOptions} options The options for the current turn.
 * @returns {Promise<BattleState>} The updated battle state.
 */
async function processStatusEffects(battleState, fighter, timing, options) {
    if (!fighter.statusEffects || fighter.statusEffects.length === 0) {
        return battleState;
    }
    let state = battleState;
    for (const effect of fighter.statusEffects) {
        if (effect.timing === timing) {
            state = await applyStatusEffectTick(state, fighter, effect, options);
        }
    }
    // This cleanup step is crucial to prevent expired effects from persisting
    // into subsequent turns.
    state.fighters[fighter.id].statusEffects = state.fighters[fighter.id].statusEffects.filter(e => e.duration > 0);
    return state;
}

/**
 * Applies all relevant environmental effects to a fighter. This function is
 * designed as a placeholder to be extended with location-specific or global
 * environmental effects that impact fighters during their turn.
 *
 * @param {BattleState} battleState The current battle state.
 * @param {Fighter} fighter The fighter being affected.
 * @param {'pre-turn' | 'post-turn'} timing The timing of the effect processing.
 * @param {TurnOptions} options The options for the current turn.
 * @returns {Promise<BattleState>} The updated battle state.
 */
async function processEnvironmentalEffects(battleState, fighter, timing, options) {
    // This is a placeholder for future environmental effects logic. For example,
    // a "swamp" environment might apply a speed debuff, or a "volcano" might
    // deal fire damage each turn.
    return battleState;
}

// ============================================================================
// SPECIFIC EFFECT HANDLERS
// ============================================================================

/**
 * Applies a single "tick" of a status effect, such as reducing HP from poison
 * or increasing it from regeneration. It also decrements the effect's duration.
 *
 * @param {BattleState} battleState The current battle state.
 * @param {Fighter} fighter The fighter with the status effect.
 * @param {StatusEffect} effect The status effect to apply.
 * @param {TurnOptions} options The options for the current turn.
 * @returns {Promise<BattleState>} The updated battle state.
 */
async function applyStatusEffectTick(battleState, fighter, effect, options) {
    const state = { ...battleState };
    // The effect's behavior is determined by its `type` property. This switch
    // statement should be expanded as more status effects are added.
    switch (effect.type) {
        case "poison":
            // The base damage value is hardcoded here but could be driven by the
            // effect's `value` property for more dynamic effects.
            fighter.hp = clamp(fighter.hp - (effect.value || 5), 0, fighter.maxHp);
            break;
        case "regen":
            fighter.hp = clamp(fighter.hp + (effect.value || 5), 0, fighter.maxHp);
            break;
    }
    effect.duration--;
    state.events.push(generateLogEvent("STATUS_EFFECT_TICK", { fighter, effect }));
    return state;
}

/**
 * Serves as the main entry point for applying a set of effects that originate
 * from a single move action. It delegates to more specific handlers based on
 * the effect's type (e.g., damage, heal, status).
 *
 * @param {BattleState} battleState The current battle state.
 * @param {Effect[]} effects The array of effects originating from the move.
 * @param {ActionContext} context The context of the action (actor, target).
 * @returns {BattleState} The updated battle state.
 */
function applyStatusEffectsFromMove(battleState, effects, context) {
    let state = battleState;
    for (const effect of effects) {
        switch (effect.type) {
            case "damage":
                state = applyDamageEffect(state, effect, context);
                break;
            case "heal":
                state = applyHealEffect(state, effect, context);
                break;
            case "status":
                state = applyStatusEffect(state, effect, context);
                break;
        }
    }
    return state;
}

/**
 * @description Applies a direct damage effect to the target.
 * @param {BattleState} battleState The current battle state.
 * @param {Effect} effect The damage effect to apply.
 * @param {ActionContext} context The context, providing the target.
 * @returns {BattleState} The updated battle state.
 */
function applyDamageEffect(battleState, effect, context) {
    const target = context.target;
    target.hp = clamp(target.hp - (effect.value || 0), 0, target.maxHp);
    return battleState;
}

/**
 * @description Applies a direct healing effect. The target can be the actor
 *   ("self") or their opponent.
 * @param {BattleState} battleState The current battle state.
 * @param {Effect} effect The heal effect to apply.
 * @param {ActionContext} context The context, providing actor and target.
 * @returns {BattleState} The updated battle state.
 */
function applyHealEffect(battleState, effect, context) {
    const target = effect.target === "self" ? context.actor : context.target;
    target.hp = clamp(target.hp + (effect.value || 0), 0, target.maxHp);
    return battleState;
}

/**
 * @description Adds a new status effect to the target fighter's list of
 *   active effects.
 * @param {BattleState} battleState The current battle state.
 * @param {Effect} effect The status effect to apply.
 * @param {ActionContext} context The context, providing actor and target.
 * @returns {BattleState} The updated battle state.
 */
function applyStatusEffect(battleState, effect, context) {
    const target = effect.target === "self" ? context.actor : context.target;
    const newStatusEffect = {
        id: effect.id || `status_${Date.now()}`,
        type: effect.statusType,
        duration: effect.duration || 3,
        value: effect.value,
    };
    target.statusEffects = [...(target.statusEffects || []), newStatusEffect];
    return battleState;
}


// ============================================================================
// PASSIVE STATE UPDATES
// ============================================================================

/**
 * Applies passive energy regeneration to a fighter at the end of their turn.
 * This ensures fighters are not permanently resource-starved after using
 * costly moves. The amount is governed by a constant for consistent game balance.
 *
 * @param {BattleState} battleState The current battle state.
 * @param {Fighter} fighter The fighter receiving regeneration.
 * @param {TurnOptions} options The options for the current turn.
 * @returns {BattleState} The updated battle state.
 */
function processEnergyRegeneration(battleState, fighter, options) {
    // The amount of energy regenerated is defined by a constant to allow for
    // easy tuning of the game's resource economy.
    const regenAmount = DEFAULT_ENERGY_REGEN; // Placeholder
    fighter.energy = clamp(fighter.energy + regenAmount, 0, fighter.maxEnergy);
    return battleState;
}

/**
 * Decrements all of a fighter's active move cooldowns by one turn. This is a
 * standard part of the post-turn phase, ensuring that powerful moves become
 * available again over time.
 *
 * @param {BattleState} battleState The current battle state.
 * @param {Fighter} fighter The fighter whose cooldowns are being updated.
 * @param {TurnOptions} options The options for the current turn.
 * @returns {BattleState} The updated battle state.
 */
function processCooldownDecrements(battleState, fighter, options) {
    if (!fighter.moveCooldowns) return battleState;
    for (const moveId in fighter.moveCooldowns) {
        if (fighter.moveCooldowns[moveId] > 0) {
            fighter.moveCooldowns[moveId]--;
        }
    }
    return battleState;
}

// This constant defines the base amount of energy a fighter regenerates each
// turn. It's a key lever for balancing the pace of the game.
const DEFAULT_ENERGY_REGEN = 5;

// ============================================================================
// EXPORTS
// ============================================================================
export {
    processPreTurnEffects,
    processPostTurnEffects,
    applyStatusEffectsFromMove
}; 