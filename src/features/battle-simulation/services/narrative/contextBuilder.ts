// Used via dynamic registry in Narrative system. See SYSTEM ARCHITECTURE.MD for flow.
// CONTEXT: Narrative System, // FOCUS: Battle Context Building
import type { BattleCharacter, BattleLogEntry } from '../../types';
import type { Ability } from '@/common/types';
import type { BattleContext } from './types';
import { extractMechanicalState } from './mechanicalStateExtractor';
import { determineBattlePhase, isFirstBlood } from './battlePhaseAnalyzer';
import { determineNarrativeTone, determineNarrativeIntensity, determineNarrativeFocus } from './narrativeToneAnalyzer';
import { calcCollateralTolerance } from './locationAnalyzer';

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
  const battlePhase = determineBattlePhase(turnIndex, actor, target);
  const firstBlood = isFirstBlood(battleLog);

  // Extract mechanical state
  const mechanics = extractMechanicalState(actor, target, battleLog, damage);

  // Collateral tolerance for each participant
  const collateralTolerance: Record<string, number> = {
    [actor.name]: calcCollateralTolerance(location, actor.name),
    [target.name]: calcCollateralTolerance(location, target.name)
  };

  // Determine narrative-specific context
  const narrativeTone = determineNarrativeTone(mechanics);
  const narrativeIntensity = determineNarrativeIntensity(mechanics);
  const narrativeFocus = determineNarrativeFocus(mechanics);

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
    isComeback: mechanics.isComeback,
    isRally: mechanics.isRally,
    actorHealthPercent: actor.currentHealth / 100,
    targetHealthPercent: target.currentHealth / 100,
    actorChiPercent: (actor.resources.chi || 0) / 10, // Assuming max 10 chi
    targetChiPercent: (target.resources.chi || 0) / 10,
    mechanics,
    narrativeTone,
    narrativeIntensity,
    narrativeFocus
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