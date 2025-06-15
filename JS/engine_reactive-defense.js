// FILE: engine_reactive-defense.js
'use strict';

// Version 1.2: Implemented full redirection success/failure logic with detailed return object.

// --- UPDATED IMPORT ---
import { effectivenessLevels } from './data_narrative_effectiveness.js'; // Corrected import path
// --- END UPDATED IMPORT ---
import { attemptLightningRedirection } from './engine_lightning-redirection.js';

/**
 * Checks for and attempts to execute any relevant reactive defenses for the defender.
 * This function acts as a global interception layer before a move's effects are fully resolved.
 * @param {object} attacker - The character performing the action.
 * @param {object} defender - The character being targeted.
 * @param {object} move - The move object being used by the attacker.
 * @param {object} battleState - The current state of the battle (for context, optional).
 * @param {Array} interactionLog - The battle's interaction log array.
 * @returns {object} An object indicating if a reaction occurred and its outcome.
 *                   Example: { reacted: true, type: 'lightning_redirection', success: true, stunApplied: true, damageMitigation: 1.0, narrativeEvents: [] }
 *                   Example: { reacted: false }
 */
export function checkReactiveDefense(attacker, defender, move, battleState = {}, interactionLog = []) {
    // Ensure essential objects and properties exist
    if (!attacker || !defender || !move || !move.moveTags || !Array.isArray(move.moveTags)) {
        console.error("[Reactive Defense Check]: Invalid attacker, defender, or move object provided.");
        return { reacted: false };
    }

    // Lightning Redirection Check
    if (move.moveTags.includes("lightning_attack") &&
        defender.specialTraits?.canRedirectLightning &&
        (attacker.id === 'azula' || attacker.id === 'ozai-not-comet-enhanced')) { // Specific to Zuko vs Azula/Ozai

        const redirectionResult = attemptLightningRedirection(attacker, defender, move, battleState, interactionLog);
        // redirectionResult will be like:
        // { success: true, stunAppliedToAttacker: 1, damageMitigation: 1.0, momentumChangeDefender: 3, momentumChangeAttacker: -2, narrativeEvents: [...] }
        // or { success: false, damageMitigation: 0.4 (partial), narrativeEvents: [...] }

        if (redirectionResult.attempted) { // Check if an attempt was made, successful or not
            return {
                reacted: true,
                type: 'lightning_redirection',
                ...redirectionResult // Spread all properties from attemptLightningRedirection
            };
        }
    }

    // Future reactive abilities can be checked here:
    // else if (move.moveTags.includes("some_other_trigger_tag") && defender.specialTraits?.canDoOtherReaction) {
    //     const otherReactionResult = attemptOtherReaction(attacker, defender, move, battleState, interactionLog);
    //     if (otherReactionResult.attempted) {
    //         return { reacted: true, type: 'other_reaction', ...otherReactionResult };
    //     }
    // }

    // If no reactive defense was triggered or applicable
    return { reacted: false };
}