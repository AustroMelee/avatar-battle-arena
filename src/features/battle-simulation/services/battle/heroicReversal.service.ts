// CONTEXT: Battle, // FOCUS: HeroicReversal
import type { BattleState, BattleCharacter } from '../../types';
import type { BattleCharacterFlags } from '../../types/index';
import { createMechanicLogEntry } from '../utils/mechanicLogUtils';

/**
 * Configuration for heroic reversal mechanics.
 */
export interface HeroicReversalConfig {
  healthThreshold: number; // Health below which reversal is possible
  momentumGap: number; // Minimum momentum gap to trigger
  reversalBuff: number; // Buff multiplier for reversal
  oncePerBattle: boolean; // Only allow one reversal per character per battle
}

export const DEFAULT_HEROIC_REVERSAL_CONFIG: HeroicReversalConfig = {
  healthThreshold: 20,
  momentumGap: 30,
  reversalBuff: 2,
  oncePerBattle: true,
};

/**
 * Checks if a heroic reversal can be triggered for a character.
 */
export function canTriggerHeroicReversal(
  character: BattleCharacter,
  opponent: BattleCharacter,
  config: HeroicReversalConfig = DEFAULT_HEROIC_REVERSAL_CONFIG
): boolean {
  const flags = character.flags as BattleCharacterFlags;
  if (config.oncePerBattle && flags?.heroicReversalUsed) return false;
  const isLowHealth = character.currentHealth < config.healthThreshold;
  const isLosingMomentum = (opponent.momentum - character.momentum) > config.momentumGap;
  return isLowHealth && isLosingMomentum;
}

/**
 * Triggers a heroic reversal for a character (applies buff, sets flag) and returns a mechanic log entry.
 */
export function triggerHeroicReversalWithLog(
  character: BattleCharacter,
  opponent: BattleCharacter,
  turn: number,
  config: HeroicReversalConfig = DEFAULT_HEROIC_REVERSAL_CONFIG
) {
  triggerHeroicReversal(character, config);
  const logEntry = createMechanicLogEntry({
    turn,
    actor: character.name,
    mechanic: 'Heroic Reversal',
    effect: `${character.name} seizes a sudden opening and turns the tables!`,
    reason: 'Triggered by low health and momentum gap',
    meta: { buff: config.reversalBuff }
  });
  return { logEntry };
}

/**
 * Triggers a heroic reversal for a character (applies buff, sets flag).
 */
export function triggerHeroicReversal(
  character: BattleCharacter,
  config: HeroicReversalConfig = DEFAULT_HEROIC_REVERSAL_CONFIG
): void {
  const flags = character.flags as BattleCharacterFlags;
  character.flags = {
    ...flags,
    heroicReversalUsed: true,
    heroicReversalActive: true,
    heroicReversalBuff: config.reversalBuff,
  };
}

/**
 * Resolves the heroic reversal (removes buff after use) and returns a mechanic log entry.
 */
export function resolveHeroicReversalWithLog(
  character: BattleCharacter,
  turn: number
) {
  resolveHeroicReversal(character);
  const logEntry = createMechanicLogEntry({
    turn,
    actor: character.name,
    mechanic: 'Heroic Reversal Ended',
    effect: `${character.name}'s heroic reversal effect has ended.`,
    reason: 'Buff duration expired or used',
    meta: {}
  });
  return { logEntry };
}

/**
 * Resolves the heroic reversal (removes buff after use).
 */
export function resolveHeroicReversal(
  character: BattleCharacter
): void {
  const flags = character.flags as BattleCharacterFlags;
  character.flags = {
    ...flags,
    heroicReversalActive: false,
    heroicReversalBuff: undefined,
  };
} 