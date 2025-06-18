/**
 * @fileoverview AI Decision System - Module Index
 * @description Barrel exports for the modular AI decision system.
 * Provides both flat exports and namespaced access patterns.
 * @version 1.0
 */

'use strict';

// --- MAIN INTERFACE ---
export { selectMove, analyzeAiDecision, resetAiState, getAiSummary } from './ai_decision_engine.js';

// --- PERSONALITY SYSTEM ---
export { 
    adaptPersonality, 
    getDynamicPersonality, 
    DEFAULT_PERSONALITY_PROFILE 
} from './ai_personality.js';

// --- MEMORY SYSTEM ---
export { 
    updateAiMemory, 
    getMoveEffectivenessScore, 
    isMoveOnCooldown, 
    getOpponentProfile, 
    resetMemoryAspect,
    DEFAULT_AI_MEMORY 
} from './ai_memory.js';

// --- STRATEGIC INTENT ---
export { 
    determineStrategicIntent, 
    getIntentDescription, 
    isIntentAggressive, 
    isIntentDefensive,
    STRATEGIC_INTENTS 
} from './ai_strategy_intent.js';

// --- MOVE SCORING ---
export { 
    calculateMoveWeights, 
    getViableMoves, 
    getTopMove, 
    getMoveWeightsSummary 
} from './ai_move_scoring.js';

// --- MOVE SELECTION ---
export { 
    getSoftmaxProbabilities, 
    selectFromDistribution, 
    selectMoveFromWeights, 
    calculateTemperature,
    getSelectionStats,
    validateProbabilities 
} from './ai_move_selection.js';

// --- NAMESPACED EXPORTS (for organized access) ---
export const AiPersonality = {
    adapt: adaptPersonality,
    getDynamic: getDynamicPersonality,
    DEFAULT_PROFILE: DEFAULT_PERSONALITY_PROFILE
};

export const AiMemory = {
    update: updateAiMemory,
    getMoveScore: getMoveEffectivenessScore,
    isOnCooldown: isMoveOnCooldown,
    getOpponentProfile: getOpponentProfile,
    reset: resetMemoryAspect,
    DEFAULT_MEMORY: DEFAULT_AI_MEMORY
};

export const AiStrategy = {
    determineIntent: determineStrategicIntent,
    getDescription: getIntentDescription,
    isAggressive: isIntentAggressive,
    isDefensive: isIntentDefensive,
    INTENTS: STRATEGIC_INTENTS
};

export const AiScoring = {
    calculateWeights: calculateMoveWeights,
    getViable: getViableMoves,
    getTop: getTopMove,
    getSummary: getMoveWeightsSummary
};

export const AiSelection = {
    softmax: getSoftmaxProbabilities,
    sample: selectFromDistribution,
    select: selectMoveFromWeights,
    temperature: calculateTemperature,
    stats: getSelectionStats,
    validate: validateProbabilities
};

// --- LEGACY COMPATIBILITY ---
// For backward compatibility with the old monolithic engine_ai-decision.js
export { selectMove as selectMoveCompat } from './ai_decision_engine.js';
export { selectFromDistribution as selectFromDistributionCompat } from './ai_move_selection.js';

/**
 * Module information for debugging and versioning
 */
export const AI_MODULE_INFO = {
    version: '1.0',
    modules: [
        'ai_personality',
        'ai_memory', 
        'ai_strategy_intent',
        'ai_move_scoring',
        'ai_move_selection',
        'ai_decision_engine'
    ],
    description: 'Modular AI decision system with separated concerns',
    compatibilityLayer: true
}; 