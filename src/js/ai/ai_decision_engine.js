/**
 * @fileoverview Avatar Battle Arena - AI Decision Engine
 * @description Core AI system for making intelligent battle decisions based on fighter state, opponent analysis, and strategic goals
 * @version 2.0.0
 */

'use strict';

//# sourceURL=ai_decision_engine.js

// ============================================================================
// TYPE IMPORTS
// ============================================================================

/**
 * @typedef {import('../types.js').Fighter} Fighter
 * @typedef {import('../types.js').BattleState} BattleState
 * @typedef {import('../types.js').Move} Move
 * @typedef {import('../types.js').AiDecision} AiDecision
 * @typedef {import('../types.js').AiAnalysis} AiAnalysis
 * @typedef {import('../types.js').AiPersonality} AiPersonality
 * @typedef {import('../types.js').AiMemory} AiMemory
 */

/**
 * @typedef {Object} DecisionContext
 * @description Context information for AI decision making
 * @property {Fighter} self - The AI fighter making the decision
 * @property {Fighter} opponent - The opponent fighter
 * @property {BattleState} battleState - Current battle state
 * @property {Move[]} availableMoves - Moves available to the AI
 * @property {number} turnNumber - Current turn number
 * @property {string} phase - Current battle phase
 * @property {Object} [environment] - Environmental conditions
 * @property {Object} [options] - Additional context options
 */

/**
 * @typedef {Object} MoveEvaluation
 * @description Evaluation of a single move option
 * @property {string} moveId - Move identifier
 * @property {string} moveName - Move display name
 * @property {number} score - Overall score (0-100)
 * @property {number} damage - Expected damage
 * @property {number} accuracy - Hit probability (0-1)
 * @property {number} risk - Risk assessment (0-1)
 * @property {number} strategic - Strategic value (0-1)
 * @property {string} reasoning - Human-readable reasoning
 * @property {Object<string, number>} factors - Individual scoring factors
 * @property {number} confidence - Confidence in evaluation (0-1)
 */

/**
 * @typedef {Object} ThreatAssessment
 * @description Assessment of opponent threat level
 * @property {number} immediate - Immediate threat (0-100)
 * @property {number} longTerm - Long-term threat (0-100)
 * @property {string[]} primaryThreats - Identified primary threats
 * @property {string[]} vulnerabilities - Opponent vulnerabilities
 * @property {number} overallThreat - Combined threat score (0-100)
 * @property {Object} analysis - Detailed threat analysis
 */

/**
 * @typedef {Object} StrategicGoal
 * @description AI strategic goal definition
 * @property {string} type - Goal type (offense, defense, control, etc.)
 * @property {number} priority - Goal priority (0-100)
 * @property {string} description - Goal description
 * @property {Object<string, any>} parameters - Goal-specific parameters
 * @property {boolean} active - Whether goal is currently active
 */

/**
 * @typedef {Object} DecisionWeights
 * @description Weights for different decision factors
 * @property {number} damage - Damage factor weight (0-1)
 * @property {number} accuracy - Accuracy factor weight (0-1)
 * @property {number} strategic - Strategic factor weight (0-1)
 * @property {number} personality - Personality factor weight (0-1)
 * @property {number} memory - Memory factor weight (0-1)
 * @property {number} risk - Risk factor weight (0-1)
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { calculateMoveScore } from './ai_move_scoring.js';
import { selectOptimalMove } from './ai_move_selection.js';
import { getPersonalityTraits } from './ai_personality.js';
import { updateAiMemory, getOpponentPatterns } from './ai_memory.js';
import { evaluateStrategicIntent } from './ai_strategy_intent.js';

// ============================================================================
// CONSTANTS
// ============================================================================

/** @type {number} */
const MIN_CONFIDENCE_THRESHOLD = 0.3;

/** @type {number} */
const MAX_CONFIDENCE_LEVEL = 1.0;

/** @type {number} */
const DECISION_TIMEOUT_MS = 5000;

/** @type {number} */
const DEFAULT_TURN_TIMEOUT = 3000;

/** @type {DecisionWeights} */
const DECISION_WEIGHTS = {
    damage: 0.3,
    accuracy: 0.2,
    strategic: 0.25,
    personality: 0.15,
    memory: 0.1,
    risk: 0.1
};

/** @type {string[]} */
const VALID_STRATEGIC_INTENTS = [
    'aggressive',
    'defensive',
    'balanced',
    'adaptive',
    'opportunistic',
    'conservative',
    'reckless'
];

/** @type {string[]} */
const VALID_DECISION_PHASES = [
    'opening',
    'early',
    'mid',
    'late',
    'endgame',
    'desperate'
];

/** @type {Object<string, StrategicGoal>} */
const DEFAULT_STRATEGIC_GOALS = {
    offense: {
        type: 'offense',
        priority: 70,
        description: 'Deal maximum damage to opponent',
        parameters: { damageThreshold: 15, aggressionBonus: 0.2 },
        active: true
    },
    defense: {
        type: 'defense',
        priority: 50,
        description: 'Minimize incoming damage',
        parameters: { healthThreshold: 0.3, defensiveBonus: 0.15 },
        active: true
    },
    control: {
        type: 'control',
        priority: 60,
        description: 'Control battle flow and positioning',
        parameters: { statusEffectPriority: 0.8, controlBonus: 0.1 },
        active: true
    },
    survival: {
        type: 'survival',
        priority: 90,
        description: 'Survive when critically low on health',
        parameters: { criticalThreshold: 0.2, survivalBonus: 0.3 },
        active: false
    }
};

// ============================================================================
// CORE DECISION ENGINE
// ============================================================================

/**
 * Makes an AI decision for the current battle situation
 * 
 * @param {Fighter} aiFighter - AI fighter making the decision
 * @param {Fighter} opponentFighter - Opponent fighter
 * @param {BattleState} battleState - Current battle state
 * @param {Object} [options={}] - Decision options
 * 
 * @returns {Promise<AiDecision>} AI decision with reasoning and confidence
 * 
 * @throws {TypeError} When required parameters are invalid
 * @throws {Error} When decision cannot be made
 * @throws {Error} When decision times out
 * @throws {RangeError} When fighter stats are out of valid range
 * 
 * @example
 * // Make AI decision
 * const decision = await makeAIDecision(
 *   aiCharacter,
 *   playerCharacter,
 *   currentBattleState,
 *   { timeLimit: 3000, enableDebug: true }
 * );
 * console.log(`AI chose: ${decision.moveId} (${decision.confidence.toFixed(2)} confidence)`);
 * 
 * @since 2.0.0
 * @public
 */
export async function makeAIDecision(aiFighter, opponentFighter, battleState, options = {}) {
    // Input validation
    if (!aiFighter || typeof aiFighter !== 'object' || !aiFighter.id) {
        throw new TypeError('makeAIDecision: aiFighter must be a valid fighter object with id');
    }
    
    if (!opponentFighter || typeof opponentFighter !== 'object' || !opponentFighter.id) {
        throw new TypeError('makeAIDecision: opponentFighter must be a valid fighter object with id');
    }
    
    if (!battleState || typeof battleState !== 'object') {
        throw new TypeError('makeAIDecision: battleState must be a valid battle state object');
    }
    
    if (typeof options !== 'object' || options === null) {
        throw new TypeError('makeAIDecision: options must be an object');
    }

    // Validate fighter health bounds
    if (typeof aiFighter.hp !== 'number' || aiFighter.hp < 0 || aiFighter.hp > 100) {
        throw new RangeError('makeAIDecision: aiFighter.hp must be between 0 and 100');
    }

    console.debug(`[AI Decision] Making decision for ${aiFighter.id} vs ${opponentFighter.id}`);

    /** @type {number} */
    const startTime = performance.now();

    try {
        // Set up decision timeout
        /** @type {number} */
        const timeLimit = options.timeLimit || DECISION_TIMEOUT_MS;
        
        /** @type {Promise<AiDecision>} */
        const decisionPromise = makeDecisionInternal(aiFighter, opponentFighter, battleState, options);
        
        /** @type {Promise<never>} */
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('AI decision timed out')), timeLimit);
        });

        // Race between decision and timeout
        /** @type {AiDecision} */
        const decision = await Promise.race([decisionPromise, timeoutPromise]);

        // Validate decision before returning
        validateDecision(decision, aiFighter);

        /** @type {number} */
        const executionTime = performance.now() - startTime;

        if (options.enableDebug) {
            console.debug(`[AI Decision] Decision made: ${decision.moveId} (confidence: ${decision.confidence.toFixed(2)}, time: ${executionTime.toFixed(2)}ms)`);
        }

        return decision;

    } catch (error) {
        console.error(`[AI Decision] Error making decision for ${aiFighter.id}:`, error);
        
        // Return fallback decision
        return createFallbackDecision(aiFighter, opponentFighter, battleState);
    }
}

/**
 * Internal decision making implementation
 * 
 * @param {Fighter} aiFighter - AI fighter
 * @param {Fighter} opponentFighter - Opponent fighter  
 * @param {BattleState} battleState - Current battle state
 * @param {Object} options - Decision options
 * 
 * @returns {Promise<AiDecision>} AI decision
 * 
 * @throws {TypeError} When context building fails
 * @throws {Error} When move evaluation fails
 * 
 * @private
 * @since 2.0.0
 */
async function makeDecisionInternal(aiFighter, opponentFighter, battleState, options) {
    // Build decision context
    /** @type {DecisionContext} */
    const context = await buildDecisionContext(aiFighter, opponentFighter, battleState, options);

    // Analyze the situation
    /** @type {AiAnalysis} */
    const analysis = await analyzeDecisionContext(context);

    // Evaluate available moves
    /** @type {MoveEvaluation[]} */
    const moveEvaluations = await evaluateAvailableMoves(context, analysis);

    if (!moveEvaluations || moveEvaluations.length === 0) {
        throw new Error('makeDecisionInternal: No moves available for evaluation');
    }

    // Select optimal move
    /** @type {MoveEvaluation} */
    const selectedMove = selectOptimalMove(moveEvaluations, analysis);

    // Update AI memory
    await updateAiMemory(aiFighter.id, {
        opponentId: opponentFighter.id,
        turn: battleState.turn || 1,
        selectedMove: selectedMove.moveId,
        reasoning: selectedMove.reasoning,
        confidence: selectedMove.score / 100
    });

    // Create decision object
    /** @type {AiDecision} */
    const decision = {
        moveId: selectedMove.moveId,
        confidence: Math.min(MAX_CONFIDENCE_LEVEL, Math.max(MIN_CONFIDENCE_THRESHOLD, selectedMove.score / 100)),
        reasoning: selectedMove.reasoning,
        analysis,
        moveScores: createMoveScoreMap(moveEvaluations),
        personalityInfluence: getPersonalityInfluence(aiFighter, analysis),
        timestamp: new Date().toISOString(),
        metadata: {
            evaluatedMoves: moveEvaluations.length,
            topScore: selectedMove.score,
            decisionTime: Date.now()
        }
    };

    return decision;
}

/**
 * Builds comprehensive decision context for AI analysis
 * 
 * @param {Fighter} aiFighter - AI fighter
 * @param {Fighter} opponentFighter - Opponent fighter
 * @param {BattleState} battleState - Battle state
 * @param {Object} options - Options
 * 
 * @returns {Promise<DecisionContext>} Decision context
 * 
 * @throws {TypeError} When fighters are invalid
 * @throws {Error} When context cannot be built
 * 
 * @private
 * @since 2.0.0
 */
async function buildDecisionContext(aiFighter, opponentFighter, battleState, options) {
    try {
        // Get available moves
        /** @type {Move[]} */
        const availableMoves = getAvailableMoves(aiFighter, battleState);

        if (!availableMoves || availableMoves.length === 0) {
            throw new Error('buildDecisionContext: No available moves for AI fighter');
        }

        // Determine battle phase
        /** @type {string} */
        const battlePhase = determineBattlePhase(battleState, aiFighter, opponentFighter);

        /** @type {DecisionContext} */
        const context = {
            self: aiFighter,
            opponent: opponentFighter,
            battleState,
            availableMoves,
            turnNumber: battleState.turn || 1,
            phase: battlePhase,
            environment: battleState.environment || null,
            options: {
                enableDebug: options.enableDebug || false,
                timeLimit: options.timeLimit || DEFAULT_TURN_TIMEOUT,
                personalityOverride: options.personalityOverride || null
            }
        };

        return context;

    } catch (error) {
        console.error('[AI Decision] Error building decision context:', error);
        throw new Error(`Decision context building failed: ${error.message}`);
    }
}

/**
 * Analyzes decision context to determine strategic approach
 * 
 * @param {DecisionContext} context - Decision context
 * 
 * @returns {Promise<AiAnalysis>} Strategic analysis
 * 
 * @private
 * @since 2.0.0
 */
async function analyzeDecisionContext(context) {
    // Assess threat level
    /** @type {ThreatAssessment} */
    const threatAssessment = assessThreatLevel(context);

    // Determine strategic intent
    /** @type {string} */
    const strategicIntent = await evaluateStrategicIntent(
        context.self,
        context.opponent,
        context.battleState
    );

    // Get personality traits
    /** @type {AiPersonality} */
    const personality = getPersonalityTraits(context.self);

    // Calculate aggression level based on situation
    /** @type {number} */
    const baseAggression = personality.aggression || 0.5;
    /** @type {number} */
    const situationalAggression = calculateSituationalAggression(context, threatAssessment);
    /** @type {number} */
    const aggressionLevel = Math.max(0, Math.min(1, baseAggression + situationalAggression));

    // Calculate risk tolerance
    /** @type {number} */
    const baseRisk = personality.caution ? 1 - personality.caution : 0.5;
    /** @type {number} */
    const situationalRisk = calculateSituationalRisk(context, threatAssessment);
    /** @type {number} */
    const riskTolerance = Math.max(0, Math.min(1, baseRisk + situationalRisk));

    // Identify key factors
    /** @type {string[]} */
    const consideredFactors = [
        'health_differential',
        'move_availability',
        'environmental_factors',
        'momentum_state',
        'escalation_level'
    ];

    // Calculate decision weights
    /** @type {Object<string, number>} */
    const weights = calculateDecisionWeights(context, personality);

    // Determine primary goal
    /** @type {string} */
    const primaryGoal = determinePrimaryGoal(context, threatAssessment, aggressionLevel);

    /** @type {AiAnalysis} */
    const analysis = {
        strategicIntent,
        aggressionLevel,
        riskTolerance,
        consideredFactors,
        weights,
        primaryGoal
    };

    return analysis;
}

/**
 * Evaluates all available moves and scores them
 * 
 * @param {DecisionContext} context - Decision context
 * @param {AiAnalysis} analysis - Strategic analysis
 * 
 * @returns {Promise<MoveEvaluation[]>} Move evaluations
 * 
 * @private
 * @since 2.0.0
 */
async function evaluateAvailableMoves(context, analysis) {
    /** @type {MoveEvaluation[]} */
    const evaluations = [];

    for (const move of context.availableMoves) {
        try {
            /** @type {MoveEvaluation} */
            const evaluation = await evaluateMove(move, context, analysis);
            evaluations.push(evaluation);
        } catch (error) {
            console.warn(`[AI Decision] Error evaluating move ${move.id}:`, error);
        }
    }

    // Sort by score descending
    evaluations.sort((a, b) => b.score - a.score);

    return evaluations;
}

/**
 * Evaluates a single move option
 * 
 * @param {Move} move - Move to evaluate
 * @param {DecisionContext} context - Decision context
 * @param {AiAnalysis} analysis - Strategic analysis
 * 
 * @returns {Promise<MoveEvaluation>} Move evaluation
 * 
 * @private
 * @since 2.0.0
 */
async function evaluateMove(move, context, analysis) {
    // Calculate base scoring factors
    /** @type {number} */
    const damageScore = calculateDamageScore(move, context);
    /** @type {number} */
    const accuracyScore = calculateAccuracyScore(move, context);
    /** @type {number} */
    const riskScore = calculateRiskScore(move, context, analysis);
    /** @type {number} */
    const strategicScore = calculateStrategicScore(move, context, analysis);

    // Apply AI personality modifiers
    /** @type {Object<string, number>} */
    const personalityModifiers = applyPersonalityModifiers(move, context, analysis);

    // Apply memory-based adjustments
    /** @type {number} */
    const memoryModifier = await applyMemoryModifiers(move, context);

    // Calculate weighted total score
    /** @type {Object<string, number>} */
    const factors = {
        damage: damageScore,
        accuracy: accuracyScore,
        risk: riskScore,
        strategic: strategicScore,
        personality: personalityModifiers.total || 0,
        memory: memoryModifier
    };

    /** @type {number} */
    const weightedScore = Object.entries(factors).reduce((total, [factor, score]) => {
        /** @type {number} */
        const weight = analysis.weights[factor] || DECISION_WEIGHTS[factor] || 0;
        return total + (score * weight);
    }, 0);

    // Generate reasoning
    /** @type {string} */
    const reasoning = generateMoveReasoning(move, factors, analysis);

    /** @type {MoveEvaluation} */
    const evaluation = {
        moveId: move.id,
        moveName: move.name,
        score: Math.max(0, Math.min(100, weightedScore)),
        damage: move.damage || 0,
        accuracy: move.accuracy || 0.8,
        risk: riskScore,
        strategic: strategicScore,
        reasoning,
        factors,
        confidence: Math.min(MAX_CONFIDENCE_LEVEL, Math.max(MIN_CONFIDENCE_THRESHOLD, weightedScore / 100))
    };

    return evaluation;
}

/**
 * Assesses the threat level posed by the opponent
 * 
 * @param {DecisionContext} context - Decision context
 * 
 * @returns {ThreatAssessment} Threat assessment
 * 
 * @private
 * @since 2.0.0
 */
function assessThreatLevel(context) {
    /** @type {Fighter} */
    const opponent = context.opponent;
    /** @type {Fighter} */
    const self = context.self;

    // Calculate immediate threat (opponent's potential next turn damage)
    /** @type {number} */
    const opponentMaxDamage = Math.max(
        ...(opponent.moves || []).map(move => move.damage || 0)
    );
    /** @type {number} */
    const immediateRatio = opponentMaxDamage / 100; // Normalize to 0-1
    /** @type {number} */
    const immediate = Math.min(100, immediateRatio * 100);

    // Calculate long-term threat (based on remaining health and capability)
    /** @type {number} */
    const opponentHealth = 100 - (opponent.incapacitationScore || 0);
    /** @type {number} */
    const selfHealth = 100 - (self.incapacitationScore || 0);
    /** @type {number} */
    const healthRatio = opponentHealth / (selfHealth + 1); // +1 to avoid division by zero
    /** @type {number} */
    const longTerm = Math.min(100, healthRatio * 50);

    // Identify primary threats
    /** @type {string[]} */
    const primaryThreats = [];
    if (opponentMaxDamage > 20) primaryThreats.push('high_damage');
    if (opponent.moves?.some(move => move.accuracy && move.accuracy > 0.9)) {
        primaryThreats.push('high_accuracy');
    }
    if (opponent.statusEffects?.length) primaryThreats.push('status_effects');

    // Identify vulnerabilities
    /** @type {string[]} */
    const vulnerabilities = [];
    if (opponentHealth < 30) vulnerabilities.push('low_health');
    if (!opponent.moves?.length) vulnerabilities.push('no_moves');
    if (opponent.energy && opponent.energy < 20) vulnerabilities.push('low_energy');

    // Calculate overall threat
    /** @type {number} */
    const overallThreat = (immediate * 0.6) + (longTerm * 0.4);

    return {
        immediate,
        longTerm,
        primaryThreats,
        vulnerabilities,
        overallThreat,
        analysis: {
            strategicIntent: 'defensive',
            aggressionLevel: 0.3,
            riskTolerance: 0.8,
            consideredFactors: ['desperation'],
            weights: DECISION_WEIGHTS,
            primaryGoal: 'survive'
        }
    };
}

/**
 * Calculates situational aggression modifier
 * 
 * @param {DecisionContext} context - Decision context
 * @param {ThreatAssessment} threat - Threat assessment
 * 
 * @returns {number} Aggression modifier (-0.5 to +0.5)
 * 
 * @private
 * @since 2.0.0
 */
function calculateSituationalAggression(context, threat) {
    /** @type {number} */
    let modifier = 0;

    // More aggressive when opponent is vulnerable
    if (threat.vulnerabilities.includes('low_health')) {
        modifier += 0.3;
    }

    // Less aggressive when under immediate threat
    if (threat.immediate > 70) {
        modifier -= 0.2;
    }

    // More aggressive when ahead in health
    /** @type {number} */
    const selfHealth = 100 - (context.self.incapacitationScore || 0);
    /** @type {number} */
    const opponentHealth = 100 - (context.opponent.incapacitationScore || 0);
    
    if (selfHealth > opponentHealth + 20) {
        modifier += 0.2;
    }

    return Math.max(-0.5, Math.min(0.5, modifier));
}

/**
 * Calculates situational risk tolerance modifier
 * 
 * @param {DecisionContext} context - Decision context
 * @param {ThreatAssessment} threat - Threat assessment
 * 
 * @returns {number} Risk modifier (-0.5 to +0.5)
 * 
 * @private
 * @since 2.0.0
 */
function calculateSituationalRisk(context, threat) {
    /** @type {number} */
    let modifier = 0;

    // More risk-tolerant when desperate
    /** @type {number} */
    const selfHealth = 100 - (context.self.incapacitationScore || 0);
    
    if (selfHealth < 25) {
        modifier += 0.4;
    }

    // Less risk-tolerant when ahead
    /** @type {number} */
    const opponentHealth = 100 - (context.opponent.incapacitationScore || 0);
    
    if (selfHealth > opponentHealth + 30) {
        modifier -= 0.3;
    }

    return Math.max(-0.5, Math.min(0.5, modifier));
}

/**
 * Calculates decision weights based on context and personality
 * 
 * @param {DecisionContext} context - Decision context
 * @param {AiPersonality} personality - AI personality
 * 
 * @returns {Object<string, number>} Decision weights
 * 
 * @private
 * @since 2.0.0
 */
function calculateDecisionWeights(context, personality) {
    /** @type {Object<string, number>} */
    const weights = { ...DECISION_WEIGHTS };

    // Adjust weights based on personality
    if (personality.aggression > 0.7) {
        weights.damage += 0.1;
        weights.strategic -= 0.05;
    }

    if (personality.caution > 0.7) {
        weights.accuracy += 0.1;
        weights.risk += 0.1;
        weights.damage -= 0.1;
    }

    if (personality.creativity > 0.7) {
        weights.strategic += 0.1;
        weights.personality += 0.05;
    }

    // Normalize weights to sum to 1.0
    /** @type {number} */
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    
    for (const key in weights) {
        weights[key] = weights[key] / totalWeight;
    }

    return weights;
}

/**
 * Determines the AI's primary goal for this turn
 * 
 * @param {DecisionContext} context - Decision context
 * @param {ThreatAssessment} threat - Threat assessment
 * @param {number} aggressionLevel - Current aggression level
 * 
 * @returns {string} Primary goal identifier
 * 
 * @private
 * @since 2.0.0
 */
function determinePrimaryGoal(context, threat, aggressionLevel) {
    /** @type {number} */
    const selfHealth = 100 - (context.self.incapacitationScore || 0);

    // Defensive goal when under immediate threat
    if (threat.immediate > 80 || selfHealth < 20) {
        return 'survive';
    }

    // Offensive goal when aggressive and opponent is vulnerable
    if (aggressionLevel > 0.7 && threat.vulnerabilities.length > 0) {
        return 'finish_opponent';
    }

    // Control goal when evenly matched
    if (Math.abs(selfHealth - (100 - (context.opponent.incapacitationScore || 0))) < 15) {
        return 'gain_advantage';
    }

    // Default offensive goal
    return 'deal_damage';
}

// ============================================================================
// MOVE SCORING FUNCTIONS
// ============================================================================

/**
 * Calculates damage score for a move
 * 
 * @param {Move} move - Move to score
 * @param {DecisionContext} context - Decision context
 * 
 * @returns {number} Damage score (0-100)
 * 
 * @private
 * @since 2.0.0
 */
function calculateDamageScore(move, context) {
    /** @type {number} */
    const baseDamage = move.damage || 0;
    
    // Normalize to 0-100 scale (assuming max damage around 50)
    return Math.min(100, (baseDamage / 50) * 100);
}

/**
 * Calculates accuracy score for a move
 * 
 * @param {Move} move - Move to score
 * @param {DecisionContext} context - Decision context
 * 
 * @returns {number} Accuracy score (0-100)
 * 
 * @private
 * @since 2.0.0
 */
function calculateAccuracyScore(move, context) {
    /** @type {number} */
    const baseAccuracy = move.accuracy || 0.8;
    
    // Convert to 0-100 scale
    return baseAccuracy * 100;
}

/**
 * Calculates risk score for a move
 * 
 * @param {Move} move - Move to score
 * @param {DecisionContext} context - Decision context
 * @param {AiAnalysis} analysis - Strategic analysis
 * 
 * @returns {number} Risk score (0-100, lower is better)
 * 
 * @private
 * @since 2.0.0
 */
function calculateRiskScore(move, context, analysis) {
    /** @type {number} */
    let riskScore = 0;

    // High energy cost increases risk
    if (move.energyCost) {
        /** @type {number} */
        const energyRatio = move.energyCost / (context.self.energy || 100);
        riskScore += energyRatio * 30;
    }

    // Low accuracy increases risk
    /** @type {number} */
    const accuracy = move.accuracy || 0.8;
    riskScore += (1 - accuracy) * 40;

    // Self-damage increases risk
    if (move.selfDamage) {
        riskScore += move.selfDamage * 2;
    }

    return Math.min(100, riskScore);
}

/**
 * Calculates strategic score for a move
 * 
 * @param {Move} move - Move to score
 * @param {DecisionContext} context - Decision context
 * @param {AiAnalysis} analysis - Strategic analysis
 * 
 * @returns {number} Strategic score (0-100)
 * 
 * @private
 * @since 2.0.0
 */
function calculateStrategicScore(move, context, analysis) {
    /** @type {number} */
    let strategicScore = 50; // Base score

    // Bonus for moves that align with primary goal
    switch (analysis.primaryGoal) {
        case 'deal_damage':
            if (move.type === 'offensive') strategicScore += 20;
            break;
        case 'survive':
            if (move.type === 'defensive') strategicScore += 30;
            break;
        case 'gain_advantage':
            if (move.statusEffects?.length) strategicScore += 25;
            break;
        case 'finish_opponent':
            if (move.damage && move.damage > 20) strategicScore += 35;
            break;
    }

    // Bonus for elemental advantages
    if (move.element && context.opponent.element) {
        /** @type {number} */
        const elementalMultiplier = getElementalEffectiveness(move.element, context.opponent.element);
        if (elementalMultiplier > 1.0) {
            strategicScore += (elementalMultiplier - 1) * 20;
        }
    }

    return Math.min(100, strategicScore);
}

/**
 * Gets elemental effectiveness multiplier
 * 
 * @param {string} attackElement - Attacking element
 * @param {string} defenseElement - Defending element
 * 
 * @returns {number} Effectiveness multiplier
 * 
 * @private
 * @since 2.0.0
 */
function getElementalEffectiveness(attackElement, defenseElement) {
    /** @type {Object<string, Object<string, number>>} */
    const effectiveness = {
        'fire': { 'water': 0.5, 'earth': 1.5, 'air': 1.0 },
        'water': { 'fire': 1.5, 'earth': 1.0, 'air': 1.0 },
        'earth': { 'fire': 0.5, 'water': 1.0, 'air': 1.5 },
        'air': { 'fire': 1.0, 'water': 1.0, 'earth': 0.5 }
    };

    return effectiveness[attackElement]?.[defenseElement] || 1.0;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Gets available moves for a fighter
 * 
 * @param {Fighter} fighter - Fighter to get moves for
 * @param {BattleState} battleState - Current battle state
 * 
 * @returns {Move[]} Available moves
 * 
 * @private
 * @since 2.0.0
 */
function getAvailableMoves(fighter, battleState) {
    if (!fighter.moves || !Array.isArray(fighter.moves)) {
        return [];
    }

    return fighter.moves.filter(move => {
        // Check energy requirements
        if (move.energyCost && (fighter.energy || 100) < move.energyCost) {
            return false;
        }

        // Check cooldowns
        if (move.cooldown && fighter.moveCooldowns && fighter.moveCooldowns[move.id] > 0) {
            return false;
        }

        return true;
    });
}

/**
 * Applies personality modifiers to move scoring
 * 
 * @param {Move} move - Move being evaluated
 * @param {DecisionContext} context - Decision context
 * @param {AiAnalysis} analysis - Strategic analysis
 * 
 * @returns {Object<string, number>} Personality modifiers
 * 
 * @private
 * @since 2.0.0
 */
function applyPersonalityModifiers(move, context, analysis) {
    /** @type {AiPersonality} */
    const personality = getPersonalityTraits(context.self);
    
    /** @type {Object<string, number>} */
    const modifiers = {};
    
    // Aggression modifier
    if (move.type === 'offensive') {
        modifiers.aggression = (personality.aggression || 0.5) * 20;
    }
    
    // Caution modifier
    if (move.type === 'defensive') {
        modifiers.caution = (personality.caution || 0.5) * 15;
    }
    
    // Creativity modifier
    if (move.statusEffects?.length || move.type === 'utility') {
        modifiers.creativity = (personality.creativity || 0.5) * 10;
    }
    
    // Calculate total
    modifiers.total = Object.values(modifiers).reduce((sum, value) => sum + value, 0);
    
    return modifiers;
}

/**
 * Applies memory-based modifiers to move scoring
 * 
 * @param {Move} move - Move being evaluated
 * @param {DecisionContext} context - Decision context
 * 
 * @returns {Promise<number>} Memory modifier
 * 
 * @private
 * @since 2.0.0
 */
async function applyMemoryModifiers(move, context) {
    try {
        /** @type {any[]} */
        const patterns = await getOpponentPatterns(context.opponent.id);
        
        // Simple memory modifier based on past effectiveness
        /** @type {number} */
        const pastEffectiveness = patterns
            .filter(p => p.moveId === move.id)
            .reduce((sum, p) => sum + (p.success ? 1 : -1), 0);
            
        return Math.max(-10, Math.min(10, pastEffectiveness * 2));
    } catch (error) {
        console.warn('[AI Decision] Error applying memory modifiers:', error);
        return 0;
    }
}

/**
 * Generates human-readable reasoning for a move choice
 * 
 * @param {Move} move - Move being evaluated
 * @param {Object<string, number>} factors - Scoring factors
 * @param {AiAnalysis} analysis - Strategic analysis
 * 
 * @returns {string} Move reasoning
 * 
 * @private
 * @since 2.0.0
 */
function generateMoveReasoning(move, factors, analysis) {
    /** @type {string[]} */
    const reasons = [];
    
    // Primary factor
    /** @type {string} */
    const primaryFactor = Object.entries(factors)
        .reduce((max, [key, value]) => value > factors[max] ? key : max, 'damage');
    
    switch (primaryFactor) {
        case 'damage':
            reasons.push(`High damage potential (${move.damage || 0})`);
            break;
        case 'accuracy':
            reasons.push(`Reliable accuracy (${((move.accuracy || 0.8) * 100).toFixed(0)}%)`);
            break;
        case 'strategic':
            reasons.push(`Aligns with strategic goal: ${analysis.primaryGoal}`);
            break;
    }
    
    // Add secondary considerations
    if (factors.strategic > 60) {
        reasons.push('good strategic value');
    }
    
    if (factors.risk < 30) {
        reasons.push('low risk');
    }
    
    return reasons.join(', ');
}

/**
 * Creates a map of move scores from evaluations
 * 
 * @param {MoveEvaluation[]} evaluations - Move evaluations
 * 
 * @returns {Object<string, number>} Move score map
 * 
 * @private
 * @since 2.0.0
 */
function createMoveScoreMap(evaluations) {
    /** @type {Object<string, number>} */
    const scoreMap = {};
    
    for (const evaluation of evaluations) {
        scoreMap[evaluation.moveId] = evaluation.score;
    }
    
    return scoreMap;
}

/**
 * Gets personality influence information
 * 
 * @param {Fighter} fighter - AI fighter
 * @param {AiAnalysis} analysis - Strategic analysis
 * 
 * @returns {AiPersonality} Personality influence
 * 
 * @private
 * @since 2.0.0
 */
function getPersonalityInfluence(fighter, analysis) {
    /** @type {AiPersonality} */
    const personality = getPersonalityTraits(fighter);
    
    return {
        ...personality,
        triggers: {
            aggressionTriggered: analysis.aggressionLevel > 0.7,
            cautionTriggered: analysis.riskTolerance < 0.3,
            creativityTriggered: analysis.strategicIntent === 'adaptive'
        }
    };
}

/**
 * Validates a decision before returning it
 * 
 * @param {AiDecision} decision - Decision to validate
 * @param {Fighter} fighter - AI fighter
 * 
 * @returns {void}
 * 
 * @throws {Error} When decision is invalid
 * 
 * @private
 * @since 2.0.0
 */
function validateDecision(decision, fighter) {
    if (!decision || typeof decision !== 'object') {
        throw new Error('validateDecision: decision must be an object');
    }
    
    if (!decision.moveId || typeof decision.moveId !== 'string') {
        throw new Error('validateDecision: decision must have a valid moveId');
    }
    
    if (typeof decision.confidence !== 'number' || decision.confidence < 0 || decision.confidence > 1) {
        throw new Error('validateDecision: confidence must be a number between 0 and 1');
    }
    
    if (decision.confidence < MIN_CONFIDENCE_THRESHOLD) {
        throw new Error(`validateDecision: confidence ${decision.confidence} below minimum threshold ${MIN_CONFIDENCE_THRESHOLD}`);
    }
    
    // Verify move exists in fighter's moveset
    /** @type {boolean} */
    const moveExists = fighter.moves?.some(move => move.id === decision.moveId) || false;
    
    if (!moveExists) {
        throw new Error(`validateDecision: move '${decision.moveId}' not found in fighter's moveset`);
    }
}

/**
 * Creates a fallback decision when normal decision making fails
 * 
 * @param {Fighter} aiFighter - AI fighter
 * @param {Fighter} opponentFighter - Opponent fighter
 * @param {BattleState} battleState - Battle state
 * 
 * @returns {AiDecision} Fallback decision
 * 
 * @private
 * @since 2.0.0
 */
function createFallbackDecision(aiFighter, opponentFighter, battleState) {
    /** @type {Move[]} */
    const availableMoves = getAvailableMoves(aiFighter, battleState);
    
    /** @type {Move | null} */
    const fallbackMove = availableMoves.length > 0 ? availableMoves[0] : null;
    
    if (!fallbackMove) {
        // Create basic struggle move
        /** @type {AiDecision} */
        return {
            moveId: 'struggle',
            confidence: MIN_CONFIDENCE_THRESHOLD,
            reasoning: 'Fallback to basic struggle move',
            analysis: {
                strategicIntent: 'defensive',
                aggressionLevel: 0.3,
                riskTolerance: 0.8,
                consideredFactors: ['desperation'],
                weights: DECISION_WEIGHTS,
                primaryGoal: 'survive'
            },
            moveScores: { 'struggle': MIN_CONFIDENCE_THRESHOLD * 100 },
            personalityInfluence: getPersonalityTraits(aiFighter)
        };
    }
    
    /** @type {AiDecision} */
    return {
        moveId: fallbackMove.id,
        confidence: MIN_CONFIDENCE_THRESHOLD,
        reasoning: `Fallback to first available move: ${fallbackMove.name}`,
        analysis: {
            strategicIntent: 'balanced',
            aggressionLevel: 0.5,
            riskTolerance: 0.5,
            consideredFactors: ['availability'],
            weights: DECISION_WEIGHTS,
            primaryGoal: 'deal_damage'
        },
        moveScores: { [fallbackMove.id]: MIN_CONFIDENCE_THRESHOLD * 100 },
        personalityInfluence: getPersonalityTraits(aiFighter)
    };
}

// ============================================================================
// EXPORTS
// ============================================================================

export { makeAIDecision }; 