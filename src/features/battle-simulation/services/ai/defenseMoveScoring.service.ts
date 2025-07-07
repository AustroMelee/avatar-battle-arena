// CONTEXT: Defense Move Scoring Service
// RESPONSIBILITY: Score defense moves based on context and intent

import { Ability } from '@/common/types';
import { BattleCharacter } from '../../types';
import { BattleTacticalContext } from './battleStateAwareness';
import { Intent } from './intentSystem';

/**
 * @description Scores a defense move based on context and intent
 * @param {Ability} move - The defense move to score
 * @param {BattleCharacter} self - The character using the move
 * @param {BattleCharacter} enemy - The enemy character
 * @param {BattleTacticalContext} context - The current battle context
 * @param {Intent} intent - The current tactical intent
 * @returns {number} The calculated score
 */
export function scoreDefenseMove(
  move: Ability,
  self: BattleCharacter,
  _enemy: BattleCharacter,
  context: BattleTacticalContext,
  intent: Intent
): number {
  let score = 0;
  
  // Base defense value
  score += (move.power || 0) * 1.5;
  
  // Status Effect Scoring
  // Value moves that apply defensive status effects
  if (move.appliesEffect) {
    score += 6; // Base bonus for applying effects
    
    // Extra value for defensive effects
    if (move.appliesEffect.type === 'DEFENSE_UP') {
      score += 8; // High value for defense buffs
    } else if (move.appliesEffect.type === 'HEAL_OVER_TIME') {
      score += 10; // Very high value for healing
    } else if (move.appliesEffect.type === 'ATTACK_UP') {
      score += 4; // Medium value for attack buffs
    }
    
    // Value longer duration effects
    if (move.appliesEffect.duration >= 3) {
      score += 4;
    }
  }
  
  // Value moves when we have negative effects
  const selfEffects = self.activeEffects;
  
  // High value when we have defense down
  if (selfEffects.some(e => e.type === 'DEFENSE_DOWN')) {
    score += 12;
    // Extra value for defense-up effects when we have defense down
    if (move.appliesEffect?.type === 'DEFENSE_UP') {
      score += 8;
    }
  }
  
  // Value when we have burn effects (need healing)
  if (selfEffects.some(e => e.type === 'BURN')) {
    score += 8;
    // Extra value for healing effects when burning
    if (move.appliesEffect?.type === 'HEAL_OVER_TIME') {
      score += 10;
    }
  }
  
  // Value when we have stun effects (need to recover)
  if (selfEffects.some(e => e.type === 'STUN')) {
    score += 6;
  }
  
  // Intent-specific scoring
  switch (intent.type) {
    case 'defend':
      score += 100;
      if (move.appliesEffect?.type === 'DEFENSE_UP') score += 50;
      break;
    case 'stall':
      score += 80;
      if (move.tags?.includes('rest')) score += 40;
      break;
    case 'restore_chi':
      if (move.tags?.includes('rest')) score += 120;
      break;
    case 'desperate_attack':
      score -= 50; // Penalize defensive moves during all-out attacks
      break;
  }
  
  // Context-specific bonuses
  if (context.healthPressure) {
    score += 30;
    // Extra value for healing when under health pressure
    if (move.appliesEffect?.type === 'HEAL_OVER_TIME') {
      score += 8;
    }
  }
  
  if (context.chiPressure) {
    score += 8;
    // Extra value for rest moves when under chi pressure
    if (move.tags?.includes('rest')) {
      score += 6;
    }
  }
  
  if (context.enemyDefenseStreak >= 3) {
    score += 4; // Less value when enemy is turtling
  }
  
  if (context.isLateGame) {
    score += 6; // More value for defense in late game
  }
  
  // Penalties for expensive defense moves when under pressure
  if (context.chiPressure && (move.chiCost || 0) > 2) {
    score -= 8;
  }
  
  return score;
}

/**
 * @description Gets scoring reasons for a defense move
 * @param {Ability} move - The defense move to analyze
 * @param {BattleCharacter} self - The character using the move
 * @param {BattleCharacter} enemy - The enemy character
 * @param {BattleTacticalContext} context - The current battle context
 * @param {Intent} intent - The current tactical intent
 * @returns {string[]} Array of scoring reasons
 */
export function getDefenseMoveScoringReasons(
  move: Ability,
  self: BattleCharacter,
  _enemy: BattleCharacter,
  _context: BattleTacticalContext,
  intent: Intent
): string[] {
  const reasons: string[] = [];
  
  reasons.push(`Base defense (${move.power || 0} defense)`);
  
  // Status effect reasons
  if (move.appliesEffect) {
    reasons.push(`Applies ${move.appliesEffect.type} effect`);
    if (move.appliesEffect.duration >= 3) {
      reasons.push(`Long duration effect (${move.appliesEffect.duration} turns)`);
    }
  }
  
  // Self effect reasons
  const selfEffects = self.activeEffects;
  if (selfEffects.some(e => e.type === 'DEFENSE_DOWN')) {
    reasons.push('We have reduced defense - need protection');
    if (move.appliesEffect?.type === 'DEFENSE_UP') {
      reasons.push('Defense-up effect counters our defense down');
    }
  }
  if (selfEffects.some(e => e.type === 'BURN')) {
    reasons.push('We are burning - need recovery');
    if (move.appliesEffect?.type === 'HEAL_OVER_TIME') {
      reasons.push('Healing effect counters our burn');
    }
  }
  if (selfEffects.some(e => e.type === 'STUN')) {
    reasons.push('We are stunned - need recovery');
  }
  
  // Intent-specific reasons
  switch (intent.type) {
    case 'defend':
      reasons.push('Defensive intent - prioritize protection');
      if (move.appliesEffect?.type === 'DEFENSE_UP') {
        reasons.push('Defense-up effect for defensive intent');
      }
      if (move.tags?.includes('healing')) {
        reasons.push('Healing effect for defensive intent');
      }
      break;
      
    case 'stall':
      reasons.push('Stalling intent - buy time');
      if (move.tags?.includes('rest')) {
        reasons.push('Rest effect for stalling');
      }
      if (move.appliesEffect?.type === 'HEAL_OVER_TIME') {
        reasons.push('Healing effect for stalling');
      }
      break;
      
    case 'restore_chi':
      reasons.push('Chi restoration intent');
      if (move.tags?.includes('rest')) {
        reasons.push('Rest effect for chi restoration');
      }
      break;
      
    case 'desperate_attack':
      reasons.push('Desperate situation - less value for defense');
      break;
  }
  
  return reasons;
}

/**
 * @description Gets context factors for a defense move
 * @param {Ability} move - The defense move to analyze
 * @param {BattleTacticalContext} context - The current battle context
 * @returns {string[]} Array of context factors
 */
export function getDefenseMoveContextFactors(
  move: Ability,
  context: BattleTacticalContext
): string[] {
  const factors: string[] = [];
  
  if (context.healthPressure) {
    factors.push('Under health pressure');
    if (move.appliesEffect?.type === 'HEAL_OVER_TIME') {
      factors.push('Healing effect needed for health pressure');
    }
  }
  
  if (context.chiPressure) {
    factors.push('Under chi pressure');
    if (move.tags?.includes('rest')) {
      factors.push('Rest effect needed for chi pressure');
    }
  }
  
  if (context.enemyDefenseStreak >= 3) {
    factors.push('Enemy turtling - less need for defense');
  }
  
  if (context.isLateGame) {
    factors.push('Late game - defense more valuable');
  }
  
  if (context.chiPressure && (move.chiCost || 0) > 2) {
    factors.push('Chi pressure - avoid expensive defense moves');
  }
  
  return factors;
} 