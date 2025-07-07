// CONTEXT: Buff/Debuff Management (Legacy - Use statusEffect.service.ts instead)
// RESPONSIBILITY: Apply, reduce, and process buffs/debuffs
import { BattleCharacter, Buff, Debuff, ActiveStatusEffect } from '../../types';
import { processTurnEffects, applyEffect } from './statusEffect.service';
import { generateUniqueLogId } from '../ai/logQueries';

/**
 * @description Processes buffs and debuffs for a character, reducing duration and removing expired ones.
 * @param {BattleCharacter} character - The character whose buffs/debuffs to process.
 * @param {number} turn - The current turn number.
 * @returns {BattleCharacter} The character with updated buffs/debuffs.
 * @deprecated Use processTurnEffects from statusEffect.service.ts instead
 */
export function processBuffsAndDebuffs(character: BattleCharacter, turn: number): BattleCharacter {
  // Use the new status effect system
  const result = processTurnEffects(character, turn);
  return result.updatedCharacter;
}

/**
 * @description Applies a buff to a character.
 * @param {BattleCharacter} character - The character to buff.
 * @param {Buff} buff - The buff to apply.
 * @param {number} turn - The current turn number.
 * @returns {BattleCharacter} The character with the new buff.
 * @deprecated Use applyEffect from statusEffect.service.ts instead
 */
export function applyBuff(character: BattleCharacter, buff: Buff, turn: number): BattleCharacter {
  // Convert legacy buff to new status effect format
  const effect: ActiveStatusEffect = {
    id: buff.id,
    name: buff.name,
    type: 'DEFENSE_UP',
    category: 'buff',
    duration: buff.duration,
    potency: buff.potency || 1,
    sourceAbility: buff.source,
    turnApplied: turn
  };
  return applyEffect(character, effect, turn).updatedCharacter;
}

/**
 * @description Applies a debuff to a character.
 * @param {BattleCharacter} character - The character to debuff.
 * @param {Debuff} debuff - The debuff to apply.
 * @param {number} turn - The current turn number.
 * @returns {BattleCharacter} The character with the new debuff.
 * @deprecated Use applyEffect from statusEffect.service.ts instead
 */
export function applyDebuff(character: BattleCharacter, debuff: Debuff, turn: number): BattleCharacter {
  // Convert legacy debuff to new status effect format
  const effect: ActiveStatusEffect = {
    id: debuff.id,
    name: debuff.name,
    type: 'DEFENSE_DOWN',
    category: 'debuff',
    duration: debuff.duration,
    potency: debuff.potency || 1,
    sourceAbility: debuff.source,
    turnApplied: turn
  };
  return applyEffect(character, effect, turn).updatedCharacter;
}

/**
 * @description Reduces cooldowns for all abilities at the end of a turn.
 * @param {BattleCharacter} character - The character whose cooldowns to reduce.
 * @returns {BattleCharacter} The character with updated cooldowns.
 */
export function reduceCooldowns(character: BattleCharacter): BattleCharacter {
  const newCooldowns = { ...character.cooldowns };
  
  // Reduce all cooldowns by 1 turn
  Object.keys(newCooldowns).forEach(abilityName => {
    if (newCooldowns[abilityName] > 0) {
      newCooldowns[abilityName]--;
    }
  });
  
  return {
    ...character,
    cooldowns: newCooldowns
  };
}

/**
 * @description Recovers chi for a character at the end of a turn with enhanced regeneration logic.
 * @param {BattleCharacter} character - The character whose chi to recover.
 * @returns {BattleCharacter} The character with recovered chi.
 */
export function recoverChi(character: BattleCharacter): BattleCharacter {
  // Base regeneration: Always recover some chi (prevents complete starvation)
  let recoveryAmount = 1;
  
  // Enhanced regeneration based on character state
  if (character.currentHealth < 20) {
    // Critical health: Desperation regeneration (2x base)
    recoveryAmount = 2;
  } else if (character.currentHealth < 40) {
    // Low health: Moderate regeneration (1.5x base)
    recoveryAmount = 1.5;
  } else if (character.resources.chi < 3) {
    // Low chi: Slight bonus regeneration
    recoveryAmount = 1.5;
  }
  
  // Rest bonus: If character used rest/focus move, get enhanced regeneration
  // Removed isResting legacy check
  
  // Bending-based regeneration bonuses
  // Removed bending legacy checks
  
  // Ensure we don't exceed max chi (default to 10 if not specified)
  const maxChi = 10; // Default max chi
  const newChi = Math.min(maxChi, character.resources.chi + recoveryAmount);
  
  return {
    ...character,
    resources: {
      ...character.resources,
      chi: newChi
    },
    // Clear resting flag after regeneration
    // Removed isResting legacy field
  };
}

/**
 * @description Creates a test buff for demonstration purposes.
 * @param {string} name - The name of the buff.
 * @param {number} duration - How many turns the buff lasts.
 * @param {string} source - Which ability created this buff.
 * @returns {Buff} A buff object.
 */
export function createTestBuff(name: string, duration: number, source: string): Buff {
  return {
    id: generateUniqueLogId('buff'),
    name,
    duration,
    potency: 1,
    description: `A ${name} effect`,
    source
  };
}

/**
 * @description Creates a test debuff for demonstration purposes.
 * @param {string} name - The name of the debuff.
 * @param {number} duration - How many turns the debuff lasts.
 * @param {string} source - Which ability created this debuff.
 * @returns {Debuff} A debuff object.
 */
export function createTestDebuff(name: string, duration: number, source: string): Debuff {
  return {
    id: generateUniqueLogId('debuff'),
    name,
    duration,
    potency: 1,
    description: `A ${name} effect`,
    source
  };
} 