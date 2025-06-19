/**
 * @fileoverview Analyzes the battle result to produce a detailed analysis.
 */

"use strict";

import { validateBattleResultStructure } from "./analysis/validation.js";
import { analyzeWinner } from "./analysis/winner.js";
import { analyzeFighterPerformance } from "./analysis/fighter.js";
import { analyzeEnvironmentalImpact } from "./analysis/environment.js";
import { createBattleSummary } from "./analysis/summary.js";

/**
 * @typedef {import('../types/battle.js').BattleResult} BattleResult
 * @typedef {import('../types/ui_analysis.js').BattleAnalysisResult} BattleAnalysisResult
 */

/**
 * Analyzes the battle result to produce a detailed analysis.
 * @param {BattleResult} battleResult
 * @returns {BattleAnalysisResult}
 */
export function analyzeBattle(battleResult) {
    if (!battleResult || !battleResult.fighter1 || !battleResult.fighter2) {
        return null;
    }
    
    const summary = createBattleSummary(battleResult, battleResult.fighter1, battleResult.fighter2);
    const fighter1Stats = analyzeFighterPerformance(battleResult.fighter1);
    const fighter2Stats = analyzeFighterPerformance(battleResult.fighter2);
    const environment = analyzeEnvironmentalImpact(battleResult.environmentState, battleResult.locationId);
    const winnerAnalysis = analyzeWinner(battleResult, battleResult.winnerId === battleResult.fighter1.id ? battleResult.fighter1 : battleResult.fighter2);

    return {
        summary,
        fighter1Stats,
        fighter2Stats,
        environment,
        winnerAnalysis,
    };
} 