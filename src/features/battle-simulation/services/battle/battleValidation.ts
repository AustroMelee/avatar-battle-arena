// CONTEXT: Battle Validation System
// RESPONSIBILITY: Validate battle state, prevent deadlocks, and ensure proper resolution
import { BattleState, BattleLogEntry, LogEventType } from '../../types';
import { createEventId } from '../ai/logQueries';
// import { getAvailableFallbackMoves } from './fallbackMoves';
// import { trackDamage } from './analyticsTracker.service';
import { AANG_MOVES, AZULA_MOVES } from '../../types/move.types';
import { createMechanicLogEntry } from '../utils/mechanicLogUtils';

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
    logEntry = {
      id: createEventId(),
      turn: state.turn,
      actor: 'System',
      type: 'VICTORY',
      action: 'victory',
      target: fighter2.name,
      result: `${fighter1.name} has been defeated! ${fighter2.name} wins!`,
      narrative: `${fighter1.name} falls, unable to continue. ${fighter2.name} emerges victorious!`,
      timestamp: Date.now(),
      meta: { resolution: 'victory', winner: fighter2.name }
    };
    return { isValid: false, issues, recommendations, shouldForceEnd, endReason, logEntry };
  }

  if (fighter2.currentHealth <= 0) {
    shouldForceEnd = true;
    endReason = 'victory';
    logEntry = {
      id: createEventId(),
      turn: state.turn,
      actor: 'System',
      type: 'VICTORY',
      action: 'victory',
      target: fighter1.name,
      result: `${fighter2.name} has been defeated! ${fighter1.name} wins!`,
      narrative: `${fighter2.name} falls, unable to continue. ${fighter1.name} emerges victorious!`,
      timestamp: Date.now(),
      meta: { resolution: 'victory', winner: fighter1.name }
    };
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
    logEntry = {
      id: createEventId(),
      turn: state.turn,
      actor: 'System',
      type: 'DRAW',
      action: 'stalemate',
      result: 'Both fighters are exhausted and can only perform basic moves. The battle ends in a draw.',
      narrative: 'The warriors are too exhausted to continue effectively. The duel ends in a stalemate.',
      timestamp: Date.now(),
      meta: { resolution: 'stalemate', reason: 'basic_move_loop' }
    };
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
    const logEntry = {
      id: createEventId(),
      turn: state.turn,
      actor: 'System',
      type: 'INFO',
      action: 'climax_trigger',
      result: 'The battle has stalled! The fighters are forced into a final, decisive clash!',
      narrative: 'The battle has stalled! The fighters are forced into a final, decisive clash!',
      timestamp: Date.now(),
      meta: { reason, phase: 'climax' }
    };
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
    const logEntry = createMechanicLogEntry({
        turn: state.turn,
        actor: 'System',
        mechanic: 'SUDDEN DEATH',
        effect: 'The battle has reached its final stage! The next exchange will end it!',
        reason: reason,
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

/**
 * @description Forces a battle climax when normal resolution is impossible.
 * @param {BattleState} state - The current battle state
 * @returns {BattleState} Updated state with forced climax
 */
export function forceBattleClimax(state: BattleState): BattleState {
  const newState = { ...state };
  const [p1, p2] = newState.participants;

  const climaxLogEntry: BattleLogEntry = {
    id: createEventId(),
    turn: newState.turn,
    actor: 'System',
    type: 'INFO',
    action: 'climax',
    result: 'The battle reaches its climax! Both fighters must give their all!',
    narrative: 'The tension reaches its peak. Both warriors know this is the moment of truth!',
    timestamp: Date.now(),
    meta: { resolution: 'climax', turn: newState.turn }
  };
  newState.battleLog.push(climaxLogEntry);

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

  // Log the climax moves
  const p1ClimaxLog: BattleLogEntry = {
    id: createEventId(),
    turn: newState.turn,
    actor: p1.name,
    type: 'MOVE',
    action: p1Finisher.name,
    target: p2.name,
    result: `CLIMAX: ${p1.name} unleashes ${p1Finisher.name} for ${p1Damage} damage!`,
    damage: p1Damage,
    timestamp: Date.now(),
    meta: { climax: true, finisher: true },
    narrative: ''
  };
  const p2ClimaxLog: BattleLogEntry = {
    id: createEventId(),
    turn: newState.turn,
    actor: p2.name,
    type: 'MOVE',
    action: p2Finisher.name,
    target: p1.name,
    result: `CLIMAX: ${p2.name} unleashes ${p2Finisher.name} for ${p2Damage} damage!`,
    damage: p2Damage,
    timestamp: Date.now(),
    meta: { climax: true, finisher: true },
    narrative: ''
  };
  newState.battleLog.push(p1ClimaxLog, p2ClimaxLog);

  // Check for winner after climax
  if (newState.participants[1].currentHealth <= 0 && newState.participants[0].currentHealth <= 0) {
    newState.winner = null;
    newState.isFinished = true;
    const drawLog: BattleLogEntry = {
      id: createEventId(),
      turn: newState.turn,
      actor: 'System',
      type: 'DRAW',
      action: 'mutual_ko',
      result: 'Both fighters are knocked out in the climactic exchange!',
      narrative: 'The climactic clash leaves both warriors unconscious. The battle ends in a draw.',
      timestamp: Date.now(),
      meta: { resolution: 'mutual_ko', climax: true }
    };
    newState.battleLog.push(drawLog);
  } else if (newState.participants[1].currentHealth <= 0) {
    newState.winner = newState.participants[0];
    newState.isFinished = true;
    const victoryLog: BattleLogEntry = {
      id: createEventId(),
      turn: newState.turn,
      actor: 'System',
      type: 'VICTORY',
      action: 'victory',
      target: p1.name,
      result: `${p1.name} wins the climactic battle!`,
      narrative: `${p1.name} emerges victorious from the intense climax!`,
      timestamp: Date.now(),
      meta: { resolution: 'victory', climax: true }
    };
    newState.battleLog.push(victoryLog);
  } else if (newState.participants[0].currentHealth <= 0) {
    newState.winner = newState.participants[1];
    newState.isFinished = true;
    const victoryLog: BattleLogEntry = {
      id: createEventId(),
      turn: newState.turn,
      actor: 'System',
      type: 'VICTORY',
      action: 'victory',
      target: p2.name,
      result: `${p2.name} wins the climactic battle!`,
      narrative: `${p2.name} emerges victorious from the intense climax!`,
      timestamp: Date.now(),
      meta: { resolution: 'victory', climax: true }
    };
    newState.battleLog.push(victoryLog);
  }
  newState.isFinished = true;
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