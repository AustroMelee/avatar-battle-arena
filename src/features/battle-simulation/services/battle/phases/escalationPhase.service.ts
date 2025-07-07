// CONTEXT: Escalation Phase Service
// RESPONSIBILITY: Handle pattern breaking and escalation events with enhanced state management

import { BattleState } from '../../../types';
import { getActiveParticipants } from '../state';
import { forcePatternEscalation } from '../escalationApplication.service';
import { processLogEntryForAnalytics } from '../analyticsTracker.service';
import { EnhancedStateManager } from '../../narrative/enhancedStateManager';
import { createNarrativeService } from '../../narrative';
import { generateUniqueLogId } from '../../ai/logQueries';

// Global enhanced state manager instance
const enhancedStateManager = new EnhancedStateManager();
// Lazy narrative service instance
let narrativeService: ReturnType<typeof createNarrativeService> | null = null;

function getNarrativeService() {
  if (!narrativeService) {
    narrativeService = createNarrativeService();
  }
  return narrativeService;
}

const STALEMATE_TURN_THRESHOLD = 15;
const STALEMATE_DAMAGE_THRESHOLD = 5; // Average damage per turn to be considered "active"
const REPETITIVE_LOOP_THRESHOLD = 3; // Number of same consecutive moves to trigger escalation

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
    const { newState, logEntry } = forcePatternEscalation(state, attacker, escalationType, reason);
    
    // Update analytics with the escalation event
    if (newState.analytics) {
        newState.analytics.patternAdaptations = (newState.analytics.patternAdaptations || 0) + 1;
        console.log(`DEBUG: Analytics updated - Pattern Adaptations: ${newState.analytics.patternAdaptations}`);
    }

    newState.battleLog.push(logEntry);
    newState.log.push(logEntry.narrative || logEntry.result);

    // --- NEW: Increment the escalation cycle counter ---
    const attackerIndex = newState.participants.findIndex(p => p.name === attacker.name);
    if (attackerIndex !== -1) {
      newState.participants[attackerIndex].flags.escalationCycleCount = (newState.participants[attackerIndex].flags.escalationCycleCount || 0) + 1;
    }

    return newState;
  }

  return state;
}

/**
 * @description Gets the active participants from the battle state
 */
function getActiveParticipants(state: BattleState) {
  const attacker = state.participants[state.activeParticipantIndex];
  const target = state.participants[1 - state.activeParticipantIndex];
  const attackerIndex = state.activeParticipantIndex;
  const targetIndex = 1 - state.activeParticipantIndex;
  
  return { attacker, target, attackerIndex, targetIndex };
} 