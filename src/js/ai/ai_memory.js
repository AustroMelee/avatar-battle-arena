/**
 * @fileoverview AI Memory and Learning System
 * @description Manages AI working memory, opponent modeling, move effectiveness tracking, and learning.
 * Handles all "what the AI knows" without decision-making logic.
 * @version 1.0
 */

'use strict';

/**
 * Default AI memory structure for new characters
 */
export const DEFAULT_AI_MEMORY = {
    selfMoveEffectiveness: {},
    opponentModel: { 
        isAggressive: 0, 
        isDefensive: 0, 
        isTurtling: false 
    },
    moveSuccessCooldown: {},
    opponentSequenceLog: {},
    repositionCooldown: 0
};

/**
 * Updates an AI's memory based on its last move and opponent's behavior
 * Modifies the learner's aiMemory in-place
 */
export function updateAiMemory(learner, opponent) {
    if (!learner || !opponent || !learner.aiMemory || !opponent.moveHistory) {
        return;
    }

    // Ensure memory structure exists
    learner.aiMemory = { ...DEFAULT_AI_MEMORY, ...learner.aiMemory };

    // Update self-move effectiveness tracking
    if (learner.lastMove?.name) {
        const { name, isRepositionMove } = learner.lastMove;
        
        // Initialize move tracking if not exists
        if (!learner.aiMemory.selfMoveEffectiveness[name]) {
            learner.aiMemory.selfMoveEffectiveness[name] = { 
                totalEffectiveness: 0, 
                uses: 0 
            };
        }

        // Convert effectiveness to numeric value
        const effectivenessValue = {
            'Weak': -1,
            'Normal': 1,
            'Strong': 2,
            'Critical': 3
        }[learner.lastMoveEffectiveness] || 0;

        // Update effectiveness tracking
        learner.aiMemory.selfMoveEffectiveness[name].totalEffectiveness += effectivenessValue;
        learner.aiMemory.selfMoveEffectiveness[name].uses++;

        // Set cooldown for weak moves
        if (learner.lastMoveEffectiveness === 'Weak') {
            learner.aiMemory.moveSuccessCooldown[name] = 2;
        }

        // Set reposition cooldown
        if (isRepositionMove) {
            learner.aiMemory.repositionCooldown = 2;
        }
    }

    // Decrement reposition cooldown
    if (learner.aiMemory.repositionCooldown > 0) {
        learner.aiMemory.repositionCooldown--;
    }

    // Update opponent modeling based on their last move
    if (opponent.lastMove?.type) {
        const moveType = opponent.lastMove.type;
        
        if (moveType === 'Offense' || moveType === 'Finisher') {
            learner.aiMemory.opponentModel.isAggressive = (learner.aiMemory.opponentModel.isAggressive || 0) + 1;
        } else if (moveType === 'Defense') {
            learner.aiMemory.opponentModel.isDefensive = (learner.aiMemory.opponentModel.isDefensive || 0) + 1;
        }
    }

    // Track opponent turtling behavior
    learner.aiMemory.opponentModel.isTurtling = (opponent.consecutiveDefensiveTurns || 0) >= 2;
}

/**
 * Gets the effectiveness score for a specific move from memory
 * Returns average effectiveness or 0 if no data
 */
export function getMoveEffectivenessScore(aiMemory, moveName) {
    if (!aiMemory?.selfMoveEffectiveness?.[moveName]) {
        return 0;
    }

    const moveData = aiMemory.selfMoveEffectiveness[moveName];
    if (moveData.uses === 0) return 0;
    
    return moveData.totalEffectiveness / moveData.uses;
}

/**
 * Checks if a move is on cooldown due to poor performance
 */
export function isMoveOnCooldown(aiMemory, moveName) {
    return (aiMemory?.moveSuccessCooldown?.[moveName] || 0) > 0;
}

/**
 * Gets the opponent's behavioral tendencies from memory
 * Returns normalized scores for aggression and defensiveness
 */
export function getOpponentProfile(aiMemory) {
    if (!aiMemory?.opponentModel) {
        return { aggressionScore: 0, defensivenessScore: 0, isTurtling: false };
    }

    const { isAggressive = 0, isDefensive = 0, isTurtling = false } = aiMemory.opponentModel;
    const totalMoves = isAggressive + isDefensive;
    
    if (totalMoves === 0) {
        return { aggressionScore: 0, defensivenessScore: 0, isTurtling };
    }

    return {
        aggressionScore: isAggressive / totalMoves,
        defensivenessScore: isDefensive / totalMoves,
        isTurtling
    };
}

/**
 * Clears or resets specific aspects of AI memory
 */
export function resetMemoryAspect(aiMemory, aspect) {
    if (!aiMemory) return;

    switch (aspect) {
        case 'moveEffectiveness':
            aiMemory.selfMoveEffectiveness = {};
            break;
        case 'opponentModel':
            aiMemory.opponentModel = { isAggressive: 0, isDefensive: 0, isTurtling: false };
            break;
        case 'cooldowns':
            aiMemory.moveSuccessCooldown = {};
            aiMemory.repositionCooldown = 0;
            break;
        case 'all':
            Object.assign(aiMemory, DEFAULT_AI_MEMORY);
            break;
    }
} 