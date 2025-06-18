/**
 * @fileoverview Avatar Battle Arena - State Initialization Engine
 * @description Handles initialization of fighter and battle states with defensive programming
 * @version 2.0.0
 */

'use strict';

//# sourceURL=engine_state_initializer.js

// --- TYPE IMPORTS ---
/**
 * @typedef {import('./types.js').Fighter} Fighter
 * @typedef {import('./types.js').BattleState} BattleState
 * @typedef {import('./types.js').EnvironmentState} EnvironmentState
 * @typedef {import('./types.js').LocationConditions} LocationConditions
 * @typedef {import('./types.js').MentalState} MentalState
 * @typedef {import('./types.js').FighterTraits} FighterTraits
 * @typedef {import('./types.js').FighterModifiers} FighterModifiers
 * @typedef {import('./types.js').FighterStats} FighterStats
 */

import { characters } from './data_characters.js';
import { locations } from './locations.js';

/**
 * Initializes a fighter's complete state for battle
 * 
 * @param {string} fighterId - Unique identifier for the fighter
 * @param {string} opponentId - Unique identifier for the opponent
 * @param {boolean} emotionalMode - Whether emotional mode is enabled
 * 
 * @returns {Fighter} Complete fighter state object
 * 
 * @throws {TypeError} When fighterId is not a string
 * @throws {Error} When fighter not found in character data
 * @throws {Error} When character data is invalid
 * 
 * @example
 * // Initialize a fighter for battle
 * const aang = initializeFighterState('aang-airbending-only', 'azula', true);
 * console.log(aang.hp); // 100
 * 
 * @since 2.0.0
 * @public
 */
export function initializeFighterState(fighterId, opponentId, emotionalMode) {
    // Input validation
    if (typeof fighterId !== 'string' || fighterId.length === 0) {
        throw new TypeError(`initializeFighterState: fighterId must be a non-empty string, received: ${typeof fighterId}`);
    }
    
    if (typeof opponentId !== 'string' || opponentId.length === 0) {
        throw new TypeError(`initializeFighterState: opponentId must be a non-empty string, received: ${typeof opponentId}`);
    }
    
    if (typeof emotionalMode !== 'boolean') {
        throw new TypeError(`initializeFighterState: emotionalMode must be a boolean, received: ${typeof emotionalMode}`);
    }

    console.log(`[State Init] Initializing fighter: ${fighterId}`);

    // Find character data
    /** @type {any} */
    const characterData = characters[fighterId];
    if (!characterData) {
        throw new Error(`initializeFighterState: Fighter '${fighterId}' not found in character data`);
    }

    // Validate required character properties
    if (!characterData.name || typeof characterData.name !== 'string') {
        throw new Error(`initializeFighterState: Invalid character name for fighter '${fighterId}'`);
    }

    /** @type {MentalState} */
    const mentalState = {
        confidence: 50,
        focus: 50,
        desperation: 0,
        rage: 0,
        dominantEmotion: 'calm',
        emotionalHistory: {}
    };

    /** @type {FighterTraits} */
    const traits = {
        canFly: characterData.canFly || false,
        canRedirectLightning: characterData.canRedirectLightning || false,
        isProdigy: characterData.isProdigy || false,
        hasFirebending: characterData.hasFirebending || false,
        hasAirbending: characterData.hasAirbending || false,
        hasEarthbending: characterData.hasEarthbending || false,
        hasWaterbending: characterData.hasWaterbending || false,
        isAgile: characterData.isAgile || false,
        isPowerful: characterData.isPowerful || false,
        isTactical: characterData.isTactical || false
    };

    /** @type {FighterModifiers} */
    const modifiers = {
        damageModifier: 1.0,
        evasionModifier: 0.0,
        energyRegenModifier: 1.0,
        accuracyModifier: 0.0,
        elementalResistance: {},
        temporaryEffects: {}
    };

    /** @type {FighterStats} */
    const stats = {
        damageDealt: 0,
        damageReceived: 0,
        movesUsed: 0,
        criticalHits: 0,
        missedAttacks: 0,
        energySpent: 0,
        moveHistory: {}
    };

    /** @type {Fighter} */
    const fighter = {
        id: fighterId,
        name: characterData.name,
        archetype: characterData.archetype || fighterId,
        hp: 100,
        maxHp: 100,
        energy: 100,
        maxEnergy: 100,
        momentum: 0,
        stunDuration: 0,
        opponentId: opponentId,
        mentalState: mentalState,
        traits: traits,
        modifiers: modifiers,
        stats: stats
    };

    console.log(`[State Init] Fighter '${fighter.name}' initialized successfully`);
    return fighter;
}

/**
 * Initializes the complete battle state
 * 
 * @param {string} f1Id - First fighter identifier
 * @param {string} f2Id - Second fighter identifier
 * @param {string} locId - Location identifier
 * @param {string} timeOfDay - Time of day setting ('day', 'night', etc.)
 * @param {boolean} emotionalMode - Whether emotional mode is enabled
 * 
 * @returns {BattleState} Complete battle state object
 * 
 * @throws {TypeError} When required parameters are not strings or boolean
 * @throws {Error} When location not found
 * @throws {Error} When location data is invalid
 * 
 * @example
 * // Initialize battle state
 * const battleState = initializeBattleState('aang', 'azula', 'fire-nation-capital', 'day', true);
 * console.log(battleState.locationId); // 'fire-nation-capital'
 * 
 * @since 2.0.0
 * @public
 */
export function initializeBattleState(f1Id, f2Id, locId, timeOfDay, emotionalMode) {
    // Input validation
    if (typeof f1Id !== 'string' || f1Id.length === 0) {
        throw new TypeError(`initializeBattleState: f1Id must be a non-empty string, received: ${typeof f1Id}`);
    }
    
    if (typeof f2Id !== 'string' || f2Id.length === 0) {
        throw new TypeError(`initializeBattleState: f2Id must be a non-empty string, received: ${typeof f2Id}`);
    }
    
    if (typeof locId !== 'string' || locId.length === 0) {
        throw new TypeError(`initializeBattleState: locId must be a non-empty string, received: ${typeof locId}`);
    }
    
    if (typeof timeOfDay !== 'string' || timeOfDay.length === 0) {
        throw new TypeError(`initializeBattleState: timeOfDay must be a non-empty string, received: ${typeof timeOfDay}`);
    }
    
    if (typeof emotionalMode !== 'boolean') {
        throw new TypeError(`initializeBattleState: emotionalMode must be a boolean, received: ${typeof emotionalMode}`);
    }

    console.log(`[State Init] Initializing battle state for location: ${locId}`);

    // Find location data
    /** @type {any} */
    const locationData = locations[locId];
    if (!locationData) {
        throw new Error(`initializeBattleState: Location '${locId}' not found in location data`);
    }

    // Validate location data
    if (!locationData.name || typeof locationData.name !== 'string') {
        throw new Error(`initializeBattleState: Invalid location name for location '${locId}'`);
    }

    /** @type {EnvironmentState} */
    const environmentState = {
        totalDamage: 0,
        impactLevel: 0,
        damageLevel: 'pristine',
        impactDescriptions: [],
        elementalDamage: {},
        isDestroyed: false
    };

    /** @type {LocationConditions} */
    const locationConditions = {
        modifiers: locationData.modifiers || {},
        specialFeatures: locationData.specialFeatures || [],
        elevation: locationData.elevation || 0,
        terrain: locationData.terrain || 'normal',
        customProperties: {}
    };

    /** @type {BattleState} */
    const battleState = {
        locationId: locId,
        timeOfDay: timeOfDay,
        turn: 0,
        currentPhase: 'opening',
        emotionalMode: emotionalMode,
        environmentState: environmentState,
        locationConditions: locationConditions,
        weatherConditions: {
            type: 'clear',
            intensity: 0,
            modifiers: {},
            effects: []
        },
        metadata: {
            battleId: `battle_${Date.now()}`,
            startTime: Date.now(),
            version: '2.0.0',
            config: {
                emotionalMode: emotionalMode,
                timeOfDay: timeOfDay
            },
            flags: []
        }
    };

    console.log(`[State Init] Battle state initialized for '${locationData.name}'`);
    return battleState;
} 