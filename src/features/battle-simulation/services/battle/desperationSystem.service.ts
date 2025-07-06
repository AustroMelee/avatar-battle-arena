// CONTEXT: Desperation System Service
// RESPONSIBILITY: Handle desperation mechanics, stat surges, and dramatic power shifts

import { BattleCharacter, BattleState, BattleLogEntry } from '../../types';
import { Ability } from '@/common/types';
import { generateUniqueLogId } from '../ai/logQueries';

/**
 * @description Desperation thresholds that trigger dramatic changes
 */
export const DESPERATION_THRESHOLDS = {
  CRITICAL_HP: 0.15, // 15% HP - unlocks desperate moves
  EXTREME_HP: 0.10,  // 10% HP - stat surges and reckless power
  FINAL_HP: 0.05     // 5% HP - defensive collapse, all-or-nothing
} as const;

/**
 * @description Desperation state for a character
 */
export interface DesperationState {
  isDesperate: boolean;
  isExtreme: boolean;
  isFinal: boolean;
  statModifiers: {
    attackBonus: number;
    defensePenalty: number;
    critChanceBonus: number;
  };
  availableDesperateMoves: Ability[];
  canUseFinisher: boolean;
}

/**
 * @description Calculates desperation state for a character
 * @param {BattleCharacter} character - The character to analyze
 * @param {BattleState} state - Current battle state
 * @returns {DesperationState} The desperation state
 */
export function calculateDesperationState(
  character: BattleCharacter,
  state: BattleState
): DesperationState {
  const healthPercent = character.currentHealth / 100;
  const isDesperate = healthPercent <= DESPERATION_THRESHOLDS.CRITICAL_HP;
  const isExtreme = healthPercent <= DESPERATION_THRESHOLDS.EXTREME_HP;
  const isFinal = healthPercent <= DESPERATION_THRESHOLDS.FINAL_HP;

  // Stat modifiers based on desperation level
  let attackBonus = 0;
  let defensePenalty = 0;
  let critChanceBonus = 0;

  if (isExtreme) {
    attackBonus = 2; // +2 damage to all attacks
    defensePenalty = 10; // -10 defense (vulnerable but deadly)
    critChanceBonus = 0.15; // +15% crit chance
  }

  if (isFinal) {
    attackBonus += 3; // Additional +3 damage
    defensePenalty += 15; // Additional -15 defense
    critChanceBonus += 0.25; // Additional +25% crit chance
  }

  // Get desperate moves that are now available
  const availableDesperateMoves = character.abilities.filter(ability => 
    ability.tags?.includes('desperation') &&
    ability.unlockCondition?.type === 'health' &&
    character.currentHealth <= (ability.unlockCondition.threshold || 0) &&
    (!character.cooldowns[ability.name] || character.cooldowns[ability.name] === 0) &&
    (character.resources.chi || 0) >= (ability.chiCost || 0)
  );

  // Check if finisher is available (opponent below 20% HP)
  const opponent = state.participants.find(p => p.name !== character.name);
  const canUseFinisher = opponent ? 
    (opponent.currentHealth / 100) <= 0.20 && 
    character.abilities.some(a => a.tags?.includes('finisher')) : false;

  return {
    isDesperate,
    isExtreme,
    isFinal,
    statModifiers: {
      attackBonus,
      defensePenalty,
      critChanceBonus
    },
    availableDesperateMoves,
    canUseFinisher
  };
}

/**
 * @description Applies desperation stat modifiers to a character
 * @param {BattleCharacter} character - The character to modify
 * @param {DesperationState} desperationState - The desperation state
 * @returns {BattleCharacter} Modified character
 */
export function applyDesperationModifiers(
  character: BattleCharacter,
  desperationState: DesperationState
): BattleCharacter {
  if (!desperationState.isExtreme) {
    return character;
  }

  return {
    ...character,
    currentDefense: Math.max(0, character.currentDefense - desperationState.statModifiers.defensePenalty)
  };
}

/**
 * @description Generates dramatic narrative for desperation state
 * @param {BattleCharacter} character - The character
 * @param {DesperationState} desperationState - The desperation state
 * @returns {string} Dramatic narrative
 */
export function generateDesperationNarrative(
  character: BattleCharacter,
  desperationState: DesperationState
): string {
  if (desperationState.isFinal) {
    return `${character.name} stands on the brink of collapse. Every breath is a struggle, every movement a gamble. The air itself seems to pulse with desperate energy.`;
  }
  
  if (desperationState.isExtreme) {
    return `${character.name}'s defense slackens, but the air stings with raw, desperate power. A cornered animal is the most dangerous kind.`;
  }
  
  if (desperationState.isDesperate) {
    return `${character.name} feels the weight of the battle pressing down. Desperation moves are now within reach.`;
  }
  
  return '';
}

/**
 * @description Creates a desperation log entry
 * @param {BattleCharacter} character - The character entering desperation
 * @param {DesperationState} desperationState - The desperation state
 * @param {number} turn - Current turn
 * @returns {BattleLogEntry} The log entry
 */
export function createDesperationLogEntry(
  character: BattleCharacter,
  desperationState: DesperationState,
  turn: number
): BattleLogEntry {
  let narrative = '';
  let result = '';

  if (desperationState.isFinal) {
    narrative = `${character.name}'s focus fractures. For a heartbeat, all restraint dissolves. The air howls—one last chance.`;
    result = `${character.name} enters final desperation! Attack +5, Defense -25, Crit +40%`;
  } else if (desperationState.isExtreme) {
    narrative = `${character.name} fights like a cornered animal—deadly, but vulnerable.`;
    result = `${character.name} enters extreme desperation! Attack +2, Defense -10, Crit +15%`;
  } else if (desperationState.isDesperate) {
    narrative = `${character.name} feels the ancient power stirring within. Desperate moves are now available.`;
    result = `${character.name} enters desperation! Desperate moves unlocked.`;
  }

  return {
    id: generateUniqueLogId('desperation'),
    turn,
    actor: character.name,
    type: 'DESPERATION',
    action: 'desperation_trigger',
    target: character.name,
    result,
    narrative,
    timestamp: Date.now(),
    meta: {
      desperationLevel: desperationState.isFinal ? 'final' : desperationState.isExtreme ? 'extreme' : 'desperate',
      attackBonus: desperationState.statModifiers.attackBonus,
      defensePenalty: desperationState.statModifiers.defensePenalty,
      critBonus: desperationState.statModifiers.critChanceBonus
    }
  };
}

/**
 * @description Checks if a character should enter desperation state
 * @param {BattleCharacter} character - The character to check
 * @param {BattleState} state - Current battle state
 * @param {DesperationState} previousState - Previous desperation state
 * @returns {boolean} Whether desperation state has changed
 */
export function shouldTriggerDesperation(
  character: BattleCharacter,
  state: BattleState,
  previousState: DesperationState | null
): boolean {
  const currentState = calculateDesperationState(character, state);
  
  if (!previousState) {
    return currentState.isDesperate;
  }
  
  // Trigger if desperation level has increased
  return (
    (!previousState.isDesperate && currentState.isDesperate) ||
    (!previousState.isExtreme && currentState.isExtreme) ||
    (!previousState.isFinal && currentState.isFinal)
  );
} 