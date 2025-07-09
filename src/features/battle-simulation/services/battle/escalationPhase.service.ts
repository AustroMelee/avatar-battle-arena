// Used via dynamic registry in battle engine. See SYSTEM ARCHITECTURE.MD for flow.
import type { BattleState, BattleCharacter } from '../../types';
import { createMechanicLogEntry } from '../utils/mechanicLogUtils';
/**
 * Handles escalation phase transitions and logging.
 * - Uses only tacticalPhase for escalation state.
 * - All log pushes are type-safe (never null).
 * - Analytics and flags are robustly updated.
 */
export function handleEscalationPhase({ state, attacker, reason, shouldEscalate }: {
  state: BattleState;
  attacker: BattleCharacter;
  reason: string;
  shouldEscalate: boolean;
}): BattleState {
  if (!shouldEscalate) return state;
  // Set phase
  state.tacticalPhase = 'escalation';
  // Update analytics
  if (state.analytics) {
    state.analytics.patternAdaptations = (state.analytics.patternAdaptations || 0) + 1;
  }
  // Update attacker flags
  const attackerIndex = state.participants.findIndex((p: BattleCharacter) => p.name === attacker.name);
  if (attackerIndex !== -1) {
    state.participants[attackerIndex].flags.usedEscalation = true;
    state.participants[attackerIndex].flags.escalationCycleCount = (state.participants[attackerIndex].flags.escalationCycleCount || 0) + 1;
    state.participants[attackerIndex].flags.escalationTurns = String(state.turn);
  }
  // Log technical and narrative
  const effect = reason || 'Escalation triggered.';
  const technical = createMechanicLogEntry({
    turn: state.turn,
    mechanic: 'Forced Escalation',
    effect,
    reason,
  });
  if (technical && technical.technical) state.battleLog.push(technical.technical);
  if (technical && technical.narrative) state.log.push(technical.narrative);
  return state;
} 