/**
 * @fileoverview Curbstomp Narrative Generator
 * @description Only for generating narrative/logging events related to curbstomp triggers, dice rolls, survivor miracles, etc.
 * @version 1.0
 */

'use strict';

import { generateLogEvent } from '../utils_log_event.js';

/**
 * Generates narrative for rule trigger events
 * @param {Object} battleState - Current battle state
 * @param {Object} rule - Rule that triggered
 * @param {boolean} didTrigger - Whether the rule actually triggered
 * @param {number} rollResult - Dice roll result
 * @returns {Object} Log event for the rule trigger
 */
export function generateRuleTriggerNarrative(battleState, rule, didTrigger, rollResult) {
    return generateLogEvent(battleState, {
        type: "dice_roll",
        rollType: "curbstompRuleTrigger",
        ruleId: rule.id,
        result: rollResult,
        threshold: rule.triggerChance || 1.0,
        outcome: didTrigger ? "triggered" : "not triggered"
    });
}

/**
 * Generates narrative for miraculous survival events
 * @param {Object} battleState - Current battle state
 * @param {Object} character - Character who survived
 * @param {Object} rule - Rule they survived
 * @returns {Object} Log event for miraculous survival
 */
export function generateSurvivalMiracleNarrative(battleState, character, rule) {
    return generateLogEvent(battleState, {
        type: 'narrative_event',
        text: `By some miracle, ${character.name} survives what should have been a fatal blow!`,
        html_content: `<p class="narrative-survivor">By some miracle, ${character.name} survives what should have been a fatal blow!</p>`,
        isMajorEvent: true,
        characterId: character.id,
        ruleId: rule.id
    });
}

/**
 * Generates narrative for curbstomp detection events
 * @param {Object} battleState - Current battle state
 * @param {Object} attacker - Attacking character
 * @param {Object} defender - Defending character
 * @param {Object} metrics - Curbstomp detection metrics
 * @returns {Object} Log event for curbstomp detection
 */
export function generateCurbstompDetectionNarrative(battleState, attacker, defender, metrics) {
    return generateLogEvent(battleState, {
        type: 'curbstomp_event',
        attackerId: attacker.id,
        defenderId: defender.id,
        text: `${attacker.name} has completely overwhelmed ${defender.name}!`,
        html_content: `<p class="narrative-action char-${attacker.id}">${attacker.name} has completely overwhelmed ${defender.name}!</p>`,
        isMajorEvent: true,
        actualAttackerId: attacker.id,
        debugData: {
            hpRatio: metrics.hpRatio,
            momentumGap: metrics.momentumGap,
            turn: battleState.turn,
            location: battleState.locationId
        }
    });
}

/**
 * Generates narrative for instant win outcomes
 * @param {Object} battleState - Current battle state
 * @param {Object} winner - Winning character
 * @param {Object} loser - Losing character
 * @param {Object} rule - Rule that caused the outcome
 * @returns {Object} Log event for instant win
 */
export function generateInstantWinNarrative(battleState, winner, loser, rule) {
    return generateLogEvent(battleState, {
        type: 'curbstomp_event',
        winnerId: winner.id,
        loserId: loser.id,
        text: `${winner.name} secured a decisive victory over ${loser.name} due to ${rule.description}.`,
        html_content: `<p class="narrative-victory char-${winner.id}">${winner.name} secured a decisive victory over ${loser.name} due to ${rule.description}.</p>`,
        isMajorEvent: true,
        ruleId: rule.id
    });
}

/**
 * Generates narrative for instant loss outcomes
 * @param {Object} battleState - Current battle state
 * @param {Object} loser - Losing character
 * @param {Object} rule - Rule that caused the outcome
 * @returns {Object} Log event for instant loss
 */
export function generateInstantLossNarrative(battleState, loser, rule) {
    return generateLogEvent(battleState, {
        type: 'curbstomp_event',
        loserId: loser.id,
        text: `${loser.name} was decisively defeated due to ${rule.description}.`,
        html_content: `<p class="narrative-defeat char-${loser.id}">${loser.name} was decisively defeated due to ${rule.description}.</p>`,
        isMajorEvent: true,
        ruleId: rule.id
    });
}

/**
 * Generates narrative for environmental kill outcomes
 * @param {Object} battleState - Current battle state
 * @param {Object} victim - Character killed by environment
 * @param {Object} rule - Rule that caused the outcome
 * @returns {Object} Log event for environmental kill
 */
export function generateEnvironmentalKillNarrative(battleState, victim, rule) {
    return generateLogEvent(battleState, {
        type: 'curbstomp_event',
        victimId: victim.id,
        text: `The environment itself proved fatal for ${victim.name}.`,
        html_content: `<p class="narrative-environmental char-${victim.id}">The environment itself proved fatal for ${victim.name}.</p>`,
        isMajorEvent: true,
        ruleId: rule.id
    });
}

/**
 * Generates narrative for buff/advantage outcomes
 * @param {Object} battleState - Current battle state
 * @param {Object} character - Character receiving buff
 * @param {Object} rule - Rule that caused the outcome
 * @param {string} property - Property being modified
 * @param {number} value - Value of the modification
 * @returns {Object} Log event for buff
 */
export function generateBuffNarrative(battleState, character, rule, property, value) {
    const isPositive = value > 0;
    const effectType = isPositive ? 'enhancement' : 'hindrance';
    
    return generateLogEvent(battleState, {
        type: 'narrative_event',
        characterId: character.id,
        text: `${character.name} receives ${effectType} to ${property} from ${rule.description}.`,
        html_content: `<p class="narrative-${effectType} char-${character.id}">${character.name} receives ${effectType} to ${property} from ${rule.description}.</p>`,
        ruleId: rule.id,
        property,
        value
    });
}

/**
 * Generates narrative for momentum/advantage changes
 * @param {Object} battleState - Current battle state
 * @param {Object} character - Character receiving advantage
 * @param {Object} rule - Rule that caused the outcome
 * @param {number} momentumChange - Amount of momentum change
 * @returns {Object} Log event for momentum advantage
 */
export function generateMomentumAdvantageNarrative(battleState, character, rule, momentumChange) {
    const changeDescription = momentumChange > 0 ? 'gains significant momentum' : 'loses momentum';
    
    return generateLogEvent(battleState, {
        type: 'narrative_event',
        characterId: character.id,
        text: `${character.name} ${changeDescription} due to ${rule.description}.`,
        html_content: `<p class="narrative-momentum char-${character.id}">${character.name} ${changeDescription} due to ${rule.description}.</p>`,
        ruleId: rule.id,
        momentumChange
    });
}

/**
 * Generates narrative for external intervention outcomes
 * @param {Object} battleState - Current battle state
 * @param {Object} rule - Rule that caused the intervention
 * @returns {Object} Log event for external intervention
 */
export function generateExternalInterventionNarrative(battleState, rule) {
    return generateLogEvent(battleState, {
        type: 'narrative_event',
        text: 'The fight was interrupted by outside forces, ending in a draw.',
        html_content: '<p class="narrative-intervention">The fight was interrupted by outside forces, ending in a draw.</p>',
        isMajorEvent: true,
        ruleId: rule.id
    });
}

/**
 * Generates AI log entries for curbstomp events
 * @param {Object} character - Character to add log to
 * @param {string} eventType - Type of curbstomp event
 * @param {Object} rule - Rule that triggered
 * @param {Object} details - Additional details for the log
 */
export function addCurbstompAiLog(character, eventType, rule, details = {}) {
    let logMessage = `[Curbstomp - ${eventType}]: `;
    
    switch (eventType) {
        case 'Survival':
            logMessage += `Miraculously survived rule '${rule.id}'.`;
            break;
        case 'Buff':
            logMessage += `Rule '${rule.id}' applied: ${details.property} modified by ${details.value}.`;
            break;
        case 'Debuff':
            logMessage += `Rule '${rule.id}' applied: ${details.property} modified by ${details.value}.`;
            break;
        case 'Advantage':
            logMessage += `Rule '${rule.id}' granted significant momentum boost.`;
            break;
        case 'Overwhelming':
            logMessage += `${details.attackerName} has achieved a decisive advantage over ${character.name}. HP ratio: ${details.hpRatio?.toFixed(3)}, Momentum gap: ${details.momentumGap?.toFixed(1)}`;
            break;
        default:
            logMessage += `Affected by rule '${rule.id}': ${rule.description}`;
    }
    
    character.aiLog.push(logMessage);
}

/**
 * Generates comprehensive narrative description for complex curbstomp scenarios
 * @param {Object} scenario - Scenario details
 * @returns {string} Rich narrative description
 */
export function generateComplexCurbstompNarrative(scenario) {
    const { attacker, defender, rule, outcome, context } = scenario;
    
    let narrative = `In a dramatic turn of events, `;
    
    switch (outcome.type) {
        case 'instant_win':
            narrative += `${attacker.name}'s overwhelming advantage proves decisive against ${defender.name}. `;
            break;
        case 'environmental_kill':
            narrative += `the very battlefield turns against ${defender.name}, sealing their fate. `;
            break;
        case 'external_intervention':
            narrative += `outside forces intervene, bringing an unexpected end to the confrontation. `;
            break;
        default:
            narrative += `the balance of power shifts dramatically. `;
    }
    
    if (context.location) {
        narrative += `The ${context.location} setting plays a crucial role in this outcome.`;
    }
    
    return narrative;
} 