'use strict';

/**
 * Wrapper to ensure all log events include turnNumber and timestamp.
 * @param {object} battleState - The current battle state, containing turnNumber.
 * @param {object} baseEvent - The event object to extend.
 * @returns {object} The extended event object.
 */
export function generateLogEvent(battleState, baseEvent) {
    return {
        ...baseEvent,
        turnNumber: battleState.turn,
        timestamp: new Date().toISOString()
    };
}

/**
 * Logs a dice roll event to the battle log.
 * @param {object} options - Options for the log entry.
 * @param {Array<object>} options.battleLog - The main battle event log array.
 * @param {string} options.rollType - The type of roll (e.g., "critCheck", "evasionCheck").
 * @param {string} [options.actorId] - The ID of the actor performing the roll, if applicable.
 * @param {number} options.roll - The actual result of the random roll (0.0 to 1.0).
 * @param {number} [options.threshold] - The success threshold for the roll.
 * @param {string} options.outcome - The outcome of the roll (e.g., "success", "fail").
 * @param {object} options.battleState - The current battle state, containing turnNumber.
 * @param {string} [options.moveName] - The name of the move associated with the roll, if applicable.
 * @param {object} [options.details] - Any additional details relevant to the roll.
 */
export function logRoll({ battleLog, rollType, actorId, roll, threshold, outcome, battleState, moveName, details }) {
    battleLog.push(generateLogEvent(battleState, {
        type: "dice_roll",
        rollType,
        actorId,
        result: roll,
        threshold,
        outcome,
        moveName,
        details
    }));
} 