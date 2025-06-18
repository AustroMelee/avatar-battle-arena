/**
 * @fileoverview Environment Narrative Generator
 * @description Handles environmental damage events, impact descriptions, and location-based storytelling.
 * @version 1.0
 */

'use strict';

import { locations } from '../locations.js';
import { EFFECT_TYPES } from '../data_mechanics_definitions.js';
import { getRandomElementSeeded } from '../utils_seeded_random.js';
import { generateLogEvent } from '../utils_log_event.js';

/**
 * @constant {object} ENVIRONMENTAL_IMPACT_SEVERITY
 * @description Maps narrative severity labels to numerical values for comparison.
 * Higher numbers indicate greater severity.
 */
const ENVIRONMENTAL_IMPACT_SEVERITY = {
    'subtle': 1,
    'minor': 2,
    'moderate': 3,
    'significant': 4,
    'widespread': 5,
    'critical': 6,
};

/**
 * Retrieves a descriptive line about the environmental impact of an action.
 * @param {string} locationId - The ID of the current battle location.
 * @param {object} environmentState - The current state of the environment.
 * @param {boolean} [isCrit=false] - Whether the triggering action was a critical hit.
 * @returns {string|null} A descriptive phrase or null if none is suitable.
 */
export function getEnvironmentImpactLine(locationId, environmentState, isCrit = false) {
    const loc = locations[locationId];
    if (!loc) {
        console.error(`getEnvironmentImpactLine: Location with ID "${locationId}" not found.`);
        return null;
    }

    const highestImpactSeverityInPhase = ENVIRONMENTAL_IMPACT_SEVERITY[environmentState.highestImpactLevelThisPhase] || 0;
    const usedLinesInPhase = environmentState.environmentalImpactsThisPhase.map(e => e.line);

    let candidatePools = [];

    // Build pools from highest severity to lowest
    if (isCrit && loc.envImpactCritical) candidatePools.push({ pool: loc.envImpactCritical, severity: ENVIRONMENTAL_IMPACT_SEVERITY.critical });
    if (loc.envImpactLate) candidatePools.push({ pool: loc.envImpactLate, severity: ENVIRONMENTAL_IMPACT_SEVERITY.significant });
    if (loc.envImpactMid) candidatePools.push({ pool: loc.envImpactMid, severity: ENVIRONMENTAL_IMPACT_SEVERITY.moderate });
    if (loc.envImpactInitial) candidatePools.push({ pool: loc.envImpactInitial, severity: ENVIRONMENTAL_IMPACT_SEVERITY.minor });

    // Find the best new line to use
    for (const poolInfo of candidatePools) {
        // Only use pools that represent an escalation or maintenance of the current impact level
        if (poolInfo.severity >= highestImpactSeverityInPhase) {
            const availableLines = poolInfo.pool.filter(line => !usedLinesInPhase.includes(line));
            if (availableLines.length > 0) {
                return getRandomElementSeeded(availableLines);
            }
        }
    }
    
    // Fallback: If no *new* lines are available at the current or higher severity,
    // allow repeating a line from the highest severity pool achieved this phase.
    const highestSeverityPool = candidatePools.find(p => p.severity === highestImpactSeverityInPhase);
    if (highestSeverityPool && highestSeverityPool.pool.length > 0) {
        console.debug("No new environmental line found, reusing a previous-tier line.");
        return getRandomElementSeeded(highestSeverityPool.pool);
    }

    console.debug("No suitable environmental impact line found for this action.");
    return null;
}

/**
 * Generates a narrative event for collateral damage to the environment.
 * @param {object} move - The move that caused the damage.
 * @param {object} actor - The attacker.
 * @param {object} result - The result object containing effects.
 * @param {object} environmentState - The current environmental state tracker.
 * @param {object} battleState - The full battle state.
 * @returns {object|null} A log event for collateral damage, or null.
 */
export function generateCollateralDamageEvent(move, actor, result, environmentState, battleState) {
    const envDamageEffect = result.effects?.find(effect => effect.type === EFFECT_TYPES.ENVIRONMENTAL_DAMAGE);
    if (!envDamageEffect || envDamageEffect.value <= 0) {
        return null; // No environmental damage occurred.
    }

    let currentImpactLevelKey = 'subtle';
    if (envDamageEffect.value > 80) currentImpactLevelKey = 'critical';
    else if (envDamageEffect.value > 50) currentImpactLevelKey = 'widespread';
    else if (envDamageEffect.value > 20) currentImpactLevelKey = 'significant';
    else if (envDamageEffect.value > 0) currentImpactLevelKey = 'minor';

    const currentSeverity = ENVIRONMENTAL_IMPACT_SEVERITY[currentImpactLevelKey];
    const highestSeverityThisPhase = ENVIRONMENTAL_IMPACT_SEVERITY[environmentState.highestImpactLevelThisPhase] || 0;

    if (currentSeverity > highestSeverityThisPhase) {
        environmentState.highestImpactLevelThisPhase = currentImpactLevelKey;
    }

    const isCrit = result.effectiveness.label === 'Critical';
    const collateralPhrase = getEnvironmentImpactLine(battleState.locationId, environmentState, isCrit);

    if (!collateralPhrase) {
        console.debug("generateCollateralDamageEvent: No collateral phrase generated.");
        return null;
    }

    // Record the impact for summarization later
    environmentState.environmentalImpactsThisPhase.push({
        line: collateralPhrase,
        severity: currentImpactLevelKey,
        turn: battleState.turn
    });

    const htmlContent = `<p class="environmental-impact-text">${collateralPhrase}</p>`;

    return generateLogEvent(battleState, {
        type: 'collateral_damage_event',
        actorId: actor.id,
        characterName: actor.name,
        text: collateralPhrase,
        html_content: htmlContent,
        isEnvironmental: true,
        impactAmount: envDamageEffect.value,
        locationId: battleState.locationId
    });
}

/**
 * Generates a summarized environmental impact event at the end of a phase.
 * @param {object} battleState - The current battle state.
 * @param {object} environmentState - The environment state tracker.
 * @returns {object|null} A summary event or null if no impact occurred.
 */
export function generateEnvironmentalSummaryEvent(battleState, environmentState) {
    if (!environmentState.environmentalImpactsThisPhase || environmentState.environmentalImpactsThisPhase.length === 0) {
        return null;
    }

    const highestImpactLevel = environmentState.highestImpactLevelThisPhase;
    let headerPhrase = "The environment bears the marks of the conflict."; // Default

    switch (highestImpactLevel) {
        case 'critical':
            headerPhrase = "The very ground is rent by the battle's fury.";
            break;
        case 'widespread':
            headerPhrase = "Widespread destruction scars the landscape.";
            break;
        case 'significant':
            headerPhrase = "The environment visibly reels from the clash.";
            break;
        case 'moderate':
            headerPhrase = "The arena bears moderate new scars.";
            break;
        case 'minor':
        case 'subtle':
            headerPhrase = "The environment shows subtle signs of the fight.";
            break;
    }

    // Select a distinct, representative impact line from the phase
    const relevantImpacts = environmentState.environmentalImpactsThisPhase.filter(e => e.severity === highestImpactLevel);
    const distinctImpact = relevantImpacts.length > 0 ?
        getRandomElementSeeded(relevantImpacts.map(e => e.line)) :
        getRandomElementSeeded(environmentState.environmentalImpactsThisPhase.map(e => e.line));

    const htmlContent = `
        <div class="environmental-summary">
            <p class="environmental-summary-header">${headerPhrase}</p>
            ${distinctImpact ? `<p class="environmental-summary-detail">Notably, ${distinctImpact.charAt(0).toLowerCase() + distinctImpact.slice(1)}</p>` : ''}
        </div>`;

    return generateLogEvent(battleState, {
        type: 'environmental_summary_event',
        text: `${headerPhrase} ${distinctImpact || ''}`,
        html_content: htmlContent,
        isEnvironmental: true,
        summaryLevel: highestImpactLevel
    });
} 