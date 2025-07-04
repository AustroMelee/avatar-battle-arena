// CONTEXT: Tactical State Service
// RESPONSIBILITY: Handle tactical state propagation and management

import { BattleState } from '../../types';

/**
 * @description Propagates tactical states between participants to ensure visibility.
 * @param {BattleState} state - The battle state
 * @param {number} attackerIndex - Index of the attacker
 * @param {number} targetIndex - Index of the target
 */
export function propagateTacticalStates(state: BattleState, attackerIndex: number, targetIndex: number): void {
  const attacker = state.participants[attackerIndex];
  const target = state.participants[targetIndex];
  
  // Ensure both participants can see each other's tactical states
  // This is crucial for AI decision making in the next turn
  
  // Reset repositioning status after a turn (so it's not permanent)
  if (attacker.position === "repositioning") {
    console.log(`DEBUG: T${state.turn} - ${attacker.name} resetting from repositioning to neutral`);
    attacker.position = "neutral"; // Reset to neutral after repositioning
  }
  if (target.position === "repositioning") {
    console.log(`DEBUG: T${state.turn} - ${target.name} resetting from repositioning to neutral`);
    target.position = "neutral"; // Reset to neutral after repositioning
  }
  
  // Ensure charge states are visible
  if (attacker.isCharging && attacker.chargeProgress && attacker.chargeProgress >= 100) {
    attacker.isCharging = false;
    attacker.chargeProgress = 0;
  }
  if (target.isCharging && target.chargeProgress && target.chargeProgress >= 100) {
    target.isCharging = false;
    target.chargeProgress = 0;
  }
}

/**
 * @description Creates tactical windows where characters become vulnerable to punish/charge opportunities.
 * @param {BattleState} state - The battle state
 */
export function createTacticalWindows(state: BattleState): void {
  state.participants.forEach((participant) => {
    // 15% chance per turn to create a tactical window
    if (Math.random() < 0.15) {
      const windowType = Math.random() < 0.5 ? 'charging' : 'repositioning';
      
      if (windowType === 'charging') {
        participant.isCharging = true;
        participant.chargeProgress = Math.floor(Math.random() * 50) + 25; // 25-75% charge
        console.log(`DEBUG: T${state.turn} - ${participant.name} starts charging (${participant.chargeProgress}%)`);
      } else {
        participant.position = 'repositioning';
        console.log(`DEBUG: T${state.turn} - ${participant.name} starts repositioning`);
      }
    }
  });
} 