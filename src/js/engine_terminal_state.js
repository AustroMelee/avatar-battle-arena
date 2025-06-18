/**
 * @fileoverview Avatar Battle Arena - Terminal State Evaluation Engine
 * @description Evaluates battle termination conditions and determines winners/losers
 * @version 2.0.0
 */

'use strict';

//# sourceURL=engine_terminal_state.js

// ============================================================================
// TYPE IMPORTS
// ============================================================================

/**
 * @typedef {import('./types.js').Fighter} Fighter
 * @typedef {import('./types.js').BattleState} BattleState
 * @typedef {import('./types.js').TerminalEvaluation} TerminalEvaluation
 */

/**
 * @typedef {Object} TerminalStateResult
 * @description Result of terminal state evaluation
 * @property {boolean} battleOver - Whether the battle has ended
 * @property {string | null} winnerId - ID of the winning fighter, null if draw
 * @property {string | null} loserId - ID of the losing fighter, null if draw
 * @property {boolean} isStalemate - Whether the battle ended in stalemate
 * @property {string} reason - Reason for battle termination
 * @property {Object} metadata - Additional termination metadata
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { MAX_TOTAL_TURNS } from './config_game.js';
import { charactersMarkedForDefeat } from './engine_curbstomp_manager.js';

// ============================================================================
// CONSTANTS
// ============================================================================

/** @type {number} */
const KNOCKOUT_HP_THRESHOLD = 0;

/** @type {string[]} */
const TERMINAL_REASONS = [
    'HP_KNOCKOUT',
    'EXPLICIT_DEFEAT_MARKER',
    'MAX_TURNS_REACHED',
    'DOUBLE_KNOCKOUT'
];

// ============================================================================
// CORE TERMINAL STATE EVALUATION
// ============================================================================

/**
 * Evaluates the current state of the battle to determine if it has ended
 * and, if so, who the winner and loser are, or if it's a stalemate
 * 
 * @param {Fighter} fighter1 - The state object of the first fighter
 * @param {Fighter} fighter2 - The state object of the second fighter
 * @param {boolean} isStalemateFlag - A flag indicating if a stalemate condition was explicitly met
 * 
 * @returns {TerminalStateResult} An object containing battle termination information
 * 
 * @throws {TypeError} When fighters are invalid
 * @throws {TypeError} When isStalemateFlag is not a boolean
 * 
 * @example
 * // Evaluate if battle should end
 * const result = evaluateTerminalState(fighter1, fighter2, false);
 * if (result.battleOver) {
 *   console.log(`Battle ended: ${result.winnerId || 'Draw'}`);
 * }
 * 
 * @since 2.0.0
 * @public
 */
export function evaluateTerminalState(fighter1, fighter2, isStalemateFlag) {
    // Input validation
    if (!fighter1 || typeof fighter1 !== 'object') {
        throw new TypeError('evaluateTerminalState: fighter1 must be a valid fighter object');
    }
    
    if (!fighter2 || typeof fighter2 !== 'object') {
        throw new TypeError('evaluateTerminalState: fighter2 must be a valid fighter object');
    }
    
    if (typeof isStalemateFlag !== 'boolean') {
        throw new TypeError('evaluateTerminalState: isStalemateFlag must be a boolean');
    }

    // Validate fighter structure
    validateFighterForTerminalEvaluation(fighter1, 'fighter1');
    validateFighterForTerminalEvaluation(fighter2, 'fighter2');

    /** @type {boolean} */
    let battleOver = false;
    /** @type {string | null} */
    let winnerId = null;
    /** @type {string | null} */
    let loserId = null;
    /** @type {boolean} */
    let isStalemate = isStalemateFlag;
    /** @type {string} */
    let reason = 'BATTLE_ONGOING';
    /** @type {Object} */
    const metadata = {
        fighter1HP: fighter1.hp || 0,
        fighter2HP: fighter2.hp || 0,
        fighter1Turn: fighter1.currentTurn || 0,
        fighter2Turn: fighter2.currentTurn || 0,
        evaluationTime: new Date().toISOString()
    };

    // Check for KO by HP
    /** @type {boolean} */
    const fighter1KO = (fighter1.hp || 0) <= KNOCKOUT_HP_THRESHOLD;
    /** @type {boolean} */
    const fighter2KO = (fighter2.hp || 0) <= KNOCKOUT_HP_THRESHOLD;

    if (fighter1KO && fighter2KO) {
        battleOver = true;
        isStalemate = true;
        reason = 'DOUBLE_KNOCKOUT';
        metadata.terminationDetails = 'Both fighters knocked out simultaneously';
    } else if (fighter1KO) {
        battleOver = true;
        winnerId = fighter2.id;
        loserId = fighter1.id;
        reason = 'HP_KNOCKOUT';
        metadata.terminationDetails = `${fighter1.name || fighter1.id} knocked out`;
    } else if (fighter2KO) {
        battleOver = true;
        winnerId = fighter1.id;
        loserId = fighter2.id;
        reason = 'HP_KNOCKOUT';
        metadata.terminationDetails = `${fighter2.name || fighter2.id} knocked out`;
    }

    // Check for explicit defeat markers (e.g., from Curbstomp mechanics)
    if (!battleOver && charactersMarkedForDefeat.has(fighter1.id)) {
        battleOver = true;
        winnerId = fighter2.id;
        loserId = fighter1.id;
        reason = 'EXPLICIT_DEFEAT_MARKER';
        metadata.terminationDetails = `${fighter1.name || fighter1.id} marked for defeat`;
    } else if (!battleOver && charactersMarkedForDefeat.has(fighter2.id)) {
        battleOver = true;
        winnerId = fighter1.id;
        loserId = fighter2.id;
        reason = 'EXPLICIT_DEFEAT_MARKER';
        metadata.terminationDetails = `${fighter2.name || fighter2.id} marked for defeat`;
    }

    // Check for max turns reached (stalemate)
    /** @type {number} */
    const maxTurns = Number(fighter1.currentTurn || 0);
    /** @type {number} */
    const maxTurns2 = Number(fighter2.currentTurn || 0);
    
    if (!battleOver && (maxTurns >= MAX_TOTAL_TURNS || maxTurns2 >= MAX_TOTAL_TURNS)) {
        battleOver = true;
        isStalemate = true;
        reason = 'MAX_TURNS_REACHED';
        metadata.terminationDetails = `Maximum turns (${MAX_TOTAL_TURNS}) reached`;
    }

    /** @type {TerminalStateResult} */
    const result = {
        battleOver,
        winnerId,
        loserId,
        isStalemate,
        reason,
        metadata
    };

    // Log terminal state evaluation if battle has ended
    if (battleOver) {
        console.log('[Terminal State] Battle ended:', {
            winner: winnerId || 'Draw',
            reason,
            turns: Math.max(maxTurns, maxTurns2)
        });
    }

    return result;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validates fighter object for terminal state evaluation
 * 
 * @param {Fighter} fighter - Fighter to validate
 * @param {string} fighterName - Name for error messages
 * 
 * @returns {void}
 * 
 * @throws {TypeError} When fighter structure is invalid
 * 
 * @private
 * @since 2.0.0
 */
function validateFighterForTerminalEvaluation(fighter, fighterName) {
    if (!fighter.id || typeof fighter.id !== 'string') {
        throw new TypeError(`validateFighterForTerminalEvaluation: ${fighterName}.id must be a non-empty string`);
    }

    if (typeof fighter.hp !== 'undefined' && typeof fighter.hp !== 'number') {
        throw new TypeError(`validateFighterForTerminalEvaluation: ${fighterName}.hp must be a number or undefined`);
    }

    if (typeof fighter.currentTurn !== 'undefined' && typeof fighter.currentTurn !== 'number') {
        throw new TypeError(`validateFighterForTerminalEvaluation: ${fighterName}.currentTurn must be a number or undefined`);
    }
} 