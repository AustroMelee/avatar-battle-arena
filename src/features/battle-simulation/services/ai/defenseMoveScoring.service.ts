// CONTEXT: Defense Move Scoring Service
// RESPONSIBILITY: Score defense moves based on context and intent

import { Ability } from '@/common/types';
import { BattleTacticalContext } from './battleStateAwareness';
import { Intent } from './intentSystem';

/**
 * @description Scores a defense move based on context and intent
 * @param {Ability} move - The defense move to score
 * @param {BattleTacticalContext} context - The current battle context
 * @param {Intent} intent - The current tactical intent
 * @returns {number} The calculated score
 */
export function scoreDefenseMove(
  move: Ability,
  context: BattleTacticalContext,
  intent: Intent
): number {
  let score = 0;
  
  // Base defense value
  score += move.power * 0.6; // Defense moves are generally less valuable than attacks
  
  // Intent-specific scoring
  switch (intent.type) {
    case 'defend':
      score += move.power * 0.8; // High value for defense
      if (move.tags?.includes('healing')) {
        score += 10;
      }
      break;
      
    case 'stall':
      score += move.power * 0.7;
      if (move.tags?.includes('rest')) {
        score += 5;
      }
      break;
      
    case 'counter_attack':
      if (move.tags?.includes('counter')) {
        score += 8;
      }
      break;
      
    case 'desperate_attack':
      // Defense moves are less valuable for desperate attacks
      score *= 0.3;
      break;
      
    case 'restore_chi':
      if (move.tags?.includes('rest') || move.tags?.includes('healing')) {
        score += 15;
      }
      break;
      
    case 'pressure_enemy':
      // Defense moves are less valuable for pressure
      score *= 0.5;
      break;
      
    case 'go_for_finish':
      // Defense moves are counterproductive for finishing
      score *= 0.3;
      break;
  }
  
  // Context-specific bonuses
  if (context.healthPressure) {
    score += 12;
  }
  
  if (context.enemyPattern === 'aggressive') {
    score += 8;
  }
  
  if (context.chiPressure && (move.chiCost || 0) <= 2) {
    score += 6;
  }
  
  if (context.isLateGame && context.healthPressure) {
    score += 10;
  }
  
  // Rest move bonuses when low on chi
  if (context.chiPressure && move.tags?.includes('rest')) {
    score += 8;
  }
  
  // Healing move bonuses when health is low
  if (context.healthPressure && move.tags?.includes('healing')) {
    score += 12;
  }
  
  // Desperate defense bonuses
  if (context.healthPressure && move.tags?.includes('desperate')) {
    score += 15;
  }
  
  // Counter-attack bonuses when enemy is aggressive
  if (context.enemyPattern === 'aggressive' && move.tags?.includes('counter')) {
    score += 10;
  }
  
  return score;
}

/**
 * @description Gets scoring reasons for a defense move
 * @param {Ability} move - The defense move to analyze
 * @param {Intent} intent - The current tactical intent
 * @returns {string[]} Array of scoring reasons
 */
export function getDefenseMoveScoringReasons(
  move: Ability,
  intent: Intent
): string[] {
  const reasons: string[] = [];
  
  reasons.push(`Base defense (${move.power} bonus)`);
  
  // Intent-specific reasons
  switch (intent.type) {
    case 'defend':
      reasons.push('High value for defense');
      if (move.tags?.includes('healing')) {
        reasons.push('Healing bonus for defense');
      }
      break;
      
    case 'stall':
      reasons.push('Build defensive advantage');
      if (move.tags?.includes('rest')) {
        reasons.push('Rest bonus for defense building');
      }
      break;
      
    case 'counter_attack':
      if (move.tags?.includes('counter')) {
        reasons.push('Counter-attack setup');
      }
      break;
      
    case 'desperate_attack':
      reasons.push('Defense less valuable for desperate attacks');
      break;
      
    case 'restore_chi':
      if (move.tags?.includes('rest') || move.tags?.includes('healing')) {
        reasons.push('Recovery move bonus');
      }
      break;
      
    case 'pressure_enemy':
      reasons.push('Defense less valuable for pressure');
      break;
      
    case 'go_for_finish':
      reasons.push('Defense counterproductive for finish');
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
    factors.push('Health pressure - need defense');
  }
  
  if (context.enemyPattern === 'aggressive') {
    factors.push('Enemy aggressive - need defense');
  }
  
  if (context.chiPressure && (move.chiCost || 0) <= 2) {
    factors.push('Chi pressure - cheap defense');
  }
  
  if (context.isLateGame && context.healthPressure) {
    factors.push('Late game survival');
  }
  
  if (context.chiPressure && move.tags?.includes('rest')) {
    factors.push('Chi pressure - rest move');
  }
  
  if (context.healthPressure && move.tags?.includes('healing')) {
    factors.push('Health pressure - healing move');
  }
  
  if (context.healthPressure && move.tags?.includes('desperate')) {
    factors.push('Health pressure - desperate defense');
  }
  
  if (context.enemyPattern === 'aggressive' && move.tags?.includes('counter')) {
    factors.push('Enemy aggressive - counter setup');
  }
  
  return factors;
} 