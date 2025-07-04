// CONTEXT: Escalation Detection Service
// RESPONSIBILITY: Detect when escalation should be triggered

import { BattleState, BattleCharacter } from '../../types';
import { PatternState, getPatternState } from './patternTracking.service';

// Escalation triggers
const ESCALATION_TRIGGERS = {
  DAMAGE_THRESHOLD: 10, // Force escalation if total damage < 10 by turn 20
  TURNS_WITHOUT_DAMAGE: 8, // Force escalation after 8 turns without damage
  REPOSITION_SPAM: 4, // Force close combat after 4 reposition attempts
  STALEMATE_TURNS: 15 // Force climax after 15 turns of stalemate
};

/**
 * @description Calculates damage statistics for escalation triggers
 */
export function calculateDamageStats(state: BattleState): {
  totalDamage: number;
  turnsWithoutDamage: number;
  averageDamagePerTurn: number;
} {
  const recentLogs = state.battleLog.slice(-10); // Last 10 turns
  let totalDamage = 0;
  let turnsWithDamage = 0;
  
  recentLogs.forEach(log => {
    if (log.type === 'MOVE' && log.damage) {
      totalDamage += log.damage;
      turnsWithDamage++;
    }
  });
  
  const turnsWithoutDamage = recentLogs.length - turnsWithDamage;
  const averageDamagePerTurn = turnsWithDamage > 0 ? totalDamage / turnsWithDamage : 0;
  
  return { totalDamage, turnsWithoutDamage, averageDamagePerTurn };
}

/**
 * @description Checks if escalation should be triggered
 */
export function shouldTriggerEscalation(state: BattleState, attacker: BattleCharacter): {
  shouldEscalate: boolean;
  reason: string;
  escalationType: 'damage' | 'repetition' | 'stalemate' | 'reposition';
} {
  const damageStats = calculateDamageStats(state);
  const patternState = getPatternState(attacker);
  
  // Check for damage-based escalation
  if (state.turn >= 20 && damageStats.totalDamage < ESCALATION_TRIGGERS.DAMAGE_THRESHOLD) {
    return {
      shouldEscalate: true,
      reason: `Low damage output (${damageStats.totalDamage} total) by turn ${state.turn}`,
      escalationType: 'damage'
    };
  }
  
  // Check for repetition-based escalation
  if (patternState.patternStale) {
    return {
      shouldEscalate: true,
      reason: `Repetitive move pattern detected: ${patternState.consecutiveMoves.join(', ')}`,
      escalationType: 'repetition'
    };
  }
  
  // Check for reposition spam
  if (patternState.repositionAttempts >= ESCALATION_TRIGGERS.REPOSITION_SPAM) {
    return {
      shouldEscalate: true,
      reason: `Excessive repositioning (${patternState.repositionAttempts} attempts)`,
      escalationType: 'reposition'
    };
  }
  
  // Check for stalemate
  if (state.turn >= ESCALATION_TRIGGERS.STALEMATE_TURNS && damageStats.averageDamagePerTurn < 1) {
    return {
      shouldEscalate: true,
      reason: `Stalemate detected: ${damageStats.averageDamagePerTurn.toFixed(1)} avg damage/turn`,
      escalationType: 'stalemate'
    };
  }
  
  return {
    shouldEscalate: false,
    reason: '',
    escalationType: 'damage'
  };
} 