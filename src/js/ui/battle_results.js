/**
 * @fileoverview Battle Results Display Module
 * @description Orchestrates the analysis and rendering of battle results.
 * This is the single source of truth for displaying the post-battle screen.
 * @version 1.0
 */

"use strict";

import { analyzeBattleWinner } from './analysis/winner.js';
import { analyzeFighterStatus } from './analysis/fighter.js';
import { analyzeEnvironmentalImpact } from './analysis/environment.js';
import { renderBattleAnalysis, renderEnvironmentImpact, renderBattleLogContent } from './battle_results_renderer.js';
import { transformEventsToHtmlLog } from '../battle_log_transformer.js';

/**
 * Orchestrates the full process of analyzing and rendering battle results.
 * @param {import('../types/battle.js').BattleResult} battleResult - The raw result from the battle engine.
 */
export function displayCompleteBattleResults(battleResult) {
    const { finalState, winnerId, log } = battleResult;
    const { fighter1, fighter2, environment, locationId } = finalState;
    const isDraw = !winnerId;

    // 1. Analyze
    const winnerAnalysis = analyzeBattleWinner(fighter1, fighter2, winnerId, isDraw, battleResult);
    const fighter1Analysis = analyzeFighterStatus(fighter1, winnerId, isDraw, battleResult);
    const fighter2Analysis = analyzeFighterStatus(fighter2, winnerId, isDraw, battleResult);
    const environmentAnalysis = analyzeEnvironmentalImpact(environment, locationId);

    const battleAnalysis = {
        isValid: true,
        error: null,
        winner: winnerAnalysis,
        fighters: { fighter1: fighter1Analysis, fighter2: fighter2Analysis },
    };

    // 2. Render
    const analysisTarget = /** @type {HTMLElement | null} */ (document.querySelector('#battle-analysis-content'));
    const envDamageTarget = /** @type {HTMLElement | null} */ (document.querySelector('#environment-damage-value'));
    const envImpactsTarget = /** @type {HTMLElement | null} */ (document.querySelector('#environment-impacts-list'));
    const logTarget = document.querySelector('#battle-log-content');

    if (analysisTarget) {
        renderBattleAnalysis(battleAnalysis, analysisTarget);
    }
    if (envDamageTarget && envImpactsTarget) {
        renderEnvironmentImpact(environmentAnalysis, envDamageTarget, envImpactsTarget);
    }
    // Process the raw event log into a formatted HTML string.
    if (logTarget && log) {
        const formattedHtmlLog = transformEventsToHtmlLog(log);
        logTarget.innerHTML = renderBattleLogContent(formattedHtmlLog);
    }
}

/**
 * Resets all UI elements related to the battle results display.
 */
export function resetCompleteBattleResults() {
    const analysisTarget = document.querySelector('#battle-analysis-content');
    if (analysisTarget) analysisTarget.innerHTML = '';
    
    const impactsTarget = document.querySelector('#environment-impacts-list');
    if (impactsTarget) impactsTarget.innerHTML = '';

    const logTarget = document.querySelector('#battle-log-content');
    if (logTarget) logTarget.innerHTML = '';

    const envDamageTarget = /** @type {HTMLElement | null} */ (document.querySelector('#environment-damage-value'));
    if (envDamageTarget) {
        envDamageTarget.textContent = '0%';
        envDamageTarget.className = 'environmental-damage-level';
    }
} 