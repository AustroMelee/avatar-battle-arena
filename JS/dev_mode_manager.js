// FILE: dev_mode_manager.js
'use strict';
// This module manages the Dev Mode batch simulation functionality.
// It is intended for development/testing purposes only and should not be
// included in production builds.

import { simulateBattle } from './engine_battle-engine-core.js';
import { devModeMatchups } from './data_dev_mode_matchups.js';
import { copyToClipboard } from './utils_clipboard.js';
import { characters } from './data_characters.js';
import { locations } from './locations.js';

// Define a constant to control Dev Mode compilation/execution
// In a real build process, this would be set by environment variables (e.g., Webpack DefinePlugin).
// For this exercise, we'll assume it's controlled manually or via URL param for demonstration.
const DEV_MODE_ENABLED = window.location.search.includes('dev=true');
const MAX_LOG_LENGTH = 1000000; // Cap compiled log size to prevent browser/clipboard issues

// Container for all battle results in Dev Mode
let devModeCompiledLogs = [];

/**
 * Formats a single battle result into a human-readable string for dev logs.
 * @param {object} result - The battle result object from simulateBattle.
 * @param {string} fighter1Id - The ID of fighter 1.
 * @param {string} fighter2Id - The ID of fighter 2.
 * @param {string} locationId - The ID of the location.
 * @param {string} timeOfDay - Time of day for the battle.
 * @returns {string} Formatted battle log string.
 */
function formatSingleBattleLog(result, fighter1Id, fighter2Id, locationId, timeOfDay) {
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
        logOutput += `  HP: ${f1Final.hp.toFixed(0)} | Energy: ${f1Final.energy.toFixed(0)} | Momentum: ${f1Final.momentum} | Mental: ${f1Final.mentalState.level} | Escalation: ${f1Final.escalationState} | Incapacitation Score: ${f1Final.incapacitationScore.toFixed(1)}\n`;
        logOutput += `  Summary: "${f1Final.summary}"\n`;

        logOutput += `${f2Name} (F2):\n`;
        logOutput += `  HP: ${f2Final.hp.toFixed(0)} | Energy: ${f2Final.energy.toFixed(0)} | Momentum: ${f2Final.momentum} | Mental: ${f2Final.mentalState.level} | Escalation: ${f2Final.escalationState} | Incapacitation Score: ${f2Final.incapacitationScore.toFixed(1)}\n`;
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
function formatAiLogForOutput(aiLog) {
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
                parts.push(`HP:${as.hp?.toFixed(0)} E:${as.energy?.toFixed(0)} M:${as.momentum}`);
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
 * Runs the batch of simulations defined in devModeMatchups.
 * Compiles all logs and copies them to the clipboard.
 */
export async function runDevModeBatch() {
    if (!DEV_MODE_ENABLED) {
        alert("Dev Mode is not enabled. Add ?dev=true to the URL to enable.");
        return;
    }
    console.log("--- Starting Dev Mode Batch Simulation ---");
    devModeCompiledLogs = [];
    let completedCount = 0;
    let errorCount = 0;
    const totalMatches = devModeMatchups.length;

    // Show a basic progress indicator (optional, could be more elaborate UI)
    const progressBar = document.createElement('div');
    progressBar.style.position = 'fixed';
    progressBar.style.bottom = '20px';
    progressBar.style.right = '20px';
    progressBar.style.backgroundColor = 'rgba(0,0,0,0.8)';
    progressBar.style.color = 'white';
    progressBar.style.padding = '10px';
    progressBar.style.borderRadius = '5px';
    progressBar.style.zIndex = '1000';
    document.body.appendChild(progressBar);

    for (const matchup of devModeMatchups) {
        let result;
        try {
            result = simulateBattle(
                matchup.fighter1,
                matchup.fighter2,
                matchup.location,
                matchup.timeOfDay,
                true // Always run emotional mode in dev batch for consistency
            );
            devModeCompiledLogs.push(formatSingleBattleLog(result, matchup.fighter1, matchup.fighter2, matchup.location, matchup.timeOfDay));
            completedCount++;
        } catch (error) {
            console.error(`Dev Mode Error: Failed to simulate matchup ${matchup.fighter1} vs ${matchup.fighter2} at ${matchup.location}:`, error);
            result = { error: true, errorMessage: error.message, fighter1: matchup.fighter1, fighter2: matchup.fighter2, location: matchup.location, timeOfDay: matchup.timeOfDay };
            devModeCompiledLogs.push(formatSingleBattleLog(result, matchup.fighter1, matchup.fighter2, matchup.location, matchup.timeOfDay));
            errorCount++;
        }
        // Update progress bar
        progressBar.textContent = `Simulating: ${completedCount + errorCount}/${totalMatches} (Errors: ${errorCount})`;

        // Prevent building excessively large strings in memory if log grows too big
        if (devModeCompiledLogs.join('').length > MAX_LOG_LENGTH) {
            console.warn(`Dev Mode: Compiled logs exceeded ${MAX_LOG_LENGTH} characters. Truncating further logs.`);
            devModeCompiledLogs.push(`\n--- LOG TRUNCATED DUE TO SIZE LIMIT (${MAX_LOG_LENGTH} CHARS) ---\n`);
            break; // Stop processing further matchups
        }

        // Yield to the event loop occasionally to keep browser responsive
        await new Promise(resolve => setTimeout(resolve, 0));
    }
    const finalCompiledLog = devModeCompiledLogs.join('');
    console.log("--- Dev Mode Batch Simulation Complete ---");
    console.log("--- Compiled Logs (also copied to clipboard): ---");
    console.log(finalCompiledLog);
    document.body.removeChild(progressBar); // Remove progress bar
    const copySuccess = await copyToClipboard(finalCompiledLog);
    if (copySuccess) {
        alert(`✔ Batch Complete: ${completedCount} simulations processed. ${errorCount} errors. Logs copied to clipboard.`);
    } else {
        alert(`⚠ Batch Complete: ${completedCount} simulations processed. ${errorCount} errors. Failed to copy logs to clipboard.`);
    }
    // Clean up internal state if needed
    devModeCompiledLogs = [];
}

/**
 * Initializes the Dev Mode UI elements based on DEV_MODE_ENABLED.
 */
export function initializeDevModeUI() {
    const devModeButton = document.getElementById('runDevModeBatchBtn');
    if (devModeButton) {
        if (DEV_MODE_ENABLED) {
            devModeButton.style.display = 'block'; // Make button visible
            devModeButton.addEventListener('click', runDevModeBatch);
            console.log("Dev Mode UI Initialized. Batch button visible.");
        } else {
            devModeButton.style.display = 'none'; // Ensure hidden in production-like environments
            console.log("Dev Mode is disabled.");
        }
    } else {
        console.warn("Dev Mode batch button (runDevModeBatchBtn) not found in DOM.");
    }
}
