// CONTEXT: Cooldown & Diminishing Returns System
// RESPONSIBILITY: Prevent move spam, add strategic depth, and balance combat
import { Ability } from '@/common/types';
import { BattleCharacter } from '../../types';

/**
 * @description Enhanced ability with cooldown and diminishing returns.
 */
export interface EnhancedAbility extends Ability {
  cooldown?: number; // Turns before can reuse
  maxUses?: number; // Maximum uses per battle
  diminishingReturns?: {
    threshold: number; // Uses before diminishing starts
    reduction: number; // Power reduction per use after threshold
    minPower: number; // Minimum power after diminishing returns
  };
}

/**
 * @description Cooldown state for a character.
 */
export interface CooldownState {
  cooldowns: Record<string, number>; // moveId -> turns remaining
  uses: Record<string, number>; // moveId -> times used this battle
  diminishingEffects: Record<string, number>; // moveId -> current power reduction
}

/**
 * @description Applies cooldown and usage tracking to a character.
 * @param {BattleCharacter} character - The character to update
 * @param {string} moveId - The move that was used
 * @param {EnhancedAbility} ability - The ability definition
 * @returns {BattleCharacter} Updated character with cooldown state
 */
export function applyCooldownAndUsage(
  character: BattleCharacter,
  moveId: string,
  ability: EnhancedAbility
): BattleCharacter {
  const newCooldowns = { ...character.cooldowns };
  const newUses = { ...character.usesLeft };
  const newDiminishingEffects = { ...character.diminishingEffects };

  // Set cooldown if the ability has one
  if (ability.cooldown && ability.cooldown > 0) {
    newCooldowns[moveId] = ability.cooldown;
  }

  // Increment usage count
  const currentUses = newUses[moveId] || 0;
  newUses[moveId] = currentUses + 1;

  // Apply diminishing returns if configured
  if (ability.diminishingReturns) {
    const { threshold, reduction, minPower } = ability.diminishingReturns;
    if (currentUses >= threshold) {
      const extraUses = currentUses - threshold + 1;
      const powerReduction = extraUses * reduction;
      newDiminishingEffects[moveId] = Math.min(powerReduction, ability.power - minPower);
    }
  }

  return {
    ...character,
    cooldowns: newCooldowns,
    usesLeft: newUses,
    diminishingEffects: newDiminishingEffects
  };
}

/**
 * @description Reduces all cooldowns by one turn.
 * @param {BattleCharacter} character - The character whose cooldowns to reduce
 * @returns {BattleCharacter} Character with updated cooldowns
 */
export function reduceCooldowns(character: BattleCharacter): BattleCharacter {
  const newCooldowns = { ...character.cooldowns };
  
  Object.keys(newCooldowns).forEach(moveId => {
    if (newCooldowns[moveId] > 0) {
      newCooldowns[moveId]--;
    }
  });

  return {
    ...character,
    cooldowns: newCooldowns
  };
}

/**
 * @description Checks if a move is available (not on cooldown and within usage limits).
 * @param {BattleCharacter} character - The character to check
 * @param {string} moveId - The move to check
 * @param {EnhancedAbility} ability - The ability definition
 * @returns {boolean} True if the move is available
 */
export function isMoveAvailable(
  character: BattleCharacter,
  moveId: string,
  ability: EnhancedAbility
): boolean {
  // Check cooldown
  const cooldownRemaining = character.cooldowns[moveId] || 0;
  if (cooldownRemaining > 0) {
    return false;
  }

  // Check usage limit
  if (ability.maxUses) {
    const currentUses = character.usesLeft[moveId] || 0;
    if (currentUses >= ability.maxUses) {
      return false;
    }
  }

  return true;
}

/**
 * @description Gets the effective power of a move after diminishing returns.
 * @param {BattleCharacter} character - The character using the move
 * @param {string} moveId - The move ID
 * @param {EnhancedAbility} ability - The ability definition
 * @returns {number} Effective power after diminishing returns
 */
export function getEffectivePower(
  character: BattleCharacter,
  moveId: string,
  ability: EnhancedAbility
): number {
  if (!ability.diminishingReturns) {
    return ability.power;
  }

  const powerReduction = character.diminishingEffects[moveId] || 0;
  return Math.max(ability.diminishingReturns.minPower, ability.power - powerReduction);
}

/**
 * @description Gets cooldown information for UI display.
 * @param {BattleCharacter} character - The character to check
 * @param {string} moveId - The move ID
 * @returns {object} Cooldown information
 */
export function getCooldownInfo(
  character: BattleCharacter,
  moveId: string
): { isOnCooldown: boolean; turnsRemaining: number; usageCount: number } {
  const cooldownRemaining = character.cooldowns[moveId] || 0;
  const usageCount = character.usesLeft[moveId] || 0;

  return {
    isOnCooldown: cooldownRemaining > 0,
    turnsRemaining: cooldownRemaining,
    usageCount
  };
}

/**
 * @description Creates enhanced ability definitions with cooldowns and diminishing returns.
 */
export const ENHANCED_ABILITIES: Record<string, EnhancedAbility> = {
  'air_shield': {
    name: 'Air Shield',
    type: 'defense_buff',
    power: 15,
    description: 'Creates a protective air barrier.',
    chiCost: 3,
    cooldown: 2, // Can't spam shield
    diminishingReturns: {
      threshold: 2, // After 2 uses
      reduction: 3, // Reduce power by 3 each use
      minPower: 5 // Minimum 5 defense
    }
  },
  'fire_jets': {
    name: 'Fire Jets',
    type: 'defense_buff',
    power: 12,
    description: 'Propels with fire for enhanced mobility.',
    chiCost: 2,
    cooldown: 1, // Short cooldown
    diminishingReturns: {
      threshold: 3, // After 3 uses
      reduction: 2, // Reduce power by 2 each use
      minPower: 4 // Minimum 4 defense
    }
  },
  'lightning': {
    name: 'Lightning',
    type: 'attack',
    power: 25,
    description: 'Devastating lightning strike.',
    chiCost: 6,
    cooldown: 3, // Long cooldown for powerful move
    maxUses: 2 // Only 2 uses per battle
  },
  'wind_slice': {
    name: 'Wind Slice',
    type: 'attack',
    power: 20,
    description: 'Sharp wind blade attack.',
    chiCost: 4,
    cooldown: 2, // Medium cooldown
    diminishingReturns: {
      threshold: 2, // After 2 uses
      reduction: 4, // Reduce power by 4 each use
      minPower: 8 // Minimum 8 damage
    }
  }
}; 