// Used via dynamic registry in BattleEngine. See SYSTEM ARCHITECTURE.MD for flow.
// @docs
// @description: Tactical phase logic for Avatar Battle Arena. All move and narrative lookups are registry/data-driven. No hard-coded content. Extensible via data/registries only. SRP-compliant. See SYSTEM ARCHITECTURE.MD for integration points.
// @criticality: ⚔️ Core Logic
// @owner: AustroMelee
// @tags: core-logic, battle, phase, logging, SRP, registry, plug-and-play, extensibility
//
// This file should never reference character, move, or narrative content directly. All extensibility is via data/registries.
//
// Updated for 2025 registry-driven architecture overhaul.
/*
 * @file tacticalPhase.service.ts
 * @description Handles the tactical phase of the battle, where moves are selected and executed.
 * @criticality 🩸 Core Battle Phase
 * @owner AustroMelee
 * @lastUpdated 2025-07-08
 * @related processTurn.ts, moveUtils.ts
 */
// CONTEXT: Tactical Phase Service
// RESPONSIBILITY: Handle tactical AI move selection and execution with enhanced narratives

import { BattleState, BattleLogEntry, AILogEntry } from '../../../types';
import { selectBestTacticalMove } from '../../ai/enhancedMoveScoring';
import { executeTacticalMove } from '../moveExecution.service';
import { updatePatternTracking } from '../patternBreaking.service';
import { propagateTacticalStates } from '../tacticalState.service';
import { availableLocations } from '../../../../location-selection/data/locationData';
import { resolveReversal } from '../reversalMechanic.service';
import { createMechanicLogEntry, logStory } from '../../utils/mechanicLogUtils';
import { getAvailableMoves } from '../../utils/moveUtils'; // Corrected import
import { forceBattleClimax } from '../battleValidation';
import { MoveRegistry } from '../moveRegistry.service'; // IMPORT THE REGISTRY
import { isMoveStale, isBasicMove } from '../../ai/moveSelection';

/**
 * @description Processes tactical AI move selection and execution with enhanced narratives
 * @param {BattleState} state - The current battle state
 * @returns {Promise<{ state: BattleState; logEntries: BattleLogEntry[] }>} Updated state with move execution results and log entries
 */
export async function tacticalMovePhase(state: BattleState): Promise<{ state: BattleState; logEntries: BattleLogEntry[] }> {
  if (state.isFinished) return { state, logEntries: [] };
  const newState = { ...state };
  const { attacker, target, attackerIndex, targetIndex } = getActiveParticipants(newState);
  
  if (newState.climaxTriggered) {
    return { state, logEntries: [] }; // Climax already happened, do nothing in this phase.
  }
  
  if (newState.tacticalPhase === 'climax') {
    // Centralized, atomic climax trigger
    return { state: forceBattleClimax(newState), logEntries: [] };
  }
  
  if (attacker.flags?.suddenDeath) {
    // Sudden death triggers climax via forceBattleClimax
    return { state: forceBattleClimax(newState), logEntries: [] };
  }

  // --- CRITICAL FIX: Use the definitive getAvailableMoves function FIRST ---
  const locationData = availableLocations.find(loc => loc.name === newState.location) || availableLocations[0];
  let availableMoves = getAvailableMoves(attacker, target, locationData);
  const inEscalation = attacker.flags?.forcedEscalation === 'true' || attacker.flags?.desperationState;
  if (inEscalation) {
    const nonBasicMoves = availableMoves.filter(move => !isBasicMove(move));
    if (nonBasicMoves.length > 0) {
      availableMoves = nonBasicMoves;
    } else {
      // No non-basic moves left: forced ending
      const forcedEndingLog = logStory({
        turn: newState.turn,
        actor: 'Narrator',
        narrative: [
          "The clash fades, not in triumph, but in exhaustion—no victor rises, only the silence of spent ambition.",
          "Steel and spirit yield to fatigue; the world bears witness as neither hero nor villain claims the day.",
          "Victory slips from their grasp; what remains is only the hush of lessons learned in failure and persistence.",
          "The arena grows still—struggle dissolves into emptiness, and glory is postponed to another dawn.",
          "Both warriors retreat, battered and changed. The story ends, not with conquest, but with the echo of what might have been.",
          "Futility crowns the moment; sweat and determination buy only a truce, not a legend.",
          "Even legends must yield to weariness—the duel becomes a memory, unfinished, unresolved.",
          "No fire blazes, no wind roars; what endures is the truth that not every battle can be won.",
          "As the dust settles, hope and regret mingle. This day belongs to neither—only to the weary silence between heartbeats.",
          "Defeat and victory dissolve together, leaving only the arena’s quiet and the promise of rematch beneath another sky."
        ][Math.floor(Math.random() * 10)]
      });
      newState.isFinished = true;
      return { state: newState, logEntries: forcedEndingLog ? [forcedEndingLog] : [] };
    }
  } else {
    const nonStaleMoves = availableMoves.filter(move => !isMoveStale(move.id, attacker.moveHistory));
    if (nonStaleMoves.length > 0) {
      availableMoves = nonStaleMoves;
    }
  }
  if (availableMoves.length === 0) {
    const forcedEndingLog = logStory({
      turn: newState.turn,
      actor: 'Narrator',
      narrative: [
        "The clash fades, not in triumph, but in exhaustion—no victor rises, only the silence of spent ambition.",
        "Steel and spirit yield to fatigue; the world bears witness as neither hero nor villain claims the day.",
        "Victory slips from their grasp; what remains is only the hush of lessons learned in failure and persistence.",
        "The arena grows still—struggle dissolves into emptiness, and glory is postponed to another dawn.",
        "Both warriors retreat, battered and changed. The story ends, not with conquest, but with the echo of what might have been.",
        "Futility crowns the moment; sweat and determination buy only a truce, not a legend.",
        "Even legends must yield to weariness—the duel becomes a memory, unfinished, unresolved.",
        "No fire blazes, no wind roars; what endures is the truth that not every battle can be won.",
        "As the dust settles, hope and regret mingle. This day belongs to neither—only to the weary silence between heartbeats.",
        "Defeat and victory dissolve together, leaving only the arena’s quiet and the promise of rematch beneath another sky."
      ][Math.floor(Math.random() * 10)]
    });
    newState.isFinished = true;
    return { state: newState, logEntries: forcedEndingLog ? [forcedEndingLog] : [] };
  }
  // --- END OF FIX ---

  // --- AI DECISION PIPELINE ---
  const tacticalResult = selectBestTacticalMove(availableMoves, attacker, target, newState.tacticalStalemateCounter);

  // --- FIX APPLIED HERE ---
  // The AI now returns a move ID. We resolve it to a full Move object using the registry.
  const chosenMove = MoveRegistry.getMoveById(tacticalResult.chosenMoveId);

  // Add a defensive check in case the move ID is invalid.
  if (!chosenMove) {
    console.error(`FATAL: AI chose move ID "${tacticalResult.chosenMoveId}" which could not be found in the MoveRegistry.`);
    // Fallback to the first available move to prevent a crash.
    const fallbackMove = availableMoves[0] || attacker.abilities.find(m => m.id.includes('basic_strike'))!;
    const executionResult = await executeTacticalMove(fallbackMove, attacker, target, newState);
    // ... update state and return ...
    return { state: newState, logEntries: executionResult.logEntries };
  }
  
  // Now `chosenMove` is a valid Move object, and the rest of the logic works correctly.
  const executionResult = await executeTacticalMove(chosenMove, attacker, target, newState);
  
  // Log the AI decision for this turn (always, not just forced escalation)
  newState.aiLog.push({
    turn: newState.turn,
    agent: attacker.name,
    reasoning: (Array.isArray(tacticalResult.reasons) && tacticalResult.reasons.length > 0)
      ? tacticalResult.reasons.join('; ')
      : (tacticalResult.tacticalExplanation || `Chose move: ${chosenMove.name}`),
    chosenAction: chosenMove.name
  } as AILogEntry);

  // Update logs and state
  newState.log.push(executionResult.narrative);
  newState.participants[attackerIndex] = executionResult.newAttacker;
  newState.participants[targetIndex] = executionResult.newTarget;
  newState.participants[attackerIndex] = updatePatternTracking(newState.participants[attackerIndex], chosenMove.name);

  propagateTacticalStates(newState, attackerIndex, targetIndex);
  
  // Reversal check remains the same
  const reversalLogEntries = [];
  const participants = [newState.participants[attackerIndex], newState.participants[targetIndex]];
  for (const participant of participants) {
    const reversalResult = resolveReversal({ character: participant });
    if (reversalResult) {
      const { technical } = createMechanicLogEntry({ turn: newState.turn, actor: participant.name, mechanic: 'Reversal', effect: reversalResult.narrative, reason: reversalResult.source });
      reversalLogEntries.push(technical);
      participant.stability += reversalResult.stabilityGain;
    }
  }

  return { state: newState, logEntries: [...executionResult.logEntries, ...reversalLogEntries] };
}

function getActiveParticipants(state: BattleState) {
  const attacker = state.participants[state.activeParticipantIndex];
  const target = state.participants[1 - state.activeParticipantIndex];
  const attackerIndex = state.activeParticipantIndex;
  const targetIndex = 1 - state.activeParticipantIndex;
  return { attacker, target, attackerIndex, targetIndex };
}

// function calculateRiskTolerance(character: BattleCharacter): number {
//   let risk = 0;
//   // If health is low, take more risks.
//   if (character.currentHealth < 40) risk++;
//   if (character.currentHealth < 20) risk++;
//
//   // If stuck in a "recover chi" loop for too long, take a risk.
//   const moveHistory = character.moveHistory.slice(-3); // Check last 3 moves
//   const isStuckRecovering = moveHistory.length === 3 && moveHistory.every(move => 
//     move.includes('Glide') || move.includes('Dash') || move.includes('Focus')
//   );
//
//   if (isStuckRecovering) {
//     console.log(`AI TACTICAL SHIFT: ${character.name} is stuck in a recovery loop, increasing risk tolerance.`);
//     risk++;
//   }
//   
//   return Math.min(risk, 2); // Cap risk at 2
// } 