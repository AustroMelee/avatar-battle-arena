'use strict';

import { MAX_TOTAL_TURNS } from './config_game.js';
import { charactersMarkedForDefeat } from './engine_curbstomp_manager.js';

/**
 * Evaluates the current state of the battle to determine if it has ended
 * and, if so, who the winner and loser are, or if it's a stalemate.
 * @param {object} fighter1 - The state object of the first fighter.
 * @param {object} fighter2 - The state object of the second fighter.
 * @param {boolean} isStalemateFlag - A flag indicating if a stalemate condition was explicitly met.
 * @returns {object} An object containing battleOver (boolean), winnerId (string|null), loserId (string|null), and isStalemate (boolean).
 */
export function evaluateTerminalState(fighter1, fighter2, isStalemateFlag) {
    let battleOver = false;
    let winnerId = null;
    let loserId = null;
    let isStalemate = isStalemateFlag;

    // Check for KO by HP
    if (fighter1.hp <= 0 && fighter2.hp <= 0) {
        battleOver = true;
        isStalemate = true; // Both knocked out, it's a stalemate
    } else if (fighter1.hp <= 0) {
        battleOver = true;
        winnerId = fighter2.id;
        loserId = fighter1.id;
    } else if (fighter2.hp <= 0) {
        battleOver = true;
        winnerId = fighter1.id;
        loserId = fighter2.id;
    }

    // Check for explicit defeat markers (e.g., from Curbstomp mechanics)
    if (charactersMarkedForDefeat.has(fighter1.id)) {
        battleOver = true;
        winnerId = fighter2.id;
        loserId = fighter1.id;
    } else if (charactersMarkedForDefeat.has(fighter2.id)) {
        battleOver = true;
        winnerId = fighter1.id;
        loserId = fighter2.id;
    }

    // Check for max turns reached (stalemate)
    if (!battleOver && (fighter1.currentTurn >= MAX_TOTAL_TURNS || fighter2.currentTurn >= MAX_TOTAL_TURNS)) {
        battleOver = true;
        isStalemate = true; // No clear winner by HP, max turns reached.
    }

    return {
        battleOver,
        winnerId,
        loserId,
        isStalemate
    };
} 