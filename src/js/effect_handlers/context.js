/**
 * @fileoverview Effect Context Creator
 * @description Unified context object creator for all effect handlers.
 * @version 1.0
 */

"use strict";

import { generateLogEvent } from "../utils_log_event.js";
import { generateStatusChangeEvent } from "../engine_narrative-engine.js";

/**
 * Creates a unified context object for all effect handlers.
 * @param {object} effect - The effect being applied
 * @param {object} actor - The character applying the effect
 * @param {object} target - The target character
 * @param {object} primaryTarget - The resolved primary target
 * @param {object} battleState - Current battle state
 * @param {object} oldValues - Captured old values for comparison
 * @param {Array} generatedEvents - Array to collect generated events
 * @returns {object} Unified context object
 */
export function createEffectContext(effect, actor, target, primaryTarget, battleState, oldValues, generatedEvents) {
    return {
        effect,
        actor,
        target,
        primaryTarget,
        battleState,
        oldValues,
        generatedEvents,
        // Centralized logging/error handling
        log: (message, level = "info") => {
            console[level](`[Effect Handler] ${message}`);
        },
        addEvent: (eventData) => {
            generatedEvents.push(generateLogEvent(battleState, eventData));
        },
        addStatusEvent: (eventType, oldValue, newValue, statName) => {
            const statusEvent = generateStatusChangeEvent(battleState, primaryTarget, eventType, oldValue, newValue, statName);
            if (statusEvent) generatedEvents.push(statusEvent);
        }
    };
}

/**
 * Creates a mock context for testing effect handlers.
 * @param {string} effectType - The effect type to test
 * @param {object} customEffect - Custom effect data for testing
 * @returns {object} Mock context object
 */
export function createMockContext(effectType, customEffect = {}) {
    const mockCharacter = {
        id: "test-character",
        name: "Test Character",
        hp: 50,
        energy: 50,
        momentum: 0,
        stunDuration: 0,
        activeModifiers: [],
        personalityProfile: { aggression: 0.5, caution: 0.5 }
    };
    
    const mockBattleState = {
        turn: 1,
        environmentState: { damageLevel: 0 },
        locationConditions: {}
    };
    
    const mockEffect = {
        type: effectType,
        value: 10,
        duration: 1,
        ...customEffect
    };
    
    return createEffectContext(
        mockEffect,
        { ...mockCharacter, id: "actor" },
        { ...mockCharacter, id: "target" },
        { ...mockCharacter, id: "primary-target" },
        mockBattleState,
        { oldHp: 50, oldEnergy: 50, oldMomentum: 0 },
        []
    );
} 