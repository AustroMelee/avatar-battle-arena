/**
 * @fileoverview Avatar Battle Arena - Move Resolution Engine
 * @description Handles the execution and resolution of battle moves with damage calculation, effects, and validation
 * @version 2.0.0
 */

'use strict';

//# sourceURL=engine_move-resolution.js

// ============================================================================
// TYPE IMPORTS
// ============================================================================

/**
 * @typedef {import('./types.js').Fighter} Fighter
 * @typedef {import('./types.js').BattleState} BattleState
 * @typedef {import('./types.js').Move} Move
 * @typedef {import('./types.js').MoveResult} MoveResult
 * @typedef {import('./types.js').EnvironmentState} EnvironmentState
 * @typedef {import('./types.js').BattleEvent} BattleEvent
 * @typedef {import('./types.js').StatusEffect} StatusEffect
 */

/**
 * @typedef {Object} DamageCalculation
 * @description Detailed damage calculation result
 * @property {number} baseDamage - Base damage before modifiers
 * @property {number} attackMultiplier - Attack stat multiplier (0-2)
 * @property {number} defenseMultiplier - Defense stat multiplier (0-2)
 * @property {number} moveTypeModifier - Move type effectiveness (0-2)
 * @property {number} elementalModifier - Elemental effectiveness (0-2)
 * @property {number} variance - Random variance applied (-0.2 to 0.2)
 * @property {number} finalDamage - Final calculated damage (0-100)
 * @property {boolean} isCritical - Whether this was a critical hit
 * @property {boolean} isGlancing - Whether this was a glancing blow
 * @property {Object<string, number>} modifiers - Applied modifiers breakdown
 * @property {number} accuracy - Final accuracy used (0-1)
 */

/**
 * @typedef {Object} ResolutionContext
 * @description Context information for move resolution
 * @property {number} turnNumber - Current turn number (1+)
 * @property {string} phase - Current battle phase
 * @property {boolean} [isCounterattack] - Whether this is a counterattack
 * @property {EnvironmentState} [environment] - Current environment state
 * @property {Object} [modifiers] - Additional move modifiers
 * @property {boolean} [enableDebug] - Enable debug logging
 * @property {string} [resolutionId] - Unique resolution identifier
 */

/**
 * @typedef {Object} EffectApplication
 * @description Result of applying a status effect
 * @property {boolean} applied - Whether effect was successfully applied
 * @property {StatusEffect} effect - The effect that was applied
 * @property {string} targetId - Target fighter ID
 * @property {number} [duration] - Effect duration in turns
 * @property {string} [failureReason] - Reason if application failed
 */

/**
 * @typedef {Object} AccuracyCalculation
 * @description Detailed accuracy calculation
 * @property {number} baseAccuracy - Base move accuracy (0-1)
 * @property {number} attackerBonus - Attacker accuracy bonus
 * @property {number} defenderPenalty - Defender evasion penalty
 * @property {number} environmentalModifier - Environmental modifier
 * @property {number} statusModifier - Status effect modifier
 * @property {number} finalAccuracy - Final calculated accuracy (0.05-0.95)
 * @property {boolean} hitSuccess - Whether the hit was successful
 */

/**
 * @typedef {string} ElementType
 * @description Element type: 'fire', 'water', 'earth', 'air', 'spirit', 'physical', 'none'
 */

/**
 * @typedef {string} MoveType
 * @description Move type: 'offensive', 'defensive', 'utility', 'special', 'ultimate', 'passive'
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { randomFloat, randomChance, randomInt } from './utils_random.js';
import { generateLogEvent } from './utils_log_event.js';
import { clamp, percentageOf } from './utils_math.js';

// ============================================================================
// CONSTANTS
// ============================================================================

/** @type {number} */
const CRITICAL_HIT_MULTIPLIER = 1.5;

/** @type {number} */
const CRITICAL_HIT_BASE_CHANCE = 0.05;

/** @type {number} */
const GLANCING_BLOW_MULTIPLIER = 0.5;

/** @type {number} */
const GLANCING_BLOW_CHANCE = 0.1;

/** @type {number} */
const DEFAULT_ACCURACY = 0.85;

/** @type {number} */
const MIN_ACCURACY = 0.05;

/** @type {number} */
const MAX_ACCURACY = 0.95;

/** @type {number} */
const MAX_DAMAGE_VARIANCE = 0.2;

/** @type {number} */
const MIN_DAMAGE_VARIANCE = -0.2;

/** @type {number} */
const MAX_BASE_DAMAGE = 50;

/** @type {number} */
const MIN_BASE_DAMAGE = 1;

/** @type {Object<string, number>} */
const MOVE_TYPE_MODIFIERS = {
    'offensive': 1.0,
    'defensive': 0.7,
    'utility': 0.5,
    'special': 1.2,
    'ultimate': 1.5,
    'passive': 0.3
};

/** @type {Object<string, Object<string, number>>} */
const ELEMENTAL_EFFECTIVENESS = {
    'fire': { 'water': 0.5, 'earth': 1.5, 'air': 1.0, 'spirit': 0.8, 'physical': 1.0 },
    'water': { 'fire': 1.5, 'earth': 1.0, 'air': 0.8, 'spirit': 1.2, 'physical': 1.0 },
    'earth': { 'fire': 0.5, 'water': 1.2, 'air': 1.5, 'spirit': 0.9, 'physical': 1.1 },
    'air': { 'fire': 1.2, 'water': 1.0, 'earth': 0.5, 'spirit': 1.5, 'physical': 0.9 },
    'spirit': { 'fire': 1.3, 'water': 0.8, 'earth': 1.1, 'air': 0.7, 'physical': 1.8 },
    'physical': { 'fire': 1.0, 'water': 1.0, 'earth': 0.9, 'air': 1.1, 'spirit': 0.6 }
};

/** @type {string[]} */
const VALID_MOVE_TYPES = Object.keys(MOVE_TYPE_MODIFIERS);

/** @type {string[]} */
const VALID_ELEMENTS = Object.keys(ELEMENTAL_EFFECTIVENESS);

// ============================================================================
// CORE MOVE RESOLUTION
// ============================================================================

/**
 * Resolves a move execution between attacker and defender
 * 
 * @param {Move} move - Move to execute
 * @param {Fighter} attacker - Attacking fighter
 * @param {Fighter} defender - Defending fighter
 * @param {BattleState} battleState - Current battle state
 * @param {ResolutionContext} [context={}] - Resolution context
 * 
 * @returns {Promise<MoveResult>} Complete move resolution result
 * 
 * @throws {TypeError} When required parameters are invalid
 * @throws {Error} When move cannot be executed
 * @throws {RangeError} When numeric values are out of valid range
 * 
 * @example
 * // Resolve a move
 * const result = await resolveMove(
 *   fireBlast,
 *   azula,
 *   aang,
 *   battleState,
 *   { turnNumber: 5, phase: 'combat', enableDebug: true }
 * );
 * console.log(`Move dealt ${result.damage} damage`);
 * 
 * @since 2.0.0
 * @public
 */
export async function resolveMove(move, attacker, defender, battleState, context = {}) {
    // Input validation
    if (!move || typeof move !== 'object') {
        throw new TypeError('resolveMove: move must be a valid move object');
    }
    
    if (!attacker || typeof attacker !== 'object' || !attacker.id) {
        throw new TypeError('resolveMove: attacker must be a valid fighter object with id');
    }
    
    if (!defender || typeof defender !== 'object' || !defender.id) {
        throw new TypeError('resolveMove: defender must be a valid fighter object with id');
    }
    
    if (!battleState || typeof battleState !== 'object') {
        throw new TypeError('resolveMove: battleState must be a valid battle state object');
    }
    
    if (typeof context !== 'object' || context === null) {
        throw new TypeError('resolveMove: context must be an object');
    }

    // Validate numeric ranges
    if (typeof attacker.hp !== 'number' || attacker.hp < 0 || attacker.hp > 100) {
        throw new RangeError('resolveMove: attacker.hp must be between 0 and 100');
    }

    if (typeof defender.hp !== 'number' || defender.hp < 0 || defender.hp > 100) {
        throw new RangeError('resolveMove: defender.hp must be between 0 and 100');
    }

    /** @type {string} */
    const resolutionId = context.resolutionId || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    if (context.enableDebug) {
        console.debug(`[Move Resolution] ${resolutionId}: Resolving move: ${move.name} (${attacker.id} → ${defender.id})`);
    }

    /** @type {number} */
    const startTime = performance.now();

    try {
        // Pre-execution validation
        validateMoveExecution(move, attacker, defender, battleState);

        // Calculate hit/miss
        /** @type {AccuracyCalculation} */
        const accuracyResult = calculateHitSuccess(move, attacker, defender, context);
        
        if (!accuracyResult.hitSuccess) {
            return createMissResult(move, attacker, defender, context, accuracyResult);
        }

        // Calculate damage
        /** @type {DamageCalculation} */
        const damageResult = calculateMoveDamage(move, attacker, defender, battleState, context);

        // Apply damage and effects
        /** @type {MoveResult} */
        const moveResult = await applyMoveEffects(move, attacker, defender, damageResult, battleState, context);

        /** @type {number} */
        const executionTime = performance.now() - startTime;

        if (context.enableDebug) {
            console.debug(`[Move Resolution] ${resolutionId}: Move resolved: ${damageResult.finalDamage} damage dealt (${executionTime.toFixed(2)}ms)`);
        }

        // Add resolution metadata
        moveResult.metadata = {
            resolutionId,
            executionTime,
            accuracyResult,
            damageCalculation: damageResult
        };

        return moveResult;

    } catch (error) {
        console.error(`[Move Resolution] Error resolving move ${move.name}:`, error);
        
        // Return error result
        return createErrorResult(move, attacker, defender, context, error);
    }
}

/**
 * Validates that a move can be executed in the current context
 * 
 * @param {Move} move - Move to validate
 * @param {Fighter} attacker - Attacking fighter
 * @param {Fighter} defender - Defending fighter
 * @param {BattleState} battleState - Current battle state
 * 
 * @returns {void}
 * 
 * @throws {Error} When move cannot be executed
 * @throws {TypeError} When move properties are invalid
 * 
 * @private
 * @since 2.0.0
 */
function validateMoveExecution(move, attacker, defender, battleState) {
    // Check move structure
    if (!move.id || typeof move.id !== 'string') {
        throw new TypeError('validateMoveExecution: move must have valid id string');
    }

    if (!move.name || typeof move.name !== 'string') {
        throw new TypeError('validateMoveExecution: move must have valid name string');
    }

    // Check attacker condition
    if (attacker.incapacitationScore >= 100) {
        throw new Error(`validateMoveExecution: attacker ${attacker.id} is incapacitated (${attacker.incapacitationScore})`);
    }

    // Check move energy cost
    if (move.energyCost && typeof move.energyCost === 'number') {
        /** @type {number} */
        const currentEnergy = attacker.energy || 0;
        
        if (currentEnergy < move.energyCost) {
            throw new Error(`validateMoveExecution: insufficient energy for move ${move.name} (${currentEnergy}/${move.energyCost})`);
        }
    }

    // Check move cooldown
    if (move.cooldown && attacker.moveCooldowns && typeof attacker.moveCooldowns[move.id] === 'number') {
        if (attacker.moveCooldowns[move.id] > 0) {
            throw new Error(`validateMoveExecution: move ${move.name} is on cooldown (${attacker.moveCooldowns[move.id]} turns remaining)`);
        }
    }

    // Check environmental restrictions
    if (move.environmentalRestrictions && battleState.environment) {
        /** @type {EnvironmentState} */
        const environment = battleState.environment;
        
        if (move.environmentalRestrictions.forbiddenLocations && 
            Array.isArray(move.environmentalRestrictions.forbiddenLocations) &&
            move.environmentalRestrictions.forbiddenLocations.includes(environment.locationId)) {
            throw new Error(`validateMoveExecution: move ${move.name} cannot be used at location ${environment.locationId}`);
        }

        if (move.environmentalRestrictions.requiredWeather && 
            environment.weather && 
            !move.environmentalRestrictions.requiredWeather.includes(environment.weather)) {
            throw new Error(`validateMoveExecution: move ${move.name} requires specific weather conditions`);
        }
    }

    // Check target requirements
    if (move.targetType) {
        if (move.targetType === 'self' && defender.id !== attacker.id) {
            throw new Error(`validateMoveExecution: move ${move.name} can only target self`);
        }
        
        if (move.targetType === 'enemy' && defender.id === attacker.id) {
            throw new Error(`validateMoveExecution: move ${move.name} cannot target self`);
        }
    }
}

/**
 * Calculates whether a move hits successfully
 * 
 * @param {Move} move - Move being executed
 * @param {Fighter} attacker - Attacking fighter
 * @param {Fighter} defender - Defending fighter
 * @param {ResolutionContext} context - Resolution context
 * 
 * @returns {AccuracyCalculation} Detailed accuracy calculation result
 * 
 * @throws {TypeError} When parameters are invalid
 * 
 * @private
 * @since 2.0.0
 */
function calculateHitSuccess(move, attacker, defender, context) {
    // Base accuracy
    /** @type {number} */
    let accuracy = move.accuracy || DEFAULT_ACCURACY;

    // Attacker modifiers
    /** @type {number} */
    const attackerAccuracyBonus = (attacker.accuracyBonus || 0) + (attacker.stats?.accuracy || 0);
    accuracy += attackerAccuracyBonus;

    // Defender modifiers
    /** @type {number} */
    const defenderEvasion = (defender.evasion || 0) + (defender.stats?.evasion || 0);
    accuracy -= defenderEvasion;

    // Environmental modifiers
    if (context.environment) {
        /** @type {number} */
        const environmentalAccuracy = calculateEnvironmentalAccuracyModifier(move, context.environment);
        accuracy += environmentalAccuracy;
    }

    // Status effect modifiers
    /** @type {number} */
    const statusModifier = calculateStatusAccuracyModifier(attacker, defender);
    accuracy += statusModifier;

    // Clamp accuracy to valid range
    accuracy = Math.max(MIN_ACCURACY, Math.min(MAX_ACCURACY, accuracy));

    /** @type {boolean} */
    const hitSuccess = randomChance(accuracy);

    console.debug(`[Move Resolution] Hit calculation: ${accuracy.toFixed(2)} accuracy, ${hitSuccess ? 'HIT' : 'MISS'}`);

    return {
        baseAccuracy: move.accuracy || DEFAULT_ACCURACY,
        attackerBonus: attackerAccuracyBonus,
        defenderPenalty: defenderEvasion,
        environmentalModifier: calculateEnvironmentalAccuracyModifier(move, context.environment),
        statusModifier,
        finalAccuracy: accuracy,
        hitSuccess
    };
}

/**
 * Calculates environmental accuracy modifier
 * 
 * @param {Move} move - Move being executed
 * @param {EnvironmentState} environment - Current environment
 * 
 * @returns {number} Accuracy modifier from environment
 * 
 * @private
 * @since 2.0.0
 */
function calculateEnvironmentalAccuracyModifier(move, environment) {
    /** @type {number} */
    let modifier = 0;

    // Weather effects
    if (environment.weather) {
        switch (environment.weather) {
            case 'rain':
                if (move.element === 'fire') modifier -= 0.1;
                if (move.element === 'water') modifier += 0.1;
                break;
            case 'fog':
                modifier -= 0.15;
                break;
            case 'clear':
                modifier += 0.05;
                break;
        }
    }

    // Terrain effects
    if (environment.terrain) {
        switch (environment.terrain) {
            case 'rocky':
                if (move.element === 'earth') modifier += 0.1;
                break;
            case 'water':
                if (move.element === 'water') modifier += 0.15;
                if (move.element === 'fire') modifier -= 0.1;
                break;
        }
    }

    return modifier;
}

/**
 * Calculates status effect accuracy modifier
 * 
 * @param {Fighter} attacker - Attacking fighter
 * @param {Fighter} defender - Defending fighter
 * 
 * @returns {number} Accuracy modifier from status effects
 * 
 * @private
 * @since 2.0.0
 */
function calculateStatusAccuracyModifier(attacker, defender) {
    /** @type {number} */
    let modifier = 0;

    // Attacker status effects
    if (attacker.statusEffects) {
        attacker.statusEffects.forEach(/** @type {StatusEffect} */ (effect) => {
            switch (effect.type) {
                case 'blinded':
                    modifier -= 0.3;
                    break;
                case 'focused':
                    modifier += 0.2;
                    break;
                case 'confused':
                    modifier -= 0.15;
                    break;
            }
        });
    }

    // Defender status effects
    if (defender.statusEffects) {
        defender.statusEffects.forEach(/** @type {StatusEffect} */ (effect) => {
            switch (effect.type) {
                case 'slowed':
                    modifier += 0.1;
                    break;
                case 'agile':
                    modifier -= 0.15;
                    break;
            }
        });
    }

    return modifier;
}

/**
 * Calculates damage for a move execution
 * 
 * @param {Move} move - Move being executed
 * @param {Fighter} attacker - Attacking fighter
 * @param {Fighter} defender - Defending fighter
 * @param {BattleState} battleState - Current battle state
 * @param {ResolutionContext} context - Resolution context
 * 
 * @returns {DamageCalculation} Detailed damage calculation result
 * 
 * @throws {TypeError} When parameters are invalid
 * 
 * @private
 * @since 2.0.0
 */
function calculateMoveDamage(move, attacker, defender, battleState, context) {
    // Base damage
    /** @type {number} */
    let baseDamage = move.damage || 0;

    // Apply attacker stats
    /** @type {number} */
    const attackPower = attacker.stats?.attack || attacker.attack || 100;
    /** @type {number} */
    const attackMultiplier = attackPower / 100;
    baseDamage *= attackMultiplier;

    // Apply defender stats
    /** @type {number} */
    const defense = defender.stats?.defense || defender.defense || 100;
    /** @type {number} */
    const defenseMultiplier = 100 / (100 + defense - 100);
    baseDamage *= defenseMultiplier;

    // Apply move type modifier
    /** @type {number} */
    const moveTypeModifier = MOVE_TYPE_MODIFIERS[move.type] || 1.0;
    baseDamage *= moveTypeModifier;

    // Apply elemental effectiveness
    /** @type {number} */
    const elementalModifier = calculateElementalEffectiveness(move.element, defender.element);
    baseDamage *= elementalModifier;

    // Apply variance
    /** @type {number} */
    const variance = randomFloat(MIN_DAMAGE_VARIANCE, MAX_DAMAGE_VARIANCE);
    baseDamage *= variance;

    // Check for critical hit
    /** @type {number} */
    const criticalChance = move.criticalChance || 0.05;
    /** @type {boolean} */
    const isCritical = randomChance(criticalChance);
    
    if (isCritical) {
        baseDamage *= CRITICAL_HIT_MULTIPLIER;
    }

    // Check for glancing blow
    /** @type {boolean} */
    const isGlancing = !isCritical && randomChance(GLANCING_BLOW_CHANCE);
    
    if (isGlancing) {
        baseDamage *= GLANCING_BLOW_MULTIPLIER;
    }

    // Apply final modifiers
    baseDamage = applyFinalDamageModifiers(baseDamage, move, attacker, defender, battleState, context);

    /** @type {number} */
    const finalDamage = Math.max(MIN_BASE_DAMAGE, Math.min(MAX_BASE_DAMAGE, Math.round(baseDamage)));

    return {
        baseDamage: move.damage || 0,
        attackMultiplier,
        defenseMultiplier,
        moveTypeModifier,
        elementalModifier,
        variance,
        finalDamage,
        isCritical,
        isGlancing,
        modifiers: {
            attack: attackPower,
            defense,
            element: elementalModifier,
            type: moveTypeModifier
        },
        accuracy: calculateHitSuccess(move, attacker, defender, context).finalAccuracy
    };
}

/**
 * Calculates elemental effectiveness multiplier
 * 
 * @param {ElementType} attackElement - Attacking move element
 * @param {ElementType} defenderElement - Defender's element
 * 
 * @returns {number} Elemental effectiveness multiplier
 * 
 * @private
 * @since 2.0.0
 */
function calculateElementalEffectiveness(attackElement, defenderElement) {
    if (!attackElement || !defenderElement) {
        return 1.0;
    }

    return ELEMENTAL_EFFECTIVENESS[attackElement]?.[defenderElement] || 1.0;
}

/**
 * Applies final damage modifiers from various sources
 * 
 * @param {number} damage - Current damage value
 * @param {Move} move - Move being executed
 * @param {Fighter} attacker - Attacking fighter
 * @param {Fighter} defender - Defending fighter
 * @param {BattleState} battleState - Current battle state
 * @param {ResolutionContext} context - Resolution context
 * 
 * @returns {number} Final modified damage
 * 
 * @private
 * @since 2.0.0
 */
function applyFinalDamageModifiers(damage, move, attacker, defender, battleState, context) {
    /** @type {number} */
    let modifiedDamage = damage;

    // Momentum modifiers
    if (attacker.momentum) {
        /** @type {number} */
        const momentumBonus = Math.max(0, attacker.momentum) * 0.01;
        modifiedDamage *= (1 + momentumBonus);
    }

    // Environmental modifiers
    if (battleState.environment) {
        /** @type {number} */
        const envModifier = calculateEnvironmentalDamageModifier(move, battleState.environment);
        modifiedDamage *= envModifier;
    }

    // Phase modifiers
    if (context.phase) {
        switch (context.phase) {
            case 'opening':
                modifiedDamage *= 0.8;
                break;
            case 'climax':
                modifiedDamage *= 1.2;
                break;
            case 'finale':
                modifiedDamage *= 1.5;
                break;
        }
    }

    return modifiedDamage;
}

/**
 * Calculates environmental damage modifier
 * 
 * @param {Move} move - Move being executed
 * @param {EnvironmentState} environment - Current environment
 * 
 * @returns {number} Environmental damage modifier
 * 
 * @private
 * @since 2.0.0
 */
function calculateEnvironmentalDamageModifier(move, environment) {
    /** @type {number} */
    let modifier = 1.0;

    // Location-based modifiers
    if (environment.locationId) {
        switch (environment.locationId) {
            case 'fire-nation-capital':
                if (move.element === 'fire') modifier += 0.15;
                break;
            case 'north-pole':
                if (move.element === 'water') modifier += 0.2;
                if (move.element === 'fire') modifier -= 0.1;
                break;
            case 'earth-kingdom-stronghold':
                if (move.element === 'earth') modifier += 0.15;
                break;
        }
    }

    return modifier;
}

/**
 * Applies move effects and creates result object
 * 
 * @param {Move} move - Move being executed
 * @param {Fighter} attacker - Attacking fighter
 * @param {Fighter} defender - Defending fighter
 * @param {DamageCalculation} damageResult - Calculated damage
 * @param {BattleState} battleState - Current battle state
 * @param {ResolutionContext} context - Resolution context
 * 
 * @returns {Promise<MoveResult>} Complete move result
 * 
 * @private
 * @since 2.0.0
 */
async function applyMoveEffects(move, attacker, defender, damageResult, battleState, context) {
    /** @type {BattleEvent[]} */
    const events = [];

    // Apply damage
    if (damageResult.finalDamage > 0) {
        defender.incapacitationScore = (defender.incapacitationScore || 0) + damageResult.finalDamage;
        
        // Log damage event
        events.push({
            type: 'DAMAGE_DEALT',
            turn: context.turnNumber || 0,
            data: {
                attackerId: attacker.id,
                defenderId: defender.id,
                moveId: move.id,
                damage: damageResult.finalDamage,
                isCritical: damageResult.isCritical,
                isGlancing: damageResult.isGlancing
            },
            timestamp: new Date().toISOString()
        });
    }

    // Apply status effects
    /** @type {StatusEffect[]} */
    const appliedEffects = [];
    
    if (move.statusEffects && Array.isArray(move.statusEffects)) {
        for (const effect of move.statusEffects) {
            /** @type {EffectApplication} */
            const effectApplication = applyStatusEffect(effect, defender, context);
            
            if (effectApplication.applied) {
                appliedEffects.push(effectApplication.effect);
                
                events.push({
                    type: 'STATUS_EFFECT_APPLIED',
                    turn: context.turnNumber || 0,
                    data: {
                        targetId: defender.id,
                        effectType: effect.type,
                        duration: effect.duration,
                        intensity: effect.intensity
                    },
                    timestamp: new Date().toISOString()
                });
            }
        }
    }

    // Create move execution event
    events.push({
        type: 'MOVE_EXECUTED',
        turn: context.turnNumber || 0,
        data: {
            moveId: move.id,
            moveName: move.name,
            attackerId: attacker.id,
            defenderId: defender.id,
            damage: damageResult.finalDamage,
            accuracy: damageResult.accuracy,
            critical: damageResult.isCritical,
            glancing: damageResult.isGlancing,
            statusEffects: appliedEffects.length
        },
        timestamp: new Date().toISOString()
    });

    return {
        success: true,
        moveId: move.id,
        moveName: move.name,
        attackerId: attacker.id,
        defenderId: defender.id,
        damage: damageResult.finalDamage,
        effects: appliedEffects,
        events,
        accuracy: damageResult.accuracy,
        critical: damageResult.isCritical,
        glancing: damageResult.isGlancing,
        blocked: false,
        damageCalculation: damageResult
    };
}

/**
 * Applies a status effect to a target fighter
 * 
 * @param {StatusEffect} effect - Status effect to apply
 * @param {Fighter} target - Target fighter
 * @param {ResolutionContext} context - Resolution context
 * 
 * @returns {EffectApplication} Result of applying a status effect
 * 
 * @private
 * @since 2.0.0
 */
function applyStatusEffect(effect, target, context) {
    // Check application chance
    if (effect.chance && !randomChance(effect.chance)) {
        return {
            applied: false,
            effect,
            targetId: target.id,
            failureReason: 'Application chance failed'
        };
    }

    // Initialize status effects array if needed
    if (!target.statusEffects) {
        target.statusEffects = [];
    }

    // Check for existing effect of same type
    /** @type {number} */
    const existingIndex = target.statusEffects.findIndex(existing => existing.type === effect.type);
    
    if (existingIndex >= 0) {
        // Update existing effect
        target.statusEffects[existingIndex] = {
            ...effect,
            appliedTurn: context.turnNumber || 0
        };
    } else {
        // Add new effect
        target.statusEffects.push({
            ...effect,
            appliedTurn: context.turnNumber || 0
        });
    }

    return {
        applied: true,
        effect,
        targetId: target.id,
        duration: effect.duration,
        effect: {
            ...effect,
            appliedTurn: context.turnNumber || 0
        }
    };
}

/**
 * Creates a miss result when a move fails to hit
 * 
 * @param {Move} move - Move that missed
 * @param {Fighter} attacker - Attacking fighter
 * @param {Fighter} defender - Defending fighter
 * @param {ResolutionContext} context - Resolution context
 * @param {AccuracyCalculation} accuracyResult - Accuracy calculation result
 * 
 * @returns {MoveResult} Miss result
 * 
 * @private
 * @since 2.0.0
 */
function createMissResult(move, attacker, defender, context, accuracyResult) {
    /** @type {BattleEvent[]} */
    const events = [{
        type: 'MOVE_MISSED',
        turn: context.turnNumber || 0,
        data: {
            moveId: move.id,
            moveName: move.name,
            attackerId: attacker.id,
            defenderId: defender.id
        },
        timestamp: new Date().toISOString()
    }];

    return {
        success: false,
        moveId: move.id,
        moveName: move.name,
        attackerId: attacker.id,
        defenderId: defender.id,
        damage: 0,
        effects: [],
        events,
        accuracy: accuracyResult.finalAccuracy,
        critical: false,
        glancing: false,
        blocked: false,
        damageCalculation: {
            baseDamage: 0,
            attackMultiplier: 0,
            defenseMultiplier: 0,
            moveTypeModifier: 0,
            elementalModifier: 0,
            variance: 0,
            finalDamage: 0,
            isCritical: false,
            isGlancing: false,
            modifiers: {
                attack: 0,
                defense: 0,
                element: 0,
                type: 0
            },
            accuracy: accuracyResult.finalAccuracy
        }
    };
}

/**
 * Creates an error result when an unexpected error occurs
 * 
 * @param {Move} move - Move being executed
 * @param {Fighter} attacker - Attacking fighter
 * @param {Fighter} defender - Defending fighter
 * @param {ResolutionContext} context - Resolution context
 * @param {Error} error - The error that occurred
 * 
 * @returns {MoveResult} Error result
 * 
 * @private
 * @since 2.0.0
 */
function createErrorResult(move, attacker, defender, context, error) {
    /** @type {BattleEvent[]} */
    const events = [{
        type: 'MOVE_ERROR',
        turn: context.turnNumber || 0,
        data: {
            moveId: move.id,
            error: error.message
        },
        timestamp: new Date().toISOString()
    }];

    return {
        success: false,
        moveId: move.id,
        moveName: move.name,
        attackerId: attacker.id,
        defenderId: defender.id,
        damage: 0,
        effects: [],
        events,
        accuracy: false,
        critical: false,
        glancing: false,
        blocked: false,
        error: error.message
    };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validates a move object structure
 * 
 * @param {any} move - Object to validate as move
 * 
 * @returns {boolean} True if valid move object
 * 
 * @example
 * // Validate move
 * if (isValidMove(moveObject)) {
 *   console.log('Valid move');
 * }
 * 
 * @since 2.0.0
 * @public
 */
export function isValidMove(move) {
    if (!move || typeof move !== 'object') {
        return false;
    }

    // Check required properties
    /** @type {string[]} */
    const requiredProps = ['id', 'name', 'type'];
    
    for (const prop of requiredProps) {
        if (!(prop in move)) {
            return false;
        }
    }

    return true;
}

/**
 * Gets available moves for a fighter in current context
 * 
 * @param {Fighter} fighter - Fighter to get moves for
 * @param {BattleState} battleState - Current battle state
 * @param {ResolutionContext} [context={}] - Current context
 * 
 * @returns {Move[]} Array of available moves
 * 
 * @throws {TypeError} When fighter or battleState are invalid
 * 
 * @example
 * // Get available moves
 * const moves = getAvailableMoves(fighter, battleState);
 * 
 * @since 2.0.0
 * @public
 */
export function getAvailableMoves(fighter, battleState, context = {}) {
    // Input validation
    if (!fighter || typeof fighter !== 'object') {
        throw new TypeError('getAvailableMoves: fighter must be a valid fighter object');
    }
    
    if (!battleState || typeof battleState !== 'object') {
        throw new TypeError('getAvailableMoves: battleState must be a valid battle state object');
    }

    if (!fighter.moves || !Array.isArray(fighter.moves)) {
        return [];
    }

    return fighter.moves.filter(/** @type {Move} */ (move) => {
        try {
            // Check energy requirements
            if (move.energyCost && (fighter.energy || 0) < move.energyCost) {
                return false;
            }

            // Check cooldowns
            if (move.cooldown && fighter.moveCooldowns && fighter.moveCooldowns[move.id] > 0) {
                return false;
            }

            // Check environmental restrictions
            if (move.environmentalRestrictions && battleState.environment) {
                const environment = battleState.environment;
                
                if (move.environmentalRestrictions.forbiddenLocations && 
                    move.environmentalRestrictions.forbiddenLocations.includes(environment.locationId)) {
                    return false;
                }
            }

            return true;
            
        } catch (error) {
            console.warn(`[Move Resolution] Error checking move availability for ${move.id}:`, error);
            return false;
        }
    });
}

// Export calculateElementalEffectiveness separately since it's used internally
export { calculateElementalEffectiveness };