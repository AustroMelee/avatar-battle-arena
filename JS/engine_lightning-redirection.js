// FILE: engine_lightning-redirection.js
'use strict';

import { effectivenessLevels } from './narrative-v2.js'; // For potential narrative flavor
import { formatQuoteEvent } from './engine_narrative-engine.js'; // For generating narrative events

// --- LIGHTNING REDIRECTION CONSTANTS --- (Copied from engine_move-resolution, should be centralized if used elsewhere)
const LIGHTNING_REDIRECTION_BASE_SUCCESS_CHANCE = 0.80;
const LIGHTNING_REDIRECTION_HP_THRESHOLD_LOW = 30;
const LIGHTNING_REDIRECTION_HP_THRESHOLD_MID = 60;
const LIGHTNING_REDIRECTION_MENTAL_STATE_PENALTY = {
    stressed: 0.05,
    shaken: 0.15,
    broken: 0.30
};
const LIGHTNING_REDIRECTION_MIN_SUCCESS_CHANCE = 0.10;

/**
 * Attempts lightning redirection for a defender (Zuko).
 * @param {object} attacker - The character using the lightning attack (Azula or Ozai).
 * @param {object} defender - The character attempting redirection (Zuko).
 * @param {object} move - The lightning move object.
 * @param {object} battleState - Current battle state for context.
 * @param {Array} interactionLog - The battle's interaction log.
 * @returns {object} An object detailing the outcome of the redirection attempt.
 *          Properties:
 *          - attempted (boolean): Always true if this function is called.
 *          - success (boolean): True if redirection was successful, false otherwise.
 *          - damageMitigation (number): Multiplier for damage taken by defender (1.0 for full mitigation, 0.4 for partial on fail).
 *          - stunAppliedToAttacker (number): Turns the attacker is stunned (0 if redirection fails).
 *          - momentumChangeDefender (number): Momentum change for the defender.
 *          - momentumChangeAttacker (number): Momentum change for the attacker.
 *          - narrativeEvents (Array<object>): Array of narrative event objects.
 *          - effectivenessLabel (string): Custom label for narrative.
 *          - effectivenessEmoji (string): Custom emoji for narrative.
 */
export function attemptLightningRedirection(attacker, defender, move, battleState, interactionLog) {
    const narrativeEvents = [];
    let logMessage = `[REDIRECTION ATTEMPT]: ${defender.name} attempts to redirect ${attacker.name}'s ${move.name}. `;
    defender.aiLog.push(`[Reactive Action]: Attempting Lightning Redirection against ${attacker.name}'s ${move.name}.`);
    attacker.aiLog.push(`[Opponent Reaction]: ${defender.name} is attempting Lightning Redirection!`);


    let successChance = LIGHTNING_REDIRECTION_BASE_SUCCESS_CHANCE;

    // Apply HP penalties
    if (defender.hp < LIGHTNING_REDIRECTION_HP_THRESHOLD_LOW) {
        successChance -= 0.30;
        logMessage += `HP critically low (-0.30). `;
    } else if (defender.hp < LIGHTNING_REDIRECTION_HP_THRESHOLD_MID) {
        successChance -= 0.15;
        logMessage += `HP low (-0.15). `;
    }

    // Apply mental state penalties
    const mentalState = defender.mentalState?.level || 'stable';
    const mentalPenalty = LIGHTNING_REDIRECTION_MENTAL_STATE_PENALTY[mentalState] || 0;
    if (mentalPenalty > 0) {
        successChance -= mentalPenalty;
        logMessage += `Mental state '${mentalState}' (-${mentalPenalty.toFixed(2)}). `;
    }

    successChance = Math.max(LIGHTNING_REDIRECTION_MIN_SUCCESS_CHANCE, successChance);
    logMessage += `Final Chance: ${successChance.toFixed(2)}.`;
    interactionLog.push(logMessage); // Log detailed chance calculation
    defender.aiLog.push(logMessage);


    if (Math.random() < successChance) {
        // Successful Redirection
        interactionLog.push(`[REDIRECTION SUCCESS]: ${defender.name} successfully redirects the lightning!`);
        defender.aiLog.push(`[Redirection Result]: SUCCESS!`);
        attacker.aiLog.push(`[Redirection Result]: Lightning successfully redirected by ${defender.name}!`);

        // Narrative for successful redirection
        narrativeEvents.push(formatQuoteEvent(
            { type: 'action', line: `${defender.name} skillfully catches ${attacker.name}'s lightning, channeling its immense power!` },
            defender,
            attacker
        ));
        narrativeEvents.push(formatQuoteEvent(
            { type: 'action', line: `With a defiant roar, ${defender.name} unleashes the redirected energy back at a stunned ${attacker.name}!` },
            defender,
            attacker
        ));

        return {
            attempted: true,
            success: true,
            damageMitigation: 1.0, // Full damage mitigation for defender
            stunAppliedToAttacker: 1, // Attacker stunned for 1 turn
            momentumChangeDefender: 3,
            momentumChangeAttacker: -2,
            narrativeEvents,
            effectivenessLabel: "RedirectedSuccess",
            effectivenessEmoji: "⚡↩️"
        };
    } else {
        // Failed Redirection
        interactionLog.push(`[REDIRECTION FAIL]: ${defender.name} fails to fully redirect the lightning.`);
        defender.aiLog.push(`[Redirection Result]: FAILED!`);
        attacker.aiLog.push(`[Redirection Result]: ${defender.name} failed to redirect the lightning!`);


        // Narrative for failed redirection
        narrativeEvents.push(formatQuoteEvent(
            { type: 'action', line: `${defender.name} attempts to intercept the lightning, but its power is overwhelming!` },
            defender,
            attacker
        ));
        narrativeEvents.push(formatQuoteEvent(
            { type: 'action', line: `Though some energy is deflected, ${defender.name} is struck by the fierce attack, staggering from the blow!` },
            defender,
            attacker
        ));

        return {
            attempted: true,
            success: false,
            damageMitigation: 0.4, // Defender takes 60% of the damage (1.0 - 0.4 mitigation)
            stunAppliedToAttacker: 0,
            momentumChangeDefender: -1,
            momentumChangeAttacker: 1, // Attacker gains some momentum as their attack partially lands
            narrativeEvents,
            effectivenessLabel: "RedirectedFail",
            effectivenessEmoji: "⚡🤕"
        };
    }
}