// CONTEXT: Narrative System, // FOCUS: Battle Phase Analysis
import type { BattleCharacter, BattleLogEntry } from '../../types';
import { BATTLE_PHASE_THRESHOLDS } from './types';

/**
 * @description Determines the current battle phase based on turn count and health
 * @param turnIndex - Current turn number
 * @param actor - The acting character
 * @param target - The target character
 * @returns The current battle phase
 */
export function determineBattlePhase(
  turnIndex: number,
  actor: BattleCharacter,
  target: BattleCharacter
): 'start' | 'mid' | 'end' {
  // Start phase: First few turns or until first blood
  if (turnIndex <= BATTLE_PHASE_THRESHOLDS.START_MAX_TURNS) {
    return 'start';
  }
  
  // End phase: Low health, late turns, or after desperation
  const actorHealthPercent = actor.currentHealth / 100;
  const targetHealthPercent = target.currentHealth / 100;
  const hasDesperationUsed = actor.flags?.usedDesperation || target.flags?.usedDesperation;
  
  if (
    actorHealthPercent < BATTLE_PHASE_THRESHOLDS.END_HEALTH_THRESHOLD ||
    targetHealthPercent < BATTLE_PHASE_THRESHOLDS.END_HEALTH_THRESHOLD ||
    turnIndex > BATTLE_PHASE_THRESHOLDS.END_TURN_THRESHOLD ||
    hasDesperationUsed
  ) {
    return 'end';
  }
  
  // Mid phase: Everything else
  return 'mid';
}

/**
 * @description Checks if this is the first blood (first damage dealt)
 * @param battleLog - Full battle log for analysis
 * @returns True if this is the first damage event
 */
export function isFirstBlood(battleLog: BattleLogEntry[]): boolean {
  const damageEvents = battleLog.filter(entry => entry.damage && entry.damage > 0);
  return damageEvents.length === 1; // Only one damage event so far
} 