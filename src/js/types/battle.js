"use strict";

/**
 * @fileoverview Core Battle Type Definitions
 * @description Defines the core data structures for fighters, battle state, and moves.
 */

// ============================================================================
// BATTLE TYPES
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
 * @property {string} [opponentID] - ID of opponent fighter
 * @property {MentalState} mentalState - Psychological state
 * @property {FighterTraits} traits - Character traits and abilities
 * @property {FighterModifiers} modifiers - Active temporary modifiers
 * @property {FighterStats} stats - Performance statistics
 * @property {Move[]} moves - The fighter's available moves
 * @property {Object<string, number>} [moveCooldowns] - Cooldowns for moves
 * @property {StatusEffect[]} [statusEffects] - Active status effects on the fighter
 * @property {number} [incapacitationScore] - The fighter's incapacitation score
 * @property {string} [escalationState] - The fighter's escalation state
 */

/**
 * @typedef {Object} MentalState
 * @description Fighter's psychological state
 * @property {number} confidence - Confidence level (0-100)
 * @property {number} focus - Focus level (0-100)
 * @property {number} desperation - Desperation level (0-100)
 * @property {number} rage - Rage level (0-100)
 * @property {string} dominantEmotion - Primary emotional state
 */

/**
 * @typedef {Object} FighterTraits
 * @description Character traits and special abilities
 * @property {boolean} canFly - Ability to fly
 * @property {boolean} canRedirectLightning - Lightning redirection ability
 * @property {boolean} isProdigy - Prodigy status
 */

/**
 * @typedef {Object} FighterModifiers
 * @description Temporary modifiers affecting fighter performance
 * @property {number} damageModifier - Damage output modifier (multiplier)
 * @property {number} evasionModifier - Evasion chance modifier
 * @property {Object<string, number>} elementalResistance - Resistance to elements
 */

/**
 * @typedef {Object} FighterStats
 * @description Battle performance statistics
 * @property {number} damageDealt - Total damage dealt
 * @property {number} damageReceived - Total damage received
 * @property {number} movesUsed - Number of moves executed
 */

/**
 * @typedef {Object} BattleState
 * @description Complete battle state container
 * @property {string} locationId - Battle location identifier
 * @property {number} turn - Current turn number
 * @property {string} currentPhase - Current battle phase
 * @property {EnvironmentState} environment - Environmental conditions
 * @property {Fighter} fighter1 - The first fighter
 * @property {Fighter} fighter2 - The second fighter
 * @property {BattleEvent[]} log - Log of battle events
 * @property {string | null} [winnerId] - The ID of the winner, if any.
 */

/**
 * @typedef {Object} EnvironmentState
 * @description Environmental state and damage
 * @property {number} totalDamage - Total environmental damage (0-100)
 * @property {string[]} impactDescriptions - List of impact descriptions
 */

/**
 * @typedef {Object} Move
 * @description Battle move definition
 * @property {string} id - Unique move identifier
 * @property {string} name - Display name
 * @property {string} element - Element type (fire, air, earth, water, etc.)
 * @property {string} type - Move type (offensive, defensive, utility, etc.)
 * @property {number} baseDamage - Base damage value
 * @property {number} energyCost - Energy required to use
 * @property {number} accuracy - Base accuracy (0-1)
 * @property {Effect[]} effects - Move effects
 */

/**
 * @typedef {Object} Effect
 * @description Battle effect definition
 * @property {string} type - Effect type identifier
 * @property {string} target - Effect target (self, opponent, environment)
 * @property {number} [value] - Effect magnitude
 * @property {number} [duration] - Effect duration in turns
 */

/**
 * @typedef {Object} StatusEffect
 * @description An active status effect on a fighter.
 * @property {string} id - Unique ID for the status effect instance.
 * @property {string} type - The type of status effect (e.g., 'poison', 'regen').
 * @property {number} duration - Remaining turns for the effect.
 * @property {number} [value] - The magnitude of the effect per turn.
 * @property {'pre-turn' | 'post-turn'} timing - When the effect triggers.
 */
 
 /**
 * @typedef {Object} BattleEvent
 * @description Battle event for logging
 * @property {string} type - Event type identifier
 * @property {number} turn - Turn when event occurred
 * @property {string} phase - Phase when event occurred
 * @property {string} [actorId] - ID of acting character
 * @property {Object<string, any>} [data] - Event-specific data
 */

/**
 * @typedef {Object} BattleResult
 * @description The result of a completed battle.
 * @property {string | null} winnerId - The ID of the winning fighter, or null for a draw.
 * @property {string | null} loserId - The ID of the losing fighter, or null for a draw.
 * @property {string} outcome - A description of the outcome (e.g., 'knockout', 'draw').
 * @property {BattleState} finalState - The state of the battle when it ended.
 */

export {}; 