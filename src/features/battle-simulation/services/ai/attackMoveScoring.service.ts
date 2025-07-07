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
  
  const netDamage = Math.max(1, move.power - (enemy.currentDefense || 0));
  score += netDamage * 2.5; // Base damage is highly valued
  
  if (move.appliesEffect?.type === 'BURN' || move.appliesEffect?.type === 'STUN') {
    score += 15;
  }
  
  // Intent-specific scoring
  switch (intent.type) {
    case 'go_for_finish':
      if (move.power > 10) score += 80;
      if (context.enemyVulnerable) score += 50;
      break;
    case 'break_defense':
      if (move.tags?.includes('piercing')) score += 100;
      break;
    case 'pressure_enemy':
      score += netDamage * 1.5;
      if (move.appliesEffect?.type === 'BURN') score += 20;
      break;
    case 'desperate_attack':
      score += move.power * 2;
      break;
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