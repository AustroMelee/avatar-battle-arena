// CONTEXT: Escalation Application Service
// RESPONSIBILITY: Apply escalation effects to battle state

import { BattleState, BattleCharacter, BattleLogEntry } from '../../types';
import type { EscalationType } from '../../types';
import { logMechanics } from '../utils/mechanicLogUtils';

/**
 * Forces pattern-breaking escalation using only phase-based logic.
 * - Uses only tacticalPhase for escalation state.
 * - All log pushes are type-safe (never null).
 * - Analytics and flags are robustly updated.
 */
export function forcePatternEscalation(
  state: BattleState, 
  attacker: BattleCharacter, 
  escalationType: EscalationType,
  reason: string
): { newState: BattleState; logEntry: BattleLogEntry } {
  const newState = { ...state };
  const attackerIndex = newState.participants.findIndex((p: BattleCharacter) => p.name === attacker.name);
  if (attackerIndex === -1) return { newState, logEntry: {
    id: 'escalation-fallback',
    turn: state.turn,
    actor: 'System',
    action: '',
    result: '',
    target: 'Battle',
    details: undefined,
    type: 'mechanics',
    narrative: '',
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
  // Narrative
  let narrative = '';
  switch (escalationType) {
    case 'reposition':
      narrative = `The arena constricts! ${attacker.name} is forced into close combat - no more running!`;
      break;
    case 'stalemate':
      narrative = `The battle has become a war of attrition! The fighters are forced into an all-out attack!`;
      break;
    case 'damage':
      narrative = `The arena trembles with anticipation! ${attacker.name} feels the pressure mounting - it's time to escalate!`;
      break;
    case 'repetition':
      narrative = `${attacker.name} breaks free from their predictable pattern!`;
      break;
    default:
      narrative = `${attacker.name} feels the battle intensifying!`;
      break;
  }
  // Technical log
  let logEntry = logMechanics({
    turn: state.turn,
    text: `${attacker.name}: Escalation applied: ${reason}`
  });
  if (!logEntry) {
    logEntry = {
      id: 'escalation-fallback',
      turn: state.turn,
      actor: 'System',
      action: '',
      result: '',
      target: 'Battle',
      details: undefined,
      type: 'mechanics',
      narrative: '',
      timestamp: Date.now()
    };
  }
  return { newState, logEntry };
} 