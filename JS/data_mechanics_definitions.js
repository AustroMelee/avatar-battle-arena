'use strict';

/**
 * This file defines the various types of game mechanics, effects, and their properties.
 * It acts as a central registry for all active and passive effects in the game,
 * enabling a data-driven approach to mechanics application.
 */

export const EFFECT_TYPES = {
    // Core Battle Effects
    DAMAGE: 'damage',
    HEAL: 'heal',
    ENERGY_CHANGE: 'energy_change',
    STUN: 'stun',
    MOMENTUM_CHANGE: 'momentum_change',
    COLLATERAL_DAMAGE: 'collateral_damage',

    // State Modifiers (Buffs/Debuffs)
    EVASION_MODIFIER: 'evasion_modifier',
    DAMAGE_MODIFIER: 'damage_modifier',
    DEFENSE_MODIFIER: 'defense_modifier',
    ACCURACY_MODIFIER: 'accuracy_modifier',
    STUN_RESISTANCE_MODIFIER: 'stun_resistance_modifier',
    MANIPULATION_RESISTANCE_MODIFIER: 'manipulation_resistance_modifier',
    SPEED_MODIFIER: 'speed_modifier',

    // Special Outcomes
    INSTANT_KO: 'instant_ko',
    CONDITIONAL_KO_OR_MERCY: 'conditional_ko_or_mercy',
    CONDITIONAL_KO_OR_SELF_SABOTAGE: 'conditional_ko_or_self_sabotage',
    ENVIRONMENTAL_CHANGE: 'environmental_change',
    PERSONALITY_CHANGE: 'personality_change',
    TRAIT_TOGGLE: 'trait_toggle', // e.g., turning 'isInsane' on/off
    APPLY_STATUS_EFFECT: 'apply_status_effect', // For more complex, timed status effects

    // Narrative/AI Influence
    TRIGGER_NARRATIVE_EVENT: 'trigger_narrative_event',
    ADJUST_AI_PROFILE: 'adjust_ai_profile',
    APPLY_CURBSTOMP_RULE: 'apply_curbstomp_rule', // This will now apply specific curbstomp rule by ID
};

/**
 * Defines the properties and expected parameters for each effect type.
 * This can be used for validation, UI display, or dynamic effect application logic.
 */
export const MECHANIC_DEFINITIONS = {
    [EFFECT_TYPES.DAMAGE]: {
        description: "Applies damage to a target's HP.",
        params: { value: { type: 'number', required: true } },
        targets: ['target', 'self'],
    },
    [EFFECT_TYPES.HEAL]: {
        description: "Restores HP to a target.",
        params: { value: { type: 'number', required: true } },
        targets: ['target', 'self'],
    },
    [EFFECT_TYPES.ENERGY_CHANGE]: {
        description: "Modifies a character's energy.",
        params: { value: { type: 'number', required: true } }, // Positive for gain, negative for loss
        targets: ['target', 'self'],
    },
    [EFFECT_TYPES.STUN]: {
        description: "Stuns a target, preventing actions for a duration.",
        params: { duration: { type: 'number', required: true } },
        targets: ['target'],
    },
    [EFFECT_TYPES.MOMENTUM_CHANGE]: {
        description: "Adjusts a character's momentum.",
        params: { value: { type: 'number', required: true }, targetId: { type: 'string', required: true } },
        targets: ['global'], // Momentum is often global to the battle state or involves interactions
    },
    [EFFECT_TYPES.COLLATERAL_DAMAGE]: {
        description: "Increases environmental damage.",
        params: { value: { type: 'number', required: true } },
        targets: ['environment'],
    },
    [EFFECT_TYPES.EVASION_MODIFIER]: {
        description: "Modifies a character's evasion for a duration or permanently.",
        params: { value: { type: 'number', required: true }, duration: { type: 'number' } },
        targets: ['target', 'self'],
    },
    [EFFECT_TYPES.DAMAGE_MODIFIER]: {
        description: "Modifies a character's outgoing damage.",
        params: { value: { type: 'number', required: true }, duration: { type: 'number' } },
        targets: ['target', 'self'],
    },
    [EFFECT_TYPES.INSTANT_KO]: {
        description: "Immediately defeats a target.",
        params: { message: { type: 'string' } },
        targets: ['target'],
    },
    [EFFECT_TYPES.CONDITIONAL_KO_OR_MERCY]: {
        description: "A special KO effect with a chance for mercy, leading to incapacitation instead.",
        params: { mercyChance: { type: 'number', required: true }, successMessage: { type: 'string' }, mercyMessage: { type: 'string' } },
        targets: ['target'],
    },
    [EFFECT_TYPES.CONDITIONAL_KO_OR_SELF_SABOTAGE]: {
        description: "A special KO effect with a chance to backfire on the attacker.",
        params: { selfSabotageChance: { type: 'number', required: true }, successMessage: { type: 'string' }, selfSabotageMessage: { type: 'string' } },
        targets: ['target', 'self'],
    },
    [EFFECT_TYPES.TRAIT_TOGGLE]: {
        description: "Toggles a boolean trait on a character.",
        params: { traitName: { type: 'string', required: true }, value: { type: 'boolean', required: true } },
        targets: ['target', 'self'],
    },
    [EFFECT_TYPES.APPLY_CURBSTOMP_RULE]: {
        description: "Applies a specific curbstomp rule by ID.",
        params: { ruleId: { type: 'string', required: true }, message: { type: 'string' } },
        targets: ['global'],
    }
    // ... add definitions for other EFFECT_TYPES here
};

/**
 * Status Effects definitions (e.g., Poison, Burn, Bleed).
 * Each status effect can have its own properties, duration, and application logic.
 */
export const STATUS_EFFECTS = {
    // Example:
    // POISONED: {
    //     id: 'poisoned',
    //     name: 'Poisoned',
    //     description: 'Takes damage over time.',
    //     duration: { type: 'number' }, // Turns or continuous
    //     tickDamage: { type: 'number' },
    //     // ... other properties
    // }
}; 