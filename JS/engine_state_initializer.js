'use strict';

import { characters } from './data_characters.js';
import { locations } from './locations.js';

/**
 * Initializes the state for a single fighter at the beginning of a battle.
 * @param {string} fighterId - The ID of the character for whom to initialize state.
 * @param {string} opponentId - The ID of the opponent character.
 * @param {boolean} emotionalMode - Whether emotional mode is active for the battle.
 * @returns {object} The initialized fighter state object.
 */
export function initializeFighterState(fighterId, opponentId, emotionalMode) {
    const baseChar = characters[fighterId];
    if (!baseChar) {
        console.error(`Character data not found for fighterId: ${fighterId}`);
        return null; // Or throw an error, depending on desired robustness
    }

    return {
        id: baseChar.id,
        name: baseChar.name,
        type: baseChar.type,
        element: baseChar.element,
        pronouns: { ...baseChar.pronouns },
        imageUrl: baseChar.imageUrl,
        hp: 100,
        energy: 100,
        momentum: 0,
        // Initial mental state
        mentalState: {
            level: 'stable',
            stress: 0,
            resilience: 1,
            mood: 'neutral',
        },
        personalityProfile: { ...baseChar.personalityProfile },
        specialTraits: { ...baseChar.specialTraits },
        techniques: [...baseChar.techniques],
        quotes: { ...baseChar.quotes },
        relationships: { ...baseChar.relationships },
        aiLog: [], // Log for AI decisions
        moveHistory: [],
        stunDuration: 0,
        consecutiveStuns: 0,
        stunImmunityTurns: 0,
        lastMove: null,
        lastMoveEffectiveness: null,
        opponentId: opponentId,
        // Other properties that might be needed:
        // tacticalState: null,
        // activeModifiers: [],
        // environmentInfluence: { damage: 0, energy: 0, mobility: 0 },
    };
}

/**
 * Initializes the overall battle state.
 * @param {string} f1Id - Fighter 1 ID.
 * @param {string} f2Id - Fighter 2 ID.
 * @param {string} locId - Location ID.
 * @param {string} timeOfDay - Time of day for the battle.
 * @param {boolean} emotionalMode - Whether emotional mode is active.
 * @returns {object} The initialized battle state object.
 */
export function initializeBattleState(f1Id, f2Id, locId, timeOfDay, emotionalMode) {
    const locationData = locations[locId];
    if (!locationData) {
        console.error(`Location data not found for locId: ${locId}`);
        return null;
    }

    return {
        turn: 0,
        currentPhase: 'PRE_BATTLE',
        locationId: locId,
        timeOfDay: timeOfDay,
        emotionalMode: emotionalMode,
        environmentState: {
            id: locationData.id,
            name: locationData.name,
            description: locationData.description,
            envDescription: locationData.envDescription,
            envImpactVariants: [...locationData.envImpactVariants],
            envTags: [...locationData.envTags],
            damageLevel: 0, // Initial environmental damage
            environmentalImpactsThisPhase: [], // To track specific impacts within a phase
            environmentalImpactCount: 0, // To count impacts within a phase
            highestImpactLevelThisPhase: 'subtle', // NEW: Track the highest impact level achieved in the current phase
            narrativeTriggeredThisPhase: false, // NEW: Track if a general in-phase narrative has been triggered
        },
        locationConditions: locationData, // Pass the entire locationData object
        characters: { [f1Id]: null, [f2Id]: null }, // Placeholder, fighters populated after initialization
        characterReceivedCriticalHit: { // Track critical hits for narrative/AI
            [f1Id]: false,
            [f2Id]: false,
        },
        // Other global battle states
        // globalNarrativeTriggers: {},
        // combatLog: [],
    };
} 