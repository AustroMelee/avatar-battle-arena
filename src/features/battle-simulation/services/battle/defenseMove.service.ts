// CONTEXT: Defense Move Service
// RESPONSIBILITY: Execute defense/buff moves with enhanced narrative generation

import { BattleState, BattleCharacter, BattleLogEntry, Buff } from '../../types';
import { Ability } from '@/common/types';
import { createEventId } from '../ai/logQueries';
import { createNarrativeService } from '../narrative';

/**
 * @description Result of executing a defense move
 */
export interface DefenseMoveResult {
  newState: BattleState;
  logEntry: BattleLogEntry;
  damage: number;
  result: string;
  narrative: string;
  isCritical: boolean;
}

/**
 * @description Executes a defense/buff move with enhanced narrative generation
 * @param {Ability} ability - The defense ability to execute
 * @param {BattleCharacter} attacker - The character using the ability
 * @param {BattleState} state - Current battle state
 * @param {number} attackerIndex - Index of attacker in participants array
 * @returns {DefenseMoveResult} The execution result
 */
export function executeDefenseMove(
  ability: Ability,
  attacker: BattleCharacter,
  state: BattleState,
  attackerIndex: number
): DefenseMoveResult {
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
  
  // Initialize narrative service for enhanced storytelling
  const narrativeService = createNarrativeService();
  
  // Generate enhanced narrative based on battle state
  const target = newState.participants[1 - attackerIndex]; // Target is the other participant
  const context = {
    damage: 0,
    maxHealth: target.stats.power + target.stats.defense + target.stats.agility,
    isMiss: false,
    isCritical: false,
    isPatternBreak: false,
    isEscalation: false,
    consecutiveHits: 0,
    consecutiveMisses: 0,
    turnNumber: state.turn,
    characterState: 'fresh' as const,
    chi: attacker.resources.chi || 0
  };
  
  const defenseNarrative = narrativeService.generateNarrative(
    attacker.name,
    context,
    'hit',
    ability.name
  );
  
  let narrative: string;
  if (defenseNarrative) {
    narrative = defenseNarrative;
  } else {
    // Fallback to basic narrative if no enhanced narrative generated
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