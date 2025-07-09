// CONTEXT: Escalation Application Service
// RESPONSIBILITY: Apply escalation effects to battle state

import { BattleState, BattleCharacter, BattleLogEntry } from '../../types';
import { logMechanics } from '../utils/mechanicLogUtils';
import { ensureNonEmpty } from '../utils/strings';
import { nes } from '@/common/branding/nonEmptyString';

/**
 * Forces pattern-breaking escalation using only phase-based logic.
 * - Uses only tacticalPhase for escalation state.
 * - All log pushes are type-safe (never null).
 * - Analytics and flags are robustly updated.
 */
export function forcePatternEscalation(
  state: BattleState, 
  attacker: BattleCharacter
): { newState: BattleState; logEntry: BattleLogEntry } {
  const newState = { ...state };
  const attackerIndex = newState.participants.findIndex((p: BattleCharacter) => p.name === attacker.name);
  if (attackerIndex === -1) return { newState, logEntry: {
    id: 'escalation-fallback',
    turn: state.turn,
    actor: 'System',
    action: '',
    result: nes('Escalation fallback log.'),
    target: 'Battle',
    details: undefined,
    type: 'mechanics',
    narrative: nes('Escalation fallback log.'),
    timestamp: Date.now()
  }};
  // Set phase
  newState.tacticalPhase = 'escalation';
  // Update attacker flags
  newState.participants[attackerIndex].flags.usedEscalation = true;
  newState.participants[attackerIndex].flags.escalationTurns = String(state.turn);
  // Update analytics
  if (newState.analytics) {
    newState.analytics.patternAdaptations = (newState.analytics.patternAdaptations || 0) + 1;
  }
  // Technical log
  let logEntry = logMechanics({
    turn: state.turn,
    text: ensureNonEmpty(`${attacker.name} ESCALATION: stale pattern detected!`)
  });
  if (!logEntry) {
    logEntry = {
      id: 'escalation-fallback',
      turn: state.turn,
      actor: 'System',
      action: '',
      result: nes('Escalation fallback log.'),
      target: 'Battle',
      details: undefined,
      type: 'mechanics',
      narrative: nes('Escalation fallback log.'),
      timestamp: Date.now()
    };
  }
  return { newState, logEntry };
} 