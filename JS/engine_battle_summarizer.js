// FILE: js/engine_battle_summarizer.js
'use strict';

// This module is responsible for generating the final summary and conclusion
// events for the battle log after the main simulation loop has ended.

import { phaseTemplates } from './data_narrative_phases.js';
import { getFinalVictoryLine, substituteTokens } from './engine_narrative-engine.js';
import { charactersMarkedForDefeat } from './engine_curbstomp_manager.js';
import { MAX_TOTAL_TURNS } from './config_game.js';

/**
 * Generates the final summary events and text for the battle result object.
 * This function MUTATES the battleResult object by adding to its log and setting fighter summaries.
 * @param {object} battleResult - The main battle result object to be modified.
 * @param {object} fighter1 - The final state of fighter 1.
 * @param {object} fighter2 - The final state of fighter 2.
 * @param {number} turnCount - The total number of turns the battle lasted.
 */
export function generateFinalSummary(battleResult, fighter1, fighter2, turnCount) {
    const { winnerId, loserId, isStalemate } = battleResult;

    const finalWinnerFull = winnerId ? (fighter1.id === winnerId ? fighter1 : fighter2) : null;
    const finalLoserFull = loserId ? (fighter1.id === loserId ? fighter1 : fighter2) : null;

    if (isStalemate) {
        battleResult.log.push({
            type: 'stalemate_result_event',
            text: "The battle ends in a STALEMATE!",
            html_content: phaseTemplates.stalemateResult
        });
        fighter1.summary = "The battle reached an impasse, with neither fighter able to secure victory.";
        fighter2.summary = "The battle reached an impasse, with neither fighter able to secure victory.";
    } else if (finalWinnerFull && finalLoserFull) {
        const isKOByHp = finalLoserFull.hp <= 0;
        const isTimeoutVictory = turnCount >= MAX_TOTAL_TURNS && !isKOByHp;
        const lastCurbstompEvent = battleResult.log.slice().reverse().find(e => e.type === 'curbstomp_event' && !e.isEscape && e.isMajorEvent);

        if (lastCurbstompEvent && charactersMarkedForDefeat.has(finalLoserFull.id) && lastCurbstompEvent.actualAttackerId === finalWinnerFull.id) {
            finalWinnerFull.summary = lastCurbstompEvent.text;
            finalLoserFull.summary = `${finalLoserFull.name} was overcome by ${finalWinnerFull.name}'s decisive action.`;
        } else if (isKOByHp) {
            const finalBlowTextRaw = `${finalWinnerFull.name} lands the finishing blow, defeating ${finalLoserFull.name}!`;
            const finalBlowTextHtml = phaseTemplates.finalBlow
                .replace(/{winnerName}/g, `<span class="char-${finalWinnerFull.id}">${finalWinnerFull.name}</span>`)
                .replace(/{loserName}/g, `<span class="char-${finalLoserFull.id}">${finalLoserFull.name}</span>`);
            battleResult.log.push({
                type: 'final_blow_event',
                text: finalBlowTextRaw,
                html_content: finalBlowTextHtml,
                isKOAction: true
            });
            finalWinnerFull.summary = finalBlowTextRaw;
            finalLoserFull.summary = `${finalLoserFull.name} was defeated by a final blow from ${finalWinnerFull.name}.`;
        } else if (isTimeoutVictory) {
            const timeoutTextRaw = `The battle timer expires! With more health remaining, ${finalWinnerFull.name} is declared the victor over ${finalLoserFull.name}!`;
            const timeoutTextHtml = phaseTemplates.timeOutVictory
                .replace(/{winnerName}/g, `<span class="char-${finalWinnerFull.id}">${finalWinnerFull.name}</span>`)
                .replace(/{loserName}/g, `<span class="char-${finalLoserFull.id}">${finalLoserFull.name}</span>`);
            battleResult.log.push({
                type: 'timeout_victory_event',
                text: timeoutTextRaw,
                html_content: timeoutTextHtml
            });
            finalWinnerFull.summary = timeoutTextRaw;
            finalLoserFull.summary = `${finalLoserFull.name} lost by timeout as ${finalWinnerFull.name} had more health remaining.`;
        } else {
            finalWinnerFull.summary = `${finalWinnerFull.name}'s victory was sealed by their superior strategy and power.`;
            finalLoserFull.summary = `${finalLoserFull.name} fought bravely but was ultimately overcome.`;
        }
    } else {
        const defaultSummary = "The battle ended in an unexpected state.";
        if (fighter1) fighter1.summary = defaultSummary;
        if (fighter2) fighter2.summary = defaultSummary;
    }

    // Add conclusion event
    if (!isStalemate && finalWinnerFull && finalLoserFull) {
        const finalWords = getFinalVictoryLine(finalWinnerFull, finalLoserFull);
        const conclusionContext = { WinnerName: finalWinnerFull.name, LoserName: finalLoserFull.name };
        const conclusionTextRaw = substituteTokens(`${finalWinnerFull.name} stands victorious. ${finalWords}`, finalWinnerFull, finalLoserFull, conclusionContext);
        const conclusionTextHtml = phaseTemplates.conclusion.replace('{endingNarration}', conclusionTextRaw);
        battleResult.log.push({
            type: 'conclusion_event',
            text: conclusionTextRaw,
            html_content: conclusionTextHtml
        });
    } else if (isStalemate) {
        const conclusionTextRaw = "The battle concludes. Neither could claim outright victory.";
        battleResult.log.push({
            type: 'conclusion_event',
            text: conclusionTextRaw,
            html_content: phaseTemplates.conclusion.replace('{endingNarration}', conclusionTextRaw)
        });
    }
}