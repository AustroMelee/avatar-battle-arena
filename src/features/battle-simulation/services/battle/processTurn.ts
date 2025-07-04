// CONTEXT: Battle Turn Processing
// RESPONSIBILITY: Orchestrate the battle turn phases

import { BattleState } from '../../types';
import { cloneBattleState, switchActiveParticipant } from './state';
import { initializeAnalyticsTracker } from './analyticsTracker.service';
import {
  validateBattleEndPhase,
  processDesperationPhase,
  finisherPhase,
  escalationPhase,
  tacticalMovePhase,
  endOfTurnEffectsPhase
} from './phases';

/**
 * @description Processes a single turn of the battle using a clean phase-based pipeline.
 * @param {BattleState} currentState - The current state of the battle.
 * @returns {BattleState} The state after the turn is completed.
 */
export function processTurn(currentState: BattleState): BattleState {
  let state = cloneBattleState(currentState);
  
  // Initialize analytics tracker if not present
  if (!state.analytics) {
    state.analytics = initializeAnalyticsTracker();
  }
  
  // Execute battle phases in sequence
  // Each phase returns early if the battle should end
  state = validateBattleEndPhase(state);
  if (state.isFinished) return state;
  
  state = processDesperationPhase(state);
  if (state.isFinished) return state;
  
  state = finisherPhase(state);
  if (state.isFinished) return state;
  
  state = escalationPhase(state);
  if (state.isFinished) return state;
  
  state = tacticalMovePhase(state);
  if (state.isFinished) return state;
  
  state = endOfTurnEffectsPhase(state);
  
  // Switch active participant for next turn
  return switchActiveParticipant(state);
} 