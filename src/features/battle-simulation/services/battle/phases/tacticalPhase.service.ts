// CONTEXT: Tactical Phase Service
// RESPONSIBILITY: Handle tactical AI move selection and execution with enhanced narratives

import { BattleState } from '../../../types';
import { selectTacticalMove, createTacticalAnalysis } from '../../ai/tacticalAI.service';
import { canUseMove } from '../positioningMechanics.service';
import { executeTacticalMove } from '../moveExecution.service';
import { getCharacterMoves } from '../moveRegistry.service';
import { 
  isMoveDisabled,
  applyEscalationModifiers
} from '../moveDisabling.service';
import { 
  updatePatternTracking
} from '../patternBreaking.service';
import { processLogEntryForAnalytics } from '../analyticsTracker.service';
import { propagateTacticalStates } from '../tacticalState.service';

/**
 * @description Processes tactical AI move selection and execution with enhanced narratives
 * @param {BattleState} state - The current battle state
 * @returns {Promise<BattleState>} Updated state with move execution results
 */
export async function tacticalMovePhase(state: BattleState): Promise<BattleState> {
  if (state.isFinished) return state;
  const newState = { ...state };
  const { attacker, target, attackerIndex, targetIndex } = getActiveParticipants(newState);
  
  // Get character-specific moves
  const availableMoves = getCharacterMoves(attacker.name);
  
  // Use tactical AI for move selection
  console.log(`DEBUG: T${newState.turn} ${attacker.name} available moves:`, availableMoves.map(m => `${m.name}(${m.maxUses || 'unlimited'})`));
  
  // Filter out disabled moves due to pattern breaking
  const filteredMoves = availableMoves.filter(move => !isMoveDisabled(move, attacker));
  
  const tacticalResult = selectTacticalMove(
    attacker,
    target,
    filteredMoves,
    newState.location || 'Open Field'
  );
  
  const chosenMove = tacticalResult.move;
  const tacticalAnalysis = createTacticalAnalysis(attacker, target, newState.location || 'Open Field', chosenMove);
  
  // Check if move can be used
  console.log(`DEBUG: T${newState.turn} ${attacker.name} attempting to use ${chosenMove.name}`);
  if (!canUseMove(chosenMove, attacker, target, newState.location || 'Open Field')) {
    console.log(`DEBUG: T${newState.turn} ${attacker.name} cannot use ${chosenMove.name}, falling back to basic move`);
    // Fallback to basic move
    const basicMove = availableMoves.find(m => m.id === 'basic_strike') || availableMoves[0];
    const executionResult = await executeTacticalMove(basicMove, attacker, target, newState);
    
    // Only add the enhanced narrative to the user-facing log
    newState.battleLog.push(executionResult.logEntry);
    newState.log.push(executionResult.narrative);
    
    // Add AI reasoning to aiLog for debugging (not user-facing)
    newState.aiLog.push({
      turn: newState.turn,
      agent: attacker.name,
      reasoning: `Fallback: ${tacticalResult.reasoning}`,
      perceivedState: {} as any,
      consideredActions: [],
      chosenAction: chosenMove.name,
      timestamp: Date.now()
    });
    
    // Update analytics for fallback move execution
    if (newState.analytics) {
      newState.analytics = processLogEntryForAnalytics(newState.analytics, executionResult.logEntry);
      console.log(`DEBUG: T${newState.turn} Fallback Analytics - Damage: ${newState.analytics.totalDamage}, Chi: ${newState.analytics.totalChiSpent}`);
    }
    
    // Update BOTH participants' states to ensure tactical state visibility
    newState.participants[attackerIndex] = executionResult.newAttacker;
    newState.participants[targetIndex] = executionResult.newTarget;
    
    // Update pattern tracking after move execution
    newState.participants[attackerIndex] = updatePatternTracking(
      newState.participants[attackerIndex], 
      chosenMove.name
    );
    
    // Propagate tactical states to ensure opponents can see them
    propagateTacticalStates(newState, attackerIndex, targetIndex);
  } else {
    // Apply escalation modifiers to the chosen move
    const modifiedMove = applyEscalationModifiers(chosenMove, attacker);
    
    // Execute tactical move
    const executionResult = await executeTacticalMove(modifiedMove, attacker, target, newState);
    
    // Add tactical analysis to log entry meta (for debugging, not user display)
    executionResult.logEntry.meta = {
      ...executionResult.logEntry.meta,
      tacticalAnalysis
      // Removed aiRule from user-facing logs - AI reasoning goes to aiLog only
    };
    
    // Debug: Log AI reasoning to console only (not user-facing)
    console.log(`T${newState.turn} ${attacker.name} AI: ${tacticalResult.reasoning}`);
    console.log(`T${newState.turn} ${attacker.name} Tactical Factors: ${tacticalResult.tacticalAnalysis}`);
    
    // Add AI reasoning to aiLog for debugging (not user-facing)
    newState.aiLog.push({
      turn: newState.turn,
      agent: attacker.name,
      reasoning: tacticalResult.reasoning,
      perceivedState: {} as any,
      consideredActions: [],
      chosenAction: chosenMove.name,
      timestamp: Date.now()
    });
    
    // Only add the enhanced narrative to the user-facing log
    newState.battleLog.push(executionResult.logEntry);
    newState.log.push(executionResult.narrative);
    
    // Update analytics for successful move execution
    if (newState.analytics) {
      newState.analytics = processLogEntryForAnalytics(newState.analytics, executionResult.logEntry);
      console.log(`DEBUG: T${newState.turn} Success Analytics - Damage: ${newState.analytics.totalDamage}, Chi: ${newState.analytics.totalChiSpent}`);
    }
    
    // Update BOTH participants' states to ensure tactical state visibility
    newState.participants[attackerIndex] = executionResult.newAttacker;
    newState.participants[targetIndex] = executionResult.newTarget;
    
    // Update pattern tracking after move execution
    newState.participants[attackerIndex] = updatePatternTracking(
      newState.participants[attackerIndex], 
      chosenMove.name
    );
    
    // Propagate tactical states to ensure opponents can see them
    propagateTacticalStates(newState, attackerIndex, targetIndex);
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