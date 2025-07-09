// Used via dynamic registry in BattleEngine. See SYSTEM ARCHITECTURE.MD for flow.
// CONTEXT: Desperation Phase Service
// RESPONSIBILITY: Handle desperation state changes and dramatic events with enhanced state management

import { BattleState } from '../../../types';
import { 
  calculateDesperationState, 
  shouldTriggerDesperation, 
  createDesperationLogEntry,
  applyDesperationModifiers 
} from '../desperationSystem.service';
import { EnhancedStateManager } from '../../narrative/enhancedStateManager';
import { createNarrativeService } from '../../narrative';
import { logStory } from '../../utils/mechanicLogUtils';

// Global enhanced state manager instance (shared with escalation phase)
const enhancedStateManager = new EnhancedStateManager();
// Lazy narrative service instance
let narrativeService: ReturnType<typeof createNarrativeService> | null = null;

function getNarrativeService() {
  if (!narrativeService) {
    narrativeService = createNarrativeService();
  }
  return narrativeService;
}

/**
 * @description Processes desperation state changes and triggers dramatic events with enhanced state management
 * @param {BattleState} state - The current battle state
 * @returns {Promise<BattleState>} Updated state with desperation effects
 */
export async function processDesperationPhase(state: BattleState): Promise<BattleState> {
  if (state.isFinished) return state;
  
  // Update the state manager with current turn
  enhancedStateManager.updateTurn(state.turn);
  
  const newState = { ...state };
  const { attacker, attackerIndex } = getActiveParticipants(newState);
  
  // Check for desperation state changes and trigger dramatic events
  const currentDesperationState = calculateDesperationState(attacker, newState);
  const previousDesperationState = attacker.flags?.desperationState ? 
    JSON.parse(attacker.flags.desperationState) : null;
  
  if (shouldTriggerDesperation(attacker, newState, previousDesperationState)) {
    // Update narrative service turn
    getNarrativeService().updateTurn(state.turn);
    
    // Generate state announcement using enhanced narrative system
    const desperationAnnouncement = await getNarrativeService().generateStateAnnouncement(
      attacker.name,
      'desperation',
      {
        turnNumber: state.turn,
        escalationCount: 0,
        desperationCount: 0
      }
    );
    
    // Add state announcement to the log if generated
    if (desperationAnnouncement) {
      const logEntry = logStory({
        turn: state.turn,
        narrative: desperationAnnouncement,
        target: undefined
      });
      if (logEntry) newState.battleLog.push(logEntry);
      newState.log.push(desperationAnnouncement);
    } else {
      // Add the original desperation log entry if no state announcement was generated
      const desperationLogEntry = createDesperationLogEntry(attacker, currentDesperationState, newState.turn);
      newState.battleLog.push(desperationLogEntry);
      newState.log.push(typeof desperationLogEntry.narrative === 'string' ? desperationLogEntry.narrative : desperationLogEntry.narrative.join(' ') || desperationLogEntry.result);
    }
    
    // Store desperation state in character flags
    newState.participants[attackerIndex].flags = {
      ...newState.participants[attackerIndex].flags,
      desperationState: JSON.stringify(currentDesperationState)
    };
  }
  
  // Apply desperation modifiers to attacker
  const modifiedAttacker = applyDesperationModifiers(attacker);
  newState.participants[attackerIndex] = modifiedAttacker;
  
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