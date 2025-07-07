/*
 * @file processTurn.ts
 * @description Executes a single turn in the battle simulation, handling all phase transitions and state updates.
 * @criticality 🩸 Core Battle Logic
 * @owner AustroMelee
 * @lastUpdated 2025-07-08
 * @related tacticalPhase.service.ts, state.ts
 */
// CONTEXT: Battle Turn Processing
// RESPONSIBILITY: Orchestrate the battle turn phases

import { BattleState } from '../../types';
import { cloneBattleState, switchActiveParticipant, getActiveParticipants } from './state';
import { updateMentalState } from '../identity/mentalState.service';
import { cleanupTacticalStates } from './tacticalState.service';
import { processBehavioralSystemForTurn } from '../identity/behavioral.service';
import {
  validateBattleEndPhase,
  processDesperationPhase,
  finisherPhase,
  escalationPhase,
  tacticalMovePhase,
} from './phases';
import { processTurnEffects } from '../effects/statusEffect.service';

/**
 * @description Processes a single turn of the battle using a clean, well-defined phase pipeline.
 * @param {BattleState} currentState - The current state of the battle.
 * @returns {Promise<BattleState>} The state after the turn is completed.
 */
export async function processTurn(currentState: BattleState): Promise<BattleState> {
  let state = cloneBattleState(currentState);
  
  // --- PHASE 1: Start of Turn Effects for the ACTIVE character ---
  const { attacker, target, attackerIndex, targetIndex } = getActiveParticipants(state);
  const effectResult = processTurnEffects(attacker, state.turn);
  const updatedAttacker = effectResult.updatedCharacter;
  state.battleLog.push(...effectResult.logEntries);
  state.participants[attackerIndex] = updatedAttacker; // Update state with character after effects
  
  if (updatedAttacker.currentHealth <= 0) {
      state.isFinished = true;
      state.winner = target;
      return state;
  }

  // --- PHASE 2: Cooldown Reduction for the ACTIVE character ---
  // If reduceCooldowns is not available, comment out or remove this line.
  // state.participants[attackerIndex] = reduceCooldowns(updatedAttacker);
  
  // --- PHASE 3: Behavioral & Mental State ---
  const behavioralResult = processBehavioralSystemForTurn(updatedAttacker, target, state);
  state.participants[attackerIndex] = behavioralResult.updatedSelf;
  state.participants[targetIndex] = behavioralResult.updatedOpponent;
  state.battleLog.push(...behavioralResult.logEntries);

  // --- PHASE 4: Battle State Validation & Forced Endings ---
  state = validateBattleEndPhase(state);
  if (state.isFinished) return state;

  // --- PHASE 5: Escalation & Desperation (Pre-Move) ---
  state = await processDesperationPhase(state);
  if (state.isFinished) return state;
  
  state = await escalationPhase(state);
  if (state.isFinished) return state;

  // --- PHASE 6: Finisher Moves (High Priority) ---
  state = finisherPhase(state);
  if (state.isFinished) return state;
  
  // --- PHASE 7: Tactical Move Selection & Execution ---
  const tacticalResult = await tacticalMovePhase(state);
  state = tacticalResult.state;
  state.battleLog.push(...tacticalResult.logEntries);
  if (state.isFinished) return state;
  
  // --- PHASE 8: Post-Move Cleanup ---
  const turnLogs = state.battleLog.filter(entry => entry.turn === state.turn);
  state.participants.forEach((participant, index) => {
    state.participants[index].mentalState = updateMentalState(participant, turnLogs);
  });
  cleanupTacticalStates(state);
  
  // --- PHASE 9: Advance Turn ---
  return switchActiveParticipant(state);
} 