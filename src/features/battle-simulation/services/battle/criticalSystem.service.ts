// CONTEXT: Critical Hit System Service
// RESPONSIBILITY: Handle dramatic critical hits with consequences

import { BattleCharacter, BattleLogEntry } from '../../types';
import type { Move } from '../../types/move.types';
import { createEventId } from '../ai/logQueries';
import { logStory } from '../utils/mechanicLogUtils';

/**
 * @description Critical hit configuration
 */
export interface CriticalConfig {
  baseChance: number;
  damageMultiplier: number;
  staggerChance: number; // Chance to make opponent skip next turn
  narrativeIntensity: 'normal' | 'dramatic' | 'legendary';
}

/**
 * @description Critical hit result
 */
export interface CriticalResult {
  isCritical: boolean;
  damageMultiplier: number;
  staggerApplied: boolean;
  narrative: string;
  intensity: 'normal' | 'dramatic' | 'legendary';
}

/**
 * @description Base critical hit configuration
 */
export const BASE_CRITICAL_CONFIG: CriticalConfig = {
  baseChance: 0.15, // 15% base crit chance
  damageMultiplier: 2.5, // 2.5x damage on crit
  staggerChance: 0.25, // 25% chance to stagger
  narrativeIntensity: 'normal'
};

/**
 * @description Character-specific critical configurations
 */
export const CHARACTER_CRITICAL_CONFIGS: Record<string, Partial<CriticalConfig>> = {
  'aang': {
    baseChance: 0.20, // Higher crit chance for airbending
    damageMultiplier: 3.0, // More dramatic crits
    staggerChance: 0.30, // Airbending can knock opponents off balance
    narrativeIntensity: 'dramatic'
  },
  'azula': {
    baseChance: 0.18, // Firebending has good crit chance
    damageMultiplier: 2.8, // Fire crits are devastating
    staggerChance: 0.20, // Fire can stun
    narrativeIntensity: 'dramatic'
  }
};

/**
 * @description Calculates critical hit with dramatic consequences
 * @param {BattleCharacter} attacker - The attacking character
 * @param {BattleCharacter} target - The target character
 * @param {Move} move - The move being used
 * @param {number} desperationBonus - Additional crit chance from desperation
 * @returns {CriticalResult} The critical hit result
 */
export function calculateCriticalHit(
  attacker: BattleCharacter,
  target: BattleCharacter,
  move: Move,
  desperationBonus: number = 0
): CriticalResult {
  const config = {
    ...BASE_CRITICAL_CONFIG,
    ...CHARACTER_CRITICAL_CONFIGS[attacker.name.toLowerCase()]
  };
  
  // Calculate total crit chance
  const totalCritChance = config.baseChance + desperationBonus;
  const isCritical = Math.random() < totalCritChance;
  
  if (!isCritical) {
    return {
      isCritical: false,
      damageMultiplier: 1,
      staggerApplied: false,
      narrative: '',
      intensity: 'normal'
    };
  }
  
  // Determine crit intensity based on random chance
  const intensityRoll = Math.random();
  let intensity: 'normal' | 'dramatic' | 'legendary';
  let damageMultiplier: number;
  
  if (intensityRoll < 0.7) {
    intensity = 'normal';
    damageMultiplier = config.damageMultiplier;
  } else if (intensityRoll < 0.95) {
    intensity = 'dramatic';
    damageMultiplier = config.damageMultiplier * 1.5;
  } else {
    intensity = 'legendary';
    damageMultiplier = config.damageMultiplier * 2.0;
  }
  
  // Check for stagger
  const staggerApplied = Math.random() < config.staggerChance;
  
  // Generate dramatic narrative
  const narrative = generateCriticalNarrative(attacker, target, move, intensity, staggerApplied);
  
  return {
    isCritical: true,
    damageMultiplier,
    staggerApplied,
    narrative,
    intensity
  };
}

/**
 * @description Generates dramatic narrative for critical hits
 * @param {BattleCharacter} attacker - The attacking character
 * @param {BattleCharacter} target - The target character
 * @param {Move} move - The move used
 * @param {string} intensity - The intensity level
 * @param {boolean} staggerApplied - Whether stagger was applied
 * @returns {string} The dramatic narrative
 */
function generateCriticalNarrative(
  attacker: BattleCharacter,
  target: BattleCharacter,
  move: Move,
  intensity: 'normal' | 'dramatic' | 'legendary',
  staggerApplied: boolean
): string {
  const characterName = attacker.name.toLowerCase();
  
  if (characterName === 'aang') {
    return generateAangCriticalNarrative(target, move, intensity, staggerApplied);
  } else if (characterName === 'azula') {
    return generateAzulaCriticalNarrative(target, move, intensity, staggerApplied);
  }
  
  // Generic critical narrative
  return `${attacker.name}'s ${move.name} strikes with devastating precision!`;
}

/**
 * @description Generates Aang-specific critical hit narrative
 * @param {BattleCharacter} target - The target character
 * @param {Move} move - The move used
 * @param {string} intensity - The intensity level
 * @param {boolean} staggerApplied - Whether stagger was applied
 * @returns {string} The dramatic narrative
 */
function generateAangCriticalNarrative(
  target: BattleCharacter,
  move: Move,
  intensity: 'normal' | 'dramatic' | 'legendary',
  staggerApplied: boolean
): string {
  if (intensity === 'legendary') {
    return `Aang's ${move.name} becomes a force of nature! The air itself seems to bend to his will, sending ${target.name} flying across the arena with a gasp that echoes through the marble halls.`;
  }
  
  if (intensity === 'dramatic') {
    return `Aang's elbow catches ${target.name} off-guard, sending them flying across the hall—air leaves their lungs with a gasp that echoes in marble.`;
  }
  
  if (staggerApplied) {
    return `The wind catches ${target.name} off balance, leaving them vulnerable and disoriented.`;
  }
  
  return `Aang's airbending strikes with perfect precision, the wind finding its mark with devastating force.`;
}

/**
 * @description Generates Azula-specific critical hit narrative
 * @param {BattleCharacter} target - The target character
 * @param {Move} move - The move used
 * @param {string} intensity - The intensity level
 * @param {boolean} staggerApplied - Whether stagger was applied
 * @returns {string} The dramatic narrative
 */
function generateAzulaCriticalNarrative(
  target: BattleCharacter,
  move: Move,
  intensity: 'normal' | 'dramatic' | 'legendary',
  staggerApplied: boolean
): string {
  if (intensity === 'legendary') {
    return `Azula's ${move.name} erupts with blue fire so intense it seems to burn reality itself. ${target.name} is sent sprawling, the heat searing through their defenses like paper.`;
  }
  
  if (intensity === 'dramatic') {
    return `Azula's fire finds its mark with surgical precision. ${target.name} staggers back, the blue flames leaving scorch marks that will never fade.`;
  }
  
  if (staggerApplied) {
    return `The heat and force of Azula's attack leaves ${target.name} stunned and vulnerable.`;
  }
  
  return `Azula's firebending strikes with devastating accuracy, the flames finding their target with deadly precision.`;
}

/**
 * @description Applies stagger effect to target
 * @param {BattleCharacter} target - The target character
 * @returns {BattleCharacter} Modified target with stagger
 */
export function applyStaggerEffect(target: BattleCharacter): BattleCharacter {
  return {
    ...target,
    flags: {
      ...target.flags,
      // stunDuration: 1 // Skip next turn
    }
  };
}

/**
 * @description Creates a critical hit log entry
 * @param {BattleCharacter} attacker - The attacking character
 * @param {BattleCharacter} target - The target character
 * @param {Move} move - The move used
 * @param {CriticalResult} criticalResult - The critical result
 * @param {number} damage - The damage dealt
 * @param {number} turn - Current turn
 * @returns {BattleLogEntry} The log entry
 */
export function createCriticalLogEntry(
  attacker: BattleCharacter,
  target: BattleCharacter,
  move: Move,
  criticalResult: CriticalResult,
  damage: number,
  turn: number
): BattleLogEntry {
  let result = `CRITICAL HIT! ${target.name} takes ${damage} damage!`;
  
  if (criticalResult.intensity === 'legendary') {
    result = `LEGENDARY CRITICAL! ${target.name} is devastated, taking ${damage} damage!`;
  } else if (criticalResult.intensity === 'dramatic') {
    result = `DRAMATIC CRITICAL! ${target.name} takes ${damage} damage!`;
  }
  
  if (criticalResult.staggerApplied) {
    result += ` ${target.name} is staggered!`;
  }
  
  return logStory({
    turn,
    actor: attacker.name,
    narrative: criticalResult.narrative,
    target: target.name
  });
} 