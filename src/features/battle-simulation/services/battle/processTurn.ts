// CONTEXT: Battle Turn Processing
// RESPONSIBILITY: Apply one turn of game logic

import { BattleState, BattleLogEntry } from '../../types';
import { getActiveParticipants, cloneBattleState, declareWinner } from './state';
import { chooseAbilityWithLogging } from '../ai/chooseAbility';
import { processBuffsAndDebuffs, reduceCooldowns, recoverChi } from '../effects/buffs';

/**
 * @description Processes a single turn of the battle with comprehensive logging.
 * @param {BattleState} currentState - The current state of the battle.
 * @returns {BattleState} The state after the turn is completed.
 */
export function processTurn(currentState: BattleState): BattleState {
  const newState = cloneBattleState(currentState);
  const { attacker, target, attackerIndex, targetIndex } = getActiveParticipants(newState);

  // Get AI decision with enhanced tactical awareness
  const { ability: chosenAbility, aiLog } = chooseAbilityWithLogging(
    attacker, 
    target, 
    newState.turn, 
    newState.battleLog, // Pass the current battle log for state awareness
    null // No previous AI state for now
  );
  
  // Add AI log entry
  newState.aiLog.push(aiLog);
  
  // Reset temporary buffs from previous turn
  newState.participants[attackerIndex].currentDefense = attacker.stats.defense;
  
  // Also reset target's defense to base stats (defense buffs are temporary)
  newState.participants[targetIndex].currentDefense = target.stats.defense;
  
  // Debug defense values
  console.log(`[DEFENSE DEBUG] Turn ${newState.turn}: ${attacker.name} defense = ${newState.participants[attackerIndex].currentDefense}, ${target.name} defense = ${newState.participants[targetIndex].currentDefense}`);

  // Create enhanced battle log entry with tactical context
  const battleLogEntry: BattleLogEntry = {
    turn: newState.turn,
    actor: attacker.name,
    action: chosenAbility.name,
    target: target.name,
    abilityType: chosenAbility.type,
    result: '', // Will be set in switch statement
    timestamp: Date.now()
  };

  // Apply the chosen ability
  switch (chosenAbility.type) {
    case 'attack': {
      let damage = chosenAbility.power;
      
      // Piercing attacks ignore defense
      if (chosenAbility.tags?.includes('piercing')) {
        damage = Math.max(1, damage - Math.floor(target.currentDefense * 0.3)); // Only 30% defense reduction
      } else {
        damage = Math.max(1, damage - target.currentDefense);
      }
      
      // Desperate moves get bonus when health is low
      if (chosenAbility.tags?.includes('desperate') && attacker.currentHealth < 30) {
        damage = Math.floor(damage * 1.5);
      }
      
      newState.participants[targetIndex].currentHealth = Math.max(0, target.currentHealth - damage);
      
      // Debug damage calculation
      console.log(`[DAMAGE DEBUG] ${attacker.name} uses ${chosenAbility.name} (${chosenAbility.power} power) vs ${target.name} (${target.currentDefense} defense) = ${damage} damage`);
      
      battleLogEntry.result = `It hits ${target.name}, dealing ${damage} damage.`;
      battleLogEntry.damage = damage;
      
      // Enhanced narrative based on battle state
      if (chosenAbility.tags?.includes('piercing')) {
        battleLogEntry.narrative = `${attacker.name} senses ${target.name}'s defensive stance and counters with ${chosenAbility.name}, piercing through their guard!`;
      } else if (chosenAbility.tags?.includes('desperate') && attacker.currentHealth < 30) {
        battleLogEntry.narrative = `${attacker.name} (${attacker.currentHealth} HP) desperately channels their remaining strength into ${chosenAbility.name}, striking ${target.name} with renewed fury!`;
      } else if (target.currentHealth < 20) {
        battleLogEntry.narrative = `${attacker.name} sees ${target.name} critically wounded (${target.currentHealth} HP) and presses the advantage with ${chosenAbility.name}!`;
      } else if (chosenAbility.tags?.includes('high-damage')) {
        battleLogEntry.narrative = `${attacker.name} unleashes a devastating ${chosenAbility.name}, aiming to finish the fight!`;
      } else if (target.currentDefense > 20) {
        battleLogEntry.narrative = `${attacker.name} sees ${target.name} heavily defended and tests their guard with ${chosenAbility.name}!`;
      } else {
        battleLogEntry.narrative = `${attacker.name} channels their power into ${chosenAbility.name}, the energy crackling as it strikes ${target.name}!`;
      }
      break;
    }
      
    case 'defense_buff': {
      let defenseBonus = chosenAbility.power;
      
      // Desperate defense moves get bonus when health is low
      if (chosenAbility.tags?.includes('desperate') && attacker.currentHealth < 30) {
        defenseBonus = Math.floor(defenseBonus * 1.5);
      }
      
      // Healing moves restore health when health is low
      if (chosenAbility.tags?.includes('healing') && attacker.currentHealth < 40) {
        const healAmount = Math.floor(defenseBonus * 0.8);
        newState.participants[attackerIndex].currentHealth = Math.min(100, attacker.currentHealth + healAmount);
        battleLogEntry.result = `${attacker.name}'s defense rises by ${defenseBonus} and recovers ${healAmount} health!`;
      } else {
        battleLogEntry.result = `${attacker.name}'s defense rises by ${defenseBonus}!`;
      }
      
      newState.participants[attackerIndex].currentDefense += defenseBonus;
      
      // Enhanced narrative based on battle state
      if (chosenAbility.tags?.includes('desperate') && attacker.currentHealth < 30) {
        battleLogEntry.narrative = `${attacker.name} (${attacker.currentHealth} HP) desperately activates ${chosenAbility.name}, their aura flaring with renewed strength!`;
      } else if (chosenAbility.tags?.includes('healing') && attacker.currentHealth < 40) {
        battleLogEntry.narrative = `${attacker.name} (${attacker.currentHealth} HP) channels healing energy through ${chosenAbility.name}, feeling their wounds begin to close!`;
      } else if (attacker.currentHealth < 50) {
        battleLogEntry.narrative = `${attacker.name} focuses inward, strengthening their defenses with ${chosenAbility.name} as they prepare for the next assault!`;
      } else if ((attacker.resources.chi || 0) < 3) {
        battleLogEntry.narrative = `${attacker.name} (${attacker.resources.chi} chi) conserves their dwindling energy with ${chosenAbility.name}!`;
      } else if (attacker.currentDefense < attacker.stats.defense + 10) {
        battleLogEntry.narrative = `${attacker.name} senses vulnerability and strengthens their defenses with ${chosenAbility.name}!`;
      } else {
        battleLogEntry.narrative = `${attacker.name} focuses inward, their aura strengthening as ${chosenAbility.name} takes effect.`;
      }
      break;
    }
      
    default: {
      battleLogEntry.result = `${chosenAbility.name} is used.`;
      battleLogEntry.narrative = `${attacker.name} executes ${chosenAbility.name} with practiced precision.`;
    }
  }
  
  // Update attacker's move history and last move
  newState.participants[attackerIndex].lastMove = chosenAbility.name;
  newState.participants[attackerIndex].moveHistory.push(chosenAbility.name);
  
  // Apply cooldown if the ability has one
  if (chosenAbility.cooldown && chosenAbility.cooldown > 0) {
    newState.participants[attackerIndex].cooldowns[chosenAbility.name] = chosenAbility.cooldown;
  }
  
  // Spend chi if the ability has a cost
  if (chosenAbility.chiCost && chosenAbility.chiCost > 0) {
    newState.participants[attackerIndex].resources.chi = Math.max(0, attacker.resources.chi - chosenAbility.chiCost);
  }
  
  // Add to both legacy log and new structured log with tactical explanation
  const tacticalExplanation = aiLog.reasoning ? ` (${aiLog.reasoning})` : '';
  newState.log.push(`${attacker.name} uses ${chosenAbility.name}! ${battleLogEntry.result}${tacticalExplanation}`);
  newState.battleLog.push(battleLogEntry);

  // Check for winner
  if (newState.participants[targetIndex].currentHealth <= 0) {
    return declareWinner(newState, newState.participants[attackerIndex]);
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