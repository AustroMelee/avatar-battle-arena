/**
 * @fileoverview Avatar Battle Arena - Core Battle Engine (Refactored)
 * @description Primary battle simulation orchestrator. It initializes the battle,
 * manages the main turn loop by delegating to specialized processors, and finalizes the result.
 * @version 3.0
 */

// FILE: engine_battle-engine-core.js
'use strict';

//# sourceURL=engine_battle-engine-core.js

// --- TYPE IMPORTS ---
/**
 * @typedef {import('./types.js').Fighter} Fighter
 * @typedef {import('./types.js').BattleState} BattleState
 * @typedef {import('./types.js').PhaseState} PhaseState
 * @typedef {import('./types.js').BattleEvent} BattleEvent
 * @typedef {import('./types.js').BattleResult} BattleResult
 * @typedef {import('./types.js').EnvironmentState} EnvironmentState
 */

// --- DATA & CONFIG IMPORTS ---
import { characters } from './data_characters.js';
import { locations } from './locations.js';
import { MAX_TOTAL_TURNS, USE_DETERMINISTIC_RANDOM, RANDOM_SEED } from './config_game.js';

// --- STATE & RULE ENGINE IMPORTS ---
import { initializeFighterState, initializeBattleState } from './engine_state_initializer.js';
import { evaluateTerminalState } from './engine_terminal_state.js';
import { generateFinalSummary } from './engine_battle_summarizer.js';
import { applyCurbstompRules, resetCurbstompState, checkCurbstompConditions } from './engine_curbstomp_manager.js';
import { initializeBattlePhaseState } from './engine_battle-phase.js';
import { managePhaseTransition } from './engine_phase-manager.js'; // NEW
import { processTurn } from './engine_turn-processor.js'; // NEW

// --- UTILITY IMPORTS ---
import { setSeed } from './utils_seeded_random.js';
import { generateLogEvent } from './utils_log_event.js';
import { assertBattleStateInvariants } from './utils_state_invariants.js';
import { findNarrativeQuote, generateTurnNarrationObjects } from './engine_narrative-engine.js';

/**
 * @typedef {Object} TerminalState
 * @description Terminal state evaluation result
 * @property {boolean} battleOver - Whether battle has ended
 * @property {string} [winnerId] - ID of winning fighter
 * @property {string} [loserId] - ID of losing fighter
 * @property {boolean} isStalemate - Whether battle is a stalemate
 */

/**
 * Handles the pre-battle setup, including initial banter and rules checks.
 * 
 * @param {Fighter} fighter1 - First fighter state
 * @param {Fighter} fighter2 - Second fighter state
 * @param {BattleState} battleState - Current battle state
 * @param {PhaseState} phaseState - Current phase state
 * @param {BattleEvent[]} battleEventLog - Battle event log array
 * 
 * @returns {TerminalState} Terminal state evaluation result
 * 
 * @private
 * @since 3.0
 */
function handlePreBattle(fighter1, fighter2, battleState, phaseState, battleEventLog) {
    console.debug(`[Battle Engine] Running Pre-Battle setup...`);
    
    // Input validation
    if (!fighter1 || !fighter2) {
        throw new Error('handlePreBattle: fighter1 and fighter2 are required');
    }
    if (!battleState) {
        throw new Error('handlePreBattle: battleState is required');
    }
    if (!phaseState) {
        throw new Error('handlePreBattle: phaseState is required');
    }
    if (!Array.isArray(battleEventLog)) {
        throw new Error('handlePreBattle: battleEventLog must be an array');
    }
    
    const locId = battleState.locationId;

    // Generate pre-battle banter
    const banter1 = findNarrativeQuote(fighter1, fighter2, 'battleStart', phaseState.currentPhase, { 
        currentPhaseKey: phaseState.currentPhase, 
        locationId: locId, 
        battleState 
    });
    
    if (banter1) {
        const narrationObjects = generateTurnNarrationObjects(
            [{ quote: banter1, actor: fighter1 }], 
            null, 
            fighter1, 
            fighter2, 
            null, 
            battleState.environmentState, 
            battleState.locationConditions, 
            phaseState.currentPhase, 
            true, 
            null, 
            battleState
        );
        battleEventLog.push(...narrationObjects);
    }

    const banter2 = findNarrativeQuote(fighter2, fighter1, 'battleStart', phaseState.currentPhase, { 
        currentPhaseKey: phaseState.currentPhase, 
        locationId: locId, 
        battleState 
    });
    
    if (banter2) {
        const narrationObjects = generateTurnNarrationObjects(
            [{ quote: banter2, actor: fighter2 }], 
            null, 
            fighter2, 
            fighter1, 
            null, 
            battleState.environmentState, 
            battleState.locationConditions, 
            phaseState.currentPhase, 
            true, 
            null, 
            battleState
        );
        battleEventLog.push(...narrationObjects);
    }

    // Apply any initial "curbstomp" rules (e.g., for lore-based mismatches)
    applyCurbstompRules(fighter1, fighter2, battleState, battleEventLog, true);
    
    return evaluateTerminalState(fighter1, fighter2, false);
}

/**
 * Handles the post-battle wrap-up, determining the final winner and generating a summary.
 * 
 * @param {BattleResult} battleResult - Mutable battle result object
 * @param {Fighter} fighter1 - First fighter final state
 * @param {Fighter} fighter2 - Second fighter final state
 * @param {number} turn - Final turn number
 * 
 * @returns {void}
 * 
 * @private
 * @since 3.0
 */
function handlePostBattle(battleResult, fighter1, fighter2, turn) {
    console.debug(`[Battle Engine] Running Post-Battle wrap-up...`);
    
    // Input validation
    if (!battleResult || typeof battleResult !== 'object') {
        throw new Error('handlePostBattle: battleResult must be an object');
    }
    if (!fighter1 || !fighter2) {
        throw new Error('handlePostBattle: fighter1 and fighter2 are required');
    }
    if (typeof turn !== 'number' || turn < 0) {
        throw new Error('handlePostBattle: turn must be a non-negative number');
    }
    
    // Check for timeout condition if battle ended due to max turns
    if (!battleResult.winnerId && !battleResult.isDraw && turn >= MAX_TOTAL_TURNS) {
        const timeoutEvent = generateLogEvent({}, { 
            type: 'timeout_event', 
            text: 'The battle timed out!' 
        });
        battleResult.log.push(timeoutEvent);
        
        if (fighter1.hp === fighter2.hp) {
            battleResult.isDraw = true;
        } else {
            battleResult.winnerId = (fighter1.hp > fighter2.hp) ? fighter1.id : fighter2.id;
            battleResult.loserId = (battleResult.winnerId === fighter1.id) ? fighter2.id : fighter1.id;
        }
    }
    
    generateFinalSummary(battleResult, fighter1, fighter2, turn);
}

/**
 * Simulates a complete battle between two fighters.
 * This is the primary entry point for the battle simulation.
 * 
 * @param {string} f1Id - First fighter identifier
 * @param {string} f2Id - Second fighter identifier  
 * @param {string} locId - Battle location identifier
 * @param {string} timeOfDay - Time of day setting
 * @param {boolean} [emotionalMode=false] - Whether to enable emotional mode
 * 
 * @returns {BattleResult} Complete battle result with log, winner, and final states
 * 
 * @throws {Error} When required parameters are invalid
 * @throws {Error} When fighters or location cannot be found
 * @throws {Error} When battle initialization fails
 * 
 * @example
 * // Basic battle simulation
 * const result = simulateBattle('aang', 'azula', 'fire-nation-capital', 'noon');
 * console.log(`Winner: ${result.winnerId}`);
 * 
 * @example
 * // Battle with emotional mode
 * const emotionalResult = simulateBattle('aang', 'azula', 'fire-nation-capital', 'noon', true);
 * 
 * @since 3.0
 * @public
 */
export function simulateBattle(f1Id, f2Id, locId, timeOfDay, emotionalMode = false) {
    console.log(`[Battle Engine] ===== BATTLE SIMULATION START v3.0 =====`);
    console.log(`[Battle Engine] ${f1Id} vs ${f2Id} at ${locId} (${timeOfDay})`);

    // === INPUT VALIDATION ===
    if (!f1Id || typeof f1Id !== 'string') {
        throw new Error(`simulateBattle: f1Id must be a non-empty string, received: ${typeof f1Id} (${f1Id})`);
    }
    if (!f2Id || typeof f2Id !== 'string') {
        throw new Error(`simulateBattle: f2Id must be a non-empty string, received: ${typeof f2Id} (${f2Id})`);
    }
    if (!locId || typeof locId !== 'string') {
        throw new Error(`simulateBattle: locId must be a non-empty string, received: ${typeof locId} (${locId})`);
    }
    if (!timeOfDay || typeof timeOfDay !== 'string') {
        throw new Error(`simulateBattle: timeOfDay must be a non-empty string, received: ${typeof timeOfDay} (${timeOfDay})`);
    }
    if (typeof emotionalMode !== 'boolean') {
        throw new Error(`simulateBattle: emotionalMode must be a boolean, received: ${typeof emotionalMode} (${emotionalMode})`);
    }

    // === 1. INITIALIZATION ===
    if (USE_DETERMINISTIC_RANDOM) {
        setSeed(RANDOM_SEED);
    }
    resetCurbstompState();
    
    /** @type {BattleEvent[]} */
    const battleEventLog = [];
    
    /** @type {Fighter} */
    let fighter1 = initializeFighterState(f1Id, f2Id, emotionalMode);
    
    /** @type {Fighter} */
    let fighter2 = initializeFighterState(f2Id, f1Id, emotionalMode);
    
    /** @type {BattleState} */
    let battleState = initializeBattleState(f1Id, f2Id, locId, timeOfDay, emotionalMode);
    
    /** @type {PhaseState} */
    let phaseState = initializeBattlePhaseState(battleState, battleEventLog);
    
    // Cross-reference setup
    fighter1.opponentId = fighter2.id;
    fighter2.opponentId = fighter1.id;
    
    let turn = 0;
    let battleOver = false;
    /** @type {string | null} */
    let winnerId = null;
    /** @type {string | null} */
    let loserId = null;
    let isStalemate = false;

    // === 2. PRE-BATTLE PHASE ===
    /** @type {TerminalState} */
    let terminalOutcome = handlePreBattle(fighter1, fighter2, battleState, phaseState, battleEventLog);
    if (terminalOutcome.battleOver) {
        ({ battleOver, winnerId, loserId, isStalemate } = terminalOutcome);
    }

    // === 3. MAIN BATTLE LOOP ===
    /** @type {Fighter} */
    let currentAttacker = fighter1;
    /** @type {Fighter} */
    let currentDefender = fighter2;

    while (turn < MAX_TOTAL_TURNS && !battleOver) {
        battleState.turn = turn;
        battleState.currentPhase = phaseState.currentPhase;

        // A. Manage Phase Transitions
        const phaseEvents = managePhaseTransition(phaseState, currentAttacker, currentDefender, battleState);
        battleEventLog.push(...phaseEvents);

        // B. Process the Current Attacker's Turn
        const turnEvents = processTurn(currentAttacker, currentDefender, battleState, phaseState);
        battleEventLog.push(...turnEvents);
        
        // C. Check for End-of-Turn Terminal State
        terminalOutcome = evaluateTerminalState(fighter1, fighter2, false);
        if (terminalOutcome.battleOver) {
            ({ battleOver, winnerId, loserId, isStalemate } = terminalOutcome);
        }

        // D. Prepare for Next Turn
        [currentAttacker, currentDefender] = [currentDefender, currentAttacker];
        turn++;
    }

    // === 4. POST-BATTLE & SUMMARY ===
    /** @type {BattleResult} */
    const finalBattleResult = {
        log: battleEventLog,
        winnerId,
        loserId,
        isDraw: isStalemate,
        finalState: { 
            fighter1: { ...fighter1 }, 
            fighter2: { ...fighter2 } 
        },
        environmentState: battleState.environmentState,
        phaseSummary: phaseState.phaseSummaryLog
    };
    
    handlePostBattle(finalBattleResult, fighter1, fighter2, turn);
    console.log(`[Battle Engine] ===== BATTLE SIMULATION END =====`);
    return finalBattleResult;
}