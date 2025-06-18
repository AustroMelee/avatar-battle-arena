/**
 * @fileoverview Avatar Battle Arena - Battle Phase Management Engine
 * @description Manages battle phase transitions and state throughout combat with comprehensive validation
 * @version 2.0.0
 */

'use strict';

//# sourceURL=engine_battle-phase.js

// ============================================================================
// TYPE IMPORTS
// ============================================================================

/**
 * @typedef {import('./types.js').Fighter} Fighter
 * @typedef {import('./types.js').BattleState} BattleState
 * @typedef {import('./types.js').PhaseState} PhaseState
 * @typedef {import('./types.js').BattleEvent} BattleEvent
 * @typedef {import('./types.js').EnvironmentState} EnvironmentState
 */

/**
 * @typedef {Object} PhaseTransitionResult
 * @description Result of phase transition evaluation
 * @property {boolean} transitioned - Whether a phase transition occurred
 * @property {string} previousPhase - Previous phase before transition
 * @property {string} currentPhase - Current phase after evaluation
 * @property {string[]} triggers - List of conditions that triggered transition
 * @property {number} triggerCount - Number of conditions met
 * @property {Object} metadata - Additional transition metadata
 */

/**
 * @typedef {Object} PhaseAIModifiers
 * @description AI behavior modifiers for different battle phases
 * @property {number} aggressionMultiplier - Aggression level modifier
 * @property {number} patienceMultiplier - Patience level modifier
 * @property {number} riskToleranceMultiplier - Risk tolerance modifier
 * @property {number} defensiveBiasMultiplier - Defensive behavior modifier
 * @property {number} creativityMultiplier - Move creativity modifier
 * @property {number} opportunismMultiplier - Opportunism modifier
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { battlePhases as phaseDefinitions } from './data_narrative_phases.js';
import { locations } from './locations.js';
import { getRandomElementSeeded, seededRandom } from './utils_seeded_random.js';
import { USE_DETERMINISTIC_RANDOM } from './config_game.js';
import { generateLogEvent } from './utils_log_event.js';
import { 
    PHASE_TRANSITION_THRESHOLDS, 
    MENTAL_STATE_TRIGGERS, 
    MOVE_TRIGGERS,
    shouldMentalStateTriggerTransition,
    getPhaseAIModifiers as getConfiguredPhaseAIModifiers 
} from './config_phase_transitions.js';

// ============================================================================
// CONSTANTS
// ============================================================================

/** @type {Object<string, string>} */
export const BATTLE_PHASES = {
    PRE_BANTER: 'Pre-Banter',
    POKING: 'Poking',
    EARLY: 'Early',
    MID: 'Mid',
    LATE: 'Late'
};

/** @type {string[]} */
const VALID_PHASES = Object.values(BATTLE_PHASES);

/** @type {number} */
const MIN_POKING_DURATION = 1;

/** @type {number} */
const MAX_POKING_DURATION = 8;

/** @type {number} */
const DEFAULT_POKING_DURATION = 3;

/** @type {number} */
const PHASE_TRANSITION_THRESHOLD = 0.1;

/** @type {number} */
const MIN_EARLY_TURNS = 2;

/** @type {number} */
const MAX_EARLY_TURNS = 5;

/** @type {number} */
const MIN_MID_TURNS = 2;

/** @type {number} */
const MAX_MID_TURNS = 7;

// ============================================================================
// CORE PHASE MANAGEMENT
// ============================================================================

/**
 * Initializes the battle phase state for a new battle
 * 
 * @param {BattleState} battleState - Current battle state
 * @param {BattleEvent[]} battleEventLog - Battle event log array
 * 
 * @returns {PhaseState} Initialized phase state
 * 
 * @throws {TypeError} When battleState is invalid
 * @throws {TypeError} When battleEventLog is invalid
 * 
 * @example
 * // Initialize phase state for new battle
 * const phaseState = initializeBattlePhaseState(battleState, eventLog);
 * console.log(`Starting in ${phaseState.currentPhase} phase`);
 * 
 * @since 2.0.0
 * @public
 */
export function initializeBattlePhaseState(battleState, battleEventLog) {
    // Input validation
    if (!battleState || typeof battleState !== 'object') {
        throw new TypeError('initializeBattlePhaseState: battleState must be a valid battle state object');
    }

    if (!Array.isArray(battleEventLog)) {
        throw new TypeError('initializeBattlePhaseState: battleEventLog must be an array');
    }

    /** @type {Object} */
    const pokingConfig = PHASE_TRANSITION_THRESHOLDS.POKING_TO_EARLY;
    
    /** @type {number} */
    const pokingDuration = Math.floor(
        (USE_DETERMINISTIC_RANDOM ? seededRandom() : Math.random()) * 
        (pokingConfig.MAX_DURATION - pokingConfig.MIN_DURATION + 1)
    ) + pokingConfig.MIN_DURATION;

    // Generate and log the poking duration event
    /** @type {BattleEvent} */
    const pokingDurationEvent = generateLogEvent(battleState, {
        type: "dice_roll",
        rollType: "pokingDuration",
        result: pokingDuration,
        outcome: `Poking phase duration set to ${pokingDuration} turns.`
    });

    battleEventLog.push(pokingDurationEvent);

    /** @type {PhaseState} */
    const phaseState = {
        currentPhase: BATTLE_PHASES.PRE_BANTER,
        turnInCurrentPhase: 0,
        pokingDuration: pokingDuration,
        pokingPhaseMaxTurns: pokingDuration,
        phaseSummaryLog: [],
        phaseLog: [`Battle started in ${BATTLE_PHASES.PRE_BANTER} Phase.`],
        currentPhaseFighterStats: {
            f1: { hp: null, momentum: null },
            f2: { hp: null, momentum: null }
        }
    };

    console.log(`[Phase Manager] Initialized phase state: ${BATTLE_PHASES.PRE_BANTER}, poking duration: ${pokingDuration}`);

    return phaseState;
}

/**
 * Checks for and processes battle phase transitions
 * 
 * @param {PhaseState} phaseState - Current phase state
 * @param {Fighter} fighter1 - First fighter
 * @param {Fighter} fighter2 - Second fighter
 * @param {number} totalTurnsElapsed - Total turns elapsed in battle
 * @param {string} locationId - Battle location identifier
 * 
 * @returns {boolean} True if phase transition occurred
 * 
 * @throws {TypeError} When parameters are invalid
 * 
 * @example
 * // Check for phase transition
 * const transitioned = checkAndTransitionPhase(
 *   phaseState, fighter1, fighter2, 5, 'fire-nation-capital'
 * );
 * if (transitioned) {
 *   console.log(`Phase changed to ${phaseState.currentPhase}`);
 * }
 * 
 * @since 2.0.0
 * @public
 */
export function checkAndTransitionPhase(phaseState, fighter1, fighter2, totalTurnsElapsed, locationId) {
    // Input validation
    if (!phaseState || typeof phaseState !== 'object') {
        throw new TypeError('checkAndTransitionPhase: phaseState must be a valid phase state object');
    }

    if (!fighter1 || typeof fighter1 !== 'object') {
        throw new TypeError('checkAndTransitionPhase: fighter1 must be a valid fighter object');
    }

    if (!fighter2 || typeof fighter2 !== 'object') {
        throw new TypeError('checkAndTransitionPhase: fighter2 must be a valid fighter object');
    }

    if (typeof totalTurnsElapsed !== 'number' || totalTurnsElapsed < 0) {
        throw new TypeError('checkAndTransitionPhase: totalTurnsElapsed must be a non-negative number');
    }

    if (typeof locationId !== 'string') {
        throw new TypeError('checkAndTransitionPhase: locationId must be a string');
    }

    /** @type {string} */
    const originalPhase = phaseState.currentPhase;
    
    phaseState.turnInCurrentPhase++;

    // Helper to update currentPhaseFighterStats
    /** @type {Function} */
    const updatePhaseStats = () => {
        phaseState.currentPhaseFighterStats.f1 = { 
            hp: fighter1.hp || 0, 
            momentum: Number(fighter1.momentum || 0) 
        };
        phaseState.currentPhaseFighterStats.f2 = { 
            hp: fighter2.hp || 0, 
            momentum: Number(fighter2.momentum || 0) 
        };
    };

    // Process phase transitions based on current phase
    /** @type {boolean} */
    let transitioned = false;

    switch (phaseState.currentPhase) {
        case BATTLE_PHASES.PRE_BANTER:
            transitioned = processPreBanterTransition(phaseState, totalTurnsElapsed, updatePhaseStats);
            break;

        case BATTLE_PHASES.POKING:
            transitioned = processPokingTransition(phaseState, totalTurnsElapsed, locationId, updatePhaseStats);
            break;

        case BATTLE_PHASES.EARLY:
            transitioned = processEarlyTransition(phaseState, fighter1, fighter2, totalTurnsElapsed, updatePhaseStats);
            break;

        case BATTLE_PHASES.MID:
            transitioned = processMidTransition(phaseState, fighter1, fighter2, totalTurnsElapsed, updatePhaseStats);
            break;

        case BATTLE_PHASES.LATE:
            // Late phase doesn't transition to anything else
            break;

        default:
            console.warn(`[Phase Manager] Unknown phase: ${phaseState.currentPhase}`);
            break;
    }

    if (transitioned) {
        console.log(`[Phase Manager] Transition: ${originalPhase} → ${phaseState.currentPhase} (turn ${totalTurnsElapsed + 1})`);
    }

    return originalPhase !== phaseState.currentPhase;
}

/**
 * Gets AI behavior modifiers for the current battle phase
 * 
 * @param {string} currentPhase - Current battle phase
 * 
 * @returns {PhaseAIModifiers} AI behavior modifiers for the phase
 * 
 * @throws {TypeError} When currentPhase is not a string
 * 
 * @example
 * // Get AI modifiers for current phase
 * const modifiers = getPhaseAIModifiers(phaseState.currentPhase);
 * const adjustedAggression = baseAggression * modifiers.aggressionMultiplier;
 * 
 * @since 2.0.0
 * @public
 */
export function getPhaseAIModifiers(currentPhase) {
    // Input validation
    if (typeof currentPhase !== 'string') {
        throw new TypeError('getPhaseAIModifiers: currentPhase must be a string');
    }

    switch (currentPhase) {
        case BATTLE_PHASES.PRE_BANTER:
            return { 
                aggressionMultiplier: 0.001, 
                patienceMultiplier: 5.0, 
                riskToleranceMultiplier: 0.001, 
                defensiveBiasMultiplier: 5.0, 
                creativityMultiplier: 0.1, 
                opportunismMultiplier: 0.001 
            };

        case BATTLE_PHASES.POKING:
            return { 
                aggressionMultiplier: 0.2, 
                patienceMultiplier: 2.0, 
                riskToleranceMultiplier: 0.3, 
                defensiveBiasMultiplier: 2.0, 
                creativityMultiplier: 1.5, 
                opportunismMultiplier: 0.5 
            };

        case BATTLE_PHASES.EARLY:
            return { 
                aggressionMultiplier: 0.9, 
                patienceMultiplier: 1.1, 
                riskToleranceMultiplier: 0.8, 
                defensiveBiasMultiplier: 1.0, 
                creativityMultiplier: 1.0, 
                opportunismMultiplier: 1.0 
            };

        case BATTLE_PHASES.MID:
            return { 
                aggressionMultiplier: 1.2, 
                patienceMultiplier: 0.9, 
                riskToleranceMultiplier: 1.1, 
                defensiveBiasMultiplier: 0.9, 
                creativityMultiplier: 1.1, 
                opportunismMultiplier: 1.2 
            };

        case BATTLE_PHASES.LATE:
            return { 
                aggressionMultiplier: 1.5, 
                patienceMultiplier: 0.5, 
                riskToleranceMultiplier: 1.5, 
                defensiveBiasMultiplier: 0.6, 
                creativityMultiplier: 1.0, 
                opportunismMultiplier: 1.5 
            };

        default:
            console.warn(`[Phase Manager] Unknown phase for AI modifiers: ${currentPhase}`);
            return { 
                aggressionMultiplier: 1.0, 
                patienceMultiplier: 1.0, 
                riskToleranceMultiplier: 1.0, 
                defensiveBiasMultiplier: 1.0, 
                creativityMultiplier: 1.0, 
                opportunismMultiplier: 1.0 
            };
    }
}

// ============================================================================
// PHASE TRANSITION PROCESSORS
// ============================================================================

/**
 * Processes Pre-Banter to Poking phase transition
 * 
 * @param {PhaseState} phaseState - Current phase state
 * @param {number} totalTurnsElapsed - Total turns elapsed
 * @param {Function} updatePhaseStats - Function to update phase stats
 * 
 * @returns {boolean} True if transition occurred
 * 
 * @private
 * @since 2.0.0
 */
function processPreBanterTransition(phaseState, totalTurnsElapsed, updatePhaseStats) {
    if (phaseState.turnInCurrentPhase >= 1) {
        phaseState.phaseSummaryLog.push({ 
            phase: BATTLE_PHASES.PRE_BANTER, 
            turns: phaseState.turnInCurrentPhase 
        });

        phaseState.currentPhase = BATTLE_PHASES.POKING;
        phaseState.turnInCurrentPhase = 0;
        updatePhaseStats();
        phaseState.phaseLog.push(
            `Transitioned to ${BATTLE_PHASES.POKING} Phase on turn ${totalTurnsElapsed + 1}. Triggers: Narrative Completion.`
        );
        return true;
    }
    return false;
}

/**
 * Processes Poking to Early phase transition
 * 
 * @param {PhaseState} phaseState - Current phase state
 * @param {number} totalTurnsElapsed - Total turns elapsed
 * @param {string} locationId - Battle location identifier
 * @param {Function} updatePhaseStats - Function to update phase stats
 * 
 * @returns {boolean} True if transition occurred
 * 
 * @private
 * @since 2.0.0
 */
function processPokingTransition(phaseState, totalTurnsElapsed, locationId, updatePhaseStats) {
    if (phaseState.turnInCurrentPhase >= phaseState.pokingDuration) {
        // Apply location-specific poking duration override
        /** @type {Object | undefined} */
        const locationOverrides = locations[locationId]?.phaseOverrides;
        
        if (locationOverrides && locationOverrides.pokingDuration !== undefined) {
            phaseState.pokingDuration = locationOverrides.pokingDuration;
        }
        
        phaseState.phaseSummaryLog.push({ 
            phase: BATTLE_PHASES.POKING, 
            turns: phaseState.turnInCurrentPhase 
        });

        phaseState.currentPhase = BATTLE_PHASES.EARLY;
        phaseState.turnInCurrentPhase = 0;
        updatePhaseStats();
        phaseState.phaseLog.push(
            `Transitioned to ${BATTLE_PHASES.EARLY} Phase on turn ${totalTurnsElapsed + 1}. Triggers: Poking Phase Duration Met.`
        );
        return true;
    }
    return false;
}

/**
 * Processes Early to Mid phase transition
 * 
 * @param {PhaseState} phaseState - Current phase state
 * @param {Fighter} fighter1 - First fighter
 * @param {Fighter} fighter2 - Second fighter
 * @param {number} totalTurnsElapsed - Total turns elapsed
 * @param {Function} updatePhaseStats - Function to update phase stats
 * 
 * @returns {boolean} True if transition occurred
 * 
 * @private
 * @since 2.0.0
 */
function processEarlyTransition(phaseState, fighter1, fighter2, totalTurnsElapsed, updatePhaseStats) {
    /** @type {number} */
    let midPhaseTriggers = 0;

    // Calculate deltas from the start of the current (EARLY) phase
    /** @type {number} */
    const hpDeltaF1 = (phaseState.currentPhaseFighterStats.f1.hp || 0) - (fighter1.hp || 0);
    /** @type {number} */
    const hpDeltaF2 = (phaseState.currentPhaseFighterStats.f2.hp || 0) - (fighter2.hp || 0);
    /** @type {number} */
    const momentumDeltaF1 = Number(fighter1.momentum || 0) - Number(phaseState.currentPhaseFighterStats.f1.momentum || 0);
    /** @type {number} */
    const momentumDeltaF2 = Number(fighter2.momentum || 0) - Number(phaseState.currentPhaseFighterStats.f2.momentum || 0);

    // Evaluate transition conditions
    if ((fighter1.hp || 0) <= 60 || (fighter2.hp || 0) <= 60) midPhaseTriggers++;
    if (Math.abs(Number(fighter1.momentum || 0)) >= 5 || Math.abs(Number(fighter2.momentum || 0)) >= 5) midPhaseTriggers++;
    if (hpDeltaF1 >= 30 || hpDeltaF2 >= 30) midPhaseTriggers++;
    if (momentumDeltaF1 >= 5 || momentumDeltaF2 >= 5) midPhaseTriggers++;
    if (Math.abs((fighter1.hp || 0) - (fighter2.hp || 0)) >= 30) midPhaseTriggers++;
    if (Math.abs(Number(fighter1.momentum || 0) - Number(fighter2.momentum || 0)) >= 8) midPhaseTriggers++;

    // Mental state and finisher triggers
    if (fighter1.mentalState?.level === 'stressed' || fighter2.mentalState?.level === 'stressed') midPhaseTriggers++;
    if (fighter1.lastMove?.type === 'Finisher' || (fighter1.lastMove?.power && fighter1.lastMove.power >= 70)) midPhaseTriggers++;
    if (fighter2.lastMove?.type === 'Finisher' || (fighter2.lastMove?.power && fighter2.lastMove.power >= 70)) midPhaseTriggers++;

    // Force progression if minimum conditions met
    if (phaseState.turnInCurrentPhase >= MIN_EARLY_TURNS && midPhaseTriggers === 0) midPhaseTriggers++;

    if (midPhaseTriggers >= 1 || phaseState.turnInCurrentPhase >= MAX_EARLY_TURNS) {
        phaseState.phaseSummaryLog.push({ 
            phase: BATTLE_PHASES.EARLY, 
            turns: phaseState.turnInCurrentPhase 
        });

        phaseState.currentPhase = BATTLE_PHASES.MID;
        phaseState.turnInCurrentPhase = 0;
        updatePhaseStats();
        phaseState.phaseLog.push(
            `Transitioned to ${BATTLE_PHASES.MID} Phase on turn ${totalTurnsElapsed + 1}. Triggers: ${midPhaseTriggers} (or max turns for phase).`
        );
        return true;
    }
    return false;
}

/**
 * Processes Mid to Late phase transition
 * 
 * @param {PhaseState} phaseState - Current phase state
 * @param {Fighter} fighter1 - First fighter
 * @param {Fighter} fighter2 - Second fighter
 * @param {number} totalTurnsElapsed - Total turns elapsed
 * @param {Function} updatePhaseStats - Function to update phase stats
 * 
 * @returns {boolean} True if transition occurred
 * 
 * @private
 * @since 2.0.0
 */
function processMidTransition(phaseState, fighter1, fighter2, totalTurnsElapsed, updatePhaseStats) {
    /** @type {number} */
    let latePhaseTriggers = 0;

    // Calculate deltas from the start of the current (MID) phase
    /** @type {number} */
    const hpDeltaF1 = (phaseState.currentPhaseFighterStats.f1.hp || 0) - (fighter1.hp || 0);
    /** @type {number} */
    const hpDeltaF2 = (phaseState.currentPhaseFighterStats.f2.hp || 0) - (fighter2.hp || 0);
    /** @type {number} */
    const momentumDeltaF1 = Number(fighter1.momentum || 0) - Number(phaseState.currentPhaseFighterStats.f1.momentum || 0);
    /** @type {number} */
    const momentumDeltaF2 = Number(fighter2.momentum || 0) - Number(phaseState.currentPhaseFighterStats.f2.momentum || 0);

    // Evaluate transition conditions
    if ((fighter1.hp || 0) <= 40 || (fighter2.hp || 0) <= 40) latePhaseTriggers++;
    if (Math.abs(Number(fighter1.momentum || 0)) >= 4 || Math.abs(Number(fighter2.momentum || 0)) >= 4) latePhaseTriggers++;
    if (hpDeltaF1 >= 25 || hpDeltaF2 >= 25) latePhaseTriggers++;
    if (momentumDeltaF1 >= 4 || momentumDeltaF2 >= 4) latePhaseTriggers++;
    if (Math.abs((fighter1.hp || 0) - (fighter2.hp || 0)) >= 20) latePhaseTriggers++;
    if (Math.abs(Number(fighter1.momentum || 0) - Number(fighter2.momentum || 0)) >= 6) latePhaseTriggers++;

    // Mental state and finisher triggers
    const mentalStates = ['shaken', 'broken'];
    if (mentalStates.includes(fighter1.mentalState?.level) || mentalStates.includes(fighter2.mentalState?.level)) {
        latePhaseTriggers++;
    }

    /** @type {number} */
    const finisherCount = (fighter1.moveHistory?.filter(m => m.type === 'Finisher').length || 0) + 
                         (fighter2.moveHistory?.filter(m => m.type === 'Finisher').length || 0);
    if (finisherCount >= 1) latePhaseTriggers++;

    // Force progression if minimum conditions met
    if (phaseState.turnInCurrentPhase >= MIN_MID_TURNS && latePhaseTriggers === 0) latePhaseTriggers++;

    if (latePhaseTriggers >= 1 || phaseState.turnInCurrentPhase >= MAX_MID_TURNS) {
        phaseState.phaseSummaryLog.push({ 
            phase: BATTLE_PHASES.MID, 
            turns: phaseState.turnInCurrentPhase 
        });

        phaseState.currentPhase = BATTLE_PHASES.LATE;
        phaseState.turnInCurrentPhase = 0;
        updatePhaseStats();
        phaseState.phaseLog.push(
            `Transitioned to ${BATTLE_PHASES.LATE} Phase on turn ${totalTurnsElapsed + 1}. Triggers: ${latePhaseTriggers} (or max turns for phase).`
        );
        return true;
    }
    return false;
}

// ============================================================================
// ENHANCED PHASE VALIDATION
// ============================================================================

/**
 * Validates a phase state object for consistency and required properties
 * 
 * @param {PhaseState} phaseState - Phase state to validate
 * 
 * @returns {boolean} True if valid
 * 
 * @throws {TypeError} When phaseState is not an object
 * @throws {Error} When required properties are missing or invalid
 * 
 * @since 2.0.0
 * @public
 */
export function validatePhaseState(phaseState) {
    if (!phaseState || typeof phaseState !== 'object') {
        throw new TypeError('validatePhaseState: phaseState must be an object');
    }

    if (typeof phaseState.currentPhase !== 'string' || !VALID_PHASES.includes(phaseState.currentPhase)) {
        throw new Error(`validatePhaseState: currentPhase must be one of: ${VALID_PHASES.join(', ')}`);
    }

    if (typeof phaseState.turnInCurrentPhase !== 'number' || phaseState.turnInCurrentPhase < 0) {
        throw new Error('validatePhaseState: turnInCurrentPhase must be a non-negative number');
    }

    if (typeof phaseState.pokingDuration !== 'number' || 
        phaseState.pokingDuration < MIN_POKING_DURATION || 
        phaseState.pokingDuration > MAX_POKING_DURATION) {
        throw new Error(`validatePhaseState: pokingDuration must be between ${MIN_POKING_DURATION} and ${MAX_POKING_DURATION}`);
    }

    if (!Array.isArray(phaseState.phaseLog)) {
        throw new Error('validatePhaseState: phaseLog must be an array');
    }

    return true;
}

/**
 * Gets transition requirements for a specific phase
 * 
 * @param {string} fromPhase - Current phase
 * @param {string} toPhase - Target phase
 * 
 * @returns {Object} Requirements for transition
 * 
 * @throws {TypeError} When phases are not strings
 * @throws {Error} When phases are invalid
 * 
 * @since 2.0.0
 * @public
 */
export function getPhaseTransitionRequirements(fromPhase, toPhase) {
    if (typeof fromPhase !== 'string' || !VALID_PHASES.includes(fromPhase)) {
        throw new Error(`getPhaseTransitionRequirements: fromPhase must be one of: ${VALID_PHASES.join(', ')}`);
    }

    if (typeof toPhase !== 'string' || !VALID_PHASES.includes(toPhase)) {
        throw new Error(`getPhaseTransitionRequirements: toPhase must be one of: ${VALID_PHASES.join(', ')}`);
    }

    /** @type {Object<string, any>} */
    const requirements = {
        minTurns: 0,
        maxTurns: Infinity,
        healthThreshold: null,
        energyThreshold: null,
        conditions: []
    };

    // Define transition requirements
    switch (`${fromPhase}_to_${toPhase}`) {
        case `${BATTLE_PHASES.PRE_BANTER}_to_${BATTLE_PHASES.POKING}`:
            requirements.minTurns = 1;
            requirements.conditions = ['banter_complete'];
            break;

        case `${BATTLE_PHASES.POKING}_to_${BATTLE_PHASES.EARLY}`:
            requirements.minTurns = 1;
            requirements.conditions = ['poking_duration_complete', 'first_damage_dealt'];
            break;

        case `${BATTLE_PHASES.EARLY}_to_${BATTLE_PHASES.MID}`:
            requirements.minTurns = 3;
            requirements.healthThreshold = 70;
            requirements.conditions = ['significant_damage_dealt'];
            break;

        case `${BATTLE_PHASES.MID}_to_${BATTLE_PHASES.LATE}`:
            requirements.minTurns = 2;
            requirements.healthThreshold = 40;
            requirements.conditions = ['critical_health_reached'];
            break;

        default:
            throw new Error(`getPhaseTransitionRequirements: Invalid transition from ${fromPhase} to ${toPhase}`);
    }

    return requirements;
}