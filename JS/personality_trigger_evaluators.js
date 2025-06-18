/**
 * @fileoverview Personality Trigger Evaluators
 * @description Modular system for evaluating character personality triggers
 * @version 1.0
 */

'use strict';

/**
 * Individual personality trigger evaluator functions
 * Each function takes (character, opponent, battleState) and returns boolean
 */

/**
 * Evaluates if a character is provoked
 */
function evaluateProvoked(character, opponent, battleState) {
    const { opponentLandedCriticalHit, opponentTaunted, allyTargeted, ally } = battleState;
    
    return opponentLandedCriticalHit || 
           opponentTaunted || 
           (allyTargeted && ally && ['ty-lee', 'zuko'].includes(ally.id));
}

/**
 * Evaluates if this is a serious fight situation
 */
function evaluateSeriousFight(character, opponent, battleState) {
    const { ally, opponentUsedLethalForce } = battleState;
    
    return (ally && ally.hp < ally.maxHp * 0.3) || opponentUsedLethalForce;
}

/**
 * Evaluates if character's authority is being challenged
 */
function evaluateAuthorityChallenge(character, opponent, battleState) {
    const { opponentLandedSignificantHits, opponentTaunted } = battleState;
    
    return (opponentLandedSignificantHits >= 2) || opponentTaunted;
}

/**
 * Evaluates if character is being underestimated
 */
function evaluateUnderestimated(character, opponent, battleState) {
    const { opponentTauntedAgeOrStrategy } = battleState;
    
    return opponentTauntedAgeOrStrategy || 
           (opponent.lastMoveEffectiveness === 'Weak' && opponent.lastMove?.power > 50);
}

/**
 * Evaluates if character is in control of the situation
 */
function evaluateInControl(character, opponent, battleState) {
    const { characterReceivedCriticalHit } = battleState;
    
    return (character.hp > character.maxHp * 0.5) && 
           !characterReceivedCriticalHit && 
           (opponent.mentalState?.level === 'stable' || opponent.mentalState?.level === 'stressed');
}

/**
 * Evaluates if character is desperate or broken
 */
function evaluateDesperateBroken(character, opponent, battleState) {
    const { allyDowned } = battleState;
    
    return (character.hp < character.maxHp * 0.3) || 
           (character.mentalState?.level === 'broken') || 
           (character.id === 'katara' && allyDowned) || 
           (character.id === 'katara' && character.criticalHitsTaken >= 2);
}

/**
 * Evaluates if character feels doubted
 */
function evaluateDoubted(character, opponent, battleState) {
    const { opponentTauntedBlindness, opponentLandedBlindHit } = battleState;
    
    return opponentTauntedBlindness || opponentLandedBlindHit;
}

/**
 * Evaluates if character is in mortal danger
 */
function evaluateMortalDanger(character, opponent, battleState) {
    const { ally } = battleState;
    
    return (ally && ally.hp < ally.maxHp * 0.05) || 
           (character.hp < character.maxHp * 0.2);
}

/**
 * Evaluates if character's honor has been violated
 */
function evaluateHonorViolated(character, opponent, battleState) {
    const { opponentCheated, allyDisarmedUnfairly } = battleState;
    
    return opponentCheated || allyDisarmedUnfairly;
}

/**
 * Evaluates if character is in a confident stance
 */
function evaluateConfidentStance(character, opponent, battleState) {
    const { characterLandedStrongOrCriticalHitLastTurn, allyBuffedSelf } = battleState;
    
    return characterLandedStrongOrCriticalHitLastTurn || allyBuffedSelf;
}

/**
 * Evaluates if character's skill is being challenged
 */
function evaluateSkillChallenged(character, opponent, battleState) {
    const { opponentTauntedSkillOrTradition, opponentAttackedFirstAggressively } = battleState;
    
    return opponentTauntedSkillOrTradition || opponentAttackedFirstAggressively;
}

/**
 * Evaluates if character feels disrespected (location-specific)
 */
function evaluateDisrespected(character, opponent, battleState) {
    const { locationId, opponentTauntedAgeOrStrategy } = battleState;
    
    return locationId === 'omashu' && opponentTauntedAgeOrStrategy;
}

/**
 * Registry of all personality trigger evaluators
 * Maps trigger IDs to their evaluator functions
 */
export const PERSONALITY_TRIGGER_EVALUATORS = {
    'provoked': evaluateProvoked,
    'serious_fight': evaluateSeriousFight,
    'authority_challenged': evaluateAuthorityChallenge,
    'underestimated': evaluateUnderestimated,
    'in_control': evaluateInControl,
    'desperate_broken': evaluateDesperateBroken,
    'doubted': evaluateDoubted,
    'mortal_danger': evaluateMortalDanger,
    'honor_violated': evaluateHonorViolated,
    'confident_stance': evaluateConfidentStance,
    'skill_challenged': evaluateSkillChallenged,
    'disrespected': evaluateDisrespected
};

/**
 * Main personality trigger evaluation function
 * Replaces the large switch statement with a cleaner registry lookup
 * 
 * @param {string} triggerId - The ID of the trigger to evaluate
 * @param {object} character - The character object
 * @param {object} opponent - The opponent character object
 * @param {object} battleState - The current battle state
 * @returns {boolean} True if the trigger condition is met
 */
export function evaluatePersonalityTrigger(triggerId, character, opponent, battleState) {
    // Input validation
    if (!triggerId || !character || !opponent || !battleState) {
        console.warn('[Personality Triggers] Invalid inputs provided:', { triggerId, character: !!character, opponent: !!opponent, battleState: !!battleState });
        return false;
    }
    
    console.debug(`[Personality Triggers] Evaluating trigger "${triggerId}" for ${character.name}`);
    
    // Get the evaluator function
    const evaluator = PERSONALITY_TRIGGER_EVALUATORS[triggerId];
    
    if (!evaluator) {
        console.warn(`[Personality Triggers] Unknown trigger ID: ${triggerId}`);
        return false;
    }
    
    try {
        const result = evaluator(character, opponent, battleState);
        console.debug(`[Personality Triggers] Trigger "${triggerId}" result: ${result}`);
        return result;
    } catch (error) {
        console.error(`[Personality Triggers] Error evaluating trigger "${triggerId}":`, error);
        return false;
    }
}

/**
 * Helper function to get all available trigger IDs
 * @returns {string[]} Array of all trigger IDs
 */
export function getAvailableTriggerIds() {
    return Object.keys(PERSONALITY_TRIGGER_EVALUATORS);
}

/**
 * Helper function to check if a trigger ID exists
 * @param {string} triggerId - The trigger ID to check
 * @returns {boolean} True if the trigger exists
 */
export function hasPersonalityTrigger(triggerId) {
    return triggerId in PERSONALITY_TRIGGER_EVALUATORS;
}

/**
 * Helper function to add a custom trigger evaluator
 * @param {string} triggerId - The ID for the new trigger
 * @param {function} evaluatorFunction - The evaluator function
 * @returns {boolean} True if successfully added
 */
export function addPersonalityTrigger(triggerId, evaluatorFunction) {
    if (typeof evaluatorFunction !== 'function') {
        console.error('[Personality Triggers] Evaluator must be a function');
        return false;
    }
    
    if (triggerId in PERSONALITY_TRIGGER_EVALUATORS) {
        console.warn(`[Personality Triggers] Trigger "${triggerId}" already exists, overwriting`);
    }
    
    PERSONALITY_TRIGGER_EVALUATORS[triggerId] = evaluatorFunction;
    return true;
} 