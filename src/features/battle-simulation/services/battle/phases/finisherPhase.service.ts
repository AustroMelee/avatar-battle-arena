// CONTEXT: Finisher Phase Service
// RESPONSIBILITY: Handle finisher moves and dramatic consequences

import { BattleState, BattleLogEntry } from '../../../types';
import { getAvailableFinisher, executeFinisherMove } from '../finisherSystem.service';
import { declareWinner } from '../state';

/**
 * @description Processes finisher moves if available
 * @param {BattleState} state - The current battle state
 * @returns {BattleState} Updated state (may be finished if finisher kills opponent)
 */
export function finisherPhase(state: BattleState): BattleState {
  if (state.isFinished) return state;
  const newState = { ...state };
  const { attacker, target, targetIndex } = getActiveParticipants(newState);
  
  // Check for finisher moves first (highest priority)
  const availableFinisher = getAvailableFinisher(attacker, target, newState);
  let finisherLogEntry: BattleLogEntry | undefined;
  
  if (availableFinisher) {
    // Execute finisher move with dramatic consequences
    finisherLogEntry = executeFinisherMove(availableFinisher, attacker, target, newState, targetIndex);
    newState.battleLog.push(finisherLogEntry);
    newState.log.push(finisherLogEntry.narrative || finisherLogEntry.result);
    
    // Check for winner after finisher
    if (newState.participants[targetIndex].currentHealth <= 0) {
      return declareWinner(newState, newState.participants[getActiveParticipants(newState).attackerIndex]);
    }
  }
  
  return newState;
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