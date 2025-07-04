// CONTEXT: Buff/Debuff Management
// RESPONSIBILITY: Apply, reduce, and process buffs/debuffs
import { BattleCharacter, Buff, Debuff } from '../../types';

/**
 * @description Processes buffs and debuffs for a character, reducing duration and removing expired ones.
 * @param {BattleCharacter} character - The character whose buffs/debuffs to process.
 * @returns {BattleCharacter} The character with updated buffs/debuffs.
 */
export function processBuffsAndDebuffs(character: BattleCharacter): BattleCharacter {
  // Reduce duration of all buffs and remove expired ones
  const updatedBuffs = character.activeBuffs
    .map(buff => ({ ...buff, duration: buff.duration - 1 }))
    .filter(buff => buff.duration > 0);
  
  // Reduce duration of all debuffs and remove expired ones
  const updatedDebuffs = character.activeDebuffs
    .map(debuff => ({ ...debuff, duration: debuff.duration - 1 }))
    .filter(debuff => debuff.duration > 0);
  
  return {
    ...character,
    activeBuffs: updatedBuffs,
    activeDebuffs: updatedDebuffs
  };
}

/**
 * @description Applies a buff to a character.
 * @param {BattleCharacter} character - The character to buff.
 * @param {Buff} buff - The buff to apply.
 * @returns {BattleCharacter} The character with the new buff.
 */
export function applyBuff(character: BattleCharacter, buff: Buff): BattleCharacter {
  return {
    ...character,
    activeBuffs: [...character.activeBuffs, buff]
  };
}

/**
 * @description Applies a debuff to a character.
 * @param {BattleCharacter} character - The character to debuff.
 * @param {Debuff} debuff - The debuff to apply.
 * @returns {BattleCharacter} The character with the new debuff.
 */
export function applyDebuff(character: BattleCharacter, debuff: Debuff): BattleCharacter {
  return {
    ...character,
    activeDebuffs: [...character.activeDebuffs, debuff]
  };
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
  if (character.flags?.isResting) {
    recoveryAmount *= 2; // Double regeneration when resting
  }
  
  // Bending-based regeneration bonuses
  if (character.bending === 'air') {
    // Airbenders recover chi more efficiently when mobile/evasive
    recoveryAmount = Math.floor(recoveryAmount * 1.2);
  } else if (character.bending === 'fire') {
    // Firebenders recover chi more when aggressive
    recoveryAmount = Math.floor(recoveryAmount * 1.1);
  }
  
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
    flags: {
      ...character.flags,
      isResting: false
    }
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
    id: `${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
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
    id: `${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
    name,
    duration,
    potency: 1,
    description: `A ${name} effect`,
    source
  };
} 