// CONTEXT: Fallback Move System
// RESPONSIBILITY: Provide always-available moves to prevent battle deadlocks
import { Ability } from '@/common/types';

/**
 * @description Basic attack that is always available, even with zero chi.
 * Provides minimal damage but prevents complete deadlock.
 */
export const BASIC_ATTACK: Ability = {
  name: 'Basic Strike',
  type: 'attack',
  power: 2, // Minimal damage
  description: 'A basic physical strike. Always available.',
  chiCost: 0, // No chi cost
  tags: ['basic', 'fallback']
};

/**
 * @description Rest/focus move that allows chi recovery at the cost of skipping an attack.
 * Provides strategic resource management.
 */
export const REST_MOVE: Ability = {
  name: 'Focus',
  type: 'defense_buff',
  power: 5, // Small defense bonus
  description: 'Focus and recover chi. Skip attack this turn for enhanced regeneration.',
  chiCost: 0, // No chi cost
  tags: ['rest', 'recovery', 'defensive']
};

/**
 * @description Desperation attack that unlocks when health is critically low.
 * High risk, high reward move for comeback potential.
 */
export const DESPERATION_ATTACK: Ability = {
  name: 'Desperate Strike',
  type: 'attack',
  power: 8, // High damage for desperation
  description: 'A desperate attack fueled by survival instinct. Only available when critically wounded.',
  chiCost: 0, // No chi cost (desperation doesn't need chi)
  tags: ['desperate', 'high-damage', 'comeback']
};

/**
 * @description Gets all fallback moves that should always be available.
 * @returns {Ability[]} Array of fallback abilities
 */
export function getFallbackMoves(): Ability[] {
  return [BASIC_ATTACK, REST_MOVE, DESPERATION_ATTACK];
}

/**
 * @description Checks if a desperation move should be available based on character state.
 * @param {number} currentHealth - Current health of the character
 * @param {number} maxHealth - Maximum health of the character
 * @returns {boolean} True if desperation moves should be available
 */
export function shouldUnlockDesperation(currentHealth: number, maxHealth: number = 100): boolean {
  const healthPercentage = (currentHealth / maxHealth) * 100;
  return healthPercentage <= 25; // Unlock when health is 25% or below
}

/**
 * @description Gets available fallback moves based on character state.
 * @param {number} currentHealth - Current health of the character
 * @param {number} maxHealth - Maximum health of the character
 * @returns {Ability[]} Array of available fallback abilities
 */
export function getAvailableFallbackMoves(currentHealth: number, maxHealth: number = 100): Ability[] {
  const moves = [BASIC_ATTACK, REST_MOVE];
  
  // Add desperation moves if health is critically low
  if (shouldUnlockDesperation(currentHealth, maxHealth)) {
    moves.push(DESPERATION_ATTACK);
  }
  
  return moves;
} 