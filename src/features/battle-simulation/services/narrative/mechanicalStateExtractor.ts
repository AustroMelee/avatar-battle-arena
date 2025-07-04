// CONTEXT: Narrative System, // FOCUS: Mechanical State Extraction
import type { BattleCharacter, BattleLogEntry } from '../../types';
import type { MechanicalState } from './types';

/**
 * @description Extracts mechanical state from battle characters and context
 * @param actor - The acting character
 * @param target - The target character
 * @param battleLog - Full battle log for analysis
 * @param damage - Damage dealt (if any)
 * @returns Complete mechanical state
 */
export function extractMechanicalState(
  actor: BattleCharacter,
  target: BattleCharacter,
  battleLog: BattleLogEntry[],
  damage?: number
): MechanicalState {
  // Escalation states
  const forcedEscalation = actor.flags?.forcedEscalation === 'true';
  const escalationType = undefined; // Not available in current flags structure
  const escalationMultiplier = parseFloat(actor.flags?.damageMultiplier || '1.0');
  
  // Vulnerability and punishment
  const isVulnerable = target.isCharging || target.position === "repositioning" || target.position === "stunned";
  const vulnerabilityType = target.isCharging ? 'charging' : 
                           target.position === "repositioning" ? 'repositioning' : 
                           target.position === "stunned" ? 'stunned' : undefined;
  
  // Calculate punish damage from recent logs
  const recentLogs = battleLog.slice(-3);
  let punishDamage = 0;
  let punishMultiplier = 1;
  
  recentLogs.forEach(log => {
    if (log.meta?.punishDamage) {
      punishDamage += log.meta.punishDamage as number;
    }
    if (log.meta?.punishMultiplier) {
      punishMultiplier = Math.max(punishMultiplier, log.meta.punishMultiplier as number);
    }
  });
  
  // Pattern and repetition
  const moveHistory = actor.moveHistory || [];
  const lastMoves = moveHistory.slice(-3);
  const moveRepetition = lastMoves.length >= 2 && lastMoves.every(move => move === lastMoves[0]) ? lastMoves.length : 0;
  const repositionAttempts = actor.repositionAttempts || 0;
  const isRepetitive = moveRepetition >= 3;
  
  // Pattern adaptations from battle state (not available on character)
  const patternAdaptations = 0;
  
  // Position and charging
  const position = actor.position || 'neutral';
  const isCharging = actor.isCharging || false;
  const chargeProgress = actor.chargeProgress || 0;
  const positionChanged = false; // Not available in current character structure
  
  // Damage and performance
  const damageDealt = damage || 0;
  const damageMultiplier = escalationMultiplier;
  const isLowDamage = damageDealt < 5;
  const isHighDamage = damageDealt > 20;
  
  // Battle flow analysis
  const recentDamageLogs = battleLog.slice(-10).filter(log => log.damage && log.damage > 0);
  const turnsWithoutDamage = 10 - recentDamageLogs.length;
  const totalRecentDamage = recentDamageLogs.reduce((sum, log) => sum + (log.damage || 0), 0);
  const averageDamagePerTurn = recentDamageLogs.length > 0 ? totalRecentDamage / recentDamageLogs.length : 0;
  const isStalemate = averageDamagePerTurn < 1 && battleLog.length > 15;
  
  // Character-specific mechanics
  const isDesperation = actor.flags?.usedDesperation === true;
  const isLastUse = false; // Not available in current flags structure
  const isRally = isRallySequence(actor);
  const isComeback = isComebackSequence(actor, target);
  
  return {
    forcedEscalation,
    escalationType,
    escalationMultiplier,
    isVulnerable,
    vulnerabilityType,
    punishMultiplier,
    punishDamage,
    moveRepetition,
    patternAdaptations,
    repositionAttempts,
    isRepetitive,
    position,
    isCharging,
    chargeProgress,
    positionChanged,
    damageDealt,
    damageMultiplier,
    isLowDamage,
    isHighDamage,
    turnsWithoutDamage,
    averageDamagePerTurn,
    isStalemate,
    isDesperation,
    isLastUse,
    isRally,
    isComeback
  };
}

/**
 * @description Checks if the actor is making a comeback (was low health, now dealing damage)
 * @param actor - The acting character
 * @param target - The target character
 * @returns True if this appears to be a comeback
 */
export function isComebackSequence(
  actor: BattleCharacter,
  target: BattleCharacter
): boolean {
  // Actor was recently at low health (< 30%) but is now dealing damage
  const isDealingDamage = actor.currentHealth > 30 && target.currentHealth < 70;
  
  return isDealingDamage;
}

/**
 * @description Checks if the actor is on a rally (consecutive successful attacks)
 * @param actor - The acting character
 * @returns True if this appears to be a rally
 */
export function isRallySequence(actor: BattleCharacter): boolean {
  const recentMoves = actor.moveHistory?.slice(-3) || [];
  const damagingMoves = recentMoves.filter(move => 
    move.toLowerCase().includes('attack') || 
    move.toLowerCase().includes('blast') ||
    move.toLowerCase().includes('slice') ||
    move.toLowerCase().includes('fire') ||
    move.toLowerCase().includes('wind')
  );
  
  return damagingMoves.length >= 2; // At least 2 consecutive damaging moves
} 