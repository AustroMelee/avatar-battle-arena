/**
 * @fileoverview Main entry point for the Battle Results Analysis module.
 * @description Orchestrates the different components of the battle analysis.
 */

"use strict";

import { validateBattleResultStructure } from "./analysis/validation.js";
import { analyzeBattleWinner } from "./analysis/winner.js";
import { analyzeFighterStatus } from "./analysis/fighter.js";
import { analyzeEnvironmentalImpact } from "./analysis/environment.js";
import { generateBattleSummary } from "./analysis/summary.js";

/**
 * @typedef {import('../types.js').BattleResult} BattleResult
 * @typedef {import('../types/analysis.js').BattleAnalysisResult} BattleAnalysisResult
 */

/**
 * Analyzes battle results and returns structured data.
 * @param {BattleResult} battleResult - The raw battle result data.
 * @param {Object} [options={}] - The analysis options.
 * @returns {BattleAnalysisResult} The analyzed battle data.
 */
export function analyzeBattleResults(battleResult, options = {}) {
    try {
        validateBattleResultStructure(battleResult);

        const { finalState, winnerId, isDraw, locationId } = battleResult;
        const { fighter1, fighter2, environment } = finalState;

        const winnerAnalysis = analyzeBattleWinner(fighter1, fighter2, winnerId, isDraw, battleResult);
        const fighterAnalysis = {
            fighter1: analyzeFighterStatus(fighter1, winnerId, isDraw, battleResult),
            fighter2: analyzeFighterStatus(fighter2, winnerId, isDraw, battleResult),
        };
        const environmentAnalysis = analyzeEnvironmentalImpact(environment, locationId);
        const battleSummary = generateBattleSummary(fighter1, fighter2, winnerId, isDraw, battleResult);

        return {
            isValid: true,
            winner: winnerAnalysis,
            fighters: fighterAnalysis,
            environment: environmentAnalysis,
            summary: battleSummary,
            metadata: {
                analysisTimestamp: new Date().toISOString(),
                analysisVersion: "2.0.0",
                optionsUsed: { ...options },
                battleId: battleResult.metadata?.battleId || "unknown",
            },
        };
    } catch (/** @type {any} */ error) {
        console.error("[Battle Analysis] Analysis failed:", error);
        return {
            isValid: false,
            error: `Analysis failed: ${error.message}`,
            metadata: {
                analysisTimestamp: new Date().toISOString(),
                failureReason: error.message,
            },
        };
    }
} 