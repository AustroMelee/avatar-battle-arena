/**
 * @fileoverview Battle Event Types and Structure Definitions
 * @description Central registry of all event types, constants, and structure documentation
 * @version 1.0.0
 */

'use strict';

/**
 * Core event types used throughout the battle system
 */
export const EVENT_TYPES = {
    // Combat Events
    DAMAGE: 'damage',
    HEALING: 'healing',
    CRITICAL_HIT: 'critical_hit',
    MISS: 'miss',
    BLOCK: 'block',
    COUNTER: 'counter',
    
    // Dice Roll Events
    DICE_ROLL: 'dice_roll',
    
    // Battle Flow Events
    BATTLE_START: 'battle_start',
    BATTLE_END: 'battle_end',
    TURN_START: 'turn_start',
    TURN_END: 'turn_end',
    PHASE_CHANGE: 'phase_change',
    
    // AI Events
    AI_DECISION: 'ai_decision',
    AI_STRATEGY_CHANGE: 'ai_strategy_change',
    
    // Environmental Events
    ENVIRONMENTAL_EFFECT: 'environmental_effect',
    LOCATION_EFFECT: 'location_effect',
    
    // System Events
    PERFORMANCE: 'performance',
    ERROR: 'error',
    DEBUG: 'debug',
    TIMEOUT_EVENT: 'timeout_event',
    
    // Narrative Events
    QUOTE: 'quote',
    NARRATION: 'narration',
    ESCALATION: 'escalation',
    
    // Special Events
    CURBSTOMP: 'curbstomp',
    MOMENTUM_SHIFT: 'momentum_shift',
    STALEMATE: 'stalemate'
};

/**
 * Roll types for dice roll events
 */
export const ROLL_TYPES = {
    CRIT_CHECK: 'critCheck',
    EVASION_CHECK: 'evasionCheck',
    ACCURACY_CHECK: 'accuracyCheck',
    DAMAGE_VARIANCE: 'damageVariance',
    BLOCK_CHECK: 'blockCheck',
    COUNTER_CHECK: 'counterCheck',
    ENVIRONMENTAL_CHECK: 'environmentalCheck',
    AI_RANDOMNESS: 'aiRandomness'
};

/**
 * Outcome types for events
 */
export const OUTCOME_TYPES = {
    SUCCESS: 'success',
    FAIL: 'fail',
    CRITICAL: 'critical',
    NORMAL: 'normal',
    EXTREME: 'extreme',
    PARTIAL: 'partial'
};

/**
 * Required fields for all log events
 */
export const REQUIRED_EVENT_FIELDS = [
    'type',
    'eventId', 
    'timestamp',
    'turnNumber'
];

/**
 * Standard event structure template
 * @typedef {Object} LogEventStructure
 * @property {string} type - Event type from EVENT_TYPES
 * @property {string} eventId - Unique event identifier
 * @property {string} timestamp - ISO timestamp
 * @property {number} turnNumber - Battle turn number
 * @property {number} performanceTimestamp - High-resolution timestamp
 * @property {string} phase - Current battle phase
 * @property {string} [actorId] - Character performing action
 * @property {string} [text] - Human-readable description
 * @property {string} [html_content] - HTML-formatted content
 * @property {boolean} [isMajorEvent] - Significance flag
 * @property {Object} [debugData] - Debug information
 * @property {Object} metadata - Event metadata
 */

/**
 * Dice roll event structure
 * @typedef {Object} DiceRollEvent
 * @property {string} rollType - Type from ROLL_TYPES
 * @property {number} result - Roll result (0-1)
 * @property {number} [threshold] - Success threshold
 * @property {string} outcome - Outcome from OUTCOME_TYPES
 * @property {string} [moveName] - Associated move
 * @property {Object} [details] - Additional roll details
 * @property {Object} rollAnalysis - Roll analysis data
 */

/**
 * Performance event structure
 * @typedef {Object} PerformanceEvent
 * @property {string} operation - Operation name
 * @property {number} duration - Duration in milliseconds
 * @property {Object} metadata - Performance metadata
 */

/**
 * Error event structure
 * @typedef {Object} ErrorEvent
 * @property {Object} error - Error object with name, message, stack
 * @property {string} context - Error context
 * @property {Object} additionalData - Additional error data
 */ 