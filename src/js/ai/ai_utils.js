"use strict";

/**
 * @fileoverview AI Utility Functions
 * @description Shared helper functions used across AI modules. Extracted from ai_decision_engine.js for reuse and easier testing.
 * @version 1.0.0
 */

// ============================================================================
// TYPE IMPORTS
// ============================================================================
/**
 * @typedef {import('../types.js').Fighter} Fighter
 * @typedef {import('../types.js').BattleState} BattleState
 * @typedef {import('../types.js').Move} Move
 */

// ============================================================================
// ELEMENTAL EFFECTIVENESS
// ============================================================================

/**
 * Calculates elemental effectiveness multiplier between attacker and defender.
 * Identical logic moved from ai_decision_engine.js to central utility.
 *
 * @param {string} attackElement - Attacking element
 * @param {string} defenseElement - Defending element
 * @returns {number} Effectiveness multiplier (default 1.0)
 */
function getElementalEffectiveness(attackElement, defenseElement) {
  /** @type {Object<string, Object<string, number>>} */
  const effectiveness = {
    fire:  { water: 0.5, earth: 1.5, air: 1.0 },
    water: { fire: 1.5, earth: 1.0, air: 1.0 },
    earth: { fire: 0.5, water: 1.0, air: 1.5 },
    air:   { fire: 1.0, water: 1.0, earth: 0.5 }
  };

  return effectiveness[attackElement]?.[defenseElement] || 1.0;
}

// ============================================================================
// MOVE AVAILABILITY
// ============================================================================

/**
 * Filters a fighter's move list down to currently available moves.
 *
 * @param {Fighter} fighter - Fighter to get moves for
 * @param {BattleState} battleState - Current battle state (unused for now, but kept for future context-dependent logic)
 * @returns {Move[]} Array of moves the fighter can currently use
 */
function getAvailableMoves(fighter, battleState) {
  /** @type {any} */
  const f = fighter;
  if (!f?.moves || !Array.isArray(f.moves)) {
    return [];
  }

  return /** @type {Move[]} */ (f.moves.filter(/** @param {any} move */ (move) => {
    /** @type {any} */
    const m = move;
    // Check energy requirements
    if (m.energyCost && (f.energy ?? 100) < m.energyCost) {
      return false;
    }

    // Check cooldowns
    if (m.cooldown && f.moveCooldowns && f.moveCooldowns[m.id] > 0) {
      return false;
    }

    // Placeholder for future special conditions (e.g., low-health unlocks)
    return true;
  }));
}

// ============================================================================
// EXPORTS
// ============================================================================

export { getElementalEffectiveness, getAvailableMoves }; 