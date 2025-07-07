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
import { createMechanicLogEntry } from '../../utils/mechanicLogUtils';
import { AANG_SUDDEN_DEATH_FINISHER, AZULA_SUDDEN_DEATH_FINISHER } from '../../../types/move.types';
import { getAvailableMoves } from '../../utils/moveUtils'; // Corrected import
import { forceBattleClimax } from '../battleValidation';

/**
 * @description Processes tactical AI move selection and execution with enhanced narratives
 * @param {BattleState} state - The current battle state
 * @returns {Promise<{ state: BattleState; logEntries: BattleLogEntry[] }>} Updated state with move execution results and log entries
 */
export async function tacticalMovePhase(state: BattleState): Promise<{ state: BattleState; logEntries: BattleLogEntry[] }> {
  if (state.isFinished) return { state, logEntries: [] };
  const newState = { ...state };
  const { attacker, target, attackerIndex, targetIndex } = getActiveParticipants(newState);
  
  if ((newState as any).tacticalPhase === 'climax') {
    const finalState = forceBattleClimax(newState);
    const climaxLogs = finalState.battleLog.slice(-3);
    return { state: finalState, logEntries: climaxLogs };
  }
  
  if (attacker.flags?.suddenDeath) {
    const finisherMove = attacker.name === 'Aang' ? AANG_SUDDEN_DEATH_FINISHER : AZULA_SUDDEN_DEATH_FINISHER;
    const reasoning = "SUDDEN DEATH: The battle must end now with a final, decisive blow!";
    const executionResult = await executeTacticalMove(finisherMove, attacker, target, newState);
    newState.aiLog.push({
      turn: newState.turn,
      agent: attacker.name,
      reasoning: reasoning,
      chosenAction: finisherMove.name,
      narrative: executionResult.narrative,
      // Explicitly log as a Desperation Move
      tacticalAnalysis: { positionAdvantage: false, chargeOpportunity: false, punishOpportunity: false, environmentalFactor: 'sudden_death' },
      timestamp: Date.now(),
    } as AILogEntry);
    newState.log.push(executionResult.narrative);
    newState.participants[attackerIndex] = executionResult.newAttacker;
    newState.participants[targetIndex] = executionResult.newTarget;
    return { state: newState, logEntries: executionResult.logEntries };
  }

  // --- CRITICAL FIX: Use the definitive getAvailableMoves function FIRST ---
  const locationData = availableLocations.find(loc => loc.name === newState.location) || availableLocations[0];
  const availableMoves = getAvailableMoves(attacker, target, locationData);

  if (attacker.flags?.forcedEscalation === 'true') {
    console.log(`DEBUG: T${newState.turn} ${attacker.name} is in ESCALATION MODE.`);
    const attackMoves = availableMoves.filter(m => m.type === 'attack' && !m.isChargeUp && !m.changesPosition);
    
    if (attackMoves.length > 0) {
        const chosenMove = attackMoves.sort((a, b) => b.baseDamage - a.baseDamage)[0];
        const reasoning = `FORCED ESCALATION: Using strongest available attack: ${chosenMove.name}.`;
        console.log(`DEBUG: T${newState.turn} ${attacker.name} forced escalation move: ${chosenMove.name}`);
        const executionResult = await executeTacticalMove(chosenMove, attacker, target, newState);
        
        newState.aiLog.push({ turn: newState.turn, agent: attacker.name, reasoning, chosenAction: chosenMove.name } as AILogEntry);
        newState.log.push(executionResult.narrative);
        newState.participants[attackerIndex] = executionResult.newAttacker;
        newState.participants[targetIndex] = executionResult.newTarget;
        return { state: newState, logEntries: executionResult.logEntries };
    } else {
        const logEntry = createMechanicLogEntry({
            turn: newState.turn,
            actor: attacker.name,
            mechanic: 'Escalation Charge',
            effect: `${attacker.name} has no offensive options and gathers power, preparing for the next assault! (Gains 2 Chi)`,
            reason: 'No offensive moves available during forced escalation.',
        });
        newState.participants[attackerIndex].resources.chi += 2; 
        newState.log.push(logEntry.narrative || logEntry.result);
        return { state: newState, logEntries: [logEntry] };
    }
  }

  // --- AI DECISION PIPELINE ---
  let currentStalemateCounter = newState.tacticalStalemateCounter || 0;
  // The AI now only considers the moves it can legally use.
  const tacticalResult = selectBestTacticalMove(availableMoves, attacker, target, currentStalemateCounter);

  if (tacticalResult.priority === newState.lastTacticalPriority) {
    currentStalemateCounter++;
  } else {
    currentStalemateCounter = 0; 
  }
  newState.tacticalStalemateCounter = currentStalemateCounter;
  newState.lastTacticalPriority = tacticalResult.priority;

  // Find the chosen move from the original full list to ensure we have the complete object.
  const chosenMove = attacker.abilities.find(m => m.name === tacticalResult.chosenAbility.name) || availableMoves[0];
  const executionResult = await executeTacticalMove(chosenMove, attacker, target, newState);
  
  // Update logs and state
  newState.battleLog.push(...executionResult.logEntries);
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
      reversalLogEntries.push(createMechanicLogEntry({ turn: newState.turn, actor: participant.name, mechanic: 'Reversal', effect: reversalResult.narrative, reason: reversalResult.source }));
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