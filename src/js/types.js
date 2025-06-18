/**
 * @fileoverview Type Definitions for Avatar Battle Arena
 * @description Comprehensive TypeScript-via-JSDoc type definitions for all core structures.
 * This file provides machine-verified type safety without requiring a build step.
 * @version 1.0.0
 */

'use strict';

// ============================================================================
// CORE BATTLE TYPES
// ============================================================================

/**
 * @typedef {Object} Fighter
 * @description Complete fighter state during battle
 * @property {string} id - Unique fighter identifier
 * @property {string} name - Display name
 * @property {string} archetype - Fighter archetype identifier
 * @property {number} hp - Current hit points (0-100)
 * @property {number} maxHp - Maximum hit points
 * @property {number} energy - Current energy (0-100)
 * @property {number} maxEnergy - Maximum energy
 * @property {number} momentum - Battle momentum (-100 to 100)
 * @property {number} stunDuration - Remaining stun turns
 * @property {string} [opponentId] - ID of opponent fighter
 * @property {MentalState} mentalState - Psychological state
 * @property {FighterTraits} traits - Character traits and abilities
 * @property {FighterModifiers} modifiers - Active temporary modifiers
 * @property {FighterStats} stats - Performance statistics
 */

/**
 * @typedef {Object} MentalState
 * @description Fighter's psychological state
 * @property {number} confidence - Confidence level (0-100)
 * @property {number} focus - Focus level (0-100)
 * @property {number} desperation - Desperation level (0-100)
 * @property {number} rage - Rage level (0-100)
 * @property {string} dominantEmotion - Primary emotional state
 * @property {Object<string, number>} emotionalHistory - Historical emotional data
 */

/**
 * @typedef {Object} FighterTraits
 * @description Character traits and special abilities
 * @property {boolean} canFly - Ability to fly
 * @property {boolean} canRedirectLightning - Lightning redirection ability
 * @property {boolean} isProdigy - Prodigy status
 * @property {boolean} hasFirebending - Firebending ability
 * @property {boolean} hasAirbending - Airbending ability
 * @property {boolean} hasEarthbending - Earthbending ability
 * @property {boolean} hasWaterbending - Waterbending ability
 * @property {boolean} isAgile - Enhanced agility
 * @property {boolean} isPowerful - Enhanced power
 * @property {boolean} isTactical - Enhanced tactical thinking
 */

/**
 * @typedef {Object} FighterModifiers
 * @description Temporary modifiers affecting fighter performance
 * @property {number} damageModifier - Damage output modifier (multiplier)
 * @property {number} evasionModifier - Evasion chance modifier
 * @property {number} energyRegenModifier - Energy regeneration modifier
 * @property {number} accuracyModifier - Attack accuracy modifier
 * @property {Object<string, number>} elementalResistance - Resistance to elements
 * @property {Object<string, number>} temporaryEffects - Time-limited effects
 */

/**
 * @typedef {Object} FighterStats
 * @description Battle performance statistics
 * @property {number} damageDealt - Total damage dealt
 * @property {number} damageReceived - Total damage received
 * @property {number} movesUsed - Number of moves executed
 * @property {number} criticalHits - Number of critical hits
 * @property {number} missedAttacks - Number of missed attacks
 * @property {number} energySpent - Total energy consumed
 * @property {Object<string, number>} moveHistory - History of moves used
 */

// ============================================================================
// BATTLE STATE TYPES
// ============================================================================

/**
 * @typedef {Object} BattleState
 * @description Complete battle state container
 * @property {string} locationId - Battle location identifier
 * @property {string} timeOfDay - Time of day setting
 * @property {number} turn - Current turn number
 * @property {string} currentPhase - Current battle phase
 * @property {boolean} emotionalMode - Emotional mode enabled
 * @property {EnvironmentState} environmentState - Environmental conditions
 * @property {LocationConditions} locationConditions - Location-specific conditions
 * @property {Object<string, any>} [weatherConditions] - Weather effects
 * @property {Object<string, any>} [metadata] - Battle metadata and settings
 */

/**
 * @typedef {Object} EnvironmentState
 * @description Environmental state and damage
 * @property {number} totalDamage - Total environmental damage (0-100)
 * @property {number} impactLevel - Current impact level (0-4)
 * @property {string} damageLevel - Damage level description
 * @property {string[]} impactDescriptions - List of impact descriptions
 * @property {Object<string, number>} elementalDamage - Damage by element type
 * @property {boolean} isDestroyed - Environment completely destroyed
 */

/**
 * @typedef {Object} LocationConditions
 * @description Location-specific battle conditions
 * @property {Object<string, LocationModifier>} modifiers - Element-specific modifiers
 * @property {string[]} specialFeatures - Special location features
 * @property {number} elevation - Elevation level
 * @property {string} terrain - Terrain type
 * @property {Object<string, any>} customProperties - Location-specific data
 */

/**
 * @typedef {Object} LocationModifier
 * @description Modifier for specific element/move type
 * @property {number} damage - Damage multiplier
 * @property {number} energy - Energy cost multiplier
 * @property {string} reason - Explanation for modifier
 */

/**
 * @typedef {Object} WeatherConditions
 * @description Weather effects on battle
 * @property {string} type - Weather type (clear, rain, storm, etc.)
 * @property {number} intensity - Weather intensity (0-10)
 * @property {Object<string, number>} modifiers - Weather-based modifiers
 * @property {string[]} effects - Active weather effects
 */

/**
 * @typedef {Object} BattleMetadata
 * @description Battle configuration and metadata
 * @property {string} battleId - Unique battle identifier
 * @property {number} startTime - Battle start timestamp
 * @property {string} version - Engine version used
 * @property {Object<string, any>} config - Battle configuration
 * @property {string[]} flags - Active battle flags
 */

/**
 * @typedef {Object} BattleResult
 * @description Complete battle result
 * @property {BattleEvent[]} log - Complete battle event log
 * @property {string} [winnerId] - Winner fighter ID
 * @property {string} [loserId] - Loser fighter ID
 * @property {boolean} isDraw - Whether battle was a draw
 * @property {Object} finalState - Final state of all fighters
 * @property {EnvironmentState} environmentState - Final environment state
 * @property {string[]} phaseSummary - Phase summary log
 */

/**
 * @typedef {Object} BattleEvent
 * @description Battle event for logging
 * @property {string} type - Event type identifier
 * @property {number} turn - Turn when event occurred
 * @property {string} phase - Phase when event occurred
 * @property {string} text - Event description text
 * @property {string} [actorId] - ID of acting character
 * @property {string} [targetId] - ID of target character
 * @property {Object<string, any>} [data] - Event-specific data
 * @property {number} timestamp - Event timestamp
 * @property {string} [category] - Event category for filtering
 */

// ============================================================================
// PHASE SYSTEM TYPES
// ============================================================================

/**
 * @typedef {Object} PhaseState
 * @description Battle phase management state
 * @property {string} currentPhase - Current phase identifier
 * @property {number} phaseStartTurn - Turn when phase started
 * @property {number} turnsSincePhaseStart - Turns elapsed in current phase
 * @property {Object<string, any>} phaseData - Phase-specific data
 * @property {string[]} phaseSummaryLog - Phase summary messages
 */

/**
 * @typedef {Object} PhaseTransition
 * @description Record of a phase transition
 * @property {string} fromPhase - Previous phase
 * @property {string} toPhase - New phase
 * @property {number} turn - Turn of transition
 * @property {string} reason - Reason for transition
 * @property {Object<string, any>} context - Transition context data
 */

// ============================================================================
// MOVE AND ACTION TYPES
// ============================================================================

/**
 * @typedef {Object} Move
 * @description Battle move definition
 * @property {string} id - Unique move identifier
 * @property {string} name - Display name
 * @property {string} description - Move description
 * @property {string} element - Element type (fire, air, earth, water, etc.)
 * @property {string} type - Move type (offensive, defensive, utility, etc.)
 * @property {number} baseDamage - Base damage value
 * @property {number} energyCost - Energy required to use
 * @property {number} accuracy - Base accuracy (0-1)
 * @property {number} criticalChance - Critical hit chance (0-1)
 * @property {Effect[]} effects - Move effects
 */

/**
 * @typedef {Object} Effect
 * @description Battle effect definition
 * @property {string} type - Effect type identifier
 * @property {string} target - Effect target (self, opponent, environment)
 * @property {number} [value] - Effect magnitude
 * @property {number} [duration] - Effect duration in turns
 * @property {string} [condition] - Activation condition
 * @property {Object<string, any>} [params] - Effect parameters
 * @property {string} [description] - Effect description
 */

/**
 * @typedef {Object} MoveResult
 * @description Result of executing a move
 * @property {boolean} hit - Whether move connected
 * @property {boolean} critical - Whether move was critical hit
 * @property {number} damage - Actual damage dealt
 * @property {number} energyCost - Actual energy consumed
 * @property {string} effectiveness - Effectiveness level
 * @property {string[]} narrativeEvents - Generated narrative events
 */

/**
 * @typedef {Object} AppliedEffect
 * @description Record of an applied effect
 * @property {string} effectType - Type of effect applied
 * @property {string} targetId - ID of effect target
 * @property {number} magnitude - Effect magnitude
 * @property {number} [duration] - Remaining duration
 * @property {boolean} success - Whether effect was successfully applied
 * @property {string} [description] - Effect description
 */

/**
 * @typedef {Object} MoveResultMetadata
 * @description Additional move result information
 * @property {number} rollValue - Random roll value used
 * @property {number} threshold - Threshold for success
 * @property {Object<string, number>} modifiers - Applied modifiers
 * @property {string[]} resistances - Resistances that affected result
 * @property {string} calculationMethod - Method used for calculations
 */

// ============================================================================
// EVENT AND LOGGING TYPES
// ============================================================================

/**
 * @typedef {Object} LogEntry
 * @description Structured log entry
 * @property {string} level - Log level (debug, info, warn, error)
 * @property {string} message - Log message
 * @property {string} module - Module that generated log
 * @property {number} timestamp - Log timestamp
 * @property {Object<string, any>} [context] - Additional context data
 * @property {Error} [error] - Associated error object
 */

/**
 * @typedef {Object} PerformanceEvent
 * @description Performance measurement event
 * @property {string} operation - Operation being measured
 * @property {number} duration - Duration in milliseconds
 * @property {number} memoryUsed - Memory usage in bytes
 * @property {string} [category] - Performance category
 * @property {Object<string, any>} [metadata] - Additional performance data
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
 * @property {AiAnalysis} analysis - Decision analysis
 * @property {Object<string, number>} moveScores - Scores for all considered moves
 * @property {AiPersonality} personalityInfluence - Personality factors
 */

/**
 * @typedef {Object} AiAnalysis
 * @description AI decision analysis
 * @property {string} strategicIntent - Overall strategy
 * @property {number} aggressionLevel - Aggression level (0-1)
 * @property {number} riskTolerance - Risk tolerance (0-1)
 * @property {string[]} consideredFactors - Factors considered
 * @property {Object<string, number>} weights - Decision weights
 * @property {string} primaryGoal - Primary tactical goal
 */

/**
 * @typedef {Object} AiPersonality
 * @description AI personality traits affecting decisions
 * @property {number} aggression - Aggression trait (0-1)
 * @property {number} caution - Caution trait (0-1)
 * @property {number} creativity - Creativity trait (0-1)
 * @property {number} adaptability - Adaptability trait (0-1)
 * @property {Object<string, number>} preferences - Move type preferences
 * @property {Object<string, any>} triggers - Personality triggers
 */

/**
 * @typedef {Object} AiMemory
 * @description AI memory of opponent patterns
 * @property {Object<string, number>} opponentMoveFrequency - Opponent move usage
 * @property {string[]} opponentPatterns - Identified patterns
 * @property {Object<string, number>} effectiveCounters - Effective counter moves
 * @property {number} adaptationLevel - How much AI has adapted
 * @property {AiMemoryEntry[]} recentEvents - Recent battle events
 */

/**
 * @typedef {Object} AiMemoryEntry
 * @description Single AI memory entry
 * @property {number} turn - Turn of remembered event
 * @property {string} event - Event type
 * @property {string} context - Event context
 * @property {number} importance - Memory importance (0-1)
 * @property {Object<string, any>} data - Associated data
 */

// ============================================================================
// UI AND RENDERING TYPES
// ============================================================================

/**
 * @typedef {Object} UIState
 * @description Complete UI state
 * @property {string} currentScreen - Current screen identifier
 * @property {SelectionState} selection - Current selections
 * @property {RenderState} rendering - Rendering state
 * @property {AnimationState} animation - Animation state
 * @property {InteractionState} interaction - User interaction state
 * @property {Object<string, any>} cache - UI cache data
 */

/**
 * @typedef {Object} SelectionState
 * @description User selection state
 * @property {string} [fighter1Id] - Selected first fighter
 * @property {string} [fighter2Id] - Selected second fighter
 * @property {string} [locationId] - Selected location
 * @property {string} [timeOfDay] - Selected time of day
 * @property {string} gameMode - Selected game mode
 * @property {boolean} emotionalMode - Emotional mode setting
 */

/**
 * @typedef {Object} RenderState
 * @description UI rendering state
 * @property {boolean} needsUpdate - Whether UI needs re-render
 * @property {Object<string, any>} lastRendered - Last rendered state
 * @property {string[]} dirtyComponents - Components needing update
 * @property {number} lastRenderTime - Last render timestamp
 * @property {RenderPerformance} performance - Rendering performance data
 */

/**
 * @typedef {Object} RenderPerformance
 * @description UI rendering performance metrics
 * @property {number} averageRenderTime - Average render time in ms
 * @property {number} maxRenderTime - Maximum render time in ms
 * @property {number} totalRenders - Total number of renders
 * @property {number} skippedRenders - Number of skipped renders
 * @property {Object<string, number>} componentTimes - Per-component render times
 */

/**
 * @typedef {Object} AnimationState
 * @description Animation system state
 * @property {AnimationQueueItem[]} queue - Animation queue
 * @property {boolean} isPlaying - Whether animations are playing
 * @property {number} currentIndex - Current animation index
 * @property {string} speed - Animation speed setting
 * @property {boolean} isPaused - Whether animations are paused
 */

/**
 * @typedef {Object} AnimationQueueItem
 * @description Single animation queue item
 * @property {string} type - Animation type
 * @property {string} text - Animation text
 * @property {number} duration - Animation duration in ms
 * @property {string} [element] - Associated element type
 * @property {string} [effectiveness] - Move effectiveness
 * @property {Object<string, any>} [metadata] - Animation metadata
 */

/**
 * @typedef {Object} InteractionState
 * @description User interaction state
 * @property {boolean} isInteracting - Whether user is currently interacting
 * @property {string} [activeElement] - Currently active UI element
 * @property {Object<string, boolean>} disabledElements - Disabled UI elements
 * @property {InteractionHistory[]} history - Interaction history
 * @property {Object<string, any>} preferences - User preferences
 */

/**
 * @typedef {Object} InteractionHistory
 * @description Record of user interaction
 * @property {string} action - Action type
 * @property {string} element - UI element interacted with
 * @property {number} timestamp - Interaction timestamp
 * @property {Object<string, any>} [data] - Interaction data
 */

// ============================================================================
// RESULT AND ANALYSIS TYPES
// ============================================================================

/**
 * @typedef {Object} BattleFinalState
 * @description Final state of all fighters
 * @property {Fighter} fighter1 - Final state of fighter 1
 * @property {Fighter} fighter2 - Final state of fighter 2
 */

/**
 * @typedef {Object} BattleStatistics
 * @description Battle performance statistics
 * @property {number} totalTurns - Total turns in battle
 * @property {number} totalDamage - Total damage dealt
 * @property {number} battleDuration - Battle duration in ms
 * @property {Object<string, number>} moveUsage - Move usage statistics
 * @property {Object<string, number>} elementUsage - Element usage statistics
 * @property {PerformanceMetrics} performance - Performance metrics
 */

/**
 * @typedef {Object} BattleAnalysis
 * @description Post-battle analysis
 * @property {string} victoryMethod - How victory was achieved
 * @property {string[]} keyMoments - Key moments in battle
 * @property {FighterAnalysis} fighter1Analysis - Fighter 1 analysis
 * @property {FighterAnalysis} fighter2Analysis - Fighter 2 analysis
 * @property {string[]} insights - Battle insights
 * @property {Object<string, any>} metadata - Analysis metadata
 */

/**
 * @typedef {Object} FighterAnalysis
 * @description Individual fighter performance analysis
 * @property {number} damageEfficiency - Damage per energy ratio
 * @property {number} survivability - How well fighter survived
 * @property {number} adaptability - How well fighter adapted
 * @property {string[]} strengths - Fighter strengths shown
 * @property {string[]} weaknesses - Fighter weaknesses exposed
 * @property {Object<string, number>} scores - Various performance scores
 */

/**
 * @typedef {Object} PerformanceMetrics
 * @description System performance metrics
 * @property {number} averageTurnTime - Average time per turn in ms
 * @property {number} memoryUsage - Peak memory usage in bytes
 * @property {number} cpuTime - Total CPU time in ms
 * @property {Object<string, number>} modulePerformance - Per-module performance
 */

// ============================================================================
// UTILITY AND HELPER TYPES
// ============================================================================

/**
 * @typedef {Object} ValidationResult
 * @description Result of data validation
 * @property {boolean} isValid - Whether data is valid
 * @property {string[]} errors - Validation errors
 * @property {string[]} warnings - Validation warnings
 * @property {Object<string, any>} [correctedData] - Auto-corrected data
 */

/**
 * @typedef {Object} ConfigOptions
 * @description Configuration options
 * @property {boolean} debugMode - Debug mode enabled
 * @property {boolean} performanceTracking - Performance tracking enabled
 * @property {string} logLevel - Logging level
 * @property {number} maxTurns - Maximum battle turns
 * @property {boolean} deterministicRandom - Use deterministic random
 * @property {Object<string, any>} customSettings - Custom configuration
 */

/**
 * @typedef {Object} ErrorContext
 * @description Error context information
 * @property {string} module - Module where error occurred
 * @property {string} function - Function where error occurred
 * @property {Object<string, any>} inputs - Function inputs at time of error
 * @property {string} operation - Operation being performed
 * @property {Object<string, any>} state - Relevant state at time of error
 */

// ============================================================================
// COMPLEX COMPOSITE TYPES
// ============================================================================

/**
 * @typedef {Object} GameState
 * @description Complete game state container
 * @property {UIState} ui - UI state
 * @property {BattleState} [battle] - Current battle state (if in battle)
 * @property {Fighter} [fighter1] - Fighter 1 state (if in battle)
 * @property {Fighter} [fighter2] - Fighter 2 state (if in battle)
 * @property {PhaseState} [phase] - Phase state (if in battle)
 * @property {BattleEvent[]} [eventLog] - Battle event log (if in battle)
 * @property {ConfigOptions} config - Game configuration
 * @property {Object<string, any>} cache - Global cache
 */

/**
 * @typedef {function(Fighter, Fighter, BattleState, PhaseState): MoveResult} MoveProcessor
 * @description Function signature for move processing
 */

/**
 * @typedef {function(BattleEvent): void} EventHandler
 * @description Function signature for event handling
 */

/**
 * @typedef {function(Fighter, Fighter, BattleState): AiDecision} AiDecisionFunction
 * @description Function signature for AI decision making
 */

/**
 * @typedef {function(any[], Object): ValidationResult} ValidatorFunction
 * @description Function signature for validation functions
 */

// ============================================================================
// EXPORTS FOR GLOBAL AVAILABILITY
// ============================================================================

// Re-export types for global availability (optional)
export {};

// Global type definitions are now available throughout the project
// Use /** @type {TypeName} */ for variable typing
// Use /** @param {TypeName} paramName */ for parameters
// Use /** @returns {TypeName} */ for return types 