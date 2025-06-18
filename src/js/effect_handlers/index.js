/**
 * @fileoverview Effect Handlers - Main Export
 * @description Central export and handler map for the modular effect system.
 * @version 2.0
 */

"use strict";

// Import core modules
import { createEffectContext } from "./context.js";
import { handleStatChange } from "./statChangeConfig.js";

// Import handler modules
import * as statHandlers from "./statHandlers.js";
import * as modifierHandlers from "./modifierHandlers.js";
import * as outcomeHandlers from "./outcomeHandlers.js";
import * as narrativeHandlers from "./narrativeHandlers.js";
import { handleCompositeEffect } from "./compositeHandler.js";

// Import testing utilities
import { testEffectHandler, runAllEffectHandlerTests, runEffectTestSuite } from "./test.js";

// Import effect type definitions
import { EFFECT_TYPES } from "../data_mechanics_definitions.js";

/**
 * Map of effect types to their corresponding handler functions.
 * Uses Map for better performance and dynamic registration capabilities.
 */
export const effectHandlers = new Map([
    // Stat-based handlers
    [EFFECT_TYPES.DAMAGE, statHandlers.handleDamage],
    [EFFECT_TYPES.HEAL, statHandlers.handleHeal],
    [EFFECT_TYPES.ENERGY_CHANGE, statHandlers.handleEnergyChange],
    [EFFECT_TYPES.STUN, statHandlers.handleStun],
    [EFFECT_TYPES.MOMENTUM_CHANGE, statHandlers.handleMomentumChange],
    [EFFECT_TYPES.ENVIRONMENTAL_DAMAGE, statHandlers.handleEnvironmentalDamage],
    
    // All modifier effects use the same handler
    [EFFECT_TYPES.EVASION_MODIFIER, modifierHandlers.handleModifier],
    [EFFECT_TYPES.DAMAGE_MODIFIER, modifierHandlers.handleModifier],
    [EFFECT_TYPES.DEFENSE_MODIFIER, modifierHandlers.handleModifier],
    [EFFECT_TYPES.ACCURACY_MODIFIER, modifierHandlers.handleModifier],
    [EFFECT_TYPES.STUN_RESISTANCE_MODIFIER, modifierHandlers.handleModifier],
    [EFFECT_TYPES.MANIPULATION_RESISTANCE_MODIFIER, modifierHandlers.handleModifier],
    [EFFECT_TYPES.SPEED_MODIFIER, modifierHandlers.handleModifier],
    
    // Outcome-based effects
    [EFFECT_TYPES.INSTANT_KO, outcomeHandlers.handleInstantKo],
    [EFFECT_TYPES.CONDITIONAL_KO_OR_MERCY, outcomeHandlers.handleConditionalKoOrMercy],
    [EFFECT_TYPES.CONDITIONAL_KO_OR_SELF_SABOTAGE, outcomeHandlers.handleConditionalKoOrSelfSabotage],
    [EFFECT_TYPES.TRAIT_TOGGLE, outcomeHandlers.handleTraitToggle],
    [EFFECT_TYPES.APPLY_CURBSTOMP_RULE, outcomeHandlers.handleApplyCurbstompRule],
    
    // Narrative and AI effects
    [EFFECT_TYPES.TRIGGER_NARRATIVE_EVENT, narrativeHandlers.handleTriggerNarrativeEvent],
    [EFFECT_TYPES.ADJUST_AI_PROFILE, narrativeHandlers.handleAdjustAiProfile],
    [EFFECT_TYPES.NARRATIVE_ONLY, narrativeHandlers.handleNarrativeOnly],
    
    // Special handlers
    ["COMPOSITE_EFFECT", (ctx) => handleCompositeEffect(ctx, effectHandlers)],
    ["STAT_CHANGE", handleStatChange], // Generic stat change handler
]);

/**
 * Registers a new effect handler dynamically.
 * @param {string} effectType - The effect type identifier
 * @param {function} handler - The handler function
 * @throws {Error} If handler is not a function
 */
export function registerEffectHandler(effectType, handler) {
    if (typeof handler !== "function") {
        throw new Error("Handler must be a function");
    }
    effectHandlers.set(effectType, handler);
    console.log(`[Effect Handlers] Registered handler for effect type: ${effectType}`);
}

/**
 * Unregisters an effect handler.
 * @param {string} effectType - The effect type identifier
 * @returns {boolean} True if the handler was found and removed, false otherwise
 */
export function unregisterEffectHandler(effectType) {
    const success = effectHandlers.delete(effectType);
    if (success) {
        console.log(`[Effect Handlers] Unregistered handler for effect type: ${effectType}`);
    }
    return success;
}

/**
 * Gets all registered effect types.
 * @returns {Array} Array of registered effect type strings
 */
export function getRegisteredEffectTypes() {
    return Array.from(effectHandlers.keys());
}

/**
 * Checks if a handler is registered for the given effect type.
 * @param {string} effectType - The effect type to check
 * @returns {boolean} True if handler is registered, false otherwise
 */
export function hasEffectHandler(effectType) {
    return effectHandlers.has(effectType);
}

/**
 * Gets the handler function for a specific effect type.
 * @param {string} effectType - The effect type
 * @returns {function|undefined} The handler function or undefined if not found
 */
export function getEffectHandler(effectType) {
    return effectHandlers.get(effectType);
}

/**
 * Bulk registers multiple effect handlers.
 * @param {object} handlers - Object mapping effect types to handler functions
 */
export function registerEffectHandlers(handlers) {
    Object.entries(handlers).forEach(([effectType, handler]) => {
        registerEffectHandler(effectType, handler);
    });
}

// Export context creator and testing utilities
export { createEffectContext };
export { testEffectHandler, runAllEffectHandlerTests, runEffectTestSuite };

// Export handler modules for direct access if needed
export { statHandlers, modifierHandlers, outcomeHandlers, narrativeHandlers };

// Export config for external customization
export { statChangeConfig } from "./statChangeConfig.js"; 