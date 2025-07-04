// CONTEXT: Attack Move Service
// RESPONSIBILITY: Execute attack moves with enhanced narrative generation

import { BattleState, BattleCharacter, BattleLogEntry } from '../../types';
import { Ability } from '@/common/types';
import { Move } from '../../types/move.types';
import { convertAbilityToMove } from './moveConverter.service';
import { createBattleContext } from './battleContext.service';
import { resolveMove } from './moveLogic.service';
import { createNarrativeService } from '../narrative';

/**
 * @description Result of executing an attack move
 */
export interface AttackMoveResult {
  newState: BattleState;
  logEntry: BattleLogEntry;
  damage: number;
  result: string;
  narrative: string;
  isCritical: boolean;
}

/**
 * @description Executes an attack move and calculates damage using the new dramatic mechanics with enhanced narrative generation
 * @param {Ability} ability - The attack ability to execute
 * @param {BattleCharacter} attacker - The attacking character
 * @param {BattleCharacter} target - The target character
 * @param {BattleState} state - Current battle state
 * @param {number} targetIndex - Index of target in participants array
 * @returns {AttackMoveResult} The execution result
 */
export function executeAttackMove(
  ability: Ability,
  attacker: BattleCharacter,
  target: BattleCharacter,
  state: BattleState,
  targetIndex: number
): AttackMoveResult {
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
  
  // Initialize narrative service for enhanced storytelling
  const narrativeService = createNarrativeService();
  
  // Generate enhanced narrative for attack using new system
  const context = {
    damage: moveResult.damage,
    maxHealth: target.stats.power + target.stats.defense + target.stats.agility,
    isMiss: moveResult.damage === 0,
    isCritical: moveResult.wasCrit,
    isPatternBreak: attacker.flags?.forcedEscalation === 'true' && attacker.flags?.damageMultiplier === '2.0',
    isEscalation: attacker.flags?.forcedEscalation === 'true',
    consecutiveHits: 0,
    consecutiveMisses: 0,
    turnNumber: state.turn,
    characterState: (attacker.flags?.usedDesperation === true ? 'desperate' : 
                   attacker.currentHealth < 30 ? 'wounded' : 
                   attacker.currentHealth < 60 ? 'exhausted' : 'fresh') as 'fresh' | 'wounded' | 'exhausted' | 'desperate',
    chi: attacker.resources.chi || 0
  };
  
  // Generate enhanced narrative for attack
  const attackNarrative = narrativeService.generateNarrative(
    attacker.name,
    context,
    moveResult.damage === 0 ? 'miss' : moveResult.damage < 10 ? 'glance' : moveResult.damage < 25 ? 'hit' : 'devastating',
    ability.name
  );
  
  let narrative: string;
  if (attackNarrative && attackNarrative.trim()) {
    narrative = attackNarrative;
    console.log(`DEBUG: Enhanced attack narrative for ${attacker.name}: "${narrative}"`);
  } else {
    narrative = moveResult.narrative || `${attacker.name} uses ${ability.name} and deals ${moveResult.damage} damage!`;
    console.log(`DEBUG: Fallback attack narrative for ${attacker.name}: "${narrative}"`);
  }
  
  return {
    newState,
    logEntry: moveResult.logEntry,
    damage: moveResult.damage,
    result: moveResult.logEntry.result,
    narrative,
    isCritical: moveResult.wasCrit
  };
} 