// CONTEXT: Desperation System Service
// RESPONSIBILITY: Handle desperation mechanics, stat surges, and dramatic power shifts

import {
  BattleCharacter,
  BattleState,
  BattleLogEntry,
} from '../../types';
import type { Move } from '../../types/move.types';
import { logMechanics, logStory } from '../utils/mechanicLogUtils';
import { nes } from '@/common/branding/nonEmptyString';

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
  availableDesperateMoves: Move[];
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
  // Use a global max health for all percent-based mechanics
  const MAX_HEALTH = 100;
  const healthPercent = character.currentHealth / MAX_HEALTH;
  const isDesperate = healthPercent <= DESPERATION_THRESHOLDS.CRITICAL_HP;
  const isExtreme = healthPercent <= DESPERATION_THRESHOLDS.EXTREME_HP;
  const isFinal = healthPercent <= DESPERATION_THRESHOLDS.FINAL_HP;

  // Stat modifiers based on desperation level
  let attackBonus = 0;
  let defensePenalty = 0;
  let critChanceBonus = 0;

  if (isExtreme) {
    attackBonus = 2;
    defensePenalty = 10;
    critChanceBonus = 0.15;
  }

  if (isFinal) {
    attackBonus += 3;
    defensePenalty += 15;
    critChanceBonus += 0.25;
  }

  // Get desperate moves that are now available
  const availableDesperateMoves = character.abilities.filter(move =>
    move.tags?.includes('desperation') &&
    move.unlockCondition?.type === 'health' &&
    character.currentHealth <= (move.unlockCondition.threshold || 0) &&
    (!character.cooldowns[move.name] || character.cooldowns[move.name] === 0) &&
    (character.resources.chi || 0) >= (move.chiCost || 0)
  );

  // Check if finisher is available (opponent below 20% HP)
  const opponent = state.participants.find(p => p.name !== character.name);
  const canUseFinisher = opponent
    ? (opponent.currentHealth / MAX_HEALTH) <= 0.20 &&
      character.abilities.some(a => a.tags?.includes('finisher'))
    : false;

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
 * @description Applies all desperation stat modifiers to a character (attack, defense, crit)
 * Returns the character unchanged, as stat modifications should be handled as derived values.
 */
export function applyDesperationModifiers(
  character: BattleCharacter
): BattleCharacter {
  // No direct mutation; stat modifications should be handled as derived values in calculations.
  return character;
}

/**
 * @description Generates dramatic narrative for desperation state
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
 * @description Creates a narrative log entry for desperation
 */
export function createDesperationLogEntry(
  character: BattleCharacter,
  desperationState: DesperationState,
  turn: number
): BattleLogEntry {
  let narrative = '';
  if (desperationState.isFinal) {
    narrative = `${character.name}'s focus fractures. For a heartbeat, all restraint dissolves. The air howls—one last chance.`;
  } else if (desperationState.isExtreme) {
    narrative = `${character.name} fights like a cornered animal—deadly, but vulnerable.`;
  } else if (desperationState.isDesperate) {
    narrative = `${character.name} feels the ancient power stirring within. Desperate moves are now available.`;
  }

  const log = logStory({
    turn,
    text: `${character.name}: Desperation triggered.`
  });
  if (log) return log;
  return {
    id: 'desperation-fallback',
    turn,
    actor: 'System',
    type: 'mechanics',
    action: 'Desperation',
    result: nes(narrative),
    target: character.name,
    narrative: nes(narrative),
    timestamp: Date.now(),
    details: undefined
  };
}

/**
 * @description Checks if a character should enter desperation state
 * Defensive: Will not retrigger if already desperate
 */
export function shouldTriggerDesperation(
  character: BattleCharacter,
  state: BattleState,
  previousState: DesperationState | null
): boolean {
  const currentState = calculateDesperationState(character, state);
  if (!previousState) return currentState.isDesperate;
  // Trigger if desperation level has increased
  return (
    (!previousState.isDesperate && currentState.isDesperate) ||
    (!previousState.isExtreme && currentState.isExtreme) ||
    (!previousState.isFinal && currentState.isFinal)
  );
}

/**
 * @description Triggers full desperation flow: phase change, stat surges, flags, technical & narrative logs.
 */
export function triggerDesperation(
  character: BattleCharacter,
  state: BattleState,
  previousState: DesperationState | null,
  turn: number
): { updatedCharacter: BattleCharacter; logs: BattleLogEntry[] } {
  const desperationState = calculateDesperationState(character, state);
  const logs: BattleLogEntry[] = [];

  // Defensive: Only trigger if level has increased
  if (
    !previousState ||
    (!previousState.isDesperate && desperationState.isDesperate) ||
    (!previousState.isExtreme && desperationState.isExtreme) ||
    (!previousState.isFinal && desperationState.isFinal)
  ) {
    // Phase Change Enforcement (log and mutate)
    if (state.tacticalPhase !== 'desperation') {
      state.tacticalPhase = 'desperation';
      const techLog = logMechanics({
        turn,
        text: `${character.name}: Desperation triggered.`
      });
      if (techLog) logs.push(techLog);
    }

    // Flag Consistency
    character.flags.usedDesperation = true;

    // Analytics Update
    if (state.analytics) {
      state.analytics.desperationMoves = (state.analytics.desperationMoves || 0) + 1;
    }

    // No direct stat mutation; stat modifications are derived
    const mutated = character;

    // Technical Log Consistency
    const techLog2 = logMechanics({
      turn,
      text: `${character.name}: Desperation log 2.`
    });
    if (techLog2) logs.push(techLog2);

    const narrativeLog = createDesperationLogEntry(character, desperationState, turn);
    if (narrativeLog) logs.push(narrativeLog);

    return { updatedCharacter: mutated, logs };
  }

  // Defensive: Already desperate, do not retrigger, but log the attempt
  const techLog3 = logMechanics({
    turn,
    text: `${character.name}: Desperation log 3.`
  });
  if (techLog3) logs.push(techLog3);
  return { updatedCharacter: character, logs };
}

/**
 * @description Filters available moves for a character in desperation phase
 */
export function filterDesperationMoves(
  character: BattleCharacter,
  desperationState: DesperationState,
  state: BattleState
): Move[] {
  if (state.tacticalPhase === 'desperation') {
    // Only allow desperation-tagged or finisher moves (if unlocked)
    const desperationMoves = desperationState.availableDesperateMoves;
    const finishers = desperationState.canUseFinisher
      ? character.abilities.filter(m => m.tags?.includes('finisher'))
      : [];
    return [...desperationMoves, ...finishers];
  }
  // Otherwise allow normal pool
  return character.abilities;
}
