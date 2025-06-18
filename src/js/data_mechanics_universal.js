// FILE: data_mechanics_universal.js
"use strict";

// Universal mechanics and rules applicable across all characters and locations.

/**
 * @typedef {object} UniversalMechanicCondition
 * @property {string} type - The type of condition (e.g., 'target_technique_speed', 'location_property').
 * @property {any} value - The value to check against for the condition.
 * @property {number} [triggerChance] - Optional chance modifier for this condition.
 * @property {number} [modifier] - Optional numerical modifier applied if condition is met.
 */

/**
 * @typedef {object} UniversalMechanicOutcome
 * @property {string} type - The type of effect (should map to a value in EFFECT_TYPES).
 * @property {string} [successMessage] - Message displayed on successful outcome.
 * @property {string} [failureMessage] - Message displayed on failed outcome.
 * @property {number} [value] - Numeric value for effects like stun duration.
 * @property {number} [duration] - Duration for effects like paralysis.
 */

/**
 * @typedef {object} UniversalMechanicRule
 * @property {string} id - Unique identifier for the universal mechanic.
 * @property {string} description - A description of the mechanic.
 * @property {string} characterId - The ID of the character associated with this mechanic (if character-specific, but universal in application).
 * @property {UniversalMechanicCondition[]} conditions - An array of conditions that must be met for the mechanic to trigger.
 * @property {number} maxChance - The maximum probability (0-1) for this mechanic to trigger.
 * @property {string[]} counteredBy - An array of tags describing moves that can counter this mechanic.
 * @property {string} personalityTrigger - A string indicating a personality trait or state that influences this mechanic.
 * @property {boolean} canTriggerPreBattle - True if this mechanic can trigger before the main battle loop.
 * @property {string[]} [activatingMoveTags] - Optional array of move tags that can activate this mechanic.
 * @property {UniversalMechanicOutcome} outcome - The effect or outcome of the universal mechanic.
 */

/**
 * Universal mechanics that apply globally or based on specific character/environmental interactions.
 * @type {object.<string, UniversalMechanicRule>}
 */
export const universalMechanics = {
    maiKnifeAdvantage: {
        id: "mai_knife_advantage",
        description: "Mai's uncanny precision with knives.",
        characterId: "mai",
        conditions: [
            { type: "target_technique_speed", value: "slow", triggerChance: 0.85 },
            { type: "location_property", property: "cramped", modifier: 0.10 }
        ],
        maxChance: 0.85,
        counteredBy: ["fast_defensive_move", "area_denial_projectile"],
        personalityTrigger: "provoked",
        canTriggerPreBattle: false,
        outcome: { type: "instant_ko", successMessage: "{attackerName}'s thrown knife finds a fatal opening due to {targetName}'s slow technique!", failureMessage: "{targetName} narrowly avoids Mai's deadly accurate throw!" }
    },
    tyLeeChiBlocking: {
        id: "tylee_chi_blocking",
        description: "Ty Lee's ability to paralyze with precise strikes.",
        characterId: "ty-lee",
        conditions: [
            { type: "location_property", property: "cramped", triggerChance: 0.60 },
        ],
        maxChance: 0.85,
        counteredBy: ["projectile_attack", "area_denial_move"],
        personalityTrigger: "serious_fight",
        canTriggerPreBattle: false,
        activatingMoveTags: ["melee_range", "debuff_disable"],
        outcome: { type: "stun", duration: 2, successMessage: "Ty Lee's acrobatic assault with {moveName} lands perfectly, blocking {targetName}'s chi!", failureMessage: "{targetName} manages to avoid Ty Lee's disabling strikes!" }
    },
    // Add other universal mechanics here
};