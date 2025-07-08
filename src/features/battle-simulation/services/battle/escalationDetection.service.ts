// CONTEXT: Escalation Detection Service
// RESPONSIBILITY: Detect when escalation should be triggered

// Custom assertion helper
function assert(condition: any, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

import { BattleState, BattleCharacter } from '../../types';
import { logStory, logTechnical } from '../utils/mechanicLogUtils';

/**
 * EscalationType: All supported escalation triggers.
 */
export type EscalationType =
  | 'damage'
  | 'repetition'
  | 'stalemate'
  | 'reposition'
  | 'desperation';

/**
 * EscalationTriggerResult: Result of escalation trigger detection.
 */
export interface EscalationTriggerResult {
  triggered: boolean;
  reason: string;
  escalationType: EscalationType;
  data?: Record<string, any>;
}

/**
 * Detects if escalation should be triggered based on battle state and attacker.
 * Checks all configured triggers and returns the first that applies.
 * @param state The current battle state
 * @param attacker The acting character
 * @returns EscalationTriggerResult
 */
export function detectEscalationTrigger(state: BattleState, attacker: BattleCharacter): EscalationTriggerResult | null {
  // TODO: Escalation logic removed for type safety. Re-implement if needed.
  // 1. Turn threshold + low damage
  if (
    state.turn >= 30 &&
    state.analytics.averageDamagePerTurn < 1.5
  ) {
    return {
      triggered: true,
      reason: `Battle has lasted ${state.turn} turns with low average damage (${state.analytics.averageDamagePerTurn}).`,
      escalationType: 'damage',
      data: { turn: state.turn, avgDamage: state.analytics.averageDamagePerTurn }
    };
  }
  // 2. Pattern repetition
  // TODO: Implement pattern repetition logic with correct argument for getPatternState if needed.
  // 3. Excessive reposition attempts
  if ((attacker.repositionAttempts ?? 0) >= 5) {
    return {
      triggered: true,
      reason: `Excessive reposition attempts (${attacker.repositionAttempts}).`,
      escalationType: 'reposition',
      data: { repositionAttempts: attacker.repositionAttempts }
    };
  }
  // 4. Stalemate
  if (
    state.turn >= 20 &&
    state.analytics.averageDamagePerTurn < 1
  ) {
    return {
      triggered: true,
      reason: `Stalemate: ${state.turn} turns, avg. damage/turn < 1`,
      escalationType: 'stalemate',
      data: { turn: state.turn, avgDamage: state.analytics.averageDamagePerTurn }
    };
  }
  // 5. Resource depletion
  const bothLowChi = state.participants.every(f => f.resources.chi <= 5);
  const bothLowHealth = state.participants.every(f => f.currentHealth <= 20);
  if (bothLowChi && bothLowHealth) {
    return {
      triggered: true,
      reason: 'Both fighters are critically low on resources and health.',
      escalationType: 'desperation',
      data: { chi: state.participants.map(f => f.resources.chi), health: state.participants.map(f => f.currentHealth) }
    };
  }
  // No escalation triggered
  return null;
}

/**
 * Applies escalation to the battle state and attacker, logs the event, and fires narrative.
 * @param state The current battle state
 * @param attacker The acting character
 * @param triggerResult The result from detectEscalationTrigger
 */
export function applyEscalation(state: BattleState, attacker: BattleCharacter, triggerResult: EscalationTriggerResult) {
  assert(triggerResult && triggerResult.triggered, 'applyEscalation called without a valid triggerResult');
  if (state.tacticalPhase === 'escalation') {
    logTechnical({
      turn: state.turn,
      actor: attacker.name,
      action: 'escalation_attempt',
      result: 'Escalation already active; attempt ignored.',
      reason: 'already_escalated',
      target: attacker.name,
      details: { ...triggerResult.data }
    });
    return;
  }
  state.tacticalPhase = 'escalation';
  attacker.flags.usedEscalation = true;
  attacker.flags.escalationTurns = String(state.turn); // Store as string for clarity
  logTechnical({
    turn: state.turn,
    actor: attacker.name,
    action: 'escalation',
    result: `Escalation triggered: ${triggerResult.reason}`,
    reason: triggerResult.reason,
    target: attacker.name,
    details: { escalationType: triggerResult.escalationType, ...triggerResult.data }
  });
  logStory({
    turn: state.turn,
    actor: attacker.name,
    narrative: `The battle escalates! ${triggerResult.reason}`
  });
  // Optionally: update analytics, restrict moves, fire UI hooks, etc.
}

/**
 * Returns available moves for a fighter, filtered by escalation/desperation state.
 * @param fighter The fighter
 * @param state The battle state
 */
export function getAvailableMoves(fighter: BattleCharacter, state: BattleState) {
  if (state.tacticalPhase === 'escalation')
    return fighter.abilities.filter(m => m.tags?.includes('escalation'));
  if (state.tacticalPhase === 'desperation')
    return fighter.abilities.filter(m => m.tags?.includes('desperation'));
  return fighter.abilities;
} 