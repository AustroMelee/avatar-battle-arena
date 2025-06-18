/**
 * @fileoverview Development Log Formatter
 * @description Log formatting utilities for development mode
 * @version 1.0
 */

'use strict';

import { characters } from './data_characters.js';
import { locations } from './locations.js';

/**
 * Formats a single battle result into a human-readable string for dev logs.
 * @param {object} result - The battle result object from simulateBattle.
 * @param {string} fighter1Id - The ID of fighter 1.
 * @param {string} fighter2Id - The ID of fighter 2.
 * @param {string} locationId - The ID of the location.
 * @param {string} timeOfDay - Time of day for the battle.
 * @returns {string} Formatted battle log string.
 */
export function formatSingleBattleLog(result, fighter1Id, fighter2Id, locationId, timeOfDay) {
    const f1Name = characters[fighter1Id]?.name || fighter1Id;
    const f2Name = characters[fighter2Id]?.name || fighter2Id;
    const locName = locations[locationId]?.name || locationId;
    let logOutput = `\n===== MATCHUP: ${f1Name} vs ${f2Name} @ ${locName} (${timeOfDay}) =====\n`;
    
    if (result.error) {
        logOutput += `STATUS: ERROR - ${result.error}\n`;
        logOutput += `Error Details: ${result.errorMessage || 'No specific error message.'}\n`;
    } else {
        logOutput += `STATUS: ${result.isDraw ? 'DRAW' : `${characters[result.winnerId]?.name || result.winnerId} WINS`}\n`;
        logOutput += `Winner ID: ${result.winnerId || 'N/A'}\n`;
        logOutput += `Loser ID: ${result.loserId || 'N/A'}\n\n`;
        logOutput += `--- FINAL STATES ---\n`;
        const f1Final = result.finalState.fighter1;
        const f2Final = result.finalState.fighter2;

        logOutput += `${f1Name} (F1):\n`;
        logOutput += `  HP: ${f1Final.hp.toFixed(0)} | Energy: ${f1Final.energy.toFixed(0)} | Momentum: ${isNaN(f1Final.momentum) ? 'N/A' : f1Final.momentum} | Mental: ${f1Final.mentalState.level} | Escalation: ${f1Final.escalationState} | Incapacitation Score: ${f1Final.incapacitationScore.toFixed(1)}\n`;
        logOutput += `  Summary: "${f1Final.summary}"\n`;

        logOutput += `${f2Name} (F2):\n`;
        logOutput += `  HP: ${f2Final.hp.toFixed(0)} | Energy: ${f2Final.energy.toFixed(0)} | Momentum: ${isNaN(f2Final.momentum) ? 'N/A' : f2Final.momentum} | Mental: ${f2Final.mentalState.level} | Escalation: ${f2Final.escalationState} | Incapacitation Score: ${f2Final.incapacitationScore.toFixed(1)}\n`;
        logOutput += `  Summary: "${f2Final.summary}"\n`;

        logOutput += `Environment Damage: ${result.environmentState.damageLevel.toFixed(0)}%\n`;
        if (result.environmentState.specificImpacts && result.environmentState.specificImpacts.size > 0) {
            logOutput += `  Specific Impacts: ${Array.from(result.environmentState.specificImpacts).join('; ')}\n`;
        }

        logOutput += `\n--- AI LOGS ---\n`;
        logOutput += `--- ${f1Name} AI Log ---\n`;
        logOutput += formatAiLogForOutput(f1Final.aiLog);
        logOutput += `--- ${f2Name} AI Log ---\n`;
        logOutput += formatAiLogForOutput(f2Final.aiLog);
    }
    logOutput += `\n=======================================================\n`;
    return logOutput;
}

/**
 * Formats AI log entries into a string, truncating very long entries.
 * @param {Array} aiLog - The AI log array for a single character.
 * @returns {string} Formatted AI log string.
 */
export function formatAiLogForOutput(aiLog) {
    if (!aiLog || aiLog.length === 0) return " (No AI log entries)\n";
    return aiLog.map(entry => {
        if (typeof entry === 'object' && entry !== null) {
            let parts = [];
            if (entry.turn !== undefined) parts.push(`${entry.characterName || 'Unknown'}-T${entry.turn}`);
            if (entry.phase) parts.push(`Phase:${entry.phase}`);
            if (entry.intent) parts.push(`Intent:${entry.intent}`);
            if (entry.chosenMove) parts.push(`Move:${entry.chosenMove}`);
            if (entry.finalProb) parts.push(`Prob:${entry.finalProb}`);
            if (entry.actorState) {
                const as = entry.actorState;
                parts.push(`HP:${as.hp?.toFixed(0)} E:${as.energy?.toFixed(0)} M:${isNaN(as.momentum) ? 'N/A' : as.momentum}`);
                if (as.previousMental && as.mental !== as.previousMental) {
                    parts.push(`MS:${as.previousMental.toUpperCase()}->${as.mental.toUpperCase()} 🔔`);
                } else {
                    parts.push(`MS:${as.mental.toUpperCase()}`);
                }
                parts.push(`ES:${as.escalation}`);
            }
            if (entry.opponentEscalation) {
                parts.push(`OppES:${entry.opponentEscalation}`);
            }
            if (entry.prediction) {
                parts.push(`Pred:${entry.prediction}`);
            }
            if (entry.consideredMoves && Array.isArray(entry.consideredMoves)) {
                const topConsiderations = entry.consideredMoves.slice(0, 3).map(m => `${m.name}(${m.prob})`).join(', ');
                if (topConsiderations) parts.push(`Considered:[${topConsiderations}]`);
            }
            if (entry.reasons) {
                parts.push(`Reasons:[${entry.reasons}]`);
            }
            if (entry.isEscalationFinisherAttempt) {
                parts.push(`[FINISHER ATTEMPT!]`);
            }
            // Highlight Critical Hits or other significant effectiveness
            if (entry.effectiveness && (entry.effectiveness === 'Critical' || entry.effectiveness === 'Strong')) {
                parts.push(`[${entry.effectiveness.toUpperCase()}]`);
            }
            return `- ${parts.join(' | ')}`;
        }
        return `- ${String(entry)}`; // For plain string log entries
    }).join('\n') + '\n';
}

/**
 * Compiles multiple battle logs into a single formatted string
 * @param {Array} battleLogs - Array of formatted battle log strings
 * @returns {string} Combined log output
 */
export function compileBattleLogs(battleLogs) {
    return battleLogs.join('');
} 