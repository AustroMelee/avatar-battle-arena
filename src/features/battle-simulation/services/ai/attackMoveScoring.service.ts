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
  
  // Status Effect Scoring
  // Value moves that apply status effects
  if (move.appliesEffect) {
    score += 8; // Base bonus for applying effects
    
    // Extra value for powerful effects
    if (move.appliesEffect.type === 'BURN' || move.appliesEffect.type === 'STUN') {
      score += 6; // High value for damage-over-time or crowd control
    } else if (move.appliesEffect.type === 'DEFENSE_DOWN') {
      score += 4; // Medium value for defense reduction
    }
    
    // Value longer duration effects
    if (move.appliesEffect.duration >= 3) {
      score += 3;
    }
  }
  
  // Value moves against targets with specific effects
  const enemyEffects = enemy.activeEffects;
  
  // High value against stunned enemies
  if (enemyEffects.some(e => e.type === 'STUN')) {
    score += 12;
  }
  
  // Value against enemies with defense down
  if (enemyEffects.some(e => e.type === 'DEFENSE_DOWN')) {
    score += 8;
  }
  
  // Value against enemies with attack up (they're more dangerous, prioritize them)
  if (enemyEffects.some(e => e.type === 'ATTACK_UP')) {
    score += 6;
  }
  
  // Intent-specific scoring
  switch (intent.type) {
    case 'go_for_finish':
      if (move.power > 40) {
        score += 15;
      }
      if (context.enemyVulnerable) {
        score += 8;
      }
      // Extra value for status effects when finishing
      if (move.appliesEffect) {
        score += 4;
      }
      break;
      
    case 'break_defense':
      if (move.tags?.includes('piercing')) {
        score += 12;
      }
      if (move.power > 30) {
        score += 6;
      }
      // Value defense-down effects for breaking defense
      if (move.appliesEffect?.type === 'DEFENSE_DOWN') {
        score += 8;
      }
      break;
      
    case 'pressure_enemy':
      score += netDamage * 0.5;
      // Value damage-over-time effects for pressure
      if (move.appliesEffect?.type === 'BURN') {
        score += 6;
      }
      break;
      
    case 'build_momentum':
      if (context.hasMomentum) {
        score += 5;
      }
      // Value any status effect for momentum building
      if (move.appliesEffect) {
        score += 3;
      }
      break;
      
    case 'desperate_attack':
      score += move.power * 0.3; // Prioritize raw power
      // Value stun effects in desperate situations
      if (move.appliesEffect?.type === 'STUN') {
        score += 8;
      }
      break;
      
    case 'counter_attack':
      if (context.enemyPattern === 'aggressive') {
        score += 4;
      }
      // Value defense-down effects for counter-attacking
      if (move.appliesEffect?.type === 'DEFENSE_DOWN') {
        score += 6;
      }
      break;
  }
  
  // Context-specific bonuses
  if (context.enemyVulnerable) {
    score += 12;
  }
  
  if (context.enemyDefenseStreak >= 3) {
    score += 8;
    // Extra value for defense-down effects against turtling enemies
    if (move.appliesEffect?.type === 'DEFENSE_DOWN') {
      score += 6;
    }
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
  
  // Status effect reasons
  if (move.appliesEffect) {
    reasons.push(`Applies ${move.appliesEffect.type} effect`);
    if (move.appliesEffect.duration >= 3) {
      reasons.push(`Long duration effect (${move.appliesEffect.duration} turns)`);
    }
  }
  
  // Enemy effect reasons
  const enemyEffects = enemy.activeEffects;
  if (enemyEffects.some(e => e.type === 'STUN')) {
    reasons.push('Enemy is stunned - perfect opportunity');
  }
  if (enemyEffects.some(e => e.type === 'DEFENSE_DOWN')) {
    reasons.push('Enemy has reduced defense');
  }
  if (enemyEffects.some(e => e.type === 'ATTACK_UP')) {
    reasons.push('Enemy has attack buff - prioritize them');
  }
  
  // Intent-specific reasons
  switch (intent.type) {
    case 'go_for_finish':
      if (move.power > 40) {
        reasons.push('High power for finishing blow');
      }
      if (context.enemyVulnerable) {
        reasons.push('Enemy vulnerable - perfect for finish');
      }
      if (move.appliesEffect) {
        reasons.push('Status effect helps secure the finish');
      }
      break;
      
    case 'break_defense':
      if (move.tags?.includes('piercing')) {
        reasons.push('Piercing move for defense breaking');
      }
      if (move.power > 30) {
        reasons.push('High power for defense breaking');
      }
      if (move.appliesEffect?.type === 'DEFENSE_DOWN') {
        reasons.push('Defense-down effect for breaking defense');
      }
      break;
      
    case 'pressure_enemy':
      reasons.push('Pressure enemy with damage');
      if (move.appliesEffect?.type === 'BURN') {
        reasons.push('Burn effect for sustained pressure');
      }
      break;
      
    case 'build_momentum':
      if (context.hasMomentum) {
        reasons.push('Build on existing momentum');
      }
      if (move.appliesEffect) {
        reasons.push('Status effect builds momentum');
      }
      break;
      
    case 'desperate_attack':
      reasons.push('Desperate situation - maximize damage');
      if (move.appliesEffect?.type === 'STUN') {
        reasons.push('Stun effect for desperate situation');
      }
      break;
      
    case 'counter_attack':
      if (context.enemyPattern === 'aggressive') {
        reasons.push('Counter aggressive enemy');
      }
      if (move.appliesEffect?.type === 'DEFENSE_DOWN') {
        reasons.push('Defense-down effect for counter-attacking');
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
    if (move.appliesEffect?.type === 'DEFENSE_DOWN') {
      factors.push('Defense-down effect against turtling enemy');
    }
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