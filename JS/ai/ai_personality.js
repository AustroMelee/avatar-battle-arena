/**
 * @fileoverview AI Personality Management
 * @description Handles personality profiles, adaptation logic, and personality drift based on battle results.
 * Pure personality state management without decision logic.
 * @version 1.0
 */

'use strict';

import { clamp } from '../utils_math.js';
import { getPhaseAIModifiers } from '../engine_battle-phase.js';

/**
 * Default personality traits for AI characters
 */
export const DEFAULT_PERSONALITY_PROFILE = {
    aggression: 0.5,
    patience: 0.5,
    riskTolerance: 0.5,
    opportunism: 0.5,
    creativity: 0.5,
    defensiveBias: 0.5,
    antiRepeater: 0.5,
    signatureMoveBias: {},
    predictability: 0.5
};

/**
 * Safe getter with fallback values for personality traits
 */
function safeGet(obj, path, defaultValue, actorName = 'Unknown Actor') {
    const value = path.split('.').reduce((acc, part) => acc && acc[part], obj);
    if (value === undefined || value === null) {
        return defaultValue;
    }
    return value;
}

/**
 * Adapts an actor's personality based on recent move effectiveness
 * Modifies personality in-place based on success/failure patterns
 */
export function adaptPersonality(actor) {
    if (!actor || !actor.moveHistory || !actor.personalityProfile || !actor.aiLog || actor.moveHistory.length < 2) {
        return;
    }

    const lastTwoResults = actor.moveHistory.slice(-2).map(move => move?.effectiveness || 'Normal');

    if (lastTwoResults.every(r => r === 'Weak')) {
        actor.personalityProfile.creativity = clamp(
            safeGet(actor.personalityProfile, 'creativity', 0.5, actor.name) + 0.15, 
            0, 1.0
        );
        actor.personalityProfile.riskTolerance = clamp(
            safeGet(actor.personalityProfile, 'riskTolerance', 0.5, actor.name) + 0.1, 
            0, 1.0
        );
        actor.aiLog.push("[Personality Drift: Increased Creativity due to failure streak]");
    } else if (lastTwoResults.every(r => r === 'Strong' || r === 'Critical')) {
        actor.personalityProfile.aggression = clamp(
            safeGet(actor.personalityProfile, 'aggression', 0.5, actor.name) + 0.1, 
            0, 1.0
        );
        actor.aiLog.push("[Personality Drift: Increased Aggression due to success streak]");
    }
}

/**
 * Calculates dynamic personality modifiers based on phase and mental state
 * Returns a modified personality profile without mutating the original
 */
export function getDynamicPersonality(actor, currentPhase) {
    if (!actor || !actor.personalityProfile) {
        return { ...DEFAULT_PERSONALITY_PROFILE };
    }

    let dynamicProfile = { ...DEFAULT_PERSONALITY_PROFILE, ...actor.personalityProfile };
    
    // Apply phase-based modifiers
    const phaseMods = getPhaseAIModifiers(currentPhase);
    Object.keys(phaseMods).forEach(key => {
        const traitName = key.replace('Multiplier', '');
        if (dynamicProfile[traitName] !== undefined) {
            dynamicProfile[traitName] = clamp(dynamicProfile[traitName] * phaseMods[key], 0, 1.5);
        }
    });

    // Apply mental state modifiers
    const mentalStateLevel = safeGet(actor.mentalState, 'level', 'stable', actor.name);
    switch (mentalStateLevel) {
        case 'stressed':
            dynamicProfile.patience *= 0.7;
            dynamicProfile.riskTolerance = clamp(dynamicProfile.riskTolerance + 0.15, 0, 1.2);
            break;
        case 'shaken':
            dynamicProfile.patience *= 0.4;
            dynamicProfile.aggression = clamp(dynamicProfile.aggression + 0.2, 0, 1.2);
            dynamicProfile.riskTolerance = clamp(dynamicProfile.riskTolerance + 0.3, 0, 1.2);
            break;
        case 'broken':
            dynamicProfile.patience = 0.05;
            dynamicProfile.aggression = clamp(dynamicProfile.aggression + 0.4, 0, 1.3);
            dynamicProfile.riskTolerance = clamp(dynamicProfile.riskTolerance + 0.5, 0, 1.5);
            break;
    }

    return dynamicProfile;
} 