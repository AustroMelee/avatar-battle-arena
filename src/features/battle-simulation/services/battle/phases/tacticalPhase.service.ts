// CONTEXT: Tactical Phase Service
// RESPONSIBILITY: Handle tactical AI move selection and execution with enhanced narratives

import { BattleState, BattleCharacter, BattleLogEntry, AILogEntry } from '../../../types';
import { selectBestTacticalMove, moveToAbility } from '../../ai/enhancedMoveScoring';
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
import type { PerceivedState } from '../../../types';
import { resolveReversal } from '../reversalMechanic.service';
import { createMechanicLogEntry } from '../../utils/mechanicLogUtils';
import { Move, AANG_SUDDEN_DEATH_FINISHER, AZULA_SUDDEN_DEATH_FINISHER } from '../../../types/move.types';
import { getAvailableMoves, hasEnoughResources, isMoveOnCooldown } from '../../ai/moveUtils';
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
  const allMoves = getCharacterMoves(attacker.name);
  
  // --- NEW: Handle CLIMAX phase ---
  if ((newState as any).tacticalPhase === 'climax') {
    const finalState = forceBattleClimax(newState);
    const climaxLogs = finalState.battleLog.slice(-3);
    return { state: finalState, logEntries: climaxLogs };
  }
  
  // --- NEW: ESCALATION MODE OVERRIDE (FINAL, DEFINITIVE REFINEMENT) ---
  if (attacker.flags?.forcedEscalation === 'true') {
    console.log(`DEBUG: T${newState.turn} ${attacker.name} is in ESCALATION MODE.`);
    let chosenMove: Move | undefined;
    let reasoning = "FORCED ESCALATION - ";
    
    const usableMoves = allMoves.filter(m => canUseMove(m, attacker, target, newState.location || 'Open Field'));
    
    // 1. Prioritize ANY usable attack move.
    const attackMoves = usableMoves.filter(m => m.type === 'attack' && m.baseDamage > 1);
    if (attackMoves.length > 0) {
        chosenMove = attackMoves.sort((a, b) => b.baseDamage - a.baseDamage)[0];
        reasoning += `Forced to take offensive action. Choosing strongest available attack: ${chosenMove.name}.`;
    } else {
        // --- NEW: No valid attack? Skip turn to "Gather Power" instead of using Basic Strike. ---
        const logEntry = createMechanicLogEntry({
            turn: newState.turn,
            actor: attacker.name,
            mechanic: 'Escalation Charge',
            effect: `${attacker.name} has no powerful options and gathers power, skipping their turn!`,
            reason: 'No offensive moves available during escalation.',
        });
        newState.participants[attackerIndex].resources.chi += 2;
        newState.log.push(logEntry.narrative || logEntry.result);
        // Track as a desperation move for analytics
        if (newState.analytics) {
          newState.analytics.desperationMoves = (newState.analytics.desperationMoves || 0) + 1;
        }
        return { state: newState, logEntries: [logEntry] };
    }
    
    // Safety net in case all logic fails
    if (!chosenMove) {
        chosenMove = allMoves.find(m => m.id.includes('basic_strike')) || allMoves[0];
        reasoning = "ESCALATION: All options exhausted. Using Basic Strike.";
    }

    console.log(`DEBUG: T${newState.turn} ${attacker.name} escalation choice: ${chosenMove.name}`);

    // Execute the chosen move
    const executionResult = await executeTacticalMove(chosenMove, attacker, target, newState);
    
    // Log AI decision
    newState.aiLog.push({
      turn: newState.turn,
      agent: attacker.name,
      reasoning: reasoning,
      chosenAction: chosenMove.name,
    } as AILogEntry);
    
    newState.log.push(executionResult.narrative);
    newState.participants[attackerIndex] = executionResult.newAttacker;
    newState.participants[targetIndex] = executionResult.newTarget;

    // VERY IMPORTANT: Decrement or remove the escalation flag after use
    const escalationDuration = parseInt(attacker.flags.escalationDuration || '1', 10) - 1;
    if (escalationDuration <= 0) {
        newState.participants[attackerIndex].flags.forcedEscalation = 'false';
    } else {
        newState.participants[attackerIndex].flags.escalationDuration = escalationDuration.toString();
    }
    
    // NEW: Track as a desperation move for analytics
    if (newState.analytics) {
      newState.analytics.desperationMoves = (newState.analytics.desperationMoves || 0) + 1;
    }
    
    return { state: newState, logEntries: executionResult.logEntries };
  }
  // --- END OF ESCALATION OVERRIDE ---
  
  // --- NEW: SUDDEN DEATH OVERRIDE (HIGHEST PRIORITY) ---
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
  // --- END OF SUDDEN DEATH OVERRIDE ---
  
  // Only declare locationData here, after escalation block
  const locationData = availableLocations.find(loc => loc.name === newState.location) || availableLocations[0];
  const normalTolerance = locationData.collateralTolerance || 2;
  
  // Get character-specific moves
  const riskTolerance = calculateRiskTolerance(attacker);
  const availableMoves = getAvailableMoves(attacker, {} as any, locationData, newState.turn, riskTolerance);
  
  // --- NEW: Manage the Stuck Move Counter ---
  // Check how many powerful moves are being filtered specifically by collateral damage
  const collateralFilteredCount = allMoves.filter(move => {
    const ability = moveToAbility(move);
    return ability.collateralDamage && ability.collateralDamage > normalTolerance &&
      hasEnoughResources(ability, attacker) && !isMoveOnCooldown(move.name, attacker);
  }).length;
  if (collateralFilteredCount > 0) {
    attacker.flags.stuckMoveCounter = (attacker.flags.stuckMoveCounter || 0) + 1;
    console.log(`DEBUG: T${newState.turn} ${attacker.name} stuck counter is now ${attacker.flags.stuckMoveCounter}`);
  } else {
    attacker.flags.stuckMoveCounter = 0;
  }
  // --- END ---
  
  // Filter out disabled moves (filteredMoves is Move[])
  const filteredMoves = allMoves.filter(move => !isMoveDisabled(move, attacker));
  
  // Convert allMoves (Move[]) to Ability[] for tactical AI
  const abilityList = allMoves.map(moveToAbility);
  
  // --- NEW: Tactical Stalemate Counter Logic ---
  let currentStalemateCounter = newState.tacticalStalemateCounter || 0;

  // Use new tactical AI for move selection, passing the stalemate counter
  const tacticalResult = selectBestTacticalMove(abilityList, attacker, target, currentStalemateCounter);

  // Update the stalemate counter based on the result
  if (tacticalResult.priority === newState.lastTacticalPriority) {
    currentStalemateCounter++;
  } else {
    currentStalemateCounter = 0; // Reset counter on tactical shift
  }
  newState.tacticalStalemateCounter = currentStalemateCounter;
  newState.lastTacticalPriority = tacticalResult.priority;
  
  // Convert chosen Ability back to Move for execution (search allMoves by name)
  const chosenMove = allMoves.find(m => m.name === tacticalResult.chosenAbility.name) || allMoves[0];
  
  // Check if move can be used
  console.log(`DEBUG: T${newState.turn} ${attacker.name} attempting to use ${chosenMove.name}. Tactical Priority: ${tacticalResult.tacticalExplanation}`);
  if (!canUseMove(chosenMove, attacker, target, newState.location || 'Open Field')) {
    // If no moves are "perfectly" usable (due to cooldowns, chi, etc.),
    // we now enter a more intelligent fallback selection process.
    if (filteredMoves.length === 0) {
      console.log(`DEBUG: T${newState.turn} ${attacker.name} has no standard usable moves. Engaging smart fallback...`);
      const isInEscalation = attacker.flags?.forcedEscalation === 'true';
      let fallbackMove: Move | undefined;
      let reasoning = "No standard moves available. ";
      // In Escalation, the AI will try to use ANY signature or high-damage move, ignoring cooldowns.
      if (isInEscalation) {
        reasoning += "ESCALATION FALLBACK: ";
        const signatureMoves = filteredMoves.filter(m => m.baseDamage >= 5 || m.id.includes('Blazing') || m.id.includes('Relentless'));
        const nonBasicMoves = filteredMoves.filter(m => !m.id.includes('basic'));
        if (signatureMoves.length > 0) {
          fallbackMove = signatureMoves.sort((a, b) => b.baseDamage - a.baseDamage)[0];
          reasoning += `Forced to use best signature move: ${fallbackMove.name}.`;
        } else if (nonBasicMoves.length > 0) {
          fallbackMove = nonBasicMoves.sort((a, b) => b.baseDamage - a.baseDamage)[0];
          reasoning += `Forced to use best available non-basic move: ${fallbackMove.name}.`;
        }
      }
      // If not in escalation or no special move was found, use the default "Basic Strike".
      if (!fallbackMove) {
        fallbackMove = allMoves.find(m => m.id.includes('basic_strike')) || allMoves[0];
        reasoning += `Defaulting to last resort: ${fallbackMove.name}.`;
      }
      // We've chosen our best fallback option, now execute it.
      console.log(`DEBUG: T${newState.turn} ${attacker.name} chose fallback move: ${fallbackMove.name}`);
      const executionResult = await executeTacticalMove(fallbackMove, attacker, target, newState);
      const logEntries: BattleLogEntry[] = [...(executionResult.logEntries || [])];
      if (logEntries.length > 0) {
        logEntries[0].meta = {
          ...logEntries[0].meta,
          tacticalAnalysis: tacticalResult.tacticalExplanation
        };
      }
      // Helper to build PerceivedState for AI log
      const buildPerceivedState = (): PerceivedState => ({
        self: {
          health: attacker.currentHealth,
          defense: attacker.currentDefense,
          personality: attacker.personality,
          abilities: attacker.abilities.map(a => ({
            id: a.name,
            name: a.name,
            type: a.type,
            power: ('baseDamage' in a && typeof (a as any).baseDamage === 'number') ? (a as any).baseDamage : (typeof (a as any).power === 'number' ? (a as any).power : 0),
            cooldown: a.cooldown
          })),
          cooldowns: attacker.cooldowns,
          lastMove: attacker.lastMove,
          moveHistory: attacker.moveHistory,
          activeEffects: attacker.activeEffects,
          resources: attacker.resources,
          position: attacker.position,
          isCharging: attacker.isCharging,
          chargeProgress: attacker.chargeProgress,
          repositionAttempts: attacker.repositionAttempts,
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
          repositionAttempts: target.repositionAttempts,
        },
        round: newState.turn,
        cooldowns: attacker.cooldowns,
        location: newState.location || 'Unknown',
        locationType: newState.locationType || 'Open',
      });
      newState.aiLog.push({
        turn: newState.turn,
        agent: attacker.name,
        reasoning: reasoning,
        chosenAction: fallbackMove.name,
        timestamp: Date.now(),
        perceivedState: buildPerceivedState(),
        consideredActions: []
      });
      newState.log.push(executionResult.narrative);
      newState.participants[attackerIndex] = executionResult.newAttacker;
      newState.participants[targetIndex] = executionResult.newTarget;
      return { state: newState, logEntries };
    }
  }
  
  // Apply escalation modifiers if any
  const modifiedMove = applyEscalationModifiers(chosenMove, attacker);
  
  // Execute the chosen move
  const executionResult = await executeTacticalMove(modifiedMove, attacker, target, newState);
  const logEntries: BattleLogEntry[] = [...(executionResult.logEntries || [])];
  if (logEntries.length > 0) {
    logEntries[0].meta = {
      ...logEntries[0].meta,
      tacticalAnalysis: tacticalResult.tacticalExplanation
    };
  }
  // Helper to build PerceivedState for AI log
  const buildPerceivedState = (): PerceivedState => ({
    self: {
      health: attacker.currentHealth,
      defense: attacker.currentDefense,
      personality: attacker.personality,
      abilities: attacker.abilities.map(a => ({
        id: a.name,
        name: a.name,
        type: a.type,
        power: ('baseDamage' in a && typeof (a as any).baseDamage === 'number') ? (a as any).baseDamage : (typeof (a as any).power === 'number' ? (a as any).power : 0),
        cooldown: a.cooldown
      })),
      cooldowns: attacker.cooldowns,
      lastMove: attacker.lastMove,
      moveHistory: attacker.moveHistory,
      activeEffects: attacker.activeEffects,
      resources: attacker.resources,
      position: attacker.position,
      isCharging: attacker.isCharging,
      chargeProgress: attacker.chargeProgress,
      repositionAttempts: attacker.repositionAttempts,
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
      repositionAttempts: target.repositionAttempts,
    },
    round: newState.turn,
    cooldowns: attacker.cooldowns,
    location: newState.location || 'Unknown',
    locationType: newState.locationType || 'Open',
  });
  newState.aiLog.push({
    turn: newState.turn,
    agent: attacker.name,
    reasoning: `${tacticalResult.tacticalExplanation} - ${tacticalResult.reasons.join(', ')}`,
    chosenAction: chosenMove.name,
    timestamp: Date.now(),
    perceivedState: buildPerceivedState(),
    consideredActions: []
  });
  newState.log.push(executionResult.narrative);
  
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
  
  // --- REFINED: High-risk gamble logic ---
  if ((attacker.flags?.stuckMoveCounter || 0) >= 2) {
      if (newState.analytics) {
          newState.analytics.desperationMoves = (newState.analytics.desperationMoves || 0) + 1;
      }
      console.log(`AI TACTICAL SHIFT: ${attacker.name} is making a high-risk gamble due to being stuck.`);
  }
  
  return { state: newState, logEntries: [...logEntries, ...reversalLogEntries] };
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

/**
 * @description NEW: Calculates the AI's risk tolerance based on its state.
 * @param {BattleCharacter} character - The AI character.
 * @returns {number} A risk level (0: normal, 1: risky, 2: desperate).
 */
function calculateRiskTolerance(character: BattleCharacter): number {
  let risk = 0;
  // If health is low, take more risks.
  if (character.currentHealth < 40) risk++;
  if (character.currentHealth < 20) risk++;

  // If stuck in a "recover chi" loop for too long, take a risk.
  const moveHistory = character.moveHistory.slice(-3); // Check last 3 moves
  const isStuckRecovering = moveHistory.length === 3 && moveHistory.every(move => 
    move.includes('Glide') || move.includes('Dash') || move.includes('Focus')
  );

  if (isStuckRecovering) {
    console.log(`AI TACTICAL SHIFT: ${character.name} is stuck in a recovery loop, increasing risk tolerance.`);
    risk++;
  }
  
  return Math.min(risk, 2); // Cap risk at 2
} 