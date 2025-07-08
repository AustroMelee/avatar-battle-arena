// Used via dynamic registry in BattleEngine. See SYSTEM ARCHITECTURE.MD for flow.
// CONTEXT: Effects Phase Service
// RESPONSIBILITY: Handle end-of-turn effects like buffs, cooldowns, chi recovery, and tactical windows

import { BattleState } from '../../../types';
import { processBuffsAndDebuffs, reduceCooldowns, recoverChi } from '../../effects/buffs';
import { createTacticalWindows } from '../tacticalState.service';

/**
 * @description Processes end-of-turn effects including buffs, cooldowns, chi recovery, and tactical windows
 * @param {BattleState} state - The current battle state
 * @returns {BattleState} Updated state with end-of-turn effects applied
 */
export function endOfTurnEffectsPhase(state: BattleState): BattleState {
  if (state.isFinished) return state;
  const newState = { ...state };
  
  // Apply end-of-turn effects to all participants
  newState.participants.forEach((participant, index) => {
    const updatedParticipant = processBuffsAndDebuffs(participant, newState.turn);
    const withCooldowns = reduceCooldowns(updatedParticipant);
    const withChiRecovery = recoverChi(withCooldowns);
    newState.participants[index] = withChiRecovery;
  });
  
  // Create tactical windows - make characters occasionally vulnerable
  createTacticalWindows(newState);
  
  return newState;
} 