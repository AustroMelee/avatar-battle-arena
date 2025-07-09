// CONTEXT: Battle Validation System
// RESPONSIBILITY: Validate battle state, prevent deadlocks, and ensure proper resolution
import { BattleState, BattleLogEntry } from '../../types';
import { logStory, logMechanics } from '../utils/mechanicLogUtils';
import type { Move } from '../../types/move.types';
import { ensureNonEmpty } from '../../types';
// import { getAvailableFallbackMoves } from './fallbackMoves';
// import { trackDamage } from './analyticsTracker.service';

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
    logEntry = logMechanics({
      turn: state.turn,
      text: `${fighter1.name} has been defeated! ${fighter2.name} wins!`
    }) || undefined;
    return { isValid: false, issues, recommendations, shouldForceEnd, endReason, logEntry };
  }

  if (fighter2.currentHealth <= 0) {
    shouldForceEnd = true;
    endReason = 'victory';
    logEntry = logMechanics({
      turn: state.turn,
      text: `${fighter2.name} has been defeated! ${fighter1.name} wins!`
    }) || undefined;
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
    log.type === 'mechanics' && 
    (log.action === 'Basic Strike' || log.action === 'Focus')
  ).length;

  if (repeatedMoves >= 4) {
    issues.push('Fighters are stuck in basic move loop');
    recommendations.push('Force escalation or sudden death');
    shouldForceEnd = true;
    endReason = 'stalemate';
    logEntry = logMechanics({
      turn: state.turn,
      text: 'Both fighters are exhausted and can only perform basic moves. The battle ends in a draw.'
    }) || undefined;
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
    const logEntry = logMechanics({
      turn: state.turn,
      text: 'The battle has stalled! The fighters are forced into a final, decisive clash!'
    }) || undefined;
    // Mark the state to be handled by a new climax phase.
    (state as unknown as { tacticalPhase: string; climaxTriggered: boolean; climaxLog: BattleLogEntry | undefined }).tacticalPhase = 'climax';
    (state as unknown as { climaxTriggered: boolean; }).climaxTriggered = true;
    (state as unknown as { climaxLog: BattleLogEntry | undefined; }).climaxLog = logEntry;
    return {
      isValid: true,
      issues: ['Prolonged stalemate: average damage per turn is only 0.0.'],
      recommendations: ['Trigger Climax Phase (only finishers/high-risk moves allowed)'],
      shouldForceEnd: false,
      logEntry
    };
  }

  const turnThresholdMet = state.turn > SUDDEN_DEATH_TURN_THRESHOLD;
  const cycleThresholdMet = (fighter1.flags.escalationCycleCount || 0) >= SUDDEN_DEATH_ESCALATION_CYCLES || 
                            (fighter2.flags.escalationCycleCount || 0) >= SUDDEN_DEATH_ESCALATION_CYCLES;
  // --- REFINED: Sudden Death Trigger ---
  if ((turnThresholdMet || cycleThresholdMet) && !fighter1.flags.suddenDeath) {
    fighter1.flags.suddenDeath = true;
    if (state.analytics) state.analytics.stalematePreventionTriggered = true;
    const logEntry = logMechanics({
      turn: state.turn,
      text: 'The battle has reached its final stage! The next exchange will end it!'
    }) || undefined;
    (state as unknown as { suddenDeathActive: boolean; suddenDeathLog: BattleLogEntry | undefined }).suddenDeathActive = true;
    (state as unknown as { suddenDeathLog: BattleLogEntry | undefined; }).suddenDeathLog = logEntry;
    return { isValid: true, issues: [], recommendations: ['Trigger Sudden Death (only finishers/high-risk moves allowed)'], shouldForceEnd: false, logEntry };
  }

  // --- FINAL: Guarantee Decisive Outcome ---
  if (shouldForceEnd && endReason === 'stalemate') {
    // If both fighters are alive, force a final exchange (finisher/high-risk only)
    if (fighter1.currentHealth > 0 && fighter2.currentHealth > 0) {
      (state as unknown as { tacticalPhase: string; climaxTriggered: boolean; }).tacticalPhase = 'climax';
      (state as unknown as { climaxTriggered: boolean; }).climaxTriggered = true;
      const logEntry = logMechanics({
        turn: state.turn,
        text: 'Stalemate detected, forcing a final decisive exchange!'
      }) || undefined;
      return {
        isValid: true,
        issues: ['Stalemate detected, forcing final exchange'],
        recommendations: ['Only finishers/high-risk moves allowed'],
        shouldForceEnd: false,
        logEntry
      };
    }
    // If both are KO’d, allow draw
    if (fighter1.currentHealth <= 0 && fighter2.currentHealth <= 0) {
      return { isValid: false, issues, recommendations, shouldForceEnd: true, endReason: 'draw', logEntry };
    }
    // Otherwise, resolve as win/loss
    endReason = fighter1.currentHealth <= 0 ? 'victory' : 'defeat';
    shouldForceEnd = true;
    logEntry = logMechanics({
      turn: state.turn,
      text: `Battle forcibly ended: ${endReason}`
    }) || undefined;
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

// Exported for use in processTurn and other modules
export function deduplicateClimaxLogs(logs: (BattleLogEntry | null | undefined)[]): BattleLogEntry[] {
  const seen = new Set<string>();
  return logs.filter((log): log is BattleLogEntry => {
    if (!log) return false;
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
    const climaxStoryLogMaybe = logStory({
      turn: newState.turn,
      narrative: ensureNonEmpty('The battle reaches its climax! Both fighters must give their all!'),
    });
    const climaxTechnicalLogMaybe = logMechanics({
      turn: newState.turn,
      text: 'System: The battle reaches its climax! Both fighters must give their all!'
    });
    if (climaxStoryLogMaybe !== null && climaxStoryLogMaybe !== undefined) newState.battleLog.push(climaxStoryLogMaybe);
    if (climaxTechnicalLogMaybe !== null && climaxTechnicalLogMaybe !== undefined) newState.battleLog.push(climaxTechnicalLogMaybe);
  }

  // --- REFINED: Force specific, powerful finisher moves ---
  const p1Finisher = (p1.abilities && p1.abilities.length > 0)
    ? p1.abilities.find(m => m.isFinisher)
    : undefined;
  const p2Finisher = (p2.abilities && p2.abilities.length > 0)
    ? p2.abilities.find(m => m.isFinisher)
    : undefined;

  // Helper: safely get highest-damage move
  function getHighestDamageMove(moves: Move[] | undefined): Move | undefined {
    if (!moves || moves.length === 0) return undefined;
    return moves.reduce((max, m) => (m.baseDamage > max.baseDamage ? m : max), moves[0]);
  }

  const p1Fallback = getHighestDamageMove(p1.abilities);
  const p2Fallback = getHighestDamageMove(p2.abilities);

  const p1Move = p1Finisher || p1Fallback;
  const p2Move = p2Finisher || p2Fallback;

  if (!p1Move || !p2Move) {
    // Fallback if no moves are found
    console.error("Climax triggered, but no valid moves found for one or both participants!");
    return state;
  }

  const p1Damage = p1Move.baseDamage;
  const p2Damage = p2Move.baseDamage;

  newState.participants[1].currentHealth = Math.max(0, p2.currentHealth - p1Damage);
  newState.participants[0].currentHealth = Math.max(0, p1.currentHealth - p2Damage);

  // Only log climax moves if not already present for this turn and actor
  if (!newState.battleLog.some(log => log.turn === newState.turn && log.actor === 'System' && log.narrative && typeof log.narrative === 'string' && log.narrative.includes(p1Move.name))) {
    const p1ClimaxLog = logStory({
      turn: newState.turn,
      narrative: ensureNonEmpty(`${p1.name} unleashes ${p1Move.name}!` || '—'),
    });
    if (p1ClimaxLog !== null && p1ClimaxLog !== undefined) newState.battleLog.push(p1ClimaxLog);
  }
  if (!newState.battleLog.some(log => log.turn === newState.turn && log.actor === 'System' && log.narrative && typeof log.narrative === 'string' && log.narrative.includes(p2Move.name))) {
    const p2ClimaxLog = logStory({
      turn: newState.turn,
      narrative: ensureNonEmpty(`${p2.name} unleashes ${p2Move.name}!` || '—'),
    });
    if (p2ClimaxLog !== null && p2ClimaxLog !== undefined) newState.battleLog.push(p2ClimaxLog);
  }

  // Check for winner after climax
  if (newState.participants[1].currentHealth <= 0 && newState.participants[0].currentHealth <= 0) {
    newState.winner = null;
    newState.isFinished = true;
    if (!newState.battleLog.some(log => log.turn === newState.turn && log.narrative && typeof log.narrative === 'string' && log.narrative.includes('ends in a draw'))) {
      const drawLog = logStory({
        turn: newState.turn,
        narrative: ensureNonEmpty('The climactic clash leaves both warriors unconscious. The battle ends in a draw.'),
      });
      if (drawLog !== null && drawLog !== undefined) newState.battleLog.push(drawLog);
    }
  } else if (newState.participants[1].currentHealth <= 0) {
    newState.winner = newState.participants[0];
    newState.isFinished = true;
    if (!newState.battleLog.some(log => log.turn === newState.turn && log.narrative && typeof log.narrative === 'string' && log.narrative.includes('emerges victorious') && log.actor === 'System')) {
      const victoryLog = logStory({
        turn: newState.turn,
        narrative: ensureNonEmpty(`${p1.name} emerges victorious from the intense climax!` || '—'),
      });
      if (victoryLog !== null && victoryLog !== undefined) newState.battleLog.push(victoryLog);
    }
  } else if (newState.participants[0].currentHealth <= 0) {
    newState.winner = newState.participants[1];
    newState.isFinished = true;
    if (!newState.battleLog.some(log => log.turn === newState.turn && log.narrative && typeof log.narrative === 'string' && log.narrative.includes('emerges victorious') && log.actor === 'System')) {
      const victoryLog2 = logStory({
        turn: newState.turn,
        narrative: ensureNonEmpty(`${p2.name} emerges victorious from the intense climax!` || '—'),
      });
      if (victoryLog2 !== null && victoryLog2 !== undefined) newState.battleLog.push(victoryLog2);
    }
  }
  newState.isFinished = true;
  // Deduplicate climax logs as a failsafe
  newState.battleLog = deduplicateClimaxLogs(newState.battleLog.filter((log): log is BattleLogEntry => !!log));
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