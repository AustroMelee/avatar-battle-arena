"use strict";

/**
 * @fileoverview Turn Effects Processor
 * @description Handles the application of all status, environmental, and passive effects that occur during a turn.
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
 * Processes all effects that occur before a player's main action.
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
 * Processes all effects that occur after a player's main action.
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
 * Processes all active status effects for a given timing.
 * @param {BattleState} battleState The current battle state.
 * @param {Fighter} fighter The fighter being affected.
 * @param {'pre-turn' | 'post-turn'} timing The timing of the effect processing.
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
    // Filter out expired effects
    state.fighters[fighter.id].statusEffects = state.fighters[fighter.id].statusEffects.filter(e => e.duration > 0);
    return state;
}

/**
 * Processes all environmental effects for a given timing.
 * @param {BattleState} battleState The current battle state.
 * @param {Fighter} fighter The fighter being affected.
 * @param {'pre-turn' | 'post-turn'} timing The timing of the effect processing.
 * @param {TurnOptions} options The options for the current turn.
 * @returns {Promise<BattleState>} The updated battle state.
 */
async function processEnvironmentalEffects(battleState, fighter, timing, options) {
    // Placeholder for environmental effects logic
    return battleState;
}

// ============================================================================
// SPECIFIC EFFECT HANDLERS
// ============================================================================

/**
 * Applies a single tick of a status effect.
 * @param {BattleState} battleState The current battle state.
 * @param {Fighter} fighter The fighter with the status effect.
 * @param {StatusEffect} effect The status effect to apply.
 * @param {TurnOptions} options The options for the current turn.
 * @returns {Promise<BattleState>} The updated battle state.
 */
async function applyStatusEffectTick(battleState, fighter, effect, options) {
    const state = { ...battleState };
    // Simplified: apply effect based on type
    switch (effect.type) {
        case "poison":
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
 * Applies the effects of a move to the battle state.
 * @param {BattleState} battleState The current battle state.
 * @param {Effect[]} effects The effects from the move.
 * @param {ActionContext} context The context of the action.
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

function applyDamageEffect(battleState, effect, context) {
    const target = context.target;
    target.hp = clamp(target.hp - (effect.value || 0), 0, target.maxHp);
    return battleState;
}

function applyHealEffect(battleState, effect, context) {
    const target = effect.target === "self" ? context.actor : context.target;
    target.hp = clamp(target.hp + (effect.value || 0), 0, target.maxHp);
    return battleState;
}

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
 * Applies passive energy regeneration at the end of a turn.
 * @param {BattleState} battleState The current battle state.
 * @param {Fighter} fighter The fighter receiving regeneration.
 * @param {TurnOptions} options The options for the current turn.
 * @returns {BattleState} The updated battle state.
 */
function processEnergyRegeneration(battleState, fighter, options) {
    const regenAmount = DEFAULT_ENERGY_REGEN; // Placeholder
    fighter.energy = clamp(fighter.energy + regenAmount, 0, fighter.maxEnergy);
    return battleState;
}

/**
 * Decrements all move cooldowns for a fighter.
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

const DEFAULT_ENERGY_REGEN = 5;

// ============================================================================
// EXPORTS
// ============================================================================
export {
    processPreTurnEffects,
    processPostTurnEffects,
    applyStatusEffectsFromMove
}; 