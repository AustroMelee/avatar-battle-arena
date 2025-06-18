"use strict";

/**
 * @fileoverview AI Type Definitions
 * @description Defines the data structures for the AI engine, including decisions, memory, and analysis.
 */

/**
 * @typedef {import('./battle.js').Fighter} Fighter
 * @typedef {import('./battle.js').BattleState} BattleState
 * @typedef {import('./battle.js').Move} Move
 */

// ============================================================================
// AI AND DECISION TYPES
// ============================================================================

/**
 * @typedef {Object} AiDecision
 * @description AI decision-making result
 * @property {string} moveId - Selected move ID
 * @property {number} confidence - Decision confidence (0-1)
 * @property {string} reasoning - Decision reasoning
 */

/**
 * @typedef {Object} AiAnalysis
 * @description The AI's analysis of the current battle state
 * @property {string} primaryGoal - The primary strategic goal for the turn
 * @property {Object<string, number>} threatAssessment - Assessment of opponent threats
 */

/**
 * @typedef {Object} AiPersonality
 * @description AI personality traits affecting decisions
 * @property {number} aggression - Aggression trait (0-1)
 * @property {number} caution - Caution trait (0-1)
 */

/**
 * @typedef {Object} AiMemory
 * @description AI memory of opponent patterns, move effectiveness, and cooldowns.
 * @property {Object<string, {totalEffectiveness: number, uses: number}>} selfMoveEffectiveness - Tracks effectiveness of the AI's own moves.
 * @property {Object} opponentModel - Model of the opponent's behavior.
 * @property {number} opponentModel.isAggressive - Counter for aggressive moves.
 * @property {number} opponentModel.isDefensive - Counter for defensive moves.
 * @property {boolean} opponentModel.isTurtling - Flag for consecutive defensive moves.
 * @property {Object<string, number>} moveSuccessCooldown - Cooldown turns for moves that were weak.
 * @property {Object} opponentSequenceLog - Log of opponent move sequences.
 * @property {number} repositionCooldown - Cooldown for repositioning moves.
 */
 
/**
 * @typedef {Object} DecisionContext
 * @description Context information for AI decision making
 * @property {Fighter} self - The AI fighter making the decision
 * @property {Fighter} opponent - The opponent fighter
 * @property {BattleState} battleState - Current battle state
 * @property {Move[]} availableMoves - Moves available to the AI
 */

/**
 * @typedef {Object} MoveEvaluation
 * @description Evaluation of a single move option
 * @property {string} moveId - Move identifier
 * @property {number} score - Overall score (0-100)
 * @property {string} reasoning - Human-readable reasoning
 */

/**
 * @typedef {Object} ThreatAssessment
 * @description Assessment of opponent threat level
 * @property {number} immediate - Immediate threat (0-100)
 * @property {number} longTerm - Long-term threat (0-100)
 * @property {string[]} primaryThreats - Identified primary threats
 */

/**
 * @typedef {Object} StrategicGoal
 * @description AI strategic goal definition
 * @property {string} type - Goal type (offense, defense, control, etc.)
 * @property {number} priority - Goal priority (0-100)
 */

/**
 * @typedef {Object} DecisionWeights
 * @description Weights for different decision factors
 * @property {number} damage - Damage factor weight (0-1)
 * @property {number} strategic - Strategic factor weight (0-1)
 */

/**
 * @typedef {Object} DecisionOptions
 * @property {number} [timeLimit] - Time limit for the decision in milliseconds.
 * @property {boolean} [enableDebug] - Whether to enable debug logging.
 * @property {AiPersonality} [personalityOverride] - An override for the AI's personality.
 */

/**
 * @typedef {'NarrativeOnly' | 'OpeningMoves' | 'PokingPhaseTactics' | 'StandardExchange' | 'CautiousDefense' | 'PressAdvantage' | 'CapitalizeOnOpening' | 'DesperateGambit' | 'FinishingBlowAttempt' | 'ConserveEnergy' | 'OverwhelmOffense' | 'RecklessOffense'} StrategicIntent
 * @description The AI's high-level goal for the current turn.
 */

/**
 * @typedef {Object<string, number>} IntentMultiplierProfile
 * @description A set of multipliers for different move types or tags, keyed by move type or tag name.
 */

/**
 * @typedef {Object<StrategicIntent, IntentMultiplierProfile>} IntentMultipliers
 * @description A mapping from a strategic intent to its corresponding multiplier profile.
 */

/**
 * @typedef {'moveEffectiveness' | 'opponentModel' | 'cooldowns' | 'all'} MemoryAspect
 * @description The specific aspect of AI memory to reset.
 */

/**
 * @typedef {Object} OpponentProfile
 * @description The AI's assessment of the opponent's behavioral tendencies.
 * @property {number} aggressionScore - Normalized score for aggression (0-1).
 * @property {number} defensivenessScore - Normalized score for defensiveness (0-1).
 * @property {boolean} isTurtling - Whether the opponent is consistently defensive.
 */

export {}; 