// Used via dynamic registry in BattleEngine. See SYSTEM ARCHITECTURE.MD for flow.
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
// import type { Move } from '../../types/move.types';

declare global {
  interface ImportMeta {
    hot?: unknown;
    globEager?: (pattern: string) => Record<string, unknown>;
  }
}

if (import.meta.hot) {
  console.log('[TRACE] escalationPhase loaded from', import.meta.url);
  if (typeof import.meta.globEager === 'function') {
    console.log(
      '[TRACE] Keys in battle services bundle:',
      Object.keys(import.meta.globEager('../**/*.service.ts'))
    );
  } else {
    console.log('[TRACE] import.meta.globEager is not available');
  }
}

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
    // Use a poetic escalation/desperation line instead of mechanical log
    const fallbackLines = [
      (characterName: string) => `Out of options, ${characterName} digs deep—summoning a move born of sheer survival instinct.`
    ];
    const line = fallbackLines[Math.floor(Math.random() * fallbackLines.length)](attacker.name);
    const { narrative, technical } = createMechanicLogEntry({
      turn: state.turn,
      actor: 'Narrator',
      mechanic: '',
      effect: line,
      reason: '', // Do not append reason/parenthetical to player log
    });
    const { newState, logEntry } = forcePatternEscalation(state, attacker, escalationType, '');
    if (newState.analytics) {
        newState.analytics.patternAdaptations = (newState.analytics.patternAdaptations || 0) + 1;
        console.log(`DEBUG: Analytics updated - Pattern Adaptations: ${newState.analytics.patternAdaptations}`);
    }
    newState.battleLog.push(technical); // Technical log for devs only
    newState.battleLog.push(logEntry); // Technical log for devs only
    newState.log.push(narrative); // Only narrative, never mechanical
    newState.log.push(typeof logEntry.narrative === 'string' ? logEntry.narrative : logEntry.narrative.join(' ') || logEntry.result);
    const attackerIndex = newState.participants.findIndex(p => p.name === attacker.name);
    if (attackerIndex !== -1) {
      newState.participants[attackerIndex].flags.escalationCycleCount = (newState.participants[attackerIndex].flags.escalationCycleCount || 0) + 1;
    }
    return newState;
  }

  return state;
} 