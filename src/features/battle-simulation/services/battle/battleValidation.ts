// CONTEXT: Battle Validation System
// RESPONSIBILITY: Validate battle state, prevent deadlocks, and ensure proper resolution
import { BattleState, BattleLogEntry, LogEventType } from '../../types';
import { createEventId } from '../ai/logQueries';
// import { getAvailableFallbackMoves } from './fallbackMoves';
// import { trackDamage } from './analyticsTracker.service';
import { AANG_MOVES, AZULA_MOVES } from '../../types/move.types';
import { createMechanicLogEntry, logStory, logTechnical } from '../utils/mechanicLogUtils';

/**
 * @description Battle validation result with action recommendations.
 */
export type BattleValidationResult = {
  isValid: boolean;
  issues: string[];
  recommendations: string[];
  shouldForceEnd: boolean;
  endReason?: string;
  logEntry?: BattleLogEntry;
};

const CLIMAX_TURN_THRESHOLD = 20;
const CLIMAX_DAMAGE_THRESHOLD = 1.5;
const SUDDEN_DEATH_TURN_THRESHOLD = 35; // Trigger sudden death after turn 35
const SUDDEN_DEATH_ESCALATION_CYCLES = 3; // Trigger after 3 escalation cycles

/**
 * @description Validates the current battle state and detects potential issues.
 * @param {BattleState} state - The current battle state
 * @returns {BattleValidationResult} Validation result with recommendations
 */
export function validateBattleState(state: BattleState): BattleValidationResult {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let shouldForceEnd = false;
  let endReason: string | undefined;
  let logEntry: BattleLogEntry | undefined;

  const [fighter1, fighter2] = state.participants;

  // Check for immediate win conditions
  if (fighter1.currentHealth <= 0) {
    shouldForceEnd = true;
    endReason = 'victory';
    logEntry = logTechnical({
      turn: state.turn,
      actor: 'System',
      action: 'victory',
      result: `${fighter1.name} has been defeated! ${fighter2.name} wins!`,
      reason: undefined,
      target: fighter2.name,
      details: { resolution: 'victory', winner: fighter2.name }
    });
    return { isValid: false, issues, recommendations, shouldForceEnd, endReason, logEntry };
  }

  if (fighter2.currentHealth <= 0) {
    shouldForceEnd = true;
    endReason = 'victory';
    logEntry = logTechnical({
      turn: state.turn,
      actor: 'System',
      action: 'victory',
      result: `${fighter2.name} has been defeated! ${fighter1.name} wins!`,
      reason: undefined,
      target: fighter1.name,
      details: { resolution: 'victory', winner: fighter1.name }
    });
    return { isValid: false, issues, recommendations, shouldForceEnd, endReason, logEntry };
  }

  // Check for stalemate conditions
  const stalemateTurns = state.turn > 20; // After 20 turns, consider stalemate
  const lowDamageTurns = state.turn > 15; // After 15 turns, check for low damage

  if (stalemateTurns) {
    issues.push(`Battle has lasted ${state.turn} turns - potential stalemate`);
    recommendations.push('Consider forcing a climax or sudden death');
  }

  // Check for resource exhaustion
  const bothLowChi = fighter1.resources.chi <= 1 && fighter2.resources.chi <= 1;
  const bothLowHealth = fighter1.currentHealth <= 20 && fighter2.currentHealth <= 20;

  if (bothLowChi && bothLowHealth) {
    issues.push('Both fighters are critically low on resources and health');
    recommendations.push('Enable desperation moves or force climax');
  }

  // Check for infinite loop potential
  const recentLogs = state.battleLog.slice(-5);
  const repeatedMoves = recentLogs.filter(log => 
    log.type === 'MOVE' && 
    (log.action === 'Basic Strike' || log.action === 'Focus')
  ).length;

  if (repeatedMoves >= 4) {
    issues.push('Fighters are stuck in basic move loop');
    recommendations.push('Force escalation or sudden death');
    shouldForceEnd = true;
    endReason = 'stalemate';
    logEntry = logTechnical({
      turn: state.turn,
      actor: 'System',
      action: 'stalemate',
      result: 'Both fighters are exhausted and can only perform basic moves. The battle ends in a draw.',
      reason: 'basic_move_loop',
      target: undefined,
      details: { resolution: 'stalemate', reason: 'basic_move_loop' }
    });
  }

  // Check for health regeneration stall
  if (lowDamageTurns) {
    const recentDamage = recentLogs
      .filter(log => log.damage && log.damage > 0)
      .reduce((sum, log) => sum + (log.damage || 0), 0);

    if (recentDamage < 5) {
      issues.push('Very low damage output in recent turns');
      recommendations.push('Consider forcing a climax or enabling desperation moves');
    }
  }

  // --- NEW: Force Climax on Prolonged Stalemate ---
  if (state.turn > CLIMAX_TURN_THRESHOLD && state.analytics && state.analytics.averageDamagePerTurn < CLIMAX_DAMAGE_THRESHOLD) {
    const reason = `Prolonged stalemate: average damage per turn is only ${state.analytics.averageDamagePerTurn.toFixed(1)}.`;
    const logEntry = logTechnical({
      turn: state.turn,
      actor: 'System',
      action: 'climax_trigger',
      result: 'The battle has stalled! The fighters are forced into a final, decisive clash!',
      reason,
      target: undefined,
      details: { reason, phase: 'climax' }
    });
    // Mark the state to be handled by a new climax phase.
    (state as any).tacticalPhase = 'climax';
    return {
      isValid: true,
      issues: [reason],
      recommendations: ['Trigger Climax Phase'],
      shouldForceEnd: false,
      logEntry: {
        ...logEntry,
        type: logEntry.type as LogEventType
      }
    };
  }

  const turnThresholdMet = state.turn > SUDDEN_DEATH_TURN_THRESHOLD;
  const cycleThresholdMet = (fighter1.flags.escalationCycleCount || 0) >= SUDDEN_DEATH_ESCALATION_CYCLES || 
                            (fighter2.flags.escalationCycleCount || 0) >= SUDDEN_DEATH_ESCALATION_CYCLES;
  // --- REFINED: Sudden Death Trigger ---
  if ((turnThresholdMet || cycleThresholdMet) && !fighter1.flags.suddenDeath) {
    fighter1.flags.suddenDeath = true;
    if (state.analytics) state.analytics.stalematePreventionTriggered = true;
    const reason = cycleThresholdMet ? `Battle has cycled through escalation ${SUDDEN_DEATH_ESCALATION_CYCLES} times.` : `Battle has exceeded ${SUDDEN_DEATH_TURN_THRESHOLD} turns.`;
    const logEntry = logTechnical({
      turn: state.turn,
      actor: 'System',
      action: 'SUDDEN DEATH',
      result: 'The battle has reached its final stage! The next exchange will end it!',
      reason,
      target: undefined,
      details: { reason, phase: 'sudden_death' }
    });
    return { isValid: true, issues: [], recommendations: [], shouldForceEnd: false, logEntry };
  }

  return {
    isValid: !shouldForceEnd,
    issues,
    recommendations,
    shouldForceEnd,
    endReason,
    logEntry: logEntry ? {
      ...logEntry,
      type: logEntry.type as LogEventType
    } : undefined
  };
}

// Exported for use in processTurn and other modules
export function deduplicateClimaxLogs(logs: BattleLogEntry[]): BattleLogEntry[] {
  const seen = new Set<string>();
  return logs.filter(log => {
    if (log.action === 'climax' && log.turn != null) {
      const key = `${log.action}-${log.turn}-${log.actor}`;
      if (seen.has(key)) return false;
      seen.add(key);
    }
    return true;
  });
}

/**
 * @description Forces a battle climax when normal resolution is impossible.
 * @param {BattleState} state - The current battle state
 * @returns {BattleState} Updated state with forced climax
 */
export function forceBattleClimax(state: BattleState): BattleState {
  // Defensive: Prevent duplicate climax triggering/logging
  if (state.climaxTriggered) {
    return state;
  }
  // Set the flag BEFORE any logging or mutation
  const newState: BattleState = { ...state, climaxTriggered: true };
  const [p1, p2] = newState.participants;

  // Only log climax if not already present for this turn
  if (!newState.battleLog.some(log => log.action === 'climax' && log.turn === newState.turn)) {
    const climaxStoryLog = logStory({
      turn: newState.turn,
      actor: 'System',
      narrative: 'The battle reaches its climax! Both fighters must give their all!',
    });
    const climaxTechnicalLog = logTechnical({
      turn: newState.turn,
      actor: 'System',
      action: 'climax',
      result: 'Climax phase forced due to stalemate/turn limit.',
      details: { resolution: 'climax', turn: newState.turn },
    });
    newState.battleLog.push(climaxStoryLog, climaxTechnicalLog);
  }

  // --- REFINED: Force specific, powerful finisher moves ---
  const p1Finisher = (p1.name === 'Aang' ? AANG_MOVES : AZULA_MOVES).find(m => m.isFinisher);
  const p2Finisher = (p2.name === 'Aang' ? AANG_MOVES : AZULA_MOVES).find(m => m.isFinisher);

  if (!p1Finisher || !p2Finisher) {
    // Fallback if finishers aren't defined
    console.error("Climax triggered, but finisher moves not found!");
    return state;
  }

  const p1Damage = p1Finisher.baseDamage;
  const p2Damage = p2Finisher.baseDamage;

  newState.participants[1].currentHealth = Math.max(0, p2.currentHealth - p1Damage);
  newState.participants[0].currentHealth = Math.max(0, p1.currentHealth - p2Damage);

  // Only log climax moves if not already present for this turn and actor
  if (!newState.battleLog.some(log => log.turn === newState.turn && log.actor === p1.name && log.narrative?.includes(p1Finisher.name))) {
    const p1ClimaxLog = logStory({
      turn: newState.turn,
      actor: p1.name,
      narrative: `${p1.name} unleashes ${p1Finisher.name}!`,
      target: p2.name,
    });
    newState.battleLog.push(p1ClimaxLog);
  }
  if (!newState.battleLog.some(log => log.turn === newState.turn && log.actor === p2.name && log.narrative?.includes(p2Finisher.name))) {
    const p2ClimaxLog = logStory({
      turn: newState.turn,
      actor: p2.name,
      narrative: `${p2.name} unleashes ${p2Finisher.name}!`,
      target: p1.name,
    });
    newState.battleLog.push(p2ClimaxLog);
  }

  // Check for winner after climax
  if (newState.participants[1].currentHealth <= 0 && newState.participants[0].currentHealth <= 0) {
    newState.winner = null;
    newState.isFinished = true;
    if (!newState.battleLog.some(log => log.turn === newState.turn && log.narrative?.includes('ends in a draw'))) {
      const drawLog = logStory({
        turn: newState.turn,
        actor: 'System',
        narrative: 'The climactic clash leaves both warriors unconscious. The battle ends in a draw.',
      });
      newState.battleLog.push(drawLog);
    }
  } else if (newState.participants[1].currentHealth <= 0) {
    newState.winner = newState.participants[0];
    newState.isFinished = true;
    if (!newState.battleLog.some(log => log.turn === newState.turn && log.narrative?.includes('emerges victorious') && log.actor === p1.name)) {
      const victoryLog = logStory({
        turn: newState.turn,
        actor: 'System',
        narrative: `${p1.name} emerges victorious from the intense climax!`,
      });
      newState.battleLog.push(victoryLog);
    }
  } else if (newState.participants[0].currentHealth <= 0) {
    newState.winner = newState.participants[1];
    newState.isFinished = true;
    if (!newState.battleLog.some(log => log.turn === newState.turn && log.narrative?.includes('emerges victorious') && log.actor === p2.name)) {
      const victoryLog = logStory({
        turn: newState.turn,
        actor: 'System',
        narrative: `${p2.name} emerges victorious from the intense climax!`,
      });
      newState.battleLog.push(victoryLog);
    }
  }
  newState.isFinished = true;
  // Deduplicate climax logs as a failsafe
  newState.battleLog = deduplicateClimaxLogs(newState.battleLog);
  return newState;
}

/**
 * @description Checks if a battle should be forced to end due to stalemate or deadlock.
 * @param {BattleState} state - The current battle state
 * @returns {boolean} True if battle should be forced to end
 */
export function shouldForceBattleEnd(state: BattleState): boolean {
  const validation = validateBattleState(state);
  return validation.shouldForceEnd;
} 