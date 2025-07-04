// CONTEXT: End Phase Service
// RESPONSIBILITY: Handle battle end validation and forced endings

import { BattleState, BattleLogEntry } from '../../../types';
import { validateBattleState, forceBattleClimax } from '../battleValidation';
import { declareWinner, switchActiveParticipant } from '../state';
import { generateAndFormatBattleAnalytics } from '../battleAnalytics.service';
import { formatRealTimeAnalytics } from '../analyticsTracker.service';

/**
 * @description Validates if the battle should end and handles forced endings
 * @param {BattleState} state - The current battle state
 * @returns {BattleState} Updated state (may be finished)
 */
export function validateBattleEndPhase(state: BattleState): BattleState {
  const newState = { ...state };
  
  // Validate battle state and check for forced endings
  const validation = validateBattleState(newState);
  if (validation.shouldForceEnd) {
    if (validation.logEntry) {
      newState.battleLog.push(validation.logEntry);
      if (validation.logEntry.narrative) {
        newState.log.push(validation.logEntry.narrative);
      }
    }
    
    if (validation.endReason === 'stalemate') {
      // Force a climactic ending instead of a simple draw
      const climaxState = forceBattleClimax(newState);
      
      // Add real-time analytics summary
      if (climaxState.analytics) {
        const realTimeSummary = formatRealTimeAnalytics(climaxState.analytics);
        climaxState.log.push(`=== REAL-TIME ANALYTICS SUMMARY ===`);
        climaxState.log.push(realTimeSummary);
      }
      
      const analytics = generateAndFormatBattleAnalytics(climaxState);
      climaxState.log.push(analytics);
      return climaxState;
    } else if (validation.endReason === 'victory') {
      // Handle victory
      const winnerIndex = newState.participants[0].currentHealth <= 0 ? 1 : 0;
      const victoryState = declareWinner(newState, newState.participants[winnerIndex]);
      
      // Add real-time analytics summary
      if (victoryState.analytics) {
        const realTimeSummary = formatRealTimeAnalytics(victoryState.analytics);
        victoryState.log.push(`=== REAL-TIME ANALYTICS SUMMARY ===`);
        victoryState.log.push(realTimeSummary);
      }
      
      const analytics = generateAndFormatBattleAnalytics(victoryState);
      victoryState.log.push(analytics);
      return victoryState;
    }
    
    // Default to ending the battle
    newState.isFinished = true;
    
    // Add real-time analytics summary
    if (newState.analytics) {
      const realTimeSummary = formatRealTimeAnalytics(newState.analytics);
      newState.log.push(`=== REAL-TIME ANALYTICS SUMMARY ===`);
      newState.log.push(realTimeSummary);
    }
    
    const analytics = generateAndFormatBattleAnalytics(newState);
    newState.log.push(analytics);
    return newState;
  }
  
  return newState;
} 