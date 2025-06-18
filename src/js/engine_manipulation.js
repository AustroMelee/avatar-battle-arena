// FILE: js/engine_manipulation.js
'use strict';

// This module handles the logic for psychological manipulation attempts,
// a special trait for characters like Azula.

import { BATTLE_PHASES } from './engine_battle-phase.js';
import { getRandomElementSeeded, seededRandom } from './utils_seeded_random.js';
import { USE_DETERMINISTIC_RANDOM } from './config_game.js';
import { generateLogEvent } from './utils_log_event.js';
import { safeGet } from './utils_safe_accessor.js';

const MANIPULATION_BASE_CHANCE = 0.4; // Base chance to attempt a manipulation
const MANIPULATION_SUCCESS_MODIFIERS = {
    'stable': 0.5,
    'stressed': 1.0,
    'shaken': 1.5,
    'broken': 0.2
};

/**
 * Determines if a character attempts to manipulate their opponent and if it succeeds.
 * @param {object} manipulator - The character attempting the manipulation.
 * @param {object} target - The character being targeted.
 * @param {object} battleState - The current battle state.
 * @param {Array<object>} battleEventLog - The main event log to push narration to.
 * @returns {object} An object indicating success, the effect, and narration. { success: boolean, effect?: string, narration?: string }
 */
export function attemptManipulation(manipulator, target, battleState, battleEventLog) {
    if (!manipulator || !target || !target.mentalState || !manipulator.pronouns || !target.pronouns) {
        return { success: false };
    }

    const manipTrait = safeGet(manipulator, 'specialTraits.manipulative', 0);
    if (manipTrait === 0) return { success: false };

    const mentalStateLevel = safeGet(target.mentalState, 'level', 'stable');
    const mentalStateModifier = MANIPULATION_SUCCESS_MODIFIERS[mentalStateLevel] || 0.5;
    const resilience = safeGet(target, 'specialTraits.resilientToManipulation', 0);
    const attemptChance = manipTrait * mentalStateModifier * (1 - resilience);

    const manipulationRoll = (USE_DETERMINISTIC_RANDOM ? seededRandom() : Math.random());
    const success = manipulationRoll < attemptChance;

    battleEventLog.push(generateLogEvent(battleState, {
        type: "dice_roll",
        rollType: "manipulationAttempt",
        actorId: manipulator.id,
        result: manipulationRoll,
        threshold: attemptChance,
        outcome: success ? "success" : "failure"
    }));

    if (success) {
        const effect = getRandomElementSeeded(['Exposed', 'Shaken'], USE_DETERMINISTIC_RANDOM);
        const manipulatorName = manipulator.name || 'Manipulator';
        const manipulatorId = manipulator.id || 'unknown-manipulator';
        const targetName = target.name || 'Target';
        const targetId = target.id || 'unknown-target';
        const targetPronounO = target.pronouns.o || 'them';

        const manipulatorSpan = `<span class="char-${manipulatorId}">${manipulatorName}</span>`;
        const targetSpan = `<span class="char-${targetId}">${targetName}</span>`;
        const narration = `<p class="narrative-manipulation">${manipulatorSpan} unleashes a sharp taunt, preying on ${targetSpan}'s insecurities. It hits home, leaving ${targetPronounO} ${effect}!</p>`;
        
        // Log the successful manipulation
        if(manipulator.aiLog) manipulator.aiLog.push(`[Manipulation]: Successfully manipulated ${targetName}, causing '${effect}'.`);
        if(target.aiLog) target.aiLog.push(`[Manipulation]: Was manipulated by ${manipulatorName}, became '${effect}'.`);

        return { success: true, effect, narration };
    }

    return { success: false };
}