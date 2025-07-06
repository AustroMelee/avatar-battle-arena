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
  
  // Additional cleanup: Reset any lingering repositioning states for all participants
  state.participants.forEach((participant) => {
    if (participant.position === "repositioning") {
      console.log(`DEBUG: T${state.turn} - ${participant.name} cleanup: resetting from repositioning to neutral`);
      participant.position = "neutral";
    }
  });
  
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
    // Reduced to 5% chance per turn to create a tactical window (was 15%)
    if (Math.random() < 0.05) {
      const windowType = Math.random() < 0.7 ? 'charging' : 'repositioning'; // Favor charging over repositioning
      
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

/**
 * @description Cleans up tactical states at the end of each turn to prevent accumulation
 * @param {BattleState} state - The battle state
 */
export function cleanupTacticalStates(state: BattleState): void {
  state.participants.forEach((participant) => {
    // Reset repositioning states that might have been missed
    if (participant.position === "repositioning") {
      console.log(`DEBUG: T${state.turn} - ${participant.name} end-of-turn cleanup: resetting from repositioning to neutral`);
      participant.position = "neutral";
    }
    
    // Reset charging states that have completed
    if (participant.isCharging && participant.chargeProgress && participant.chargeProgress >= 100) {
      participant.isCharging = false;
      participant.chargeProgress = 0;
      console.log(`DEBUG: T${state.turn} - ${participant.name} charge completed and reset`);
    }
    
    // Clear escalation states that have expired
    if (participant.flags?.forcedEscalation === 'true' && participant.flags?.escalationTurns && participant.flags?.escalationDuration) {
      const escalationTurn = parseInt(participant.flags.escalationTurns);
      const escalationDuration = parseInt(participant.flags.escalationDuration);
      
      if (state.turn - escalationTurn >= escalationDuration) {
        console.log(`DEBUG: T${state.turn} - ${participant.name} escalation expired, clearing escalation state`);
        participant.flags.forcedEscalation = 'false';
        participant.flags.damageMultiplier = '1.0';
        participant.position = 'neutral';
        // Clear escalation tracking flags
        participant.flags.escalationTurns = '0';
        participant.flags.escalationDuration = '0';
        
        // Also clear reposition disabled if it was set during escalation
        if (participant.flags.repositionDisabled) {
          participant.flags.repositionDisabled = '0';
        }
      } else {
        console.log(`DEBUG: T${state.turn} - ${participant.name} still in escalation (${state.turn - escalationTurn}/${escalationDuration} turns)`);
      }
    }
  });
} 