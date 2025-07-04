// CONTEXT: Attack Move Scoring Service
// RESPONSIBILITY: Score attack moves based on context and intent

import { Ability } from '@/common/types';
import { BattleCharacter } from '../../types';
import { BattleTacticalContext } from './battleStateAwareness';
import { Intent } from './intentSystem';

/**
 * @description Scores an attack move based on context and intent
 * @param {Ability} move - The attack move to score
 * @param {BattleCharacter} enemy - The enemy character
 * @param {BattleTacticalContext} context - The current battle context
 * @param {Intent} intent - The current tactical intent
 * @returns {number} The calculated score
 */
export function scoreAttackMove(
  move: Ability,
  enemy: BattleCharacter,
  context: BattleTacticalContext,
  intent: Intent
): number {
  let score = 0;
  
  // Base damage calculation
  const netDamage = Math.max(1, move.power - (enemy.currentDefense || 0));
  const damageRatio = netDamage / Math.max(1, enemy.currentHealth);
  
  score += netDamage * 0.8; // Base damage value
  
  // Intent-specific scoring
  switch (intent.type) {
    case 'go_for_finish':
      if (move.power > 40) {
        score += 15;
      }
      if (context.enemyVulnerable) {
        score += 8;
      }
      break;
      
    case 'break_defense':
      if (move.tags?.includes('piercing')) {
        score += 12;
      }
      if (move.power > 30) {
        score += 6;
      }
      break;
      
    case 'pressure_enemy':
      score += netDamage * 0.5;
      break;
      
    case 'build_momentum':
      if (context.hasMomentum) {
        score += 5;
      }
      break;
      
    case 'desperate_attack':
      score += move.power * 0.3; // Prioritize raw power
      break;
      
    case 'counter_attack':
      if (context.enemyPattern === 'aggressive') {
        score += 4;
      }
      break;
  }
  
  // Context-specific bonuses
  if (context.enemyVulnerable) {
    score += 12;
  }
  
  if (context.enemyDefenseStreak >= 3) {
    score += 8;
  }
  
  if (context.hasMomentum) {
    score += 5;
  }
  
  if (context.isLateGame && damageRatio > 0.3) {
    score += 8;
  }
  
  // Desperate move bonuses
  if (context.healthPressure && move.tags?.includes('desperate')) {
    score += 15;
  }
  
  // High damage move bonuses when enemy is weak
  if (context.enemyHealth < 30 && move.tags?.includes('high-damage')) {
    score += 12;
  }
  
  // Piercing move bonuses when enemy has high defense
  if (context.enemyDefense > 15 && move.tags?.includes('piercing')) {
    score += 10;
  }
  
  // Chi pressure penalties for expensive attacks
  if (context.chiPressure && (move.chiCost || 0) > 3) {
    score -= 8;
  }
  
  return score;
}

/**
 * @description Gets scoring reasons for an attack move
 * @param {Ability} move - The attack move to analyze
 * @param {BattleCharacter} enemy - The enemy character
 * @param {BattleTacticalContext} context - The current battle context
 * @param {Intent} intent - The current tactical intent
 * @returns {string[]} Array of scoring reasons
 */
export function getAttackMoveScoringReasons(
  move: Ability,
  enemy: BattleCharacter,
  context: BattleTacticalContext,
  intent: Intent
): string[] {
  const reasons: string[] = [];
  
  const netDamage = Math.max(1, move.power - (enemy.currentDefense || 0));
  reasons.push(`Base attack (${netDamage} damage)`);
  
  // Intent-specific reasons
  switch (intent.type) {
    case 'go_for_finish':
      if (move.power > 40) {
        reasons.push('High power for finishing blow');
      }
      if (context.enemyVulnerable) {
        reasons.push('Enemy vulnerable - perfect for finish');
      }
      break;
      
    case 'break_defense':
      if (move.tags?.includes('piercing')) {
        reasons.push('Piercing move for defense breaking');
      }
      if (move.power > 30) {
        reasons.push('High power for defense breaking');
      }
      break;
      
    case 'pressure_enemy':
      reasons.push('Pressure enemy with damage');
      break;
      
    case 'build_momentum':
      if (context.hasMomentum) {
        reasons.push('Build on existing momentum');
      }
      break;
      
    case 'desperate_attack':
      reasons.push('Desperate situation - maximize damage');
      break;
      
    case 'counter_attack':
      if (context.enemyPattern === 'aggressive') {
        reasons.push('Counter aggressive enemy');
      }
      break;
  }
  
  return reasons;
}

/**
 * @description Gets context factors for an attack move
 * @param {Ability} move - The attack move to analyze
 * @param {BattleTacticalContext} context - The current battle context
 * @returns {string[]} Array of context factors
 */
export function getAttackMoveContextFactors(
  move: Ability,
  context: BattleTacticalContext
): string[] {
  const factors: string[] = [];
  
  if (context.enemyVulnerable) {
    factors.push('Enemy vulnerable');
  }
  
  if (context.enemyDefenseStreak >= 3) {
    factors.push('Enemy turtling');
  }
  
  if (context.hasMomentum) {
    factors.push('We have momentum');
  }
  
  if (context.isLateGame) {
    factors.push('Late game high damage');
  }
  
  if (context.healthPressure && move.tags?.includes('desperate')) {
    factors.push('Desperate situation - use desperate move');
  }
  
  if (context.enemyHealth < 30 && move.tags?.includes('high-damage')) {
    factors.push('Enemy is weak - finish them');
  }
  
  if (context.enemyDefense > 15 && move.tags?.includes('piercing')) {
    factors.push('Enemy has high defense - use piercing');
  }
  
  if (context.chiPressure && (move.chiCost || 0) > 3) {
    factors.push('Chi pressure - avoid expensive attacks');
  }
  
  return factors;
} 