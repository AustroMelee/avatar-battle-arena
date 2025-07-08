// CONTEXT: Escalation Phase Service
// RESPONSIBILITY: Handle pattern breaking and escalation events with enhanced state management

import { BattleState } from '../../../types';
import { getActiveParticipants } from '../state';
import { forcePatternEscalation } from '../escalationApplication.service';
// import { processLogEntryForAnalytics } from '../analyticsTracker.service';
// import { EnhancedStateManager } from '../../narrative/enhancedStateManager';
// import { createNarrativeService } from '../../narrative';
// import { generateUniqueLogId } from '../../ai/logQueries';
import { createMechanicLogEntry } from '../../utils/mechanicLogUtils';
import { AntiRepetitionUtility } from '../../narrative/utils/antiRepetition.utility';
// import type { Move } from '../../types/move.types';

// Global enhanced state manager instance
// const enhancedStateManager = new EnhancedStateManager();
// Lazy narrative service instance
// const narrativeService: ReturnType<typeof createNarrativeService> | null = null;

// function getNarrativeService() {
//   if (!narrativeService) {
//     narrativeService = createNarrativeService();
//   }
//   return narrativeService;
// }

const STALEMATE_TURN_THRESHOLD = 15;
const STALEMATE_DAMAGE_THRESHOLD = 5; // Average damage per turn to be considered "active"
const REPETITIVE_LOOP_THRESHOLD = 3; // Number of same consecutive moves to trigger escalation

const antiRepetition = new AntiRepetitionUtility();
const STALEMATE_BROKEN_LINES = [
  "The battle's pace quickens as the fighters are forced to break the deadlock!",
  "A sudden shift in momentum! The stalemate is shattered.",
  "No more waiting—both sides are compelled to act decisively!",
  "The tension snaps; the fighters abandon caution for action.",
  "A new urgency fills the arena as the deadlock is broken.",
  "The crowd senses a change—no more stalemates, only action!"
];

/**
 * @description Processes battle escalation based on stalemate and pattern detection.
 * If escalation is triggered, it modifies the character's state.
 * @param {BattleState} state - The current battle state.
 * @returns {Promise<BattleState>} Updated state with potential escalation effects.
 */
export async function escalationPhase(state: BattleState): Promise<BattleState> {
  if (state.isFinished) return state;

  const { attacker } = getActiveParticipants(state);
  
  // Skip if already in escalation
  if (attacker.flags?.forcedEscalation === 'true') {
    return state;
  }

  // --- Prevent redundant escalation triggers/logs ---
  const lastEscalationTurn = attacker.flags?.escalationTurns ? parseInt(attacker.flags.escalationTurns, 10) : -Infinity;
  const ESCALATION_LOG_COOLDOWN = 3;
  if (state.turn - lastEscalationTurn < ESCALATION_LOG_COOLDOWN) {
    return state;
  }

  let shouldEscalate = false;
  let reason = '';
  let escalationType: 'stalemate' | 'repetition' = 'stalemate';

  // 1. Stalemate Detection (based on real-time analytics)
  if (state.turn > STALEMATE_TURN_THRESHOLD && state.analytics.averageDamagePerTurn < STALEMATE_DAMAGE_THRESHOLD) {
    shouldEscalate = true;
    reason = `Stalemate detected: only ${state.analytics.averageDamagePerTurn.toFixed(1)} avg damage/turn.`;
    escalationType = 'stalemate';
    console.log(`DEBUG: T${state.turn} ${attacker.name} ESCALATION: ${reason}`);
  }

  // 2. Repetitive Move Detection
  if (!shouldEscalate) {
    const moveHistory = attacker.moveHistory;
    if (moveHistory.length >= REPETITIVE_LOOP_THRESHOLD) {
      const lastThreeMoves = moveHistory.slice(-REPETITIVE_LOOP_THRESHOLD);
      if (lastThreeMoves.every(move => move === lastThreeMoves[0])) {
        shouldEscalate = true;
        reason = `Repetitive move pattern detected: used '${lastThreeMoves[0]}' ${REPETITIVE_LOOP_THRESHOLD} times in a row.`;
        escalationType = 'repetition';
        console.log(`DEBUG: T${state.turn} ${attacker.name} ESCALATION: ${reason}`);
      }
    }
  }

  if (shouldEscalate) {
    // --- NEW: Add a clear, anti-repetitive "Stalemate Broken" log entry ---
    const effect = antiRepetition.getFreshLine('system-stalemate-broken', STALEMATE_BROKEN_LINES) || STALEMATE_BROKEN_LINES[0];
    const { narrative, technical } = createMechanicLogEntry({
      turn: state.turn,
      actor: 'System',
      mechanic: 'Stalemate Broken!',
      effect,
      reason: reason,
    });
    // --- END ---
    const { newState, logEntry } = forcePatternEscalation(state, attacker, escalationType, reason);
    
    // Update analytics with the escalation event
    if (newState.analytics) {
        newState.analytics.patternAdaptations = (newState.analytics.patternAdaptations || 0) + 1;
        console.log(`DEBUG: Analytics updated - Pattern Adaptations: ${newState.analytics.patternAdaptations}`);
    }

    newState.battleLog.push(technical);
    newState.battleLog.push(logEntry);
    newState.log.push(narrative);
    newState.log.push(typeof logEntry.narrative === 'string' ? logEntry.narrative : logEntry.narrative.join(' ') || logEntry.result);

    // --- NEW: Increment the escalation cycle counter ---
    const attackerIndex = newState.participants.findIndex(p => p.name === attacker.name);
    if (attackerIndex !== -1) {
      newState.participants[attackerIndex].flags.escalationCycleCount = (newState.participants[attackerIndex].flags.escalationCycleCount || 0) + 1;
    }

    // If escalation should trigger a climax, call forceBattleClimax and return
    if (shouldEscalate && escalationType === 'climax') {
      return forceBattleClimax(state);
    }

    return newState;
  }

  return state;
} 