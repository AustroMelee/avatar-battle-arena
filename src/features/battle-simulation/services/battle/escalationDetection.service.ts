// CONTEXT: Escalation Detection Service
// RESPONSIBILITY: Detect when escalation should be triggered

import { BattleState, BattleCharacter } from '../../types';
import { getPatternState } from './patternTracking.service';

// MODIFIED: More aggressive escalation triggers
const ESCALATION_TRIGGERS = {
  DAMAGE_THRESHOLD: 15, // Lowered: Force escalation if total damage < 15 by turn 30
  TURNS_WITHOUT_DAMAGE: 10, // Lowered: Force escalation after 10 turns without damage
  REPOSITION_SPAM: 5, // Lowered: Force close combat after only 5 reposition attempts
  STALEMATE_TURNS: 20, // Lowered: Force climax after 20 turns of stalemate
  ESCALATION_COOLDOWN: 12 // Lowered: Shorter cooldown between escalation events
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
  
  const lastEscalationTurn = attacker.flags?.escalationTurns ? parseInt(attacker.flags.escalationTurns, 10) : -Infinity;
  
  // Check cooldown first
  if (state.turn - lastEscalationTurn < ESCALATION_TRIGGERS.ESCALATION_COOLDOWN) {
    return {
      shouldEscalate: false,
      reason: 'Escalation cooldown active',
      escalationType: 'damage'
    };
  }

  // Check for damage-based escalation (now more aggressive)
  if (state.turn >= 30 && damageStats.totalDamage < ESCALATION_TRIGGERS.DAMAGE_THRESHOLD) {
    return {
      shouldEscalate: true,
      reason: `Low damage output (${damageStats.totalDamage} total) by turn ${state.turn}`,
      escalationType: 'damage'
    };
  }

  // Check for reposition spam (more aggressive)
  if (patternState.repositionAttempts >= ESCALATION_TRIGGERS.REPOSITION_SPAM) {
    return {
      shouldEscalate: true,
      reason: `Excessive repositioning (${patternState.repositionAttempts} attempts)`,
      escalationType: 'reposition'
    };
  }
  
  // Check for stalemate (more aggressive)
  if (state.turn >= ESCALATION_TRIGGERS.STALEMATE_TURNS && damageStats.averageDamagePerTurn < 1.0) { // Increased sensitivity
    return {
      shouldEscalate: true,
      reason: `Stalemate detected: ${damageStats.averageDamagePerTurn.toFixed(1)} avg damage/turn`,
      escalationType: 'stalemate'
    };
  }
  
  // Check for repetition-based escalation (move spam)
  if (patternState.patternStale) {
    return {
      shouldEscalate: true,
      reason: `Repetitive move pattern detected: ${patternState.consecutiveMoves.join(', ')}`,
      escalationType: 'repetition'
    };
  }

  return {
    shouldEscalate: false,
    reason: '',
    escalationType: 'damage'
  };
} 