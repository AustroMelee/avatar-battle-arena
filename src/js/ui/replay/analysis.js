/**
 * @fileoverview Manages snapshot analysis for the replay UI.
 */

"use strict";

import { replaySystem } from "../../utils_deterministic_replay.js";
import { getReplayState } from "./state.js";
import { showNotification } from "./notifications.js";

/**
 * @typedef {import('../../utils_deterministic_replay.js').BattleSnapshot} BattleSnapshot
 * @typedef {import('../../types/battle.js').BattleState} BattleState
 */

/**
 * Analyzes the currently selected snapshot.
 */
export function analyzeSelectedSnapshot() {
    const { currentReplayId } = getReplayState();
    if (!currentReplayId) {
        showNotification("Please select a snapshot first", "warning");
        return;
    }

    const snapshot = replaySystem.getSnapshotById(currentReplayId); // Assuming this method exists
    if (!snapshot) {
        showNotification("Snapshot not found", "error");
        return;
    }

    const analysis = generateSnapshotAnalysis(snapshot);
    
    const resultsContainer = document.getElementById("analysis-results");
    if (resultsContainer) {
        resultsContainer.innerHTML = `
            <div class="analysis-report">
                <h3>Snapshot Analysis: ${snapshot.id}</h3>
                ${analysis}
            </div>
        `;
    }
}

/**
 * Generates an HTML analysis for a given snapshot.
 * @param {BattleSnapshot} snapshot - The snapshot to analyze.
 * @returns {string} The HTML analysis.
 */
function generateSnapshotAnalysis(snapshot) {
    /** @type {BattleState} */
    const battleState = snapshot.battleState;
    // This would contain more sophisticated analysis logic in a real application.
    return `
        <div class="analysis-section">
            <h4>Battle State</h4>
            <ul>
                <li>Turn: ${snapshot.turn}</li>
                <li>Fighter 1 HP: ${battleState.fighters.f1?.hp || "N/A"}</li>
                <li>Fighter 2 HP: ${battleState.fighters.f2?.hp || "N/A"}</li>
                <li>Current Phase: ${battleState.phaseState?.currentPhase || "N/A"}</li>
            </ul>
        </div>
        <div class="analysis-section">
            <h4>Input History</h4>
            <pre>${JSON.stringify(snapshot.inputLog, null, 2)}</pre>
        </div>
    `;
} 