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
import { AANG_SUDDEN_DEATH_FINISHER, AZULA_SUDDEN_DEATH_FINISHER } from '../../../types/move.types';
import { getAvailableMoves } from '../../utils/moveUtils'; // Corrected import
import { forceBattleClimax } from '../battleValidation';

// Dynamic forced escalation flavor phrases
const NO_MOVE_FLAVORS = [
  (name: string) => `${name} hesitates, exhausted and wary. The next move never comes.`,
  (name: string) => `${name}'s attacks are met and deflected—neither gains ground.`,
  (name: string) => `${name} is forced on the defensive, unable to find an opening!`,
  (name: string) => `${name} circles warily, unable to break the deadlock.`,
  (name: string) => `Fatigue sets in for ${name}; no opportunity presents itself.`,
];

function getNoMoveFlavor(name: string): string {
  const idx = Math.floor(Math.random() * NO_MOVE_FLAVORS.length);
  return NO_MOVE_FLAVORS[idx](name);
}

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
  const availableMoves = getAvailableMoves(attacker, target, locationData);

  if (attacker.flags?.forcedEscalation === 'true') {
    console.log(`DEBUG: T${newState.turn} ${attacker.name} is in ESCALATION MODE.`);
    const attackMoves = availableMoves.filter(m => m.type === 'attack' && !m.isChargeUp && !m.changesPosition);
    // Define weak move threshold (e.g., baseDamage <= 10 or name === 'Basic Strike')
    const HIGH_IMPACT_THRESHOLD = 12;
    const highImpactMoves = attackMoves.filter(m => m.baseDamage > HIGH_IMPACT_THRESHOLD && m.name !== 'Basic Strike');
    if (highImpactMoves.length > 0) {
        const chosenMove = highImpactMoves.sort((a, b) => b.baseDamage - a.baseDamage)[0];
        const reasoning = `FORCED ESCALATION: Using strongest available attack: ${chosenMove.name}.`;
        console.log(`DEBUG: T${newState.turn} ${attacker.name} forced escalation move: ${chosenMove.name}`);
        const executionResult = await executeTacticalMove(chosenMove, attacker, target, newState);
        newState.aiLog.push({ turn: newState.turn, agent: attacker.name, reasoning, chosenAction: chosenMove.name } as AILogEntry);
        newState.log.push(executionResult.narrative);
        newState.participants[attackerIndex] = executionResult.newAttacker;
        newState.participants[targetIndex] = executionResult.newTarget;
        newState.participants[attackerIndex].cooldowns['Gather Power'] = 2;
        return { state: newState, logEntries: executionResult.logEntries };
    } else {
        // No high-impact moves and Gather Power is on cooldown: skip turn (no action)
        const noMoveLog = logStory({
          turn: newState.turn,
          actor: 'Narrator',
          narrative: getNoMoveFlavor(attacker.name)
        });
        return { state: newState, logEntries: noMoveLog ? [noMoveLog] : [] };
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