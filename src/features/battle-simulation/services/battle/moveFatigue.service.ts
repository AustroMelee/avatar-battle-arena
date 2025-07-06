// CONTEXT: Battle, // FOCUS: MoveFatigue
import type { BattleCharacter } from '../../types';
import type { Ability } from '../../types/move.types';
import { createMechanicLogEntry } from '../utils/mechanicLogUtils';

/**
 * Configuration for move fatigue mechanics.
 */
export interface MoveFatigueConfig {
  fatigueThreshold: number; // Number of uses before fatigue starts
  fatiguePenalty: number; // Penalty per use after threshold
  maxFatiguePenalty: number; // Maximum penalty
}

export const DEFAULT_MOVE_FATIGUE_CONFIG: MoveFatigueConfig = {
  fatigueThreshold: 3,
  fatiguePenalty: 0.1, // 10% per use
  maxFatiguePenalty: 0.5, // 50% max
};

/**
 * Tracks and updates fatigue for a move on a character.
 * Returns the effective power multiplier for the move.
 */
export function getMoveFatigueMultiplier(
  character: BattleCharacter,
  move: Ability,
  config: MoveFatigueConfig = DEFAULT_MOVE_FATIGUE_CONFIG
): number {
  const moveHistory = character.moveHistory || [];
  const useCount = moveHistory.filter(m => m === move.name).length;
  if (useCount <= config.fatigueThreshold) return 1;
  const penalty = Math.min((useCount - config.fatigueThreshold) * config.fatiguePenalty, config.maxFatiguePenalty);
  return 1 - penalty;
}

/**
 * Applies fatigue penalty to a move's base power.
 */
export function applyMoveFatigue(
  basePower: number,
  multiplier: number
): number {
  return Math.max(1, Math.floor(basePower * multiplier));
} 