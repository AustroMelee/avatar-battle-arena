// CONTEXT: Battle Turn Processing
// RESPONSIBILITY: Orchestrate the battle turn phases

import { BattleState } from '../../types';
import { cloneBattleState, switchActiveParticipant, getActiveParticipants } from './state';
import { initializeAnalyticsTracker } from './analyticsTracker.service';
import { processTurnEffects } from '../effects/statusEffect.service';
import { updateMentalState } from '../identity/mentalState.service';
import { cleanupTacticalStates } from './tacticalState.service';
import { processBehavioralSystemForTurn } from '../identity/behavioral.service';
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
 * @returns {Promise<BattleState>} The state after the turn is completed.
 */
export async function processTurn(currentState: BattleState): Promise<BattleState> {
  let state = cloneBattleState(currentState);
  
  // Initialize analytics tracker if not present
  if (!state.analytics) {
    state.analytics = initializeAnalyticsTracker();
  }
  
  // --- NEW BEHAVIORAL SYSTEM PROCESSING STEP ---
  const { attacker, target, attackerIndex, targetIndex } = getActiveParticipants(state);
  const behavioralResult = processBehavioralSystemForTurn(attacker, target, state);
  state.participants[attackerIndex] = behavioralResult.updatedSelf;
  state.participants[targetIndex] = behavioralResult.updatedOpponent;
  state.battleLog.push(...behavioralResult.logEntries);
  // --- END OF NEW STEP ---
  
  // --- NEW STATUS EFFECT PROCESSING STEP ---
  const activeCharacterIndex = state.activeParticipantIndex;
  const effectResult = processTurnEffects(state.participants[activeCharacterIndex], state.turn);
  state.participants[activeCharacterIndex] = effectResult.updatedCharacter;
  state.battleLog.push(...effectResult.logEntries);
  // --- END OF NEW STEP ---
  
  // Execute battle phases in sequence
  // Each phase returns early if the battle should end
  state = validateBattleEndPhase(state);
  if (state.isFinished) return state;
  
  state = await processDesperationPhase(state);
  if (state.isFinished) return state;
  
  state = finisherPhase(state);
  if (state.isFinished) return state;
  
  state = await escalationPhase(state);
  if (state.isFinished) return state;
  
  const tacticalResult = await tacticalMovePhase(state);
  state = tacticalResult.state;
  tacticalResult.logEntries.forEach(entry => state.battleLog.push(entry));
  if (state.isFinished) return state;
  
  state = endOfTurnEffectsPhase(state);
  
  // --- NEW MENTAL STATE UPDATE STEP (at the end of the turn) ---
  const turnLogs = state.battleLog.filter(entry => entry.turn === state.turn);
  state.participants.forEach((participant, index) => {
    state.participants[index].mentalState = updateMentalState(participant, turnLogs);
  });
  // --- END OF NEW STEP ---
  
  // --- NEW TACTICAL STATE CLEANUP STEP (at the end of the turn) ---
  cleanupTacticalStates(state);
  // --- END OF NEW STEP ---
  
  // Switch active participant for next turn
  return switchActiveParticipant(state);
} 