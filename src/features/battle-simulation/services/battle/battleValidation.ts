// CONTEXT: Battle Validation System
// RESPONSIBILITY: Validate battle state, prevent deadlocks, and ensure proper resolution
import { BattleState, BattleLogEntry } from '../../types';
import { createEventId } from '../ai/logQueries';
import { getAvailableFallbackMoves } from './fallbackMoves';

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

  return {
    isValid: !shouldForceEnd,
    issues,
    recommendations,
    shouldForceEnd,
    endReason,
    logEntry
  };
}

/**
 * @description Forces a battle climax when normal resolution is impossible.
 * @param {BattleState} state - The current battle state
 * @returns {BattleState} Updated state with forced climax
 */
export function forceBattleClimax(state: BattleState): BattleState {
  const newState = { ...state };
  const [fighter1, fighter2] = newState.participants;

  // Create climax log entry
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
  newState.log.push('The battle reaches its climax! Both fighters must give their all!');

  // Force both fighters to use their most powerful available moves
  const fighter1Moves = getAvailableFallbackMoves(fighter1.currentHealth);
  const fighter2Moves = getAvailableFallbackMoves(fighter2.currentHealth);

  // Choose the most damaging move for each fighter
  const fighter1BestMove = fighter1Moves.reduce((best, move) => 
    move.power > best.power ? move : best, fighter1Moves[0]);
  const fighter2BestMove = fighter2Moves.reduce((best, move) => 
    move.power > best.power ? move : best, fighter2Moves[0]);

  // Apply climax damage (enhanced damage for dramatic effect)
  const fighter1Damage = Math.floor(fighter1BestMove.power * 1.5);
  const fighter2Damage = Math.floor(fighter2BestMove.power * 1.5);

  newState.participants[1].currentHealth = Math.max(0, fighter2.currentHealth - fighter1Damage);
  newState.participants[0].currentHealth = Math.max(0, fighter1.currentHealth - fighter2Damage);

  // Log the climax moves
  const fighter1ClimaxLog: BattleLogEntry = {
    id: createEventId(),
    turn: newState.turn,
    actor: fighter1.name,
    type: 'MOVE',
    action: fighter1BestMove.name,
    target: fighter2.name,
    result: `CLIMAX: ${fighter1.name} unleashes ${fighter1BestMove.name} for ${fighter1Damage} damage!`,
    damage: fighter1Damage,
    timestamp: Date.now(),
    meta: { climax: true, enhanced: true }
  };

  const fighter2ClimaxLog: BattleLogEntry = {
    id: createEventId(),
    turn: newState.turn,
    actor: fighter2.name,
    type: 'MOVE',
    action: fighter2BestMove.name,
    target: fighter1.name,
    result: `CLIMAX: ${fighter2.name} unleashes ${fighter2BestMove.name} for ${fighter2Damage} damage!`,
    damage: fighter2Damage,
    timestamp: Date.now(),
    meta: { climax: true, enhanced: true }
  };

  newState.battleLog.push(fighter1ClimaxLog, fighter2ClimaxLog);
  newState.log.push(fighter1ClimaxLog.result, fighter2ClimaxLog.result);

  // Check for winner after climax
  if (newState.participants[1].currentHealth <= 0) {
    newState.winner = newState.participants[0];
    newState.isFinished = true;
    const victoryLog: BattleLogEntry = {
      id: createEventId(),
      turn: newState.turn,
      actor: 'System',
      type: 'VICTORY',
      action: 'victory',
      target: fighter1.name,
      result: `${fighter1.name} wins the climactic battle!`,
      narrative: `${fighter1.name} emerges victorious from the intense climax!`,
      timestamp: Date.now(),
      meta: { resolution: 'victory', climax: true }
    };
    newState.battleLog.push(victoryLog);
    newState.log.push(victoryLog.result);
  } else if (newState.participants[0].currentHealth <= 0) {
    newState.winner = newState.participants[1];
    newState.isFinished = true;
    const victoryLog: BattleLogEntry = {
      id: createEventId(),
      turn: newState.turn,
      actor: 'System',
      type: 'VICTORY',
      action: 'victory',
      target: fighter2.name,
      result: `${fighter2.name} wins the climactic battle!`,
      narrative: `${fighter2.name} emerges victorious from the intense climax!`,
      timestamp: Date.now(),
      meta: { resolution: 'victory', climax: true }
    };
    newState.battleLog.push(victoryLog);
    newState.log.push(victoryLog.result);
  } else {
    // Both survived climax - mutual KO or draw
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
    newState.log.push(drawLog.result);
  }

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