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
import { availableLocations } from '../../../../location-selection/data/locationData';
import type { BattleLogEntry } from '../../../types';
import { resolveReversal } from '../reversalMechanic.service';
import { createMechanicLogEntry } from '../../utils/mechanicLogUtils';

/**
 * @description Processes tactical AI move selection and execution with enhanced narratives
 * @param {BattleState} state - The current battle state
 * @returns {Promise<{ state: BattleState; logEntries: BattleLogEntry[] }>} Updated state with move execution results and log entries
 */
export async function tacticalMovePhase(state: BattleState): Promise<{ state: BattleState; logEntries: BattleLogEntry[] }> {
  if (state.isFinished) return { state, logEntries: [] };
  const newState = { ...state };
  const { attacker, target, attackerIndex, targetIndex } = getActiveParticipants(newState);
  
  // Get character-specific moves
  const availableMoves = getCharacterMoves(attacker.name);
  
  // Get location data for collateral damage filtering
  const locationData = availableLocations.find(loc => loc.name === newState.location) || availableLocations[0];
  
  // NEW: Apply collateral damage filtering manually
  const collateralFilteredMoves = availableMoves.filter(move => {
    // Check if move has collateral damage that exceeds location tolerance
    if (move.collateralDamage && move.collateralDamage > (locationData.collateralTolerance || 2)) {
      console.log(`DEBUG: T${newState.turn} ${attacker.name} filtered out ${move.name} due to collateral damage ${move.collateralDamage} > tolerance ${locationData.collateralTolerance}`);
      return false;
    }
    return true;
  });
  
  // Use tactical AI for move selection
  console.log(`DEBUG: T${newState.turn} ${attacker.name} available moves:`, collateralFilteredMoves.map(m => `${m.name}(${m.maxUses || 'unlimited'})`));
  
  // Filter out disabled moves due to pattern breaking
  const filteredMoves = collateralFilteredMoves.filter(move => !isMoveDisabled(move, attacker));
  
  // Debug escalation state
  if (attacker.flags?.forcedEscalation === 'true') {
    console.log(`DEBUG: T${newState.turn} ${attacker.name} is in escalation state`);
    console.log(`DEBUG: T${newState.turn} ${attacker.name} escalation turns: ${attacker.flags.escalationTurns}, duration: ${attacker.flags.escalationDuration}`);
  }
  
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
    console.log(`DEBUG: T${newState.turn} ${attacker.name} cannot use ${chosenMove.name}, falling back to alternative move`);
    
    // Enhanced fallback logic: avoid Basic Strike during escalation
    const isInEscalation = attacker.flags?.forcedEscalation === 'true';
    let fallbackMove = availableMoves[0]; // Default fallback
    
    if (isInEscalation) {
      // During escalation, NEVER use Basic Strike - prioritize any other move
      const signatureMoves = ['Wind Slice', 'Blue Fire', 'Blazing Counter', 'Flowing Evasion'];
      const damagingMoves = ['Fire Dash', 'Air Glide', 'Lightning Strike'];
      
      // Try to find a signature move first, then any non-Basic Strike move
      fallbackMove = availableMoves.find(m => signatureMoves.includes(m.name)) ||
                    availableMoves.find(m => damagingMoves.includes(m.name)) ||
                    availableMoves.find(m => m.id !== 'basic_strike' && m.name !== 'Basic Strike') ||
                    availableMoves[0];
      
      // If we still got Basic Strike, try to find ANY other move
      if (fallbackMove.id === 'basic_strike' || fallbackMove.name === 'Basic Strike') {
        fallbackMove = availableMoves.find(m => m.id !== 'basic_strike' && m.name !== 'Basic Strike') || availableMoves[0];
      }
      
      console.log(`DEBUG: T${newState.turn} ${attacker.name} escalation fallback: ${fallbackMove.name} (avoided Basic Strike)`);
    } else {
      // Normal fallback - can use Basic Strike
      fallbackMove = availableMoves.find(m => m.id === 'basic_strike') || availableMoves[0];
    }
    const executionResult = await executeTacticalMove(fallbackMove, attacker, target, newState);
    
    // Collect all log entries
    const logEntries: BattleLogEntry[] = [...(executionResult.logEntries || [])];
    if (tacticalResult.tacticalMemoryLogEntry) logEntries.push(tacticalResult.tacticalMemoryLogEntry);
    
    // Add tactical analysis to first log entry's meta (for debugging, not user display)
    if (logEntries.length > 0) {
      logEntries[0].meta = {
        ...logEntries[0].meta,
        tacticalAnalysis
      };
    }
    
    // Debug: Log AI reasoning to console only (not user-facing)
    console.log(`T${newState.turn} ${attacker.name} AI: ${tacticalResult.reasoning}`);
    console.log(`T${newState.turn} ${attacker.name} Tactical Factors: ${tacticalResult.tacticalAnalysis}`);
    
    // Add AI reasoning to aiLog for debugging (not user-facing)
    newState.aiLog.push({
      turn: newState.turn,
      agent: attacker.name,
      reasoning: tacticalResult.reasoning,
      perceivedState: {
        self: {
          health: attacker.currentHealth,
          defense: attacker.currentDefense,
          personality: attacker.personality,
          abilities: attacker.abilities.map(ability => ({
            id: ability.name,
            name: ability.name,
            type: ability.type,
            power: ability.power,
            cooldown: ability.cooldown
          })),
          cooldowns: attacker.cooldowns,
          lastMove: attacker.lastMove,
          moveHistory: attacker.moveHistory,
          activeEffects: attacker.activeEffects,
          resources: attacker.resources,
          position: attacker.position,
          isCharging: attacker.isCharging,
          chargeProgress: attacker.chargeProgress,
          repositionAttempts: attacker.repositionAttempts
        },
        enemy: {
          health: target.currentHealth,
          defense: target.currentDefense,
          personality: target.personality,
          name: target.name,
          lastMove: target.lastMove,
          moveHistory: target.moveHistory,
          activeEffects: target.activeEffects,
          position: target.position,
          isCharging: target.isCharging,
          chargeProgress: target.chargeProgress,
          repositionAttempts: target.repositionAttempts
        },
        round: newState.turn,
        cooldowns: attacker.cooldowns,
        location: newState.location || 'Unknown',
        locationType: newState.locationType || 'Open'
      },
      consideredActions: [],
      chosenAction: chosenMove.name,
      timestamp: Date.now()
    });
    
    // Only add the enhanced narrative to the user-facing log
    newState.log.push(executionResult.narrative);
    
    // NEW: Add collateral damage log entry if present in logEntries
    const collateralLog = logEntries.find(e => e.type === 'TACTICAL' && e.meta?.collateralDamage);
    if (collateralLog) {
      newState.log.push(collateralLog.narrative || collateralLog.result);
    }
    
    // Update analytics for successful move execution
    if (newState.analytics) {
      logEntries.forEach(log => {
        if (newState.analytics) {
          newState.analytics = processLogEntryForAnalytics(newState.analytics, log);
        }
      });
      if (newState.analytics) {
        console.log(`DEBUG: T${newState.turn} Success Analytics - Damage: ${newState.analytics.totalDamage}, Chi: ${newState.analytics.totalChiSpent}`);
      }
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
    
    // After move execution and before returning, check for reversal for both participants
    // (attacker and target)
    const reversalLogEntries: BattleLogEntry[] = [];
    const participants = [newState.participants[attackerIndex], newState.participants[targetIndex]];
    for (const participant of participants) {
      const reversalResult = resolveReversal({
        character: participant
      });
      if (reversalResult) {
        reversalLogEntries.push(
          createMechanicLogEntry({
            turn: newState.turn,
            actor: participant.name,
            mechanic: 'Reversal',
            effect: reversalResult.narrative,
            reason: reversalResult.source,
            meta: {
              controlShift: reversalResult.controlShift,
              stabilityGain: reversalResult.stabilityGain,
            },
          })
        );
        // Apply reversal effects (example: boost stability, shift control)
        participant.stability += reversalResult.stabilityGain;
        // You may want to update controlState or other fields here as needed
      }
    }
    
    return { state: newState, logEntries: [...logEntries, ...reversalLogEntries] };
  } else {
    // Apply escalation modifiers to the chosen move
    const modifiedMove = applyEscalationModifiers(chosenMove, attacker);
    
    // Execute tactical move
    const executionResult = await executeTacticalMove(modifiedMove, attacker, target, newState);
    
    // Collect all log entries
    const logEntries: BattleLogEntry[] = [...(executionResult.logEntries || [])];
    if (tacticalResult.tacticalMemoryLogEntry) logEntries.push(tacticalResult.tacticalMemoryLogEntry);
    
    // Add tactical analysis to first log entry's meta (for debugging, not user display)
    if (logEntries.length > 0) {
      logEntries[0].meta = {
        ...logEntries[0].meta,
        tacticalAnalysis
      };
    }
    
    // Debug: Log AI reasoning to console only (not user-facing)
    console.log(`T${newState.turn} ${attacker.name} AI: ${tacticalResult.reasoning}`);
    console.log(`T${newState.turn} ${attacker.name} Tactical Factors: ${tacticalResult.tacticalAnalysis}`);
    
    // Add AI reasoning to aiLog for debugging (not user-facing)
    newState.aiLog.push({
      turn: newState.turn,
      agent: attacker.name,
      reasoning: tacticalResult.reasoning,
      perceivedState: {
        self: {
          health: attacker.currentHealth,
          defense: attacker.currentDefense,
          personality: attacker.personality,
          abilities: attacker.abilities.map(ability => ({
            id: ability.name,
            name: ability.name,
            type: ability.type,
            power: ability.power,
            cooldown: ability.cooldown
          })),
          cooldowns: attacker.cooldowns,
          lastMove: attacker.lastMove,
          moveHistory: attacker.moveHistory,
          activeEffects: attacker.activeEffects,
          resources: attacker.resources,
          position: attacker.position,
          isCharging: attacker.isCharging,
          chargeProgress: attacker.chargeProgress,
          repositionAttempts: attacker.repositionAttempts
        },
        enemy: {
          health: target.currentHealth,
          defense: target.currentDefense,
          personality: target.personality,
          name: target.name,
          lastMove: target.lastMove,
          moveHistory: target.moveHistory,
          activeEffects: target.activeEffects,
          position: target.position,
          isCharging: target.isCharging,
          chargeProgress: target.chargeProgress,
          repositionAttempts: target.repositionAttempts
        },
        round: newState.turn,
        cooldowns: attacker.cooldowns,
        location: newState.location || 'Unknown',
        locationType: newState.locationType || 'Open'
      },
      consideredActions: [],
      chosenAction: chosenMove.name,
      timestamp: Date.now()
    });
    
    // Only add the enhanced narrative to the user-facing log
    newState.log.push(executionResult.narrative);
    
    // NEW: Add collateral damage log entry if present in logEntries
    const collateralLog = logEntries.find(e => e.type === 'TACTICAL' && e.meta?.collateralDamage);
    if (collateralLog) {
      newState.log.push(collateralLog.narrative || collateralLog.result);
    }
    
    // Update analytics for successful move execution
    if (newState.analytics) {
      logEntries.forEach(log => {
        if (newState.analytics) {
          newState.analytics = processLogEntryForAnalytics(newState.analytics, log);
        }
      });
      if (newState.analytics) {
        console.log(`DEBUG: T${newState.turn} Success Analytics - Damage: ${newState.analytics.totalDamage}, Chi: ${newState.analytics.totalChiSpent}`);
      }
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
    
    // After move execution and before returning, check for reversal for both participants
    // (attacker and target)
    const reversalLogEntries: BattleLogEntry[] = [];
    const participants = [newState.participants[attackerIndex], newState.participants[targetIndex]];
    for (const participant of participants) {
      const reversalResult = resolveReversal({
        character: participant
      });
      if (reversalResult) {
        reversalLogEntries.push(
          createMechanicLogEntry({
            turn: newState.turn,
            actor: participant.name,
            mechanic: 'Reversal',
            effect: reversalResult.narrative,
            reason: reversalResult.source,
            meta: {
              controlShift: reversalResult.controlShift,
              stabilityGain: reversalResult.stabilityGain,
            },
          })
        );
        // Apply reversal effects (example: boost stability, shift control)
        participant.stability += reversalResult.stabilityGain;
        // You may want to update controlState or other fields here as needed
      }
    }
    
    return { state: newState, logEntries: [...logEntries, ...reversalLogEntries] };
  }
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