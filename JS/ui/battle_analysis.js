/**
 * @fileoverview Battle Results Analysis Module
 * @description Pure data analysis functions for battle results with no DOM manipulation.
 * Computes battle analysis, winner status, scores, environment outcome as pure data.
 * @version 1.0
 */

'use strict';

import { ESCALATION_STATES } from '../engine_escalation.js';
import { locationConditions } from '../location-battle-conditions.js';

/**
 * Analyzes battle results and returns structured data
 * @param {Object} battleResult - Raw battle result data
 * @returns {Object} Analyzed battle data
 */
export function analyzeBattleResults(battleResult) {
    if (!battleResult?.finalState?.fighter1 || !battleResult?.finalState?.fighter2) {
        return {
            error: 'Analysis data incomplete',
            isValid: false
        };
    }

    const { finalState, winnerId, isDraw, environmentState, locationId } = battleResult;
    const { fighter1, fighter2 } = finalState;

    return {
        isValid: true,
        winner: analyzeBattleWinner(fighter1, fighter2, winnerId, isDraw),
        fighters: {
            fighter1: analyzeFighterStatus(fighter1, winnerId, isDraw),
            fighter2: analyzeFighterStatus(fighter2, winnerId, isDraw)
        },
        environment: analyzeEnvironmentalImpact(environmentState, locationId),
        summary: generateBattleSummary(fighter1, fighter2, winnerId, isDraw)
    };
}

/**
 * Analyzes the battle winner and outcome
 * @private
 */
function analyzeBattleWinner(fighter1, fighter2, winnerId, isDraw) {
    if (isDraw) {
        return {
            outcome: 'draw',
            message: 'The fighters were too evenly matched for a decisive outcome.',
            winnerId: null,
            winner: null
        };
    }

    if (winnerId) {
        const winner = winnerId === fighter1.id ? fighter1 : fighter2;
        return {
            outcome: 'victory',
            message: winner.summary || `${winner.name} demonstrated superior skill.`,
            winnerId,
            winner
        };
    }

    return {
        outcome: 'unknown',
        message: 'Battle outcome unclear.',
        winnerId: null,
        winner: null
    };
}

/**
 * Analyzes individual fighter status
 * @private
 */
function analyzeFighterStatus(fighter, winnerId, isDraw) {
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
function generateBattleSummary(fighter1, fighter2, winnerId, isDraw) {
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