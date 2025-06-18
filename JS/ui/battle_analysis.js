/**
 * @fileoverview Avatar Battle Arena - Battle Results Analysis Module
 * @description Pure data analysis functions for battle results with no DOM manipulation.
 * Computes battle analysis, winner status, scores, environment outcome as pure data.
 * @version 2.0.0
 */

'use strict';

//# sourceURL=battle_analysis.js

// ============================================================================
// TYPE IMPORTS
// ============================================================================

/**
 * @typedef {import('../types.js').Fighter} Fighter
 * @typedef {import('../types.js').BattleResult} BattleResult
 * @typedef {import('../types.js').BattleState} BattleState
 * @typedef {import('../types.js').EnvironmentState} EnvironmentState
 */

/**
 * @typedef {Object} BattleAnalysisResult
 * @description Complete analysis of battle results
 * @property {boolean} isValid - Whether analysis is valid
 * @property {string} [error] - Error message if analysis failed
 * @property {WinnerAnalysis} [winner] - Winner analysis data
 * @property {FighterAnalysisSet} [fighters] - Fighter analysis data
 * @property {EnvironmentAnalysis} [environment] - Environment analysis
 * @property {BattleSummary} [summary] - Battle summary data
 * @property {Object} [metadata] - Additional analysis metadata
 */

/**
 * @typedef {Object} WinnerAnalysis
 * @description Analysis of battle winner
 * @property {string | null} winnerId - Winner fighter ID
 * @property {string | null} loserId - Loser fighter ID
 * @property {boolean} isDraw - Whether battle was a draw
 * @property {string} winCondition - How the battle was won
 * @property {number} [marginOfVictory] - Victory margin (0-1)
 * @property {string} description - Human-readable victory description
 */

/**
 * @typedef {Object} FighterAnalysisSet
 * @description Analysis for both fighters
 * @property {FighterAnalysis} fighter1 - First fighter analysis
 * @property {FighterAnalysis} fighter2 - Second fighter analysis
 */

/**
 * @typedef {Object} FighterAnalysis
 * @description Individual fighter analysis
 * @property {string} id - Fighter ID
 * @property {string} name - Fighter name
 * @property {string} status - Final status (winner, loser, draw)
 * @property {FighterStats} finalStats - Final battle statistics
 * @property {PerformanceMetrics} performance - Performance analysis
 * @property {string} condition - Final condition description
 * @property {boolean} wasVictorious - Whether fighter won
 */

/**
 * @typedef {Object} FighterStats
 * @description Fighter statistical data
 * @property {number} hp - Final health points (0-100)
 * @property {number} energy - Final energy points (0-100)
 * @property {number} incapacitationScore - Final incapacitation score (0-100)
 * @property {number} momentum - Final momentum value
 * @property {string} escalationState - Final escalation state
 */

/**
 * @typedef {Object} PerformanceMetrics
 * @description Fighter performance metrics
 * @property {number} damageDealt - Total damage dealt
 * @property {number} damageReceived - Total damage received
 * @property {number} movesExecuted - Number of moves executed
 * @property {number} accuracy - Overall accuracy percentage (0-100)
 * @property {number} effectiveness - Overall effectiveness rating (0-100)
 */

/**
 * @typedef {Object} EnvironmentAnalysis
 * @description Analysis of environmental impact
 * @property {string} locationId - Battle location ID
 * @property {string} locationName - Human-readable location name
 * @property {string[]} significantEffects - Major environmental effects
 * @property {number} environmentalImpact - Overall impact rating (0-100)
 * @property {string} summary - Environmental impact summary
 */

/**
 * @typedef {Object} BattleSummary
 * @description High-level battle summary
 * @property {number} totalTurns - Number of turns in battle
 * @property {number} totalEvents - Total events generated
 * @property {string} battlePhase - Final battle phase
 * @property {string} endCondition - How battle ended
 * @property {number} battleIntensity - Intensity rating (0-100)
 * @property {string} narrativeSummary - Brief narrative description
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { ESCALATION_STATES } from '../engine_escalation.js';
import { locationConditions } from '../location-battle-conditions.js';

// ============================================================================
// CONSTANTS
// ============================================================================

/** @type {string[]} */
const VALID_WIN_CONDITIONS = [
    'incapacitation',
    'surrender',
    'timeout',
    'environmental',
    'technical',
    'stalemate'
];

/** @type {string[]} */
const VALID_FIGHTER_STATUSES = [
    'winner',
    'loser', 
    'draw',
    'forfeit',
    'incapacitated'
];

/** @type {string[]} */
const VALID_END_CONDITIONS = [
    'victory',
    'defeat',
    'stalemate',
    'timeout',
    'error',
    'forfeit'
];

/** @type {Object<string, string>} */
const STATUS_DESCRIPTIONS = {
    'winner': 'Victorious',
    'loser': 'Defeated',
    'draw': 'Draw',
    'forfeit': 'Forfeited',
    'incapacitated': 'Incapacitated'
};

/** @type {number} */
const MIN_HEALTH = 0;

/** @type {number} */
const MAX_HEALTH = 100;

/** @type {number} */
const INCAPACITATION_THRESHOLD = 100;

// ============================================================================
// CORE ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Analyzes battle results and returns structured data
 * 
 * @param {BattleResult} battleResult - Raw battle result data
 * @param {Object} [options={}] - Analysis options
 * 
 * @returns {BattleAnalysisResult} Analyzed battle data
 * 
 * @throws {TypeError} When battleResult is not an object
 * @throws {Error} When required battle data is missing
 * 
 * @example
 * // Analyze battle results
 * const analysis = analyzeBattleResults(battleResult, {
 *   includePerformanceMetrics: true,
 *   includeEnvironmentalAnalysis: true
 * });
 * 
 * if (analysis.isValid) {
 *   console.log(`Winner: ${analysis.winner.winnerId || 'Draw'}`);
 *   console.log(`Battle lasted ${analysis.summary.totalTurns} turns`);
 * }
 * 
 * @since 2.0.0
 * @public
 */
export function analyzeBattleResults(battleResult, options = {}) {
    // Input validation
    if (!battleResult || typeof battleResult !== 'object') {
        throw new TypeError('analyzeBattleResults: battleResult must be an object');
    }

    if (typeof options !== 'object' || options === null) {
        throw new TypeError('analyzeBattleResults: options must be an object');
    }

    try {
        // Validate required data structure
        validateBattleResultStructure(battleResult);

        /** @type {BattleState} */
        const finalState = battleResult.finalState;
        
        /** @type {Fighter} */
        const fighter1 = finalState.fighter1;
        
        /** @type {Fighter} */
        const fighter2 = finalState.fighter2;

        // Perform analysis components
        /** @type {WinnerAnalysis} */
        const winnerAnalysis = analyzeBattleWinner(
            fighter1, 
            fighter2, 
            battleResult.winnerId, 
            battleResult.isDraw,
            battleResult
        );

        /** @type {FighterAnalysisSet} */
        const fighterAnalysis = {
            fighter1: analyzeFighterStatus(fighter1, battleResult.winnerId, battleResult.isDraw, battleResult),
            fighter2: analyzeFighterStatus(fighter2, battleResult.winnerId, battleResult.isDraw, battleResult)
        };

        /** @type {EnvironmentAnalysis} */
        const environmentAnalysis = analyzeEnvironmentalImpact(
            finalState.environment, 
            battleResult.locationId
        );

        /** @type {BattleSummary} */
        const battleSummary = generateBattleSummary(
            fighter1, 
            fighter2, 
            battleResult.winnerId, 
            battleResult.isDraw,
            battleResult
        );

        return {
            isValid: true,
            winner: winnerAnalysis,
            fighters: fighterAnalysis,
            environment: environmentAnalysis,
            summary: battleSummary,
            metadata: {
                analysisTimestamp: new Date().toISOString(),
                analysisVersion: '2.0.0',
                optionsUsed: { ...options },
                battleId: battleResult.metadata?.battleId || 'unknown'
            }
        };

    } catch (error) {
        console.error('[Battle Analysis] Analysis failed:', error);
        
        return {
            isValid: false,
            error: `Analysis failed: ${error.message}`,
            metadata: {
                analysisTimestamp: new Date().toISOString(),
                failureReason: error.message
            }
        };
    }
}

/**
 * Validates the structure of a battle result object
 * 
 * @param {BattleResult} battleResult - Battle result to validate
 * 
 * @throws {Error} When required properties are missing or invalid
 * 
 * @private
 * @since 2.0.0
 */
function validateBattleResultStructure(battleResult) {
    if (!battleResult.finalState) {
        throw new Error('validateBattleResultStructure: battleResult.finalState is required');
    }

    if (!battleResult.finalState.fighter1 || !battleResult.finalState.fighter2) {
        throw new Error('validateBattleResultStructure: Both fighters must be present in finalState');
    }

    if (typeof battleResult.winnerId !== 'string' && battleResult.winnerId !== null) {
        throw new Error('validateBattleResultStructure: winnerId must be string or null');
    }

    if (typeof battleResult.isDraw !== 'boolean') {
        throw new Error('validateBattleResultStructure: isDraw must be boolean');
    }

    if (typeof battleResult.turnCount !== 'number' || battleResult.turnCount < 0) {
        throw new Error('validateBattleResultStructure: turnCount must be non-negative number');
    }
}

/**
 * Analyzes the battle winner and victory conditions
 * 
 * @param {Fighter} fighter1 - First fighter
 * @param {Fighter} fighter2 - Second fighter
 * @param {string | null} winnerId - Winner ID
 * @param {boolean} isDraw - Whether battle was a draw
 * @param {BattleResult} battleResult - Complete battle result
 * 
 * @returns {WinnerAnalysis} Winner analysis data
 * 
 * @throws {TypeError} When fighter parameters are invalid
 * 
 * @private
 * @since 2.0.0
 */
function analyzeBattleWinner(fighter1, fighter2, winnerId, isDraw, battleResult) {
    // Input validation
    if (!fighter1 || typeof fighter1 !== 'object' || !fighter1.id) {
        throw new TypeError('analyzeBattleWinner: fighter1 must be valid fighter object');
    }
    
    if (!fighter2 || typeof fighter2 !== 'object' || !fighter2.id) {
        throw new TypeError('analyzeBattleWinner: fighter2 must be valid fighter object');
    }

    if (typeof isDraw !== 'boolean') {
        throw new TypeError('analyzeBattleWinner: isDraw must be boolean');
    }

    /** @type {string | null} */
    const loserId = isDraw ? null : (winnerId === fighter1.id ? fighter2.id : fighter1.id);

    /** @type {string} */
    const winCondition = determineWinCondition(fighter1, fighter2, winnerId, isDraw, battleResult);

    /** @type {number | undefined} */
    const marginOfVictory = calculateMarginOfVictory(fighter1, fighter2, winnerId, isDraw);

    /** @type {string} */
    const description = generateWinnerDescription(winnerId, loserId, isDraw, winCondition, marginOfVictory);

    return {
        winnerId,
        loserId,
        isDraw,
        winCondition,
        marginOfVictory,
        description
    };
}

/**
 * Determines how the battle was won
 * 
 * @param {Fighter} fighter1 - First fighter
 * @param {Fighter} fighter2 - Second fighter
 * @param {string | null} winnerId - Winner ID
 * @param {boolean} isDraw - Whether battle was a draw
 * @param {BattleResult} battleResult - Battle result
 * 
 * @returns {string} Win condition type
 * 
 * @private
 * @since 2.0.0
 */
function determineWinCondition(fighter1, fighter2, winnerId, isDraw, battleResult) {
    if (isDraw) {
        if (battleResult.turnCount >= (battleResult.metadata?.maxTurns || 100)) {
            return 'timeout';
        }
        return 'stalemate';
    }

    /** @type {Fighter} */
    const winner = winnerId === fighter1.id ? fighter1 : fighter2;
    
    /** @type {Fighter} */
    const loser = winnerId === fighter1.id ? fighter2 : fighter1;

    // Check incapacitation
    if (loser.incapacitationScore >= INCAPACITATION_THRESHOLD) {
        return 'incapacitation';
    }

    // Check health depletion
    if (loser.hp <= MIN_HEALTH) {
        return 'incapacitation';
    }

    // Check escalation states
    if (loser.escalationState === 'Terminal Collapse') {
        return 'incapacitation';
    }

    // Default to technical victory
    return 'technical';
}

/**
 * Calculates the margin of victory
 * 
 * @param {Fighter} fighter1 - First fighter
 * @param {Fighter} fighter2 - Second fighter
 * @param {string | null} winnerId - Winner ID
 * @param {boolean} isDraw - Whether battle was a draw
 * 
 * @returns {number | undefined} Victory margin (0-1) or undefined for draws
 * 
 * @private
 * @since 2.0.0
 */
function calculateMarginOfVictory(fighter1, fighter2, winnerId, isDraw) {
    if (isDraw || !winnerId) {
        return undefined;
    }

    /** @type {Fighter} */
    const winner = winnerId === fighter1.id ? fighter1 : fighter2;
    
    /** @type {Fighter} */
    const loser = winnerId === fighter1.id ? fighter2 : fighter1;

    // Calculate based on remaining health and energy
    /** @type {number} */
    const winnerScore = (winner.hp || 0) + (winner.energy || 0) / 2;
    
    /** @type {number} */
    const loserScore = (loser.hp || 0) + (loser.energy || 0) / 2;
    
    /** @type {number} */
    const totalScore = winnerScore + loserScore;

    if (totalScore === 0) {
        return 0.5; // Neutral margin
    }

    return Math.max(0, Math.min(1, winnerScore / totalScore - 0.5) * 2);
}

/**
 * Generates a human-readable winner description
 * 
 * @param {string | null} winnerId - Winner ID
 * @param {string | null} loserId - Loser ID
 * @param {boolean} isDraw - Whether battle was a draw
 * @param {string} winCondition - Win condition
 * @param {number | undefined} marginOfVictory - Victory margin
 * 
 * @returns {string} Winner description
 * 
 * @private
 * @since 2.0.0
 */
function generateWinnerDescription(winnerId, loserId, isDraw, winCondition, marginOfVictory) {
    if (isDraw) {
        return winCondition === 'timeout' ? 
            'Battle ended in a draw after reaching maximum turns' :
            'Battle ended in a stalemate with no clear victor';
    }

    /** @type {string} */
    let description = `${winnerId} defeated ${loserId}`;

    switch (winCondition) {
        case 'incapacitation':
            description += ' by incapacitation';
            break;
        case 'technical':
            description += ' by technical victory';
            break;
        case 'environmental':
            description += ' due to environmental factors';
            break;
        default:
            description += ` by ${winCondition}`;
    }

    if (marginOfVictory !== undefined) {
        if (marginOfVictory > 0.8) {
            description += ' (decisive victory)';
        } else if (marginOfVictory > 0.6) {
            description += ' (clear victory)';
        } else if (marginOfVictory > 0.4) {
            description += ' (narrow victory)';
        } else {
            description += ' (close victory)';
        }
    }

    return description;
}

/**
 * Analyzes individual fighter status
 * @private
 */
function analyzeFighterStatus(fighter, winnerId, isDraw, battleResult) {
    const status = isDraw ? 'DRAW' : (fighter.id === winnerId ? 'VICTORIOUS' : 'DEFEATED');
    const statusClass = isDraw ? 'modifier-neutral' : (fighter.id === winnerId ? 'modifier-plus' : 'modifier-minus');
    
    let escalationClass = 'escalation-normal';
    if (fighter.escalationState) {
        switch (fighter.escalationState) {
            case ESCALATION_STATES.PRESSURED: 
                escalationClass = 'escalation-pressured'; 
                break;
            case ESCALATION_STATES.SEVERELY_INCAPACITATED: 
                escalationClass = 'escalation-severe'; 
                break;
            case ESCALATION_STATES.TERMINAL_COLLAPSE: 
                escalationClass = 'escalation-terminal'; 
                break;
        }
    }

    return {
        name: fighter.name,
        status,
        statusClass,
        stats: {
            health: {
                value: Math.round(fighter.hp),
                display: `${Math.round(fighter.hp)} / 100 HP`
            },
            energy: {
                value: Math.round(fighter.energy),
                display: `${Math.round(fighter.energy)} / 100`
            },
            mentalState: {
                value: fighter.mentalState.level,
                display: fighter.mentalState.level.toUpperCase()
            },
            momentum: {
                value: fighter.momentum,
                display: isNaN(fighter.momentum) ? 'N/A' : fighter.momentum
            },
            incapacitationScore: {
                value: fighter.incapacitationScore,
                display: fighter.incapacitationScore !== undefined ? fighter.incapacitationScore.toFixed(1) : 'N/A'
            },
            escalationState: {
                value: fighter.escalationState,
                display: fighter.escalationState || 'N/A',
                class: escalationClass
            }
        }
    };
}

/**
 * Analyzes environmental impact
 * @private
 */
function analyzeEnvironmentalImpact(environmentState, locationId) {
    const currentLocData = locationConditions[locationId];
    
    if (!environmentState || !currentLocData?.damageThresholds) {
        return {
            damage: 'N/A',
            damageClass: '',
            impacts: ['No specific impact data.']
        };
    }

    const damageLevel = environmentState.damageLevel.toFixed(0);
    let damageClass = '';
    
    if (environmentState.damageLevel >= currentLocData.damageThresholds.catastrophic) {
        damageClass = 'catastrophic-damage';
    } else if (environmentState.damageLevel >= currentLocData.damageThresholds.severe) {
        damageClass = 'high-damage';
    } else if (environmentState.damageLevel >= currentLocData.damageThresholds.moderate) {
        damageClass = 'medium-damage';
    } else if (environmentState.damageLevel >= currentLocData.damageThresholds.minor) {
        damageClass = 'low-damage';
    }

    const impacts = [];
    if (environmentState.specificImpacts?.size > 0) {
        environmentState.specificImpacts.forEach(impact => {
            if (typeof impact === 'string') {
                impacts.push(impact);
            }
        });
    } else {
        impacts.push('The environment sustained minimal noticeable damage.');
    }

    return {
        damage: `Environmental Damage: ${damageLevel}%`,
        damageClass,
        impacts
    };
}

/**
 * Generates battle summary text
 * @private
 */
function generateBattleSummary(fighter1, fighter2, winnerId, isDraw, battleResult) {
    if (isDraw) {
        return `${fighter1.name} and ${fighter2.name} fought to a draw.`;
    }
    
    if (winnerId) {
        const winner = winnerId === fighter1.id ? fighter1 : fighter2;
        const loser = winnerId === fighter1.id ? fighter2 : fighter1;
        return `${winner.name} defeated ${loser.name} in battle.`;
    }
    
    return `Battle between ${fighter1.name} and ${fighter2.name} concluded.`;
} 