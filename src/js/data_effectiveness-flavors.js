/**
 * @fileoverview Avatar Battle Arena - Effectiveness Flavor Data
 * @description Data-driven effectiveness flavor text to replace hardcoded switch statements.
 * @version 1.0
 */

"use strict";

/**
 * Effectiveness flavor text data organized by effectiveness type.
 * This replaces the hardcoded switch statement in _applyEffectivenessFlavor.
 */
export const EFFECTIVENESS_FLAVORS = {
    "super-effective": [
        "It's super effective! ",
        "A devastating blow! ",
        "Unleashed with full force! "
    ],
    "not-very-effective": [
        "It's not very effective... ",
        "A glancing blow. ",
        "Barely makes a dent. "
    ],
    "no-effect": [
        "It has no effect. ",
        "Completely shrugged off. ",
        "A futile effort. "
    ],
    "critical": [
        "Critical hit! ",
        "A precise strike! ",
        "Exploiting a weakness! "
    ],
    "miss": [
        "It misses! ",
        "A wild swing. ",
        "Fails to connect. "
    ],
    // Additional effectiveness types can be easily added here
    "glancing": [
        "A glancing hit! ",
        "Barely connects. ",
        "A superficial strike. "
    ],
    "overwhelming": [
        "Absolutely overwhelming! ",
        "Pure domination! ",
        "Unstoppable force! "
    ]
};

/**
 * Environmental narrative data organized by event type.
 * This replaces the hardcoded switch statement in buildEnvironmentalNarrative.
 */
export const ENVIRONMENTAL_NARRATIVES = {
    "activation": {
        base: (envName) => `The environment of ${envName || "the battlefield"} activates, influencing the combatants.`,
        withImpacts: (impacts) => ` Key impacts: ${impacts.map(impact => `${impact.type} (${impact.magnitude})`).join(", ")}.`
    },
    "damage": {
        flavors: [
            (entities) => `The environment lashes out, affecting ${entities}.`,
            (entities) => `Environmental hazards impact ${entities}.`,
            (entities) => `${entities} contend with the treacherous surroundings.`
        ],
        suffix: (damageAmount) => ` (${damageAmount} damage).`
    },
    "change": {
        flavors: [
            (envName) => `The ${envName} shifts, altering the dynamics of the fight.`,
            () => "The battlefield morphs, creating new challenges.",
            () => "The environment responds to the escalating conflict."
        ],
        suffix: (newState) => ` New state: ${newState}.`
    },
    // Default fallback
    "default": {
        base: () => "Something happens with the environment."
    }
}; 