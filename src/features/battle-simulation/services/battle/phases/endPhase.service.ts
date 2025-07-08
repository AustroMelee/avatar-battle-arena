// Used via dynamic registry in BattleEngine. See SYSTEM ARCHITECTURE.MD for flow.
// CONTEXT: End Phase Service
// RESPONSIBILITY: Handle battle end validation and forced endings

import { BattleState } from '../../../types';
import { validateBattleState, forceBattleClimax } from '../battleValidation';
import { declareWinner } from '../state';
import { generateAndFormatBattleAnalytics } from '../battleAnalytics.service';
import { formatRealTimeAnalytics } from '../analyticsTracker.service';
import { checkAndTriggerDecisiveClash } from '../decisiveClash.service';
import { canTriggerHeroicReversal } from '../heroicReversal.service';

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
        newState.log.push(typeof validation.logEntry.narrative === 'string' ? validation.logEntry.narrative : validation.logEntry.narrative.join(' '));
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
  
  // --- DECISIVE CLASH CHECK ---
  const decisiveResult = checkAndTriggerDecisiveClash(newState);
  if (decisiveResult.triggered) {
    // Decisive clash logic handled in checkAndTriggerDecisiveClash; no additional action needed here.
  }

  // --- HEROIC REVERSAL CHECK ---
  const [p1, p2] = newState.participants;
  if (canTriggerHeroicReversal(p1)) {
    // Placeholder for future heroic reversal logic for p1.
  }
  if (canTriggerHeroicReversal(p2)) {
    // Placeholder for future heroic reversal logic for p2.
  }
  // --- HEROIC REVERSAL END CHECK ---
  if (p1.flags?.heroicReversalActive === false) {
    // Placeholder for future heroic reversal end logic for p1.
  }
  if (p2.flags?.heroicReversalActive === false) {
    // Placeholder for future heroic reversal end logic for p2.
  }
  
  return newState;
} 