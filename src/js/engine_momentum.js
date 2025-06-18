/**
 * @fileoverview Avatar Battle Arena - Momentum System Engine
 * @description Manages fighter momentum stat that influences AI decisions and critical hit chances
 * @version 2.0.0
 */

"use strict";

//# sourceURL=engine_momentum.js

// ============================================================================
// TYPE IMPORTS
// ============================================================================

/**
 * @typedef {import('./types.js').Fighter} Fighter
 */

/**
 * @typedef {Object} MomentumConfig
 * @description Configuration for momentum system
 * @property {number} maxMomentum - Maximum momentum value
 * @property {number} minMomentum - Minimum momentum value
 * @property {number} critModifier - Critical hit modifier per momentum point
 */

/**
 * @typedef {Object} MomentumState
 * @description Current momentum state for a fighter
 * @property {number} current - Current momentum value
 * @property {number} previous - Previous momentum value
 * @property {number} delta - Change in momentum
 * @property {string} lastReason - Reason for last momentum change
 * @property {boolean} hasChanged - Whether momentum changed this turn
 */

// ============================================================================
// CONSTANTS
// ============================================================================

/** @type {number} */
export const MAX_MOMENTUM = 5;

/** @type {number} */
export const MIN_MOMENTUM = -5;

/** @type {number} */
export const MOMENTUM_CRIT_MODIFIER_PER_POINT = 0.05; // 5% crit chance per momentum point

/** @type {number} */
const MOMENTUM_VALIDATION_TOLERANCE = 0.001;

/** @type {string[]} */
const VALID_MOMENTUM_REASONS = [
    "General change",
    "Move success",
    "Move failure",
    "Damage taken",
    "Critical hit",
    "Block successful",
    "Counter attack",
    "Environmental effect",
    "Reset"
];

// ============================================================================
// CORE MOMENTUM FUNCTIONS
// ============================================================================

/**
 * Modifies a character's momentum, ensuring it stays within defined bounds
 * 
 * @param {Fighter} actor - The character whose momentum is being modified
 * @param {number} delta - The amount by which to change the momentum (can be positive or negative)
 * @param {string} [reason='General change'] - A string explaining why the momentum changed (for logging)
 * 
 * @returns {void}
 * 
 * @throws {TypeError} When actor is invalid
 * @throws {TypeError} When delta is not a number
 * @throws {TypeError} When reason is not a string
 * 
 * @example
 * // Increase momentum on successful attack
 * modifyMomentum(fighter, 2, 'Critical hit landed');
 * 
 * // Decrease momentum on taking damage
 * modifyMomentum(fighter, -1, 'Damage taken');
 * 
 * @since 2.0.0
 * @public
 */
export function modifyMomentum(actor, delta, reason = "General change") {
    // Input validation
    if (!actor || typeof actor !== "object") {
        throw new TypeError("modifyMomentum: actor must be a valid fighter object");
    }

    if (typeof delta !== "number") {
        throw new TypeError("modifyMomentum: delta must be a number");
    }

    if (typeof reason !== "string") {
        throw new TypeError("modifyMomentum: reason must be a string");
    }

    if (!Number.isFinite(delta)) {
        throw new RangeError("modifyMomentum: delta must be a finite number");
    }

    // Validate actor structure
    validateActorForMomentum(actor);

    // Ensure momentum and delta are numbers; default to 0 if NaN or undefined
    /** @type {number} */
    const currentMomentum = typeof actor.momentum === "number" && !isNaN(actor.momentum) ? actor.momentum : 0;
    
    /** @type {number} */
    const numericDelta = Number(delta);

    /** @type {number} */
    let newMomentum = currentMomentum + numericDelta;

    // Clamp momentum to min/max bounds
    newMomentum = Math.max(MIN_MOMENTUM, Math.min(MAX_MOMENTUM, newMomentum));

    // Round to avoid floating point precision issues
    newMomentum = Math.round(newMomentum * 1000) / 1000;

    if (Math.abs(newMomentum - currentMomentum) > MOMENTUM_VALIDATION_TOLERANCE) {
        /** @type {number} */
        const actualDelta = newMomentum - currentMomentum;
        
        actor.momentum = newMomentum;
        
        // Ensure aiLog exists
        if (!Array.isArray(actor.aiLog)) {
            actor.aiLog = [];
        }
        
        actor.aiLog.push(`[Momentum]: ${actor.name || actor.id}'s momentum changed from ${currentMomentum} to ${newMomentum} due to: ${reason}.`);
        
        // Signal UI update (UI module will pick this up)
        actor.momentumChanged = true;

        console.debug(`[Momentum] ${actor.name || actor.id}: ${currentMomentum} → ${newMomentum} (${actualDelta > 0 ? "+" : ""}${actualDelta}) - ${reason}`);
        
    } else if (Math.abs(numericDelta) > MOMENTUM_VALIDATION_TOLERANCE) {
        // Log if momentum change was attempted but capped
        if (!Array.isArray(actor.aiLog)) {
            actor.aiLog = [];
        }
        
        actor.aiLog.push(`[Momentum]: ${actor.name || actor.id}'s momentum attempted to change by ${numericDelta} but was capped at ${currentMomentum}. Reason: ${reason}.`);
        
        console.debug(`[Momentum] ${actor.name || actor.id}: Change capped (${numericDelta}) - ${reason}`);
    }
}

/**
 * Resets a character's momentum to zero
 * 
 * @param {Fighter} actor - The character whose momentum is being reset
 * @param {string} [reason='Reset'] - A string explaining why the momentum was reset
 * 
 * @returns {void}
 * 
 * @throws {TypeError} When actor is invalid
 * @throws {TypeError} When reason is not a string
 * 
 * @example
 * // Reset momentum at battle start
 * resetMomentum(fighter, 'Battle initialization');
 * 
 * // Reset momentum due to special effect
 * resetMomentum(fighter, 'Mind control effect');
 * 
 * @since 2.0.0
 * @public
 */
export function resetMomentum(actor, reason = "Reset") {
    // Input validation
    if (!actor || typeof actor !== "object") {
        throw new TypeError("resetMomentum: actor must be a valid fighter object");
    }

    if (typeof reason !== "string") {
        throw new TypeError("resetMomentum: reason must be a string");
    }

    // Validate actor structure
    validateActorForMomentum(actor);

    /** @type {number} */
    const currentMomentum = typeof actor.momentum === "number" && !isNaN(actor.momentum) ? actor.momentum : 0;

    if (Math.abs(currentMomentum) > MOMENTUM_VALIDATION_TOLERANCE) {
        /** @type {number} */
        const oldMomentum = currentMomentum;
        
        actor.momentum = 0;
        
        // Ensure aiLog exists
        if (!Array.isArray(actor.aiLog)) {
            actor.aiLog = [];
        }
        
        actor.aiLog.push(`[Momentum]: ${actor.name || actor.id}'s momentum reset from ${oldMomentum} to 0 due to: ${reason}.`);
        
        // Signal UI update
        actor.momentumChanged = true;

        console.debug(`[Momentum] ${actor.name || actor.id}: Reset from ${oldMomentum} to 0 - ${reason}`);
    }
}

/**
 * Calculates the critical hit chance modifier based on the actor's current momentum
 * 
 * @param {Fighter} actor - The character for whom to calculate the modifier
 * 
 * @returns {number} The critical hit chance modifier (e.g., 0.1 for +10%)
 * 
 * @throws {TypeError} When actor is invalid
 * 
 * @example
 * // Calculate crit modifier for attack
 * const critModifier = getMomentumCritModifier(fighter);
 * const baseCritChance = 0.05; // 5%
 * const finalCritChance = baseCritChance + critModifier;
 * 
 * @since 2.0.0
 * @public
 */
export function getMomentumCritModifier(actor) {
    // Input validation
    if (!actor || typeof actor !== "object") {
        throw new TypeError("getMomentumCritModifier: actor must be a valid fighter object");
    }

    // Validate actor structure
    validateActorForMomentum(actor);

    // Ensure actor.momentum is a number; default to 0 if NaN or undefined
    /** @type {number} */
    const currentMomentum = typeof actor.momentum === "number" && !isNaN(actor.momentum) ? actor.momentum : 0;

    /** @type {number} */
    const modifier = currentMomentum * MOMENTUM_CRIT_MODIFIER_PER_POINT;

    // Defensive programming - ensure modifier is within reasonable bounds
    return Math.max(-1, Math.min(1, modifier));
}

// ============================================================================
// UTILITY & STATE FUNCTIONS
// ============================================================================

/**
 * Gets the current momentum state for a fighter
 * 
 * @param {Fighter} actor - The fighter to get momentum state for
 * 
 * @returns {MomentumState} Current momentum state information
 * 
 * @throws {TypeError} When actor is invalid
 * 
 * @example
 * // Get momentum state for analysis
 * const state = getMomentumState(fighter);
 * console.log(`Momentum: ${state.current} (was ${state.previous})`);
 * 
 * @since 2.0.0
 * @public
 */
export function getMomentumState(actor) {
    // Input validation
    if (!actor || typeof actor !== "object") {
        throw new TypeError("getMomentumState: actor must be a valid fighter object");
    }

    /** @type {number} */
    const current = typeof actor.momentum === "number" && !isNaN(actor.momentum) ? actor.momentum : 0;
    
    /** @type {number} */
    const previous = typeof actor.previousMomentum === "number" && !isNaN(actor.previousMomentum) ? actor.previousMomentum : current;

    return {
        current,
        previous,
        delta: current - previous,
        lastReason: actor.lastMomentumReason || "Unknown",
        hasChanged: actor.momentumChanged || false
    };
}

/**
 * Validates momentum system configuration
 * 
 * @param {MomentumConfig} config - Configuration to validate
 * 
 * @returns {boolean} True if configuration is valid
 * 
 * @throws {TypeError} When config is invalid
 * 
 * @example
 * // Validate custom momentum config
 * const isValid = validateMomentumConfig({
 *   maxMomentum: 10,
 *   minMomentum: -10,
 *   critModifier: 0.03
 * });
 * 
 * @since 2.0.0
 * @public
 */
export function validateMomentumConfig(config) {
    if (!config || typeof config !== "object") {
        throw new TypeError("validateMomentumConfig: config must be an object");
    }

    if (typeof config.maxMomentum !== "number" || !Number.isFinite(config.maxMomentum)) {
        throw new TypeError("validateMomentumConfig: maxMomentum must be a finite number");
    }

    if (typeof config.minMomentum !== "number" || !Number.isFinite(config.minMomentum)) {
        throw new TypeError("validateMomentumConfig: minMomentum must be a finite number");
    }

    if (config.maxMomentum <= config.minMomentum) {
        throw new RangeError("validateMomentumConfig: maxMomentum must be greater than minMomentum");
    }

    if (typeof config.critModifier !== "number" || !Number.isFinite(config.critModifier)) {
        throw new TypeError("validateMomentumConfig: critModifier must be a finite number");
    }

    if (config.critModifier < 0 || config.critModifier > 1) {
        throw new RangeError("validateMomentumConfig: critModifier must be between 0 and 1");
    }

    return true;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validates actor object for momentum operations
 * 
 * @param {Fighter} actor - Actor to validate
 * 
 * @returns {void}
 * 
 * @throws {TypeError} When actor structure is invalid
 * 
 * @private
 * @since 2.0.0
 */
function validateActorForMomentum(actor) {
    if (!actor.id && !actor.name) {
        throw new TypeError("validateActorForMomentum: actor must have an id or name property");
    }

    // Initialize aiLog if it doesn't exist
    if (!actor.aiLog) {
        actor.aiLog = [];
    }

    if (!Array.isArray(actor.aiLog)) {
        throw new TypeError("validateActorForMomentum: actor.aiLog must be an array");
    }
}