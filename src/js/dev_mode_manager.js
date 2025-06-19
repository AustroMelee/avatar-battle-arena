/**
 * @fileoverview Development Mode Manager (Compatibility Layer)
 * @description Compatibility layer that re-exports focused development modules
 * 
 * This module maintains backward compatibility while delegating to focused modules:
 * - Batch simulation execution (dev_batch_simulator.js)
 * - Log formatting utilities (dev_log_formatter.js)
 * - Progress UI management (dev_progress_ui.js)
 * 
 * @version 2.0.0 - Refactored to modular architecture
 * @author Battle Arena Development Team
 * @since 1.0.0
 */

"use strict";

// Import from focused modules
import { runBatchSimulation, getDefaultMatchups } from "./dev_batch_simulator.js";
import { formatSingleBattleLog, formatAiLogForOutput, compileBattleLogs } from "./dev_log_formatter.js";
import { createProgressBar, createDetailedProgress } from "./dev_progress_ui.js";
// import { copyToClipboard } from "./utils_clipboard.js";

// Re-export all functions for backward compatibility
export { runBatchSimulation, getDefaultMatchups } from "./dev_batch_simulator.js";
export { formatSingleBattleLog, formatAiLogForOutput, compileBattleLogs } from "./dev_log_formatter.js";
export { createProgressBar, createDetailedProgress } from "./dev_progress_ui.js";

// Legacy constants and state management
const DEV_MODE_ENABLED = window.location.search.includes("dev=true");
let devModeCompiledLogs = [];

/**
 * Legacy function - runs the dev mode batch simulation with UI integration
 * @deprecated Use runBatchSimulation directly for better control
 */
export async function runDevModeBatch() {
    if (!DEV_MODE_ENABLED) {
        alert("Dev Mode is not enabled. Add ?dev=true to the URL to enable.");
        return;
    }

    console.log("--- Starting Dev Mode Batch Simulation ---");
    devModeCompiledLogs = [];
    
    const progressBar = createProgressBar("Starting simulation...");
    
    try {
        const results = await runBatchSimulation(
            getDefaultMatchups(),
            (completed, errors, total) => {
                progressBar.updateProgress(completed, errors, total);
            },
            (result, matchup) => {
                const logEntry = formatSingleBattleLog(result, matchup.fighter1, matchup.fighter2, matchup.location, matchup.timeOfDay);
                devModeCompiledLogs.push(logEntry);
            }
        );
        
        const finalCompiledLog = compileBattleLogs(devModeCompiledLogs);
        console.log("--- Dev Mode Batch Simulation Complete ---");
        console.log("--- Compiled Logs (also copied to clipboard): ---");
        console.log(finalCompiledLog);
        
        // const copySuccess = await copyToClipboard(finalCompiledLog);
        // if (copySuccess) {
        //     alert(`✔ Batch Complete: ${results.completed} simulations processed. ${results.errors} errors. Logs copied to clipboard.`);
        // } else {
        //     alert(`⚠ Batch Complete: ${results.completed} simulations processed. ${results.errors} errors. Failed to copy logs to clipboard.`);
        // }
        alert(`✔ Batch Complete: ${results.completed} simulations processed. ${results.errors} errors.`);
    } catch (error) {
        console.error("Dev Mode Batch Error:", error);
        alert(`❌ Batch failed: ${error.message}`);
    } finally {
        progressBar.remove();
        devModeCompiledLogs = [];
    }
}

/**
 * Legacy function - initializes dev mode UI
 * @deprecated Handle UI initialization directly
 */
export function initializeDevModeUI() {
    const devModeButton = document.getElementById("runDevModeBatchBtn");
    if (devModeButton) {
        if (DEV_MODE_ENABLED) {
            devModeButton.style.display = "inline-block";
            devModeButton.onclick = runDevModeBatch;
        } else {
            devModeButton.style.display = "none";
        }
    }
} 