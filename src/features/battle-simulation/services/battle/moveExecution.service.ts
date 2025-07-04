// CONTEXT: Move Execution Service
// RESPONSIBILITY: Execute moves and calculate their effects

import { BattleState, BattleCharacter, BattleLogEntry, Buff } from '../../types';
import { Ability } from '@/common/types';
import { createEventId } from '../ai/logQueries';
import { 
  resolveMove
} from './moveLogic.service';
import type { Move, BattleContext } from '../../types/move.types';

/**
 * @description Result of executing a move
 */
export interface MoveExecutionResult {
  newState: BattleState;
  logEntry: BattleLogEntry;
  damage: number;
  result: string;
  narrative: string;
  isCritical: boolean;
}

/**
 * @description Convert Ability to Move for the new dramatic mechanics system
 * @param {Ability} ability - The ability to convert
 * @returns {Move} The converted move
 */
function convertAbilityToMove(ability: Ability): Move {
  return {
    id: ability.name.toLowerCase().replace(/\s+/g, '_'),
    name: ability.name,
    chiCost: ability.chiCost || 0,
    baseDamage: ability.power,
    cooldown: ability.cooldown || 0,
    critChance: ability.critChance,
    critMultiplier: ability.critMultiplier,
    isFinisher: ability.isFinisher,
    oncePerBattle: ability.oncePerBattle,
    finisherCondition: ability.finisherCondition ? 
      ability.finisherCondition.type === 'hp_below' ? {
        type: 'hp_below' as const,
        percent: ability.finisherCondition.percent!
      } : ability.finisherCondition.type === 'phase' ? {
        type: 'phase' as const,
        phase: ability.finisherCondition.phase as 'climax' | 'stalemate'
      } : undefined
    : undefined,
    desperationBuff: ability.desperationBuff,
    description: ability.description
  };
}

/**
 * @description Create battle context for move resolution
 * @param {BattleCharacter} attacker - The attacking character
 * @param {BattleCharacter} target - The target character
 * @param {BattleState} state - Current battle state
 * @returns {BattleContext} The battle context
 */
function createBattleContext(
  attacker: BattleCharacter,
  target: BattleCharacter,
  state: BattleState
): BattleContext {
  return {
    phase: 'normal', // TODO: Implement phase detection
    turn: state.turn,
    selfHP: attacker.currentHealth,
    selfMaxHP: 100, // All characters have 100 max HP
    enemyHP: target.currentHealth,
    enemyMaxHP: 100, // All characters have 100 max HP
    hasUsedFinisher: attacker.flags?.usedFinisher || false
  };
}

/**
 * @description Executes an attack move and calculates damage using the new dramatic mechanics
 * @param {Ability} ability - The attack ability to execute
 * @param {BattleCharacter} attacker - The attacking character
 * @param {BattleCharacter} target - The target character
 * @param {BattleState} state - Current battle state
 * @param {number} targetIndex - Index of target in participants array
 * @returns {MoveExecutionResult} The execution result
 */
export function executeAttackMove(
  ability: Ability,
  attacker: BattleCharacter,
  target: BattleCharacter,
  state: BattleState,
  targetIndex: number
): MoveExecutionResult {
  // Convert ability to move format
  const move = convertAbilityToMove(ability);
  const battleContext = createBattleContext(attacker, target, state);
  
  // Use new dramatic mechanics system
  const moveResult = resolveMove(move, battleContext, attacker, target, state.turn);
  
  // Apply damage to target
  const newState = { ...state };
  newState.participants[targetIndex].currentHealth = Math.max(0, target.currentHealth - moveResult.damage);
  
  // Mark finisher as used if it was a finisher
  if (moveResult.wasFinisher) {
    newState.participants[state.activeParticipantIndex].flags = {
      ...newState.participants[state.activeParticipantIndex].flags,
      usedFinisher: true
    };
  }
  
  return {
    newState,
    logEntry: moveResult.logEntry,
    damage: moveResult.damage,
    result: moveResult.logEntry.result,
    narrative: moveResult.narrative,
    isCritical: moveResult.wasCrit
  };
}

/**
 * @description Executes a defense/buff move
 * @param {Ability} ability - The defense ability to execute
 * @param {BattleCharacter} attacker - The character using the ability
 * @param {BattleState} state - Current battle state
 * @param {number} attackerIndex - Index of attacker in participants array
 * @returns {MoveExecutionResult} The execution result
 */
export function executeDefenseMove(
  ability: Ability,
  attacker: BattleCharacter,
  state: BattleState,
  attackerIndex: number
): MoveExecutionResult {
  const defenseBonus = ability.power;
  const newState = { ...state };
  
  // Apply defense bonus
  newState.participants[attackerIndex].currentDefense += defenseBonus;
  
  // Apply buff with duration (3 turns by default)
  const buffDuration = ability.tags?.includes('rest') ? 1 : 3;
  const defenseBuff: Buff = {
    id: `${ability.name}_${Date.now()}`,
    name: `${ability.name} Defense`,
    duration: buffDuration,
    potency: defenseBonus,
    description: `Defense increased by ${defenseBonus} for ${buffDuration} turns`,
    source: ability.name
  };
  
  newState.participants[attackerIndex].activeBuffs.push(defenseBuff);
  
  const result = `${attacker.name}'s defense rises by ${defenseBonus} (${buffDuration} turns)!`;
  
  // Generate narrative based on battle state
  let narrative: string;
  if (ability.tags?.includes('rest')) {
    narrative = `${attacker.name} (${attacker.resources.chi} chi) takes a moment to focus and recover their energy, preparing for the next exchange!`;
  } else if (ability.tags?.includes('desperate') && attacker.currentHealth < 30) {
    narrative = `${attacker.name} (${attacker.currentHealth} HP) desperately activates ${ability.name}, their aura flaring with renewed strength!`;
  } else if (ability.tags?.includes('healing') && attacker.currentHealth < 40) {
    narrative = `${attacker.name} (${attacker.currentHealth} HP) channels healing energy through ${ability.name}, feeling their wounds begin to close!`;
  } else if (attacker.currentHealth < 50) {
    narrative = `${attacker.name} focuses inward, strengthening their defenses with ${ability.name} as they prepare for the next assault!`;
  } else if ((attacker.resources.chi || 0) < 3) {
    narrative = `${attacker.name} (${attacker.resources.chi} chi) conserves their dwindling energy with ${ability.name}!`;
  } else if (attacker.currentDefense < attacker.stats.defense + 10) {
    narrative = `${attacker.name} senses vulnerability and strengthens their defenses with ${ability.name}!`;
  } else {
    narrative = `${attacker.name} focuses inward, their aura strengthening as ${ability.name} takes effect.`;
  }
  
  // Create battle log entry
  const logEntry: BattleLogEntry = {
    id: createEventId(),
    turn: state.turn,
    actor: attacker.name,
    type: 'MOVE',
    action: ability.name,
    target: attacker.name,
    abilityType: ability.type,
    result,
    narrative,
    timestamp: Date.now(),
    meta: {
      resourceCost: ability.chiCost || 0
    }
  };
  
  return {
    newState,
    logEntry,
    damage: 0,
    result,
    narrative,
    isCritical: false
  };
}

/**
 * @description Executes a generic move (fallback for unknown types)
 * @param {Ability} ability - The ability to execute
 * @param {BattleCharacter} attacker - The character using the ability
 * @param {BattleState} state - Current battle state
 * @returns {MoveExecutionResult} The execution result
 */
export function executeGenericMove(
  ability: Ability,
  attacker: BattleCharacter,
  state: BattleState
): MoveExecutionResult {
  const result = `${ability.name} is used.`;
  const narrative = `${attacker.name} executes ${ability.name} with practiced precision.`;
  
  const logEntry: BattleLogEntry = {
    id: createEventId(),
    turn: state.turn,
    actor: attacker.name,
    type: 'MOVE',
    action: ability.name,
    target: 'Unknown',
    abilityType: ability.type,
    result,
    narrative,
    timestamp: Date.now(),
    meta: {
      resourceCost: ability.chiCost || 0
    }
  };
  
  return {
    newState: state,
    logEntry,
    damage: 0,
    result,
    narrative,
    isCritical: false
  };
}

/**
 * @description Executes any move based on its type
 * @param {Ability} ability - The ability to execute
 * @param {BattleCharacter} attacker - The attacking character
 * @param {BattleCharacter} target - The target character
 * @param {BattleState} state - Current battle state
 * @param {number} attackerIndex - Index of attacker in participants array
 * @param {number} targetIndex - Index of target in participants array
 * @returns {MoveExecutionResult} The execution result
 */
export function executeMove(
  ability: Ability,
  attacker: BattleCharacter,
  target: BattleCharacter,
  state: BattleState,
  attackerIndex: number,
  targetIndex: number
): MoveExecutionResult {
  switch (ability.type) {
    case 'attack':
      return executeAttackMove(ability, attacker, target, state, targetIndex);
    case 'defense_buff':
      return executeDefenseMove(ability, attacker, state, attackerIndex);
    default:
      return executeGenericMove(ability, attacker, state);
  }
} 