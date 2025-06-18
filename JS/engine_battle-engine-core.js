/**
 * @fileoverview Avatar Battle Arena - Core Battle Engine
 * @description Implements turn-based battle system with state management and move resolution
 * @version 2.0.0
 */

'use strict';

//# sourceURL=engine_battle-engine-core.js

// --- TYPE IMPORTS ---
/**
 * @typedef {import('./types.js').Fighter} Fighter
 * @typedef {import('./types.js').BattleState} BattleState
 * @typedef {import('./types.js').BattleResult} BattleResult
 * @typedef {import('./types.js').BattleEvent} BattleEvent
 * @typedef {import('./types.js').Move} Move
 * @typedef {import('./types.js').MoveResult} MoveResult
 * @typedef {import('./types.js').EnvironmentState} EnvironmentState
 * @typedef {import('./types.js').PhaseState} PhaseState
 * @typedef {import('./types.js').MentalState} MentalState
 * @typedef {import('./types.js').FighterStats} FighterStats
 */

/**
 * @typedef {Object} BattleEngineOptions
 * @description Configuration options for battle engine
 * @property {number} [maxTurns=50] - Maximum number of turns before draw
 * @property {boolean} [enableNarrative=true] - Enable narrative generation
 * @property {boolean} [enableDebugLogging=false] - Enable debug logging
 * @property {string} [seed] - Random seed for deterministic battles
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { processTurn } from './engine_turn-processor.js';
import { initializeBattleState, initializeFighter } from './engine_state_initializer.js';
import { characters } from './data_characters.js';
import { locations } from './locations.js';
import { engineLogger } from './battle_logging/index.js';

// ============================================================================
// CONSTANTS
// ============================================================================

/** @type {number} */
const DEFAULT_MAX_TURNS = 50;

/** @type {number} */
const TERMINAL_INCAPACITATION_THRESHOLD = 100;

// ============================================================================
// CORE BATTLE ENGINE
// ============================================================================

/**
 * Executes a complete battle simulation between two fighters
 * 
 * @param {string} fighter1Id - First fighter identifier
 * @param {string} fighter2Id - Second fighter identifier
 * @param {string} locationId - Battle location identifier
 * @param {BattleEngineOptions} [options={}] - Engine configuration options
 * 
 * @returns {Promise<BattleResult>} Complete battle result with winner, logs, and final state
 * 
 * @throws {TypeError} When fighter IDs or location ID are not strings
 * @throws {Error} When fighters or location are not found
 * @throws {Error} When battle state initialization fails
 * 
 * @example
 * // Execute a battle
 * const result = await executeBattle(
 *   'aang-avatar-state',
 *   'azula-comet-enhanced',
 *   'fire-nation-capital',
 *   { maxTurns: 30, enableNarrative: true }
 * );
 * 
 * @since 2.0.0
 * @public
 */
export async function executeBattle(fighter1Id, fighter2Id, locationId, options = {}) {
    // Input validation
    if (typeof fighter1Id !== 'string') {
        throw new TypeError('executeBattle: fighter1Id must be a string');
    }
    
    if (typeof fighter2Id !== 'string') {
        throw new TypeError('executeBattle: fighter2Id must be a string');
    }
    
    if (typeof locationId !== 'string') {
        throw new TypeError('executeBattle: locationId must be a string');
    }
    
    if (typeof options !== 'object' || options === null) {
        throw new TypeError('executeBattle: options must be an object');
    }

    console.log('[Battle Engine] Starting battle:', {
        fighter1Id,
        fighter2Id,
        locationId,
        options
    });

    /** @type {number} */
    const startTime = performance.now();

    try {
        // Validate fighter and location existence
        validateBattleParameters(fighter1Id, fighter2Id, locationId);

        // Initialize battle state
        /** @type {BattleState} */
        const initialState = await initializeBattleState(fighter1Id, fighter2Id, locationId, options);

        // Execute battle turns
        /** @type {BattleResult} */
        const battleResult = await runBattleLoop(initialState, options);

        /** @type {number} */
        const executionTime = performance.now() - startTime;
        
        console.log(`[Battle Engine] Battle completed in ${executionTime.toFixed(2)}ms`);
        console.log('[Battle Engine] Final result:', {
            winnerId: battleResult.winnerId,
            turnCount: battleResult.turnCount,
            eventCount: battleResult.log.length
        });

        return battleResult;

    } catch (error) {
        console.error('[Battle Engine] Battle execution failed:', error);
        throw error;
    }
}

/**
 * Validates battle parameters before execution
 * 
 * @param {string} fighter1Id - First fighter identifier
 * @param {string} fighter2Id - Second fighter identifier
 * @param {string} locationId - Location identifier
 * 
 * @returns {void}
 * 
 * @throws {Error} When fighters or location are not found
 * @throws {Error} When fighters are identical
 * 
 * @private
 * @since 2.0.0
 */
function validateBattleParameters(fighter1Id, fighter2Id, locationId) {
    // Check fighter existence
    if (!characters[fighter1Id]) {
        throw new Error(`executeBattle: Fighter '${fighter1Id}' not found in character database`);
    }
    
    if (!characters[fighter2Id]) {
        throw new Error(`executeBattle: Fighter '${fighter2Id}' not found in character database`);
    }
    
    // Check location existence
    if (!locations[locationId]) {
        throw new Error(`executeBattle: Location '${locationId}' not found in location database`);
    }
    
    // Check for identical fighters
    if (fighter1Id === fighter2Id) {
        throw new Error('executeBattle: Cannot battle identical fighters');
    }
}

/**
 * Runs the main battle loop until victory or maximum turns
 * 
 * @param {BattleState} initialState - Initial battle state
 * @param {BattleEngineOptions} options - Engine configuration
 * 
 * @returns {Promise<BattleResult>} Battle result with winner and final state
 * 
 * @throws {Error} When battle loop encounters unrecoverable error
 * 
 * @private
 * @since 2.0.0
 */
async function runBattleLoop(initialState, options) {
    /** @type {BattleState} */
    let currentState = { ...initialState };
    
    /** @type {number} */
    const maxTurns = options.maxTurns || DEFAULT_MAX_TURNS;
    
    /** @type {BattleEvent[]} */
    const battleLog = [];

    console.log(`[Battle Engine] Starting battle loop (max ${maxTurns} turns)`);

    // Main battle loop
    for (let turnNumber = 1; turnNumber <= maxTurns; turnNumber++) {
        try {
            if (options.enableDebugLogging) {
                console.debug(`[Battle Engine] Processing turn ${turnNumber}`);
            }

            // Process the turn
            /** @type {BattleState} */
            const turnResult = await processTurn(currentState, {
                turnNumber,
                enableNarrative: options.enableNarrative !== false,
                enableDebugLogging: options.enableDebugLogging || false
            });

            // Add turn events to battle log
            if (turnResult.events && turnResult.events.length > 0) {
                battleLog.push(...turnResult.events);
            }

            // Update current state
            currentState = turnResult;

            // Check for battle termination
            /** @type {string | null} */
            const winnerId = checkBattleTermination(currentState);
            
            if (winnerId) {
                console.log(`[Battle Engine] Battle ended on turn ${turnNumber}, winner: ${winnerId}`);
                
                return createBattleResult(
                    currentState,
                    winnerId,
                    turnNumber,
                    battleLog,
                    false
                );
            }

        } catch (error) {
            console.error(`[Battle Engine] Error on turn ${turnNumber}:`, error);
            
            // Add error event to log
            battleLog.push({
                type: 'ERROR',
                turn: turnNumber,
                data: {
                    message: error.message,
                    stack: error.stack
                },
                timestamp: new Date().toISOString()
            });
            
            throw new Error(`Battle loop failed on turn ${turnNumber}: ${error.message}`);
        }
    }

    // Battle ended in draw (maximum turns reached)
    console.log(`[Battle Engine] Battle ended in draw after ${maxTurns} turns`);
    
    return createBattleResult(
        currentState,
        null,
        maxTurns,
        battleLog,
        true
    );
}

/**
 * Checks if battle should terminate due to victory conditions
 * 
 * @param {BattleState} state - Current battle state
 * 
 * @returns {string | null} Winner ID if battle should end, null if continuing
 * 
 * @throws {TypeError} When state is invalid
 * 
 * @private
 * @since 2.0.0
 */
function checkBattleTermination(state) {
    // Input validation
    if (!state || typeof state !== 'object') {
        throw new TypeError('checkBattleTermination: state must be a valid battle state object');
    }

    if (!state.fighter1 || !state.fighter2) {
        throw new TypeError('checkBattleTermination: state must contain both fighters');
    }

    /** @type {Fighter} */
    const fighter1 = state.fighter1;
    /** @type {Fighter} */
    const fighter2 = state.fighter2;

    // Check terminal incapacitation
    /** @type {boolean} */
    const fighter1Incapacitated = (fighter1.incapacitationScore || 0) >= TERMINAL_INCAPACITATION_THRESHOLD;
    /** @type {boolean} */
    const fighter2Incapacitated = (fighter2.incapacitationScore || 0) >= TERMINAL_INCAPACITATION_THRESHOLD;

    if (fighter1Incapacitated && fighter2Incapacitated) {
        // Both incapacitated - draw
        return null;
    }
    
    if (fighter1Incapacitated) {
        return fighter2.id;
    }
    
    if (fighter2Incapacitated) {
        return fighter1.id;
    }

    // Check explicit victory flags
    if (state.winnerId) {
        return state.winnerId;
    }

    // Check escalation states for terminal collapse
    if (fighter1.escalationState === 'Terminal Collapse') {
        return fighter2.id;
    }
    
    if (fighter2.escalationState === 'Terminal Collapse') {
        return fighter1.id;
    }

    // Continue battle
    return null;
}

/**
 * Creates the final battle result object
 * 
 * @param {BattleState} finalState - Final battle state
 * @param {string | null} winnerId - Winner ID or null for draw
 * @param {number} turnCount - Number of turns executed
 * @param {BattleEvent[]} battleLog - Complete battle event log
 * @param {boolean} isDraw - Whether battle ended in draw
 * 
 * @returns {BattleResult} Complete battle result
 * 
 * @throws {TypeError} When required parameters are invalid
 * 
 * @private
 * @since 2.0.0
 */
function createBattleResult(finalState, winnerId, turnCount, battleLog, isDraw) {
    // Input validation
    if (!finalState || typeof finalState !== 'object') {
        throw new TypeError('createBattleResult: finalState must be a valid battle state object');
    }
    
    if (winnerId !== null && typeof winnerId !== 'string') {
        throw new TypeError('createBattleResult: winnerId must be a string or null');
    }
    
    if (typeof turnCount !== 'number' || turnCount < 0) {
        throw new TypeError('createBattleResult: turnCount must be a non-negative number');
    }
    
    if (!Array.isArray(battleLog)) {
        throw new TypeError('createBattleResult: battleLog must be an array');
    }
    
    if (typeof isDraw !== 'boolean') {
        throw new TypeError('createBattleResult: isDraw must be a boolean');
    }

    /** @type {string | null} */
    const loserId = isDraw ? null : (winnerId === finalState.fighter1.id ? finalState.fighter2.id : finalState.fighter1.id);

    /** @type {BattleResult} */
    const result = {
        winnerId,
        loserId,
        isDraw,
        turnCount,
        finalState,
        log: battleLog,
        locationId: finalState.environment.locationId,
        timestamp: new Date().toISOString(),
        metadata: {
            engineVersion: '2.0.0',
            totalEvents: battleLog.length,
            finalScores: {
                fighter1: finalState.fighter1.incapacitationScore || 0,
                fighter2: finalState.fighter2.incapacitationScore || 0
            },
            finalMomentum: {
                fighter1: finalState.fighter1.momentum || 0,
                fighter2: finalState.fighter2.momentum || 0
            },
            escalationStates: {
                fighter1: finalState.fighter1.escalationState || 'Normal',
                fighter2: finalState.fighter2.escalationState || 'Normal'
            }
        }
    };

    // Log battle summary
    console.log('[Battle Engine] Battle Result Summary:', {
        winner: winnerId || 'Draw',
        turns: turnCount,
        events: battleLog.length,
        fighter1Score: result.metadata.finalScores.fighter1,
        fighter2Score: result.metadata.finalScores.fighter2
    });

    return result;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculates battle statistics from result
 * 
 * @param {BattleResult} battleResult - Battle result to analyze
 * 
 * @returns {Object} Battle statistics object
 * 
 * @throws {TypeError} When battleResult is invalid
 * 
 * @example
 * // Calculate statistics
 * const stats = calculateBattleStatistics(battleResult);
 * console.log(stats.averageTurnLength);
 * 
 * @since 2.0.0
 * @public
 */
export function calculateBattleStatistics(battleResult) {
    // Input validation
    if (!battleResult || typeof battleResult !== 'object') {
        throw new TypeError('calculateBattleStatistics: battleResult must be an object');
    }
    
    if (!Array.isArray(battleResult.log)) {
        throw new TypeError('calculateBattleStatistics: battleResult.log must be an array');
    }

    /** @type {BattleEvent[]} */
    const events = battleResult.log;
    
    /** @type {Object} */
    const eventTypeCount = {};
    
    /** @type {number} */
    let totalDamageDealt = 0;
    
    /** @type {number} */
    let totalMovesExecuted = 0;

    // Analyze events
    events.forEach(/** @type {BattleEvent} */ (event) => {
        // Count event types
        eventTypeCount[event.type] = (eventTypeCount[event.type] || 0) + 1;
        
        // Sum damage
        if (event.type === 'MOVE_EXECUTED' && event.data && typeof event.data.damage === 'number') {
            totalDamageDealt += event.data.damage;
        }
        
        // Count moves
        if (event.type === 'MOVE_EXECUTED') {
            totalMovesExecuted++;
        }
    });

    return {
        totalEvents: events.length,
        totalTurns: battleResult.turnCount,
        totalDamage: totalDamageDealt,
        totalMoves: totalMovesExecuted,
        averageTurnLength: events.length / battleResult.turnCount,
        averageDamagePerMove: totalMovesExecuted > 0 ? totalDamageDealt / totalMovesExecuted : 0,
        eventTypeDistribution: eventTypeCount,
        battleDuration: battleResult.turnCount,
        winnerFinalScore: battleResult.metadata.finalScores[battleResult.winnerId === battleResult.finalState.fighter1.id ? 'fighter1' : 'fighter2'],
        loserFinalScore: battleResult.metadata.finalScores[battleResult.winnerId === battleResult.finalState.fighter1.id ? 'fighter2' : 'fighter1']
    };
}

/**
 * Validates a battle result object structure
 * 
 * @param {any} result - Object to validate as battle result
 * 
 * @returns {boolean} True if valid battle result
 * 
 * @example
 * // Validate battle result
 * if (isValidBattleResult(result)) {
 *   console.log('Valid battle result');
 * }
 * 
 * @since 2.0.0
 * @public
 */
export function isValidBattleResult(result) {
    if (!result || typeof result !== 'object') {
        return false;
    }

    // Check required properties
    /** @type {string[]} */
    const requiredProps = ['winnerId', 'loserId', 'isDraw', 'turnCount', 'finalState', 'log', 'locationId', 'timestamp'];
    
    for (const prop of requiredProps) {
        if (!(prop in result)) {
            console.warn(`[Battle Engine] Invalid battle result: missing property '${prop}'`);
            return false;
        }
    }

    // Validate types
    if (result.winnerId !== null && typeof result.winnerId !== 'string') {
        return false;
    }
    
    if (result.loserId !== null && typeof result.loserId !== 'string') {
        return false;
    }
    
    if (typeof result.isDraw !== 'boolean') {
        return false;
    }
    
    if (typeof result.turnCount !== 'number' || result.turnCount < 0) {
        return false;
    }
    
    if (!Array.isArray(result.log)) {
        return false;
    }
    
    if (typeof result.locationId !== 'string') {
        return false;
    }

    return true;
}

// ============================================================================
// EXPORTS
// ============================================================================

// Export main functions
export { executeBattle, calculateBattleStatistics, isValidBattleResult };

// Export for testing
export { checkBattleTermination, createBattleResult };

// Legacy compatibility
export { executeBattle as runBattle };