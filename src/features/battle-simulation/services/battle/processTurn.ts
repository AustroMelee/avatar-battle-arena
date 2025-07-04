// CONTEXT: Battle Turn Processing
// RESPONSIBILITY: Apply one turn of game logic

import { BattleState, BattleLogEntry } from '../../types';
import { getActiveParticipants, cloneBattleState, declareWinner } from './state';
import { chooseAbilityWithLogging, AIAbilityResult } from '../ai/chooseAbility';
import { processBuffsAndDebuffs, reduceCooldowns, recoverChi } from '../effects/buffs';
import { createEventId } from '../ai/logQueries';
import { defaultNarrativeService } from '../narrative';
import { validateBattleState, forceBattleClimax } from './battleValidation';
import { generateAndFormatBattleAnalytics } from './battleAnalytics.service';
import { executeMove } from './moveExecution.service';
import { 
  calculateDesperationState, 
  shouldTriggerDesperation, 
  createDesperationLogEntry,
  applyDesperationModifiers 
} from './desperationSystem.service';
import { 
  getAvailableFinisher, 
  executeFinisherMove 
} from './finisherSystem.service';





/**
 * @description Processes a single turn of the battle with comprehensive logging.
 * @param {BattleState} currentState - The current state of the battle.
 * @returns {BattleState} The state after the turn is completed.
 */
export function processTurn(currentState: BattleState): BattleState {
  const newState = cloneBattleState(currentState);
  const { attacker, target, attackerIndex, targetIndex } = getActiveParticipants(newState);

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
      const analytics = generateAndFormatBattleAnalytics(climaxState);
      climaxState.log.push(analytics);
      return climaxState;
    } else if (validation.endReason === 'victory') {
      // Handle victory
      const winnerIndex = newState.participants[0].currentHealth <= 0 ? 1 : 0;
      const victoryState = declareWinner(newState, newState.participants[winnerIndex]);
      const analytics = generateAndFormatBattleAnalytics(victoryState);
      victoryState.log.push(analytics);
      return victoryState;
    }
    
    // Default to ending the battle
    newState.isFinished = true;
    const analytics = generateAndFormatBattleAnalytics(newState);
    newState.log.push(analytics);
    return newState;
  }

  // Check for desperation state changes and trigger dramatic events
  const currentDesperationState = calculateDesperationState(attacker, newState);
  const previousDesperationState = attacker.flags?.desperationState ? 
    JSON.parse(attacker.flags.desperationState) : null;
  
  if (shouldTriggerDesperation(attacker, newState, previousDesperationState)) {
    const desperationLogEntry = createDesperationLogEntry(attacker, currentDesperationState, newState.turn);
    newState.battleLog.push(desperationLogEntry);
    newState.log.push(desperationLogEntry.narrative || desperationLogEntry.result);
    
    // Store desperation state in character flags
    newState.participants[attackerIndex].flags = {
      ...newState.participants[attackerIndex].flags,
      desperationState: JSON.stringify(currentDesperationState)
    };
  }
  
  // Apply desperation modifiers to attacker
  const modifiedAttacker = applyDesperationModifiers(attacker, currentDesperationState);
  newState.participants[attackerIndex] = modifiedAttacker;
  
  // Check for finisher moves first (highest priority)
  const availableFinisher = getAvailableFinisher(attacker, target, newState);
  let aiResult: AIAbilityResult | null = null;
  let moveDamage = 0;
  let moveResult = '';
  let finisherLogEntry: BattleLogEntry | undefined;
  
  if (availableFinisher) {
    // Execute finisher move with dramatic consequences
    finisherLogEntry = executeFinisherMove(availableFinisher, attacker, target, newState, targetIndex);
    newState.battleLog.push(finisherLogEntry);
    newState.log.push(finisherLogEntry.narrative || finisherLogEntry.result);
    
    // Check for winner after finisher
    if (newState.participants[targetIndex].currentHealth <= 0) {
      return declareWinner(newState, newState.participants[attackerIndex]);
    }
    
    // Continue with end-of-turn processing
  } else {
    // Normal AI move selection (existing code)
    aiResult = chooseAbilityWithLogging(
      attacker,
      target,
      newState.turn,
      newState.battleLog
    );

    if (aiResult.ability) {
      const chosenAbility = aiResult.ability;
      const aiLog = aiResult.aiLog;
      newState.aiLog.push(aiLog);

      // Execute the chosen ability using the move execution service
      const executionResult = executeMove(chosenAbility, attacker, target, newState, attackerIndex, targetIndex);
      
      // Update state with execution result
      Object.assign(newState, executionResult.newState);
      moveDamage = executionResult.damage;
      moveResult = executionResult.result;
      
      // Add AI rule to the log entry
      executionResult.logEntry.meta = {
        ...executionResult.logEntry.meta,
        aiRule: aiLog.reasoning || undefined
      };
      
      newState.battleLog.push(executionResult.logEntry);
      
      // Update attacker's move history and last move
      newState.participants[attackerIndex].lastMove = chosenAbility.name;
      newState.participants[attackerIndex].moveHistory.push(chosenAbility.name);
      
      // Apply cooldown if the ability has one
      if (chosenAbility.cooldown && chosenAbility.cooldown > 0) {
        newState.participants[attackerIndex].cooldowns[chosenAbility.name] = chosenAbility.cooldown;
        console.log(`Applied cooldown: ${chosenAbility.name} = ${chosenAbility.cooldown} turns`);
      }
      
      // Decrement uses if the ability has a limit
      if (chosenAbility.maxUses) {
        const currentUses = newState.participants[attackerIndex].usesLeft[chosenAbility.name] ?? chosenAbility.maxUses;
        newState.participants[attackerIndex].usesLeft[chosenAbility.name] = currentUses - 1;
      }
      
      // Spend chi if the ability has a cost
      if (chosenAbility.chiCost && chosenAbility.chiCost > 0) {
        newState.participants[attackerIndex].resources.chi = Math.max(0, attacker.resources.chi - chosenAbility.chiCost);
      }
      
      // Add to both legacy log and new structured log with AI rule explanation
      const aiRuleExplanation = aiLog.reasoning ? ` (${aiLog.reasoning})` : '';
      newState.log.push(`${attacker.name} uses ${chosenAbility.name}! ${moveResult}${aiRuleExplanation}`);
    } else {
      // No ability available - use fallback
      const fallbackLogEntry: BattleLogEntry = {
        id: createEventId(),
        turn: newState.turn,
        actor: attacker.name,
        type: 'MOVE',
        action: 'Basic Strike',
        target: target.name,
        abilityType: 'attack',
        result: `It hits ${target.name}, dealing 1 damage.`,
        damage: 1,
        timestamp: Date.now(),
        meta: {
          resourceCost: 0,
          aiRule: 'Fallback Move'
        }
      };
      
      newState.participants[targetIndex].currentHealth = Math.max(0, target.currentHealth - 1);
      newState.log.push(`${attacker.name} uses Basic Strike! It hits ${target.name}, dealing 1 damage.`);
      newState.battleLog.push(fallbackLogEntry);
    }
  }

  // Generate narrative hooks for this battle event
  const usedAbility = availableFinisher || (aiResult?.ability || null);
  const actualDamage = availableFinisher ? (finisherLogEntry?.damage || 0) : moveDamage;
  const isCritical = !availableFinisher && aiResult?.ability?.type === 'attack' && 
    moveResult?.includes('CRITICALLY');
  const narratives = usedAbility ? defaultNarrativeService.generateNarratives(
    attacker,
    target,
    usedAbility,
    newState.turn,
    newState.battleLog,
    newState.location || 'Fire Nation Capital',
    isCritical, // Pass critical hit information
    !!availableFinisher, // Is a finisher move
    actualDamage // Pass the actual damage dealt
  ) : [];

  // Add narratives to the log
  narratives.forEach(narrative => {
    newState.log.push(narrative.text);
    newState.battleLog.push({
      id: createEventId(),
      turn: newState.turn,
      actor: narrative.speaker, // Use the actual speaker (character or narrator)
      type: 'NARRATIVE',
      action: 'speak',
      result: narrative.text,
      narrative: narrative.text,
      timestamp: Date.now()
    });
  });

  // Check for winner
  if (newState.participants[targetIndex].currentHealth <= 0) {
    const finalState = declareWinner(newState, newState.participants[attackerIndex]);
    
    // Add battle analytics
    const analytics = generateAndFormatBattleAnalytics(finalState);
    finalState.log.push(analytics);
    
    return finalState;
  } else {
    // Process end-of-turn effects for both participants
    newState.participants[0] = processBuffsAndDebuffs(newState.participants[0]);
    newState.participants[1] = processBuffsAndDebuffs(newState.participants[1]);
    
    // Reduce cooldowns for both participants
    newState.participants[0] = reduceCooldowns(newState.participants[0]);
    newState.participants[1] = reduceCooldowns(newState.participants[1]);
    
    // Recover chi for both participants
    newState.participants[0] = recoverChi(newState.participants[0]);
    newState.participants[1] = recoverChi(newState.participants[1]);
    
    // Switch to the next participant for the next turn
    newState.activeParticipantIndex = targetIndex as 0 | 1;
    newState.turn++;
  }

  return newState;
} 