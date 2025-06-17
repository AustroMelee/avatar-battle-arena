// FILE: engine_lightning-redirection.js
'use strict';

// Version 1.2: Implemented full redirection success/failure logic with detailed return object.

// --- UPDATED IMPORT ---
import { effectivenessLevels } from './data_narrative_effectiveness.js'; // Corrected import path
import { BENDING_ELEMENTS, EFFECT_TYPES } from './data_mechanics_definitions.js';
import { getRandomElementSeeded, seededRandom } from './utils_seeded_random.js'; // NEW: Import for deterministic random
import { USE_DETERMINISTIC_RANDOM } from './config_game.js'; // NEW: Import for config
import { generateLogEvent } from './utils_log_event.js'; // NEW: Import generateLogEvent
// --- END UPDATED IMPORT ---

// --- LIGHTNING REDIRECTION CONSTANTS ---
const LIGHTNING_REDIRECTION_BASE_SUCCESS_CHANCE = 0.75; // Zuko is pretty good
const LIGHTNING_REDIRECTION_HP_THRESHOLD_LOW = 30;
const LIGHTNING_REDIRECTION_HP_THRESHOLD_MID = 60;
const LIGHTNING_REDIRECTION_MENTAL_STATE_PENALTY = {
    stable: 0,       // No penalty for stable
    stressed: 0.10,  // Slight penalty
    shaken: 0.20,    // Moderate penalty
    broken: 0.40     // Significant penalty
};
const LIGHTNING_REDIRECTION_MIN_SUCCESS_CHANCE = 0.05; // Small chance even under worst conditions
const LIGHTNING_REDIRECTION_MAX_SUCCESS_CHANCE = 0.95; // Not always guaranteed

/**
 * Attempts lightning redirection for a defender (Zuko).
 * @param {object} attacker - The character using the lightning attack (Azula or Ozai).
 * @param {object} defender - The character attempting redirection (Zuko).
 * @param {object} move - The lightning move object.
 * @param {object} battleState - Current battle state for context.
 * @param {Array} interactionLog - The battle's interaction log.
 * @param {function} modifyMomentum - The modifyMomentum function from engine_momentum.js. // NEW PARAM
 * @returns {object} An object detailing the outcome of the redirection attempt.
 */
export function attemptLightningRedirection(attacker, defender, move, battleState, interactionLog, modifyMomentum) {
    const narrativeEvents = [];
    let logMessage = `[REDIRECTION ATTEMPT]: ${defender.name} (HP: ${defender.hp}, Mental: ${defender.mentalState?.level}) attempts to redirect ${attacker.name}'s ${move.name}. `;
    
    // Calculate success chance
    let successChance = LIGHTNING_REDIRECTION_BASE_SUCCESS_CHANCE;

    // HP Factor: Reduce chance proportionally if below mid threshold
    if (defender.hp < LIGHTNING_REDIRECTION_HP_THRESHOLD_MID) {
        const hpFactor = Math.max(0, defender.hp - LIGHTNING_REDIRECTION_HP_THRESHOLD_LOW) / (LIGHTNING_REDIRECTION_HP_THRESHOLD_MID - LIGHTNING_REDIRECTION_HP_THRESHOLD_LOW); // 0 to 1 scale for HP between low and mid
        const hpPenalty = (1 - hpFactor) * 0.25; // Max 25% penalty from HP
        successChance -= hpPenalty;
        logMessage += `HP factor penalty (-${hpPenalty.toFixed(2)}). `;
    }
    if (defender.hp < LIGHTNING_REDIRECTION_HP_THRESHOLD_LOW) { // Additional flat penalty for very low HP
        successChance -= 0.15;
        logMessage += `Critically low HP flat penalty (-0.15). `;
    }


    // Mental State Factor
    const mentalState = defender.mentalState?.level || 'stable';
    const mentalPenalty = LIGHTNING_REDIRECTION_MENTAL_STATE_PENALTY[mentalState] || 0;
    if (mentalPenalty > 0) {
        successChance -= mentalPenalty;
        logMessage += `Mental state '${mentalState}' (-${mentalPenalty.toFixed(2)}). `;
    }

    // Clamp chance
    successChance = Math.max(LIGHTNING_REDIRECTION_MIN_SUCCESS_CHANCE, Math.min(LIGHTNING_REDIRECTION_MAX_SUCCESS_CHANCE, successChance));
    
    const roll = (USE_DETERMINISTIC_RANDOM ? seededRandom() : Math.random());
    logMessage += `Final Chance: ${successChance.toFixed(2)}, Roll: ${roll.toFixed(2)}.`;
    
    console.log(`[REDIRECTION ATTEMPT] ${defender.name} vs ${attacker.name}'s ${move.name}. Chance=${(successChance*100).toFixed(1)}% Roll=${(roll*100).toFixed(1)}%`);
    interactionLog.push(logMessage);
    defender.aiLog.push(`[Reactive Action]: Attempting Lightning Redirection against ${attacker.name}'s ${move.name}. ${logMessage}`);
    attacker.aiLog.push(`[Opponent Reaction]: ${defender.name} is attempting Lightning Redirection! Chance: ${successChance.toFixed(2)}, Roll: ${roll.toFixed(2)}.`);

    let momentumChangeDefender = 0;
    let momentumChangeAttacker = 0;

    if (roll < successChance) {
        // Successful Redirection
        console.log(`[REDIRECTION SUCCESS]: ${defender.name} redirected lightning!`);
        interactionLog.push(`[REDIRECTION SUCCESS]: ${defender.name} successfully redirects the lightning!`);
        defender.aiLog.push(`[Redirection Result]: SUCCESS!`);
        attacker.aiLog.push(`[Redirection Result]: Lightning successfully redirected by ${defender.name}!`);

        narrativeEvents.push(
            { quote: { type: 'action', line: `${defender.name} skillfully catches ${attacker.name}'s lightning, channeling its immense power!` }, actor: defender, isMoveExecutionQuote: false }
        );
        narrativeEvents.push(
            { quote: { type: 'action', line: `With a defiant roar, ${defender.name} unleashes the redirected energy back at a stunned ${attacker.name}!` }, actor: defender, isMoveExecutionQuote: false }
        );
        
        momentumChangeDefender = 3;
        momentumChangeAttacker = -2;

        modifyMomentum(defender, momentumChangeDefender, `Successful lightning redirection`);
        modifyMomentum(attacker, momentumChangeAttacker, `Lightning redirected by ${defender.name}`);

        return {
            attempted: true,
            success: true,
            damageMitigation: 1.0, // Full damage mitigation for defender
            stunAppliedToAttacker: 1, // Attacker stunned for 1 turn
            momentumChangeDefender: momentumChangeDefender,
            momentumChangeAttacker: momentumChangeAttacker,
            narrativeEvents,
            effectivenessLabel: effectivenessLevels.REDIRECTED_SUCCESS.label, // Using the label from narrative-v2
            effectivenessEmoji: effectivenessLevels.REDIRECTED_SUCCESS.emoji
        };
    } else {
        // Failed Redirection
        console.log(`[REDIRECTION FAILED]: ${defender.name} fails to fully redirect the lightning.`);
        interactionLog.push(`[REDIRECTION FAIL]: ${defender.name} fails to fully redirect the lightning.`);
        defender.aiLog.push(`[Redirection Result]: FAILED!`);
        attacker.aiLog.push(`[Redirection Result]: ${defender.name} failed to redirect the lightning! Attack proceeds.`);

        narrativeEvents.push(
            { quote: { type: 'action', line: `${defender.name} attempts to intercept the lightning, but its power is overwhelming!` }, actor: defender, isMoveExecutionQuote: false }
        );
        narrativeEvents.push(
            { quote: { type: 'action', line: `Though some energy is deflected, ${defender.name} is struck by the fierce attack, staggering from the blow!` }, actor: defender, isMoveExecutionQuote: false }
        );

        momentumChangeDefender = -1;
        momentumChangeAttacker = 1;

        modifyMomentum(defender, momentumChangeDefender, `Failed lightning redirection`);
        modifyMomentum(attacker, momentumChangeAttacker, `Lightning not redirected by ${defender.name}`);

        return {
            attempted: true,
            success: false,
            damageMitigation: 0.4, // Defender takes 60% of the damage
            stunAppliedToAttacker: 0,
            momentumChangeDefender: momentumChangeDefender,
            momentumChangeAttacker: momentumChangeAttacker,
            narrativeEvents,
            effectivenessLabel: effectivenessLevels.REDIRECTED_FAIL.label, // Using the label from narrative-v2
            effectivenessEmoji: effectivenessLevels.REDIRECTED_FAIL.emoji
        };
    }
}