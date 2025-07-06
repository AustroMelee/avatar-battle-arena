// CONTEXT: Defense Move Service
// RESPONSIBILITY: Execute defense moves with enhanced narrative generation

import { BattleState, BattleCharacter, BattleLogEntry } from '../../types';
import { Ability } from '@/common/types';
import { createEventId } from '../ai/logQueries';
import { createBattleContext } from './battleContext.service';
import { createNarrativeService } from '../narrative';
import { applyEffect, createStatusEffect } from '../effects/statusEffect.service';

/**
 * @description Result of executing a defense move
 */
export interface DefenseMoveResult {
  newState: BattleState;
  logEntry: BattleLogEntry;
  result: string;
  narrative: string;
  defenseBonus: number;
  damage: number;
  isCritical: boolean;
}

/**
 * @description Executes a defense move and applies defensive bonuses with enhanced narrative generation
 * @param {Ability} ability - The defense ability to execute
 * @param {BattleCharacter} attacker - The character using the ability
 * @param {BattleState} state - Current battle state
 * @param {number} attackerIndex - Index of attacker in participants array
 * @returns {Promise<DefenseMoveResult>} The execution result
 */
export async function executeDefenseMove(
  ability: Ability,
  attacker: BattleCharacter,
  state: BattleState,
  attackerIndex: number
): Promise<DefenseMoveResult> {
  const newState = { ...state };
  const newAttacker = { ...attacker };
  
  if (ability.type === 'evade') {
    newAttacker.activeDefense = { 
      type: 'evade', 
      sourceAbility: ability.name, 
      evadeChance: ability.power 
    };
    newAttacker.defensiveStance = 'evading';
  } else if (ability.type === 'parry_retaliate') {
    newAttacker.activeDefense = { 
      type: 'parry_retaliate', 
      sourceAbility: ability.name, 
      parryThreshold: ability.power 
    };
    newAttacker.defensiveStance = 'parrying';
  }
  
  const defenseBonus = ability.type === 'defense_buff' ? (ability.power || 0) : 0;
  if (ability.type === 'defense_buff') {
    newAttacker.currentDefense = Math.min(100, newAttacker.currentDefense + defenseBonus);
  }
  
  if (ability.appliesEffect) {
    const shouldApply = !ability.appliesEffect.chance || Math.random() < ability.appliesEffect.chance;
    
    if (shouldApply) {
      const statusEffect = createStatusEffect(
        ability.name,
        ability.appliesEffect,
        attacker.name
      );
      
      const updatedAttacker = applyEffect(newAttacker, statusEffect);
      newState.participants[attackerIndex] = updatedAttacker;
      
      console.log(`DEBUG: ${attacker.name} applied ${statusEffect.name} to self for ${statusEffect.duration} turns`);
    } else {
      newState.participants[attackerIndex] = newAttacker;
      console.log(`DEBUG: ${attacker.name}'s ${ability.name} failed to apply status effect (chance check failed)`);
    }
  } else {
    newState.participants[attackerIndex] = newAttacker;
  }
  
  const chiCost = ability.chiCost || 0;
  newState.participants[attackerIndex].resources.chi = Math.max(0, newState.participants[attackerIndex].resources.chi - chiCost);
  
  if (ability.cooldown && ability.cooldown > 0) {
    newState.participants[attackerIndex].cooldowns[ability.name] = ability.cooldown;
  }
  
  newState.participants[attackerIndex].lastMove = ability.name;
  newState.participants[attackerIndex].moveHistory.push(ability.name);
  
  const narrativeService = createNarrativeService();
  
  const target = newState.participants[1 - attackerIndex];
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
  
  const defenseNarrative = await narrativeService.generateNarrative(
    attacker.name,
    context,
    'hit',
    ability.name
  );
  
  let narrative: string;
  if (defenseNarrative) {
    narrative = defenseNarrative;
  } else {
    if (ability.type === 'evade') {
      narrative = `${attacker.name} is in the wind, anticipating an attack with ${ability.name}!`;
    } else if (ability.type === 'parry_retaliate') {
      narrative = `${attacker.name}'s gaze sharpens—she's waiting for a mistake with ${ability.name}!`;
    } else if (ability.tags?.includes('rest')) {
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
  
  if (ability.appliesEffect) {
    const effectInfo = ability.appliesEffect.type === 'HEAL_OVER_TIME' 
      ? ` and begins regenerating health over time`
      : ability.appliesEffect.type === 'DEFENSE_UP'
      ? ` and their defenses are bolstered`
      : ability.appliesEffect.type === 'ATTACK_UP'
      ? ` and their attack power increases`
      : ` and gains a ${ability.appliesEffect.type.toLowerCase().replace('_', ' ')} effect`;
    
    narrative += effectInfo;
  }
  
  let result: string;
  if (ability.type === 'evade') {
    result = `${attacker.name} uses ${ability.name} and enters an evasive stance!`;
  } else if (ability.type === 'parry_retaliate') {
    result = `${attacker.name} uses ${ability.name} and prepares to counter-attack!`;
  } else if (ability.appliesEffect) {
    result = `${attacker.name} uses ${ability.name} and gains ${defenseBonus} defense${ability.appliesEffect ? ` plus ${ability.appliesEffect.type.toLowerCase().replace('_', ' ')} effect` : ''}!`;
  } else {
    result = `${attacker.name} uses ${ability.name} and gains ${defenseBonus} defense!`;
  }
  
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
      resourceCost: ability.chiCost || 0,
      defenseBonus,
      statusEffect: ability.appliesEffect ? {
        type: ability.appliesEffect.type,
        duration: ability.appliesEffect.duration,
        potency: ability.appliesEffect.potency
      } : undefined,
      defensiveStance: ability.type === 'evade' || ability.type === 'parry_retaliate' ? ability.type : undefined
    }
  };
  
  return {
    newState,
    logEntry,
    result,
    narrative,
    defenseBonus,
    damage: 0,
    isCritical: false
  };
} 