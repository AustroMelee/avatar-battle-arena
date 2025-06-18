"use strict";

/**
 * @fileoverview AI Scoring Utilities
 * @description Helper functions for move evaluation and reasoning, extracted from ai_decision_engine.js to reduce file size and improve modularity.
 * @version 1.0.0
 */

// ============================================================================
// TYPE IMPORTS
// ============================================================================
/**
 * @typedef {import('../types.js').Fighter} Fighter
 * @typedef {import('../types.js').Move} Move
 * @typedef {import('../types.js').DecisionContext} DecisionContext
 * @typedef {import('../types.js').AiAnalysis} AiAnalysis
 * @typedef {import('../types.js').AiPersonality} AiPersonality
 * @typedef {import('../types.js').MoveEvaluation} MoveEvaluation
 */

// ============================================================================
// DEPENDENCY IMPORTS
// ============================================================================
import { getPersonalityTraits } from "./ai_personality.js";
import { getOpponentPatterns } from "./ai_memory.js";

// ============================================================================
// PERSONALITY MODIFIERS
// ============================================================================

/**
 * Applies personality modifiers to move evaluation scoring.
 *
 * @param {Move} move - Move being evaluated
 * @param {DecisionContext} context - Decision context
 * @param {AiAnalysis} analysis - Strategic analysis
 * @returns {Object<string, number>} Personality-derived scoring modifiers
 */
function applyPersonalityModifiers(move, context, analysis) {
  /** @type {AiPersonality} */
  const personality = getPersonalityTraits(context.self);

  /** @type {Record<string, number>} */
  const modifiers = {};

  // Aggression modifier
  if (move.type === "offensive") {
    modifiers.aggression = (personality.aggression ?? 0.5) * 20;
  }
  // Caution modifier
  if (move.type === "defensive") {
    modifiers.caution = (personality.caution ?? 0.5) * 15;
  }
  // Creativity modifier
  if (move.statusEffects?.length || move.type === "utility") {
    modifiers.creativity = (personality.creativity ?? 0.5) * 10;
  }

  // Total
  modifiers.total = Object.values(modifiers).reduce((s, v) => s + v, 0);
  return modifiers;
}

// ============================================================================
// MEMORY MODIFIERS
// ============================================================================

/**
 * Applies AI-memory-based modifiers to move scoring.
 *
 * @param {Move} move - Move being evaluated
 * @param {DecisionContext} context - Decision context
 * @returns {Promise<number>} Memory modifier in range ‑10…10
 */
async function applyMemoryModifiers(move, context) {
  try {
    /** @type {any[]} */
    const patterns = await getOpponentPatterns(context.opponent.id);
    /** @type {number} */
    const pastEffectiveness = patterns
      .filter((p) => p.moveId === move.id)
      .reduce((sum, p) => sum + (p.success ? 1 : -1), 0);
    return Math.max(-10, Math.min(10, pastEffectiveness * 2));
  } catch (error) {
    console.warn("[AI Utils] Error applying memory modifiers:", error);
    return 0;
  }
}

// ============================================================================
// REASONING GENERATION
// ============================================================================

/**
 * Generates a human-readable explanation for why a move was selected.
 *
 * @param {Move} move - Move being evaluated
 * @param {Record<string, number>} factors - Scoring factors
 * @param {AiAnalysis} analysis - Strategic analysis
 * @returns {string} Human-readable reasoning
 */
function generateMoveReasoning(move, factors, analysis) {
  /** @type {string[]} */
  const reasons = [];
  /** @type {string} */
  const primaryFactor = Object.entries(factors).reduce((max, [k, v]) => (v > factors[max] ? k : max), "damage");

  switch (primaryFactor) {
    case "damage":
      reasons.push(`High damage potential (${move.damage ?? 0})`);
      break;
    case "accuracy":
      reasons.push(`Reliable accuracy (${(((move.accuracy ?? 0.8) * 100).toFixed(0))}%)`);
      break;
    case "strategic":
      reasons.push(`Aligns with strategic goal: ${analysis.primaryGoal}`);
      break;
  }
  if (factors.strategic > 60) reasons.push("good strategic value");
  if (factors.risk < 30) reasons.push("low risk");
  return reasons.join(", ");
}

// ============================================================================
// SCORE MAP CREATION
// ============================================================================

/**
 * Converts an array of move evaluations into a lookup map.
 *
 * @param {MoveEvaluation[]} evaluations - Evaluations array
 * @returns {Record<string, number>} Map of moveId → score
 */
function createMoveScoreMap(evaluations) {
  /** @type {Record<string, number>} */
  const map = {};
  for (const ev of evaluations) {
    map[ev.moveId] = ev.score;
  }
  return map;
}

// ============================================================================
// EXPORTS
// ============================================================================
export { applyPersonalityModifiers, applyMemoryModifiers, generateMoveReasoning, createMoveScoreMap }; 