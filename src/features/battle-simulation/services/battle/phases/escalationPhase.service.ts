// CONTEXT: Escalation Phase Service
// RESPONSIBILITY: Handle pattern breaking and escalation events with enhanced state management

import { BattleState } from '../../../types';
import { 
  checkAndTriggerPatternBreaking
} from '../patternBreaking.service';
import { processLogEntryForAnalytics } from '../analyticsTracker.service';
import { EnhancedStateManager } from '../../narrative/enhancedStateManager';
import { createNarrativeService } from '../../narrative';
import { generateUniqueLogId } from '../../ai/logQueries';

// Global enhanced state manager instance
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
 * @description Processes pattern breaking and escalation events with enhanced state management
 * @param {BattleState} state - The current battle state
 * @returns {Promise<BattleState>} Updated state with escalation effects
 */
export async function escalationPhase(state: BattleState): Promise<BattleState> {
  if (state.isFinished) return state;
  
  // Update the state manager with current turn
  enhancedStateManager.updateTurn(state.turn);
  
  const newState = { ...state };
  const { attacker, attackerIndex } = getActiveParticipants(newState);
  
  // Check for pattern breaking and escalation
  const patternCheck = checkAndTriggerPatternBreaking(newState, attacker);
  
  if (patternCheck.shouldEscalate && patternCheck.escalationData) {
    // Apply escalation effects
    newState.participants[attackerIndex] = { 
      ...newState.participants[attackerIndex], 
      ...patternCheck.escalationData.newState.participants[attackerIndex] 
    };
    
    // Update narrative service turn
    getNarrativeService().updateTurn(state.turn);
    
    // Generate state announcement using enhanced narrative system
    const escalationAnnouncement = await getNarrativeService().generateStateAnnouncement(
      attacker.name,
      'escalation',
      {
        turnNumber: state.turn,
        escalationCount: 0,
        desperationCount: 0
      }
    );
    
    // Add state announcement to the log if generated
    if (escalationAnnouncement) {
      newState.battleLog.push({
        id: generateUniqueLogId('escalation'),
        turn: state.turn,
        actor: attacker.name,
        type: 'ESCALATION',
        action: 'State Change',
        result: escalationAnnouncement,
        narrative: escalationAnnouncement,
        timestamp: Date.now(),
        meta: {
          stateType: 'escalation'
        }
      });
      newState.log.push(escalationAnnouncement);
    } else {
      // Add the original escalation log entry if no state announcement was generated
      newState.battleLog.push(patternCheck.escalationData.logEntry);
      newState.log.push(patternCheck.escalationData.logEntry.narrative || patternCheck.escalationData.logEntry.result);
    }
    
    // Update analytics for pattern adaptation
    if (newState.analytics) {
      newState.analytics = processLogEntryForAnalytics(newState.analytics, patternCheck.escalationData.logEntry);
      console.log(`DEBUG: T${newState.turn} ${attacker.name} ESCALATION: ${patternCheck.escalationData.reason}`);
      console.log(`DEBUG: Analytics updated - Pattern Adaptations: ${newState.analytics.patternAdaptations}`);
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