// CONTEXT: Narrative System, // FOCUS: Context Analysis
import type { BattleCharacter, BattleLogEntry } from '../../types';
import type { Ability } from '@/common/types';
import type { BattleContext } from './types';
import { BATTLE_PHASE_THRESHOLDS } from './types';

/**
 * @description Determines the current battle phase based on turn count and health
 * @param turnIndex - Current turn number
 * @param actor - The acting character
 * @param target - The target character
 * @param battleLog - Full battle log for analysis
 * @returns The current battle phase
 */
export function determineBattlePhase(
  turnIndex: number,
  actor: BattleCharacter,
  target: BattleCharacter,
  battleLog: BattleLogEntry[]
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

/**
 * @description Checks if the actor is making a comeback (was low health, now dealing damage)
 * @param actor - The acting character
 * @param target - The target character
 * @param battleLog - Full battle log for analysis
 * @returns True if this appears to be a comeback
 */
export function isComeback(
  actor: BattleCharacter,
  target: BattleCharacter,
  battleLog: BattleLogEntry[]
): boolean {
  // Actor was recently at low health (< 30%) but is now dealing damage
  const recentLog = battleLog.slice(-3);
  const wasLowHealth = recentLog.some(entry => 
    entry.actor === actor.name && 
    entry.type === 'MOVE' && 
    entry.meta?.heal // Healing move indicates they were in trouble
  );
  
  const isDealingDamage = actor.currentHealth > 30 && target.currentHealth < 70;
  
  return wasLowHealth && isDealingDamage;
}

/**
 * @description Checks if the actor is on a rally (consecutive successful attacks)
 * @param actor - The acting character
 * @param battleLog - Full battle log for analysis
 * @returns True if this appears to be a rally
 */
export function isRally(actor: BattleCharacter, battleLog: BattleLogEntry[]): boolean {
  const recentLog = battleLog.slice(-3);
  const actorMoves = recentLog.filter(entry => 
    entry.actor === actor.name && 
    entry.type === 'MOVE' &&
    entry.damage && entry.damage > 0
  );
  
  return actorMoves.length >= 2; // At least 2 consecutive damaging moves
}

// Helper: Calculate collateral tolerance for a player based on location and character
function calcCollateralTolerance(ctx: {
  location: string;
  actor: BattleCharacter;
  target: BattleCharacter;
}, player: string): number {
  if (ctx.location === 'Fire Nation Capital') {
    if (player.toLowerCase() === 'azula') return 0.2;
    if (player.toLowerCase() === 'aang') return 0.7;
  }
  return 0.5;
}

/**
 * @description Builds complete battle context for narrative hooks
 * @param actor - The acting character
 * @param target - The target character
 * @param move - The move being used
 * @param turnIndex - Current turn number
 * @param battleLog - Full battle log
 * @param location - Battle location
 * @param isCritical - Whether this is a critical hit
 * @param isDesperation - Whether this is a desperation move
 * @param damage - Damage dealt (if any)
 * @returns Complete battle context
 */
export function buildBattleContext(
  actor: BattleCharacter,
  target: BattleCharacter,
  move: Ability,
  turnIndex: number,
  battleLog: BattleLogEntry[],
  location: string,
  isCritical?: boolean,
  isDesperation?: boolean,
  damage?: number
): BattleContext {
  const battlePhase = determineBattlePhase(turnIndex, actor, target, battleLog);
  const firstBlood = isFirstBlood(battleLog);
  const comeback = isComeback(actor, target, battleLog);
  const rally = isRally(actor, battleLog);

  // Collateral tolerance for each participant
  const collateralTolerance: Record<string, number> = {
    [actor.name]: calcCollateralTolerance({ location, actor, target }, actor.name),
    [target.name]: calcCollateralTolerance({ location, actor, target }, target.name)
  };

  return {
    actor,
    target,
    move,
    turnIndex,
    battleLog,
    location,
    matchup: [actor.name, target.name],
    collateralTolerance,
    battlePhase,
    isCritical,
    isDesperation,
    damage,
    isFirstBlood: firstBlood,
    isComeback: comeback,
    isRally: rally,
    actorHealthPercent: actor.currentHealth / 100,
    targetHealthPercent: target.currentHealth / 100,
    actorChiPercent: (actor.resources.chi || 0) / 10, // Assuming max 10 chi
    targetChiPercent: (target.resources.chi || 0) / 10
  };
}

/**
 * @description Gets health status description for narrative context
 * @param healthPercent - Health as percentage (0-1)
 * @returns Health status description
 */
export function getHealthStatus(healthPercent: number): string {
  if (healthPercent <= 0.1) return 'critical';
  if (healthPercent <= 0.3) return 'low';
  if (healthPercent <= 0.6) return 'moderate';
  return 'healthy';
}

/**
 * @description Gets chi status description for narrative context
 * @param chiPercent - Chi as percentage (0-1)
 * @returns Chi status description
 */
export function getChiStatus(chiPercent: number): string {
  if (chiPercent <= 0.2) return 'exhausted';
  if (chiPercent <= 0.5) return 'low';
  if (chiPercent <= 0.8) return 'moderate';
  return 'strong';
} 