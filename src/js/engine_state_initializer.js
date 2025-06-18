/**
 * @fileoverview Avatar Battle Arena - State Initialization Engine
 * @description Creates the initial `BattleState` required to run a simulation.
 * It combines character and location data to construct a valid state object.
 * @version 3.0.0
 */

"use strict";

//# sourceURL=engine_state_initializer.js

// --- TYPE IMPORTS ---
/**
 * @typedef {import('./types/battle.js').Fighter} Fighter
 * @typedef {import('./types/battle.js').BattleState} BattleState
 * @typedef {import('./types/battle.js').EnvironmentState} EnvironmentState
 * @typedef {import('./types/battle.js').Move} Move
 */

import { getCharacterRegistry } from "./data_characters.js";
import { locations } from "./locations.js";

/**
 * Initializes a single fighter's state from a character template.
 * 
 * @param {string} fighterId - The unique identifier for the character template.
 * @param {string} opponentId - The unique identifier of the opponent.
 * @returns {Fighter} A complete fighter state object ready for battle.
 * @throws {TypeError} If `fighterId` or `opponentId` are not non-empty strings.
 * @throws {Error} If the character template is not found or is invalid.
 * @private
 */
function initializeFighterState(fighterId, opponentId) {
    // Input validation
    if (typeof fighterId !== "string" || fighterId.length === 0) {
        throw new TypeError(`initializeFighterState: fighterId must be a non-empty string, received: ${typeof fighterId}`);
    }
    
    if (typeof opponentId !== "string" || opponentId.length === 0) {
        throw new TypeError(`initializeFighterState: opponentId must be a non-empty string, received: ${typeof opponentId}`);
    }

    /** @type {any} */
    const characterData = (/** @type {any} */ (getCharacterRegistry())).templates[fighterId];
    if (!characterData) {
        throw new Error(`initializeFighterState: Fighter '${fighterId}' not found in character data`);
    }

    if (!characterData.name || typeof characterData.name !== "string") {
        throw new Error(`initializeFighterState: Invalid character name for fighter '${fighterId}'`);
    }

    return {
        id: fighterId,
        name: characterData.name,
        archetype: characterData.archetype || fighterId,
        hp: characterData.maxHp || 100,
        maxHp: characterData.maxHp || 100,
        energy: characterData.maxEnergy || 100,
        maxEnergy: characterData.maxEnergy || 100,
        momentum: 0,
        stunDuration: 0,
        opponentID: opponentId,
        moves: characterData.moves || [],
        mentalState: { confidence: 50, focus: 50, desperation: 0, rage: 0, dominantEmotion: "calm" },
        traits: { canFly: !!characterData.canFly, canRedirectLightning: !!characterData.canRedirectLightning, isProdigy: !!characterData.isProdigy },
        modifiers: { damageModifier: 1.0, evasionModifier: 0.0, elementalResistance: {} },
        stats: { damageDealt: 0, damageReceived: 0, movesUsed: 0 },
        moveCooldowns: {},
        statusEffects: [],
        incapacitationScore: 0,
        escalationState: "stable",
    };
}

/**
 * Initializes the complete `BattleState` for a new simulation.
 * This is the main public function of this module.
 * 
 * @param {string} fighter1Id - The first fighter's identifier.
 * @param {string} fighter2Id - The second fighter's identifier.
 * @param {string} locationId - The location's identifier.
 * @returns {BattleState} A complete and valid `BattleState` object.
 * @throws {TypeError} If any ID is not a non-empty string.
 * @throws {Error} If the location is not found or is invalid.
 * @public
 */
export function initializeBattleState(fighter1Id, fighter2Id, locationId) {
    // Input validation
    if (typeof fighter1Id !== "string" || fighter1Id.length === 0) {
        throw new TypeError(`initializeBattleState: fighter1Id must be a non-empty string.`);
    }
    if (typeof fighter2Id !== "string" || fighter2Id.length === 0) {
        throw new TypeError(`initializeBattleState: fighter2Id must be a non-empty string.`);
    }
    if (typeof locationId !== "string" || locationId.length === 0) {
        throw new TypeError(`initializeBattleState: locationId must be a non-empty string.`);
    }

    /** @type {any} */
    const locationData = /** @type {any} */ (locations)[locationId];
    if (!locationData) {
        throw new Error(`initializeBattleState: Location '${locationId}' not found.`);
    }
    if (!locationData.name || typeof locationData.name !== "string") {
        throw new Error(`initializeBattleState: Invalid name for location '${locationId}'.`);
    }

    const fighter1 = initializeFighterState(fighter1Id, fighter2Id);
    const fighter2 = initializeFighterState(fighter2Id, fighter1Id);

    /** @type {BattleState} */
    const battleState = {
        locationId: locationId,
        turn: 1,
        currentPhase: "opening",
        environment: { totalDamage: 0, impactDescriptions: [] },
        fighter1,
        fighter2,
        log: [],
        winnerId: null,
    };

    console.log(`[State Init] Battle state initialized for '${fighter1.name}' vs '${fighter2.name}' at '${locationData.name}'`);
    return battleState;
} 