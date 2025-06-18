/**
 * @fileoverview Analyzes the winner of a battle.
 */

"use strict";

/**
 * @typedef {import('../../types/battle.js').Fighter} Fighter
 * @typedef {import('../../types/battle.js').BattleResult} BattleResult
 * @typedef {import('../../types/analysis.js').WinnerAnalysis} WinnerAnalysis
 */

const MIN_HEALTH = 0;
const INCAPACITATION_THRESHOLD = 100;

/**
 * Analyzes the battle winner and victory conditions.
 * @param {Fighter} fighter1
 * @param {Fighter} fighter2
 * @param {string | null} winnerId
 * @param {boolean} isDraw
 * @param {BattleResult} battleResult
 * @returns {WinnerAnalysis}
 */
export function analyzeBattleWinner(fighter1, fighter2, winnerId, isDraw, battleResult) {
    if (!fighter1 || !fighter1.id || !fighter2 || !fighter2.id) {
        throw new TypeError("analyzeBattleWinner: fighter1 and fighter2 must be valid fighter objects");
    }

    const loserId = isDraw ? null : (winnerId === fighter1.id ? fighter2.id : fighter1.id);
    const winCondition = determineWinCondition(fighter1, fighter2, winnerId, isDraw, battleResult);
    const marginOfVictory = calculateMarginOfVictory(fighter1, fighter2, winnerId, isDraw);
    const description = generateWinnerDescription(winnerId, loserId, isDraw, winCondition, marginOfVictory);

    return {
        winnerId,
        loserId,
        isDraw,
        winCondition,
        marginOfVictory,
        description,
    };
}

function determineWinCondition(fighter1, fighter2, winnerId, isDraw, battleResult) {
    if (isDraw) {
        return battleResult.turnCount >= (battleResult.metadata?.maxTurns || 100) ? "timeout" : "stalemate";
    }
    const loser = winnerId === fighter1.id ? fighter2 : fighter1;
    if (loser.incapacitationScore >= INCAPACITATION_THRESHOLD || loser.hp <= MIN_HEALTH || loser.escalationState === "Terminal Collapse") {
        return "incapacitation";
    }
    return "technical";
}

function calculateMarginOfVictory(fighter1, fighter2, winnerId, isDraw) {
    if (isDraw || !winnerId) {
        return undefined;
    }
    const winner = winnerId === fighter1.id ? fighter1 : fighter2;
    const loser = winnerId === fighter1.id ? fighter2 : fighter1;
    const winnerScore = (winner.hp || 0) + (winner.energy || 0) / 2;
    const loserScore = (loser.hp || 0) + (loser.energy || 0) / 2;
    const totalScore = winnerScore + loserScore;
    if (totalScore === 0) {
        return 0.5;
    }
    return Math.max(0, Math.min(1, winnerScore / totalScore - 0.5) * 2);
}

function generateWinnerDescription(winnerId, loserId, isDraw, winCondition, marginOfVictory) {
    if (isDraw) {
        return winCondition === "timeout" ? "Battle ended in a draw due to timeout" : "Battle ended in a stalemate";
    }
    let description = `${winnerId} defeated ${loserId} by ${winCondition}`;
    if (marginOfVictory !== undefined) {
        if (marginOfVictory > 0.8) description += " (decisive victory)";
        else if (marginOfVictory > 0.6) description += " (clear victory)";
        else if (marginOfVictory > 0.4) description += " (narrow victory)";
        else description += " (close victory)";
    }
    return description;
} 