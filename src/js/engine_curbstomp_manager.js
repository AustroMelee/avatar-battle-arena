/**
 * @fileoverview Avatar Battle Arena - Curbstomp Manager (Compatibility Layer)
 * @description Compatibility layer importing from modular curbstomp system. 
 * This manager coordinates the specialized modules while maintaining the original API.
 * @version 2.0 - Refactored to use modular system
 */

"use strict";

// Import from the new modular curbstomp system
import { 
    resetCurbstompState,
    applyCurbstompRules,
    checkCurbstompConditions,
    charactersMarkedForDefeat,
    markCharacterForDefeat,
    isCharacterMarkedForDefeat,
    CurbstompNarrative
} from "./curbstomp/index.js";

// Re-export the main API for backward compatibility
export { 
    resetCurbstompState,
    applyCurbstompRules, 
    checkCurbstompConditions,
    charactersMarkedForDefeat 
};

/**
 * Enhanced curbstomp detection with narrative generation
 * @param {Object} attacker - The attacking character state object
 * @param {Object} defender - The defending character state object  
 * @param {string} locId - Location identifier for context
 * @param {Object} battleState - Current battle state
 * @param {Array} battleEventLog - Battle event log for recording curbstomp events
 * @returns {boolean} True if curbstomp conditions are met and battle should end
 */
export function checkCurbstompConditionsWithNarrative(attacker, defender, locId, battleState, battleEventLog) {
    const result = checkCurbstompConditions(attacker, defender, locId, battleState);
    
    if (result.detected) {
        // Generate comprehensive curbstomp narrative
        const curbstompEvent = CurbstompNarrative.generateCurbstompDetectionNarrative(
            battleState, 
            attacker, 
            defender, 
            result.metrics
        );
        
        battleEventLog.push(curbstompEvent);
        
        // Add AI log entry
        CurbstompNarrative.addCurbstompAiLog(attacker, "Overwhelming", { id: "curbstomp_detection" }, {
            attackerName: attacker.name,
            hpRatio: result.metrics.hpRatio,
            momentumGap: result.metrics.momentumGap
        });
        
        return true;
    }
    
    return false;
}

/**
 * Convenience function to check if any character is marked for defeat
 * @returns {boolean} True if any character is marked for defeat
 */
export function hasMarkedCharacters() {
    return charactersMarkedForDefeat.size > 0;
}

/**
 * Gets all characters currently marked for defeat
 * @returns {Array<string>} Array of character IDs marked for defeat
 */
export function getMarkedCharactersList() {
    return Array.from(charactersMarkedForDefeat);
}

/**
 * Advanced curbstomp rule application with enhanced logging
 * @param {Object} fighter1 - First fighter state
 * @param {Object} fighter2 - Second fighter state  
 * @param {Object} battleState - Current battle state
 * @param {Array} battleEventLog - Event log for narrative output
 * @param {boolean} isPreBattle - Whether this is pre-battle evaluation
 * @param {Object} options - Additional options for rule application
 * @returns {Object} Detailed results of rule application
 */
export function applyCurbstompRulesAdvanced(fighter1, fighter2, battleState, battleEventLog, isPreBattle = false, options = {}) {
    const startTime = performance.now();
    const initialMarkedCount = charactersMarkedForDefeat.size;
    
    console.log(`[Curbstomp Manager] Advanced rule application - Turn: ${battleState.turn}, Pre-battle: ${isPreBattle}`);
    
    // Apply rules using the modular system
    const events = applyCurbstompRules(fighter1, fighter2, battleState, battleEventLog, isPreBattle);
    
    const endTime = performance.now();
    const newMarkedCount = charactersMarkedForDefeat.size;
    
    const results = {
        eventsGenerated: events.length,
        processingTime: endTime - startTime,
        charactersMarkedBefore: initialMarkedCount,
        charactersMarkedAfter: newMarkedCount,
        newlyMarked: newMarkedCount - initialMarkedCount,
        battlePhase: battleState.currentPhase || "unknown",
        turn: battleState.turn
    };
    
    if (options.verbose) {
        console.log("[Curbstomp Manager] Rule application complete:", results);
    }
    
    return results;
}

// For debugging and testing purposes
export const CurbstompSystemModules = {
    State: () => import("./curbstomp/curbstomp_state.js"),
    RuleRegistry: () => import("./curbstomp/curbstomp_rule_registry.js"),
    RuleEngine: () => import("./curbstomp/curbstomp_rule_engine.js"),
    VictimSelector: () => import("./curbstomp/curbstomp_victim_selector.js"),
    Narrative: () => import("./curbstomp/curbstomp_narrative.js")
};