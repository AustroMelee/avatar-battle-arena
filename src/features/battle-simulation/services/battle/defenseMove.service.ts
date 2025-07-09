// CONTEXT: Defense Move Service
// RESPONSIBILITY: Execute defense moves with enhanced narrative generation

import { BattleState, BattleCharacter, BattleLogEntry } from '../../types';
import type { Move } from '../../types/move.types';
import { createNarrativeService } from '../narrative';
import { applyEffect, createStatusEffect } from '../effects/statusEffect.service';
import { logStory } from '../utils/mechanicLogUtils';

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
 * @param {Move} move - The defense move to execute
 * @param {BattleCharacter} attacker - The character using the move
 * @param {BattleState} state - Current battle state
 * @param {number} attackerIndex - Index of attacker in participants array
 * @returns {Promise<DefenseMoveResult>} The execution result
 */
export async function executeDefenseMove(
  move: Move,
  attacker: BattleCharacter,
  state: BattleState,
  attackerIndex: number
): Promise<DefenseMoveResult> {
  const newState = { ...state };
  const newAttacker = { ...attacker };
  
  if (move.type === 'evade') {
    newAttacker.activeDefense = { 
      type: 'evade', 
      sourceAbility: move.name, 
      evadeChance: move.baseDamage 
    };
    newAttacker.defensiveStance = 'evading';
  } else if (move.type === 'parry_retaliate') {
    newAttacker.activeDefense = { 
      type: 'parry_retaliate', 
      sourceAbility: move.name, 
      parryThreshold: move.baseDamage 
    };
    newAttacker.defensiveStance = 'parrying';
  }
  
  const defenseBonus = move.type === 'defense_buff' ? (move.baseDamage || 0) : 0;
  if (move.type === 'defense_buff') {
    newAttacker.currentDefense = Math.min(100, newAttacker.currentDefense + defenseBonus);
  }
  
  if (move.appliesEffect) {
    const shouldApply = !move.appliesEffect.chance || Math.random() < move.appliesEffect.chance;
    
    if (shouldApply) {
      const statusEffect = createStatusEffect(
        move.name,
        move.appliesEffect,
        attacker.name,
        state.turn
      );
      
      const { updatedCharacter, logEntry } = applyEffect(newAttacker, statusEffect, state.turn);
      newState.participants[attackerIndex] = updatedCharacter;
      if (newState.battleLog) newState.battleLog.push(logEntry);
      
      console.log(`DEBUG: ${attacker.name} applied ${statusEffect.name} to self for ${statusEffect.duration} turns`);
    } else {
      newState.participants[attackerIndex] = newAttacker;
      console.log(`DEBUG: ${attacker.name}'s ${move.name} failed to apply status effect (chance check failed)`);
    }
  } else {
    newState.participants[attackerIndex] = newAttacker;
  }
  
  const chiCost = move.chiCost || 0;
  newState.participants[attackerIndex].resources.chi = Math.max(0, newState.participants[attackerIndex].resources.chi - chiCost);
  
  if (move.cooldown && move.cooldown > 0) {
    newState.participants[attackerIndex].cooldowns[move.name] = move.cooldown;
  }
  
  newState.participants[attackerIndex].lastMove = move.name;
  newState.participants[attackerIndex].moveHistory.push(move.name);
  
  const narrativeService = createNarrativeService();
  
  const target = newState.participants[1 - attackerIndex];
  const context = {
    damage: 0,
    maxHealth: target.base.stats.power + target.base.stats.defense + target.base.stats.agility,
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
    move.name
  );
  
  let narrative: string;
  if (defenseNarrative) {
    narrative = defenseNarrative;
  } else {
    if (move.type === 'evade') {
      narrative = `${attacker.name} is in the wind, anticipating an attack with ${move.name}!`;
    } else if (move.type === 'parry_retaliate') {
      narrative = `${attacker.name}'s gaze sharpens—she's waiting for a mistake with ${move.name}!`;
    } else if (move.tags?.includes('rest')) {
      narrative = `${attacker.name} (${attacker.resources.chi} chi) takes a moment to focus and recover their energy, preparing for the next exchange!`;
    } else if (move.tags?.includes('desperate') && attacker.currentHealth < 30) {
      narrative = `${attacker.name} (${attacker.currentHealth} HP) desperately activates ${move.name}, their aura flaring with renewed strength!`;
    } else if (move.tags?.includes('healing') && attacker.currentHealth < 40) {
      narrative = `${attacker.name} (${attacker.currentHealth} HP) channels healing energy through ${move.name}, feeling their wounds begin to close!`;
    } else if (attacker.currentHealth < 50) {
      narrative = `${attacker.name} focuses inward, strengthening their defenses with ${move.name} as they prepare for the next assault!`;
    } else if ((attacker.resources.chi || 0) < 3) {
      narrative = `${attacker.name} (${attacker.resources.chi} chi) conserves their dwindling energy with ${move.name}!`;
    } else if (attacker.currentDefense < attacker.base.stats.defense + 10) {
      narrative = `${attacker.name} senses vulnerability and strengthens their defenses with ${move.name}!`;
    } else {
      narrative = `${attacker.name} focuses inward, their aura strengthening as ${move.name} takes effect.`;
    }
  }
  
  if (move.appliesEffect) {
    const effectInfo = move.appliesEffect.type === 'HEAL_OVER_TIME' 
      ? ` and begins regenerating health over time`
      : move.appliesEffect.type === 'DEFENSE_UP'
      ? ` and their defenses are bolstered`
      : move.appliesEffect.type === 'ATTACK_UP'
      ? ` and their attack power increases`
      : ` and gains a ${move.appliesEffect.type.toLowerCase().replace('_', ' ')} effect`;
    
    narrative += effectInfo;
  }
  
  let result: string;
  if (move.type === 'evade') {
    result = `${attacker.name} uses ${move.name} and enters an evasive stance!`;
  } else if (move.type === 'parry_retaliate') {
    result = `${attacker.name} uses ${move.name} and prepares to counter-attack!`;
  } else if (move.appliesEffect) {
    result = `${attacker.name} uses ${move.name} and gains ${defenseBonus} defense${move.appliesEffect ? ` plus ${move.appliesEffect.type.toLowerCase().replace('_', ' ')} effect` : ''}!`;
  } else {
    result = `${attacker.name} uses ${move.name} and gains ${defenseBonus} defense!`;
  }
  
  const logEntry = logStory({
    turn: state.turn,
    narrative,
    target: attacker.name
  });
  
  return {
    newState,
    logEntry: ((): BattleLogEntry => {
      if (!logEntry) throw new Error('logEntry is null when assigning to DefenseMoveResult');
      return logEntry;
    })(),
    result,
    narrative,
    defenseBonus,
    damage: 0,
    isCritical: false
  };
} 