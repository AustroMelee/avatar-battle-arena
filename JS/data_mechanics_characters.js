// FILE: data_mechanics_characters.js
'use strict';

// Refined Curb Stomp Mechanics (v2) for Direct Engine Integration

/**
 * @typedef {object} CurbstompOutcome
 * @property {string} type - The type of effect (should map to a value in EFFECT_TYPES).
 * @property {string} [successMessage] - Message displayed on successful outcome.
 * @property {string} [failureMessage] - Message displayed on failed outcome (for self-sabotage).
 * @property {number} [value] - Numeric value for effects like damage increase or evasion.
 * @property {number} [mercyChance] - Chance for mercy for conditional KO.
 * @property {number} [selfSabotageChance] - Chance for self-sabotage for conditional KO.
 * @property {string} [message] - General message for the outcome.
 */

/**
 * @typedef {object} CurbstompRule
 * @property {string} id - Unique identifier for the rule.
 * @property {string} description - A description of the rule.
 * @property {number} triggerChance - The probability (0-1) of this rule triggering.
 * @property {boolean} canTriggerPreBattle - True if this rule can trigger before the main battle loop.
 * @property {string} severity - The severity or category of the rule ('lethal', 'buff', etc.).
 * @property {function(object, object, object): boolean} conditionLogic - A function that returns true if the conditions for the rule are met.
 * @property {CurbstompOutcome} outcome - The effect or outcome of the rule.
 */

/**
 * Character-specific curbstomp rules.
 * These rules define conditions under which a character might achieve an overwhelming victory
 * or trigger a special pre-battle or in-battle effect.
 * @type {object.<string, CurbstompRule[]>}
 */
export const characterCurbstompRules = {
    'azula': [
        {
            id: "azula_sane_precision_lightning",
            description: "When calm and focused, Azula's lightning is surgically precise. Auto-KO vs. conductive targets (metal, wet), with a 95% hit rate. Fails if emotionally unstable or charge is interrupted.",
            triggerChance: 0.75,
            canTriggerPreBattle: false,
            severity: 'lethal',
            conditionLogic: (azula, opponent, battleState) => {
                return !azula.mentalState.isInsane && (opponent.specialTraits?.hasMetalArmor || opponent.specialTraits?.isWet);
            },
            outcome: { 
                type: "instant_ko", 
                successMessage: "Azula's lightning strikes with surgical precision, using {targetName}'s armor or the water around them as a fatal conductor. A perfect, unblockable shot!",
            }
        },
        {
            id: "azula_sane_fire_tornado",
            description: "In open space, Azula can spiral her fire into a searing vortex. Instant-KO if target is mid-cast or grounded. High risk, high reward.",
            triggerChance: 0.55,
            canTriggerPreBattle: false,
            severity: 'lethal',
            conditionLogic: (azula, opponent, battleState) => {
                return !azula.mentalState.isInsane && battleState.isOpenTerrain;
            },
            outcome: { 
                type: "instant_ko", 
                successMessage: "Azula conjures a terrifying vortex of blue flame, engulfing and incinerating {targetName} mid-action!",
            }
        },
        {
            id: "azula_insane_unstable_kill",
            description: "If mentally unstable, Azula's flames intensify unpredictably, losing targeting but overriding defense logic.",
            triggerChance: 0.60, // 60% chance to be an instant kill
            selfSabotageChance: 0.40, // 40% chance it backfires
            canTriggerPreBattle: false,
            severity: 'lethal',
            conditionLogic: (azula, opponent, battleState) => {
                return azula.mentalState.level === 'broken'; // simplified from isInsane
            },
            outcome: { 
                type: "conditional_ko_or_self_sabotage", 
                successMessage: "In her madness, Azula unleashes a wild, unpredictable assault that completely overwhelms {targetName}! Her raw power overrides all defenses.",
                selfSabotageMessage: "Azula's attack is powerful but reckless, going awry and leaving her vulnerable. Her madness causes her to lose control."
            }
        },
        {
            id: "azula_blue_fire_surge",
            description: "Her blue fire burns hotter, overriding basic defenses. Applies to all fire-based attacks.",
            triggerChance: 1.0,
            canTriggerPreBattle: true,
            severity: 'buff',
            outcome: { 
                type: "damage_modifier", 
                value: 0.25,
                message: "Azula's blue fire rages with terrifying intensity, burning through standard defenses and penetrating resistance."
            }
        }
    ],
    'aang': [
        {
            id: "aang_mobility_edge",
            description: "Aang's mastery of airbending gives him a significant defensive advantage against grounded attacks.",
            triggerChance: 0.60,
            canTriggerPreBattle: true,
            severity: 'buff',
            outcome: { 
                type: "evasion_modifier",
                value: 0.60,
                message: "Aang zips around on his air scooter, making him an incredibly difficult target for ground-based assaults."
            }
        }
    ]
};