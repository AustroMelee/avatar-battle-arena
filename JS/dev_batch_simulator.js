/**
 * @fileoverview Development Batch Simulator
 * @description Pure simulation execution logic for development mode
 * @version 1.0
 */

'use strict';

import { simulateBattle } from './engine_battle-engine-core.js';
import { devModeMatchups } from './data_dev_mode_matchups.js';

const MAX_LOG_LENGTH = 1000000; // Cap compiled log size to prevent browser/clipboard issues

/**
 * Runs a batch of battle simulations
 * @param {Array} matchups - Array of matchup configurations
 * @param {Function} onProgress - Callback for progress updates (completedCount, errorCount, totalMatches)
 * @param {Function} onMatchupComplete - Callback for each completed matchup (result, matchup)
 * @returns {Promise<Object>} Results summary with stats and any errors
 */
export async function runBatchSimulation(matchups = devModeMatchups, onProgress = null, onMatchupComplete = null) {
    const results = {
        completed: 0,
        errors: 0,
        total: matchups.length,
        logs: [],
        errorDetails: []
    };

    for (const matchup of matchups) {
        let result;
        try {
            result = simulateBattle(
                matchup.fighter1,
                matchup.fighter2,
                matchup.location,
                matchup.timeOfDay,
                true // Always run emotional mode in dev batch for consistency
            );
            
            result.matchupConfig = matchup;
            results.completed++;
            
            if (onMatchupComplete) {
                onMatchupComplete(result, matchup);
            }
        } catch (error) {
            console.error(`Batch Simulation Error: Failed to simulate matchup ${matchup.fighter1} vs ${matchup.fighter2} at ${matchup.location}:`, error);
            result = { 
                error: true, 
                errorMessage: error.message,
                matchupConfig: matchup
            };
            results.errors++;
            results.errorDetails.push({
                matchup,
                error: error.message,
                stack: error.stack
            });
            
            if (onMatchupComplete) {
                onMatchupComplete(result, matchup);
            }
        }

        // Update progress
        if (onProgress) {
            onProgress(results.completed, results.errors, results.total);
        }

        // Check for size limits
        if (results.logs.join('').length > MAX_LOG_LENGTH) {
            console.warn(`Batch Simulation: Compiled logs exceeded ${MAX_LOG_LENGTH} characters. Truncating further logs.`);
            results.logs.push(`\n--- LOG TRUNCATED DUE TO SIZE LIMIT (${MAX_LOG_LENGTH} CHARS) ---\n`);
            break;
        }

        // Yield to the event loop occasionally to keep browser responsive
        await new Promise(resolve => setTimeout(resolve, 0));
    }

    return results;
}

/**
 * Gets the default development mode matchups
 * @returns {Array} Array of default matchup configurations
 */
export function getDefaultMatchups() {
    return devModeMatchups;
} 