/**
 * @fileoverview Curbstomp Victim Selector
 * @description Handles only the "who gets curbstomped?" logic with weighting, randomness, and fallback selection
 * @version 1.0
 */

"use strict";

import { USE_DETERMINISTIC_RANDOM } from "../config_game.js";
import { seededRandom } from "../utils_seeded_random.js";

/**
 * Selects a victim for a curbstomp rule based on its weighting logic
 * @param {Object} options - Selection parameters
 * @param {Object} options.attacker - Attacking character state
 * @param {Object} options.defender - Defending character state  
 * @param {Object} options.rule - Curbstomp rule being applied
 * @param {Object} options.locationData - Location data for context
 * @param {Object} options.battleState - Current battle state
 * @param {Function} options.logCallback - Callback for logging dice rolls
 * @returns {string|null} The ID of the victim, or null if no victim selected
 */
export function selectCurbstompVictim({ attacker, defender, rule, locationData, battleState, logCallback }) {
    // Handle function-based weighting logic
    if (typeof rule.weightingLogic === "function") {
        const weightedOutcome = rule.weightingLogic({ 
            attacker, 
            defender, 
            rule, 
            location: locationData, 
            situation: { 
                ...battleState, 
                environmentState: battleState.environmentState || { damageLevel: 0 } 
            } 
        });

        return handleWeightedOutcome(weightedOutcome, attacker, defender, rule, logCallback);
    }

    // Handle rule-based victim selection
    return handleRuleBasedSelection(attacker, defender, rule, logCallback);
}

/**
 * Handles weighted outcome from weighting logic function
 * @private
 */
function handleWeightedOutcome(weightedOutcome, attacker, defender, rule, logCallback) {
    // Direct victim ID return
    if (typeof weightedOutcome === "string") {
        return weightedOutcome;
    }
    
    // Probability-based selection
    if (weightedOutcome && typeof weightedOutcome.victimId === "string" && typeof weightedOutcome.probability === "number") {
        return handleProbabilitySelection(weightedOutcome, attacker, rule, logCallback);
    }
    
    // Distribution-based selection
    if (weightedOutcome && typeof weightedOutcome.probabilities === "object") {
        return handleDistributionSelection(weightedOutcome, attacker, defender, rule, logCallback);
    }

    return null;
}

/**
 * Handles probability-based victim selection
 * @private
 */
function handleProbabilitySelection(weightedOutcome, attacker, rule, logCallback) {
    const probabilityRoll = USE_DETERMINISTIC_RANDOM ? seededRandom() : Math.random();
    const didTrigger = probabilityRoll < weightedOutcome.probability;

    if (logCallback) {
        logCallback({
            type: "dice_roll",
            rollType: "curbstompVictimProbability",
            actorId: attacker.id,
            result: probabilityRoll,
            threshold: weightedOutcome.probability,
            outcome: didTrigger ? "triggered" : "not triggered",
            ruleId: rule.id
        });
    }

    return didTrigger ? weightedOutcome.victimId : null;
}

/**
 * Handles distribution-based victim selection
 * @private
 */
function handleDistributionSelection(weightedOutcome, attacker, defender, rule, logCallback) {
    const rand = USE_DETERMINISTIC_RANDOM ? seededRandom() : Math.random();
    let cumulativeProb = 0;

    // Log the initial dice roll
    const diceRollEvent = {
        type: "dice_roll",
        rollType: "curbstompVictimDistribution",
        actorId: attacker.id,
        result: rand,
        details: weightedOutcome.probabilities,
        outcome: "",
        ruleId: rule.id
    };

    if (logCallback) {
        logCallback(diceRollEvent);
    }

    // Select victim based on cumulative probability
    for (const charId in weightedOutcome.probabilities) {
        cumulativeProb += weightedOutcome.probabilities[charId];
        if (rand < cumulativeProb) {
            diceRollEvent.outcome = `selected ${charId}`;
            return charId;
        }
    }

    // Fallback selection if no match found
    const fallbackVictim = (USE_DETERMINISTIC_RANDOM ? seededRandom() : Math.random()) < 0.5 ? attacker.id : defender.id;
    diceRollEvent.outcome = `fallback selected ${fallbackVictim}`;
    return fallbackVictim;
}

/**
 * Handles rule-based victim selection (non-function logic)
 * @private
 */
function handleRuleBasedSelection(attacker, defender, rule, logCallback) {
    // Weighted or random character selection
    if (rule.outcome?.type?.includes("loss_weighted_character") || rule.outcome?.type?.includes("loss_random_character")) {
        return selectRandomVictim(attacker, defender, rule, logCallback);
    }
    
    // Specific character selection
    if (rule.appliesToCharacter && 
        (rule.outcome?.type?.includes("loss_weighted_character") || rule.outcome?.type?.includes("instant_death_character"))) {
        return rule.appliesToCharacter;
    }
    
    return null;
}

/**
 * Selects a random victim between attacker and defender
 * @private
 */
function selectRandomVictim(attacker, defender, rule, logCallback) {
    const fallbackRoll = USE_DETERMINISTIC_RANDOM ? seededRandom() : Math.random();
    const selectedFighter = fallbackRoll < 0.5 ? attacker.id : defender.id;

    if (logCallback) {
        logCallback({
            type: "dice_roll",
            rollType: "curbstompFallbackVictim",
            actorId: attacker.id,
            result: fallbackRoll,
            threshold: 0.5,
            outcome: `selected ${selectedFighter}`,
            ruleId: rule.id
        });
    }

    return selectedFighter;
}

/**
 * Calculates selection weights for characters based on various factors
 * @param {Object} attacker - Attacking character
 * @param {Object} defender - Defending character
 * @param {Object} battleState - Current battle state
 * @returns {Object} Weight distribution between characters
 */
export function calculateSelectionWeights(attacker, defender, battleState) {
    const weights = {};
    
    // Base weights
    weights[attacker.id] = 0.5;
    weights[defender.id] = 0.5;
    
    // Adjust based on HP differential
    const totalHp = attacker.hp + defender.hp;
    if (totalHp > 0) {
        const attackerHpRatio = attacker.hp / totalHp;
        const defenderHpRatio = defender.hp / totalHp;
        
        // Lower HP = higher chance of being victim
        weights[attacker.id] = 1 - attackerHpRatio;
        weights[defender.id] = 1 - defenderHpRatio;
    }
    
    // Adjust based on momentum
    const attackerMomentum = Number(attacker.momentum || 0);
    const defenderMomentum = Number(defender.momentum || 0);
    
    if (attackerMomentum < 0) weights[attacker.id] += 0.2;
    if (defenderMomentum < 0) weights[defender.id] += 0.2;
    
    // Normalize weights
    const totalWeight = weights[attacker.id] + weights[defender.id];
    if (totalWeight > 0) {
        weights[attacker.id] /= totalWeight;
        weights[defender.id] /= totalWeight;
    }
    
    return weights;
}

/**
 * Checks if a character survives a potentially fatal outcome (miracle survival)
 * @param {Object} character - Character to check
 * @param {Object} rule - Rule being applied
 * @param {number} survivalChance - Chance of miraculous survival (default 0.15)
 * @returns {boolean} True if character miraculously survives
 */
export function checkMiraculousSurvival(character, rule, survivalChance = 0.15) {
    if (!rule.outcome?.type?.includes("instant_") && !rule.outcome?.type?.includes("environmental_kill")) {
        return false;
    }
    
    const survivalRoll = USE_DETERMINISTIC_RANDOM ? seededRandom() : Math.random();
    return survivalRoll < survivalChance;
} 