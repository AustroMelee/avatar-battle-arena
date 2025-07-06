// CONTEXT: Escalation Detection Service
// RESPONSIBILITY: Detect when escalation should be triggered

import { BattleState, BattleCharacter } from '../../types';
import { getPatternState } from './patternTracking.service';

// Escalation triggers - EXTREMELY CONSERVATIVE
const ESCALATION_TRIGGERS = {
  DAMAGE_THRESHOLD: 25, // Force escalation if total damage < 25 by turn 35 (much higher threshold)
  TURNS_WITHOUT_DAMAGE: 15, // Force escalation after 15 turns without damage (increased from 10)
  REPOSITION_SPAM: 8, // Force close combat after 8 reposition attempts (increased from 5)
  STALEMATE_TURNS: 30, // Force climax after 30 turns of stalemate (increased from 20)
  ESCALATION_COOLDOWN: 15 // Much longer cooldown between escalation triggers (increased from 12)
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
  
  // Check escalation cooldown - prevent spam
  const lastEscalationTurn = attacker.flags?.escalationTurns ? parseInt(attacker.flags.escalationTurns) : 0;
  const escalationDuration = attacker.flags?.escalationDuration ? parseInt(attacker.flags.escalationDuration) : 0;
  
  // If currently in escalation, don't trigger again
  if (attacker.flags?.forcedEscalation === 'true' && state.turn - lastEscalationTurn < escalationDuration) {
    return {
      shouldEscalate: false,
      reason: 'Currently in escalation state',
      escalationType: 'damage'
    };
  }
  
  // Check cooldown between escalation triggers
  if (state.turn - lastEscalationTurn < ESCALATION_TRIGGERS.ESCALATION_COOLDOWN) {
    return {
      shouldEscalate: false,
      reason: 'Escalation cooldown active',
      escalationType: 'damage'
    };
  }
  
  // Check for damage-based escalation - much higher threshold to prevent early escalation
  if (state.turn >= 35 && damageStats.totalDamage < ESCALATION_TRIGGERS.DAMAGE_THRESHOLD) {
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
  
  // Check for stalemate - increased threshold to prevent early stalemate detection
  if (state.turn >= ESCALATION_TRIGGERS.STALEMATE_TURNS && damageStats.averageDamagePerTurn < 0.5) {
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