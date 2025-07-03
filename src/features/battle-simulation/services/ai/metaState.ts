// CONTEXT: AI Meta-State Assessment
// RESPONSIBILITY: Assess emotions and meta-state from battle context
import { BattleCharacter } from '../../types';
import { detectPatterns } from './patternDetection';

export interface MetaState {
  bored: boolean;
  frustrated: boolean;
  desperate: boolean;
  stuckLoop: boolean;
  escalationNeeded: boolean;
  timeoutPressure: boolean;
  stalemate: boolean;
  finishingTime: boolean;
  boredomLevel: number;
  frustrationLevel: number;
}

/**
 * @description Assesses the meta-state of a character based on battle context.
 * @param {BattleCharacter} character - The character to assess.
 * @param {BattleCharacter} enemy - The enemy character.
 * @param {number} turn - Current turn number.
 * @returns {MetaState} The assessed meta-state.
 */
export function assessMetaState(
  character: BattleCharacter, 
  enemy: BattleCharacter, 
  turn: number
): MetaState {
  const moveHistory = character.moveHistory;
  const health = character.currentHealth;
  const enemyHealth = enemy.currentHealth;
  
  // Pattern detection
  const { stuckLoop } = detectPatterns(moveHistory);
  
  // Emotional levels
  const boredomLevel = Math.min(10, Math.floor(turn / 3));
  const frustrationLevel = Math.min(10, Math.floor(turn / 5));
  
  // Meta-state assessment
  const bored = boredomLevel > 3 || stuckLoop;
  const frustrated = frustrationLevel > 2 || (turn > 20 && health < 50);
  const desperate = health < 20 || enemyHealth < 20;
  const escalationNeeded = turn > 35 || desperate || stuckLoop;
  const timeoutPressure = turn > 45;
  const stalemate = turn > 20 && Math.abs(health - enemyHealth) < 10;
  const finishingTime = enemyHealth < 30 && character.resources.chi >= 3;
  
  return {
    bored,
    frustrated,
    desperate,
    stuckLoop,
    escalationNeeded,
    timeoutPressure,
    stalemate,
    finishingTime,
    boredomLevel,
    frustrationLevel
  };
}

/**
 * @description Gets the urgency level of the current situation.
 * @param {MetaState} meta - The meta-state.
 * @returns {number} Urgency level from 0-10.
 */
export function getUrgencyLevel(meta: MetaState): number {
  if (meta.desperate) return 10;
  if (meta.finishingTime) return 9;
  if (meta.timeoutPressure) return 8;
  if (meta.escalationNeeded) return 7;
  if (meta.frustrated) return 6;
  if (meta.stalemate) return 5;
  if (meta.bored) return 3;
  return 2;
}

/**
 * @description Checks if the character should be aggressive.
 * @param {MetaState} meta - The meta-state.
 * @returns {boolean} True if aggressive behavior is warranted.
 */
export function shouldBeAggressive(meta: MetaState): boolean {
  return meta.desperate || meta.finishingTime || meta.frustrated || meta.timeoutPressure;
}

/**
 * @description Checks if the character should prioritize variety.
 * @param {MetaState} meta - The meta-state.
 * @returns {boolean} True if variety should be prioritized.
 */
export function shouldPrioritizeVariety(meta: MetaState): boolean {
  return meta.bored || meta.stuckLoop;
} 