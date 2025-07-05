// CONTEXT: Pattern Breaking Service
// RESPONSIBILITY: Route pattern breaking requests to appropriate services

import { BattleState, BattleCharacter, BattleLogEntry } from '../../types';
import { shouldTriggerEscalation } from './escalationDetection.service';
import { forcePatternEscalation } from './escalationApplication.service';
// Removed unused imports

/**
 * @description Checks and triggers pattern breaking escalation
 */
export function checkAndTriggerPatternBreaking(
  state: BattleState, 
  attacker: BattleCharacter
): { 
  shouldEscalate: boolean; 
  escalationData?: { type: string; reason: string; logEntry: BattleLogEntry; newState: BattleState };
} {
  const escalationCheck = shouldTriggerEscalation(state, attacker);
  
  if (escalationCheck.shouldEscalate) {
    const { newState, logEntry } = forcePatternEscalation(
      state, 
      attacker, 
      escalationCheck.escalationType, 
      escalationCheck.reason
    );
    
    return {
      shouldEscalate: true,
      escalationData: {
        type: escalationCheck.escalationType,
        reason: escalationCheck.reason,
        logEntry,
        newState
      }
    };
  }
  
  return { shouldEscalate: false };
}

// Re-export functions from other services
export { updatePatternTracking } from './patternTracking.service';
export { createDesperationMove } from './desperationMoveCreation.service'; 