// CONTEXT: Contextual Move Scoring
// RESPONSIBILITY: Score moves based on battle context and tactical intent
import { Ability } from '@/common/types';
import { BattleCharacter } from '../../types';
import { BattleTacticalContext } from './battleStateAwareness';
import { Intent } from './intentSystem';

/**
 * @description Enhanced move score with detailed reasoning.
 */
export interface ContextualMoveScore {
  move: Ability;
  score: number;
  reasons: string[];
  contextFactors: string[];
  intentAlignment: number; // How well the move aligns with current intent (0-10)
}

/**
 * @description Scores a move based on battle context and tactical intent.
 * @param {Ability} move - The move to score.
 * @param {BattleCharacter} me - The character using the move.
 * @param {BattleCharacter} enemy - The enemy character.
 * @param {BattleTacticalContext} context - The current battle context.
 * @param {Intent} intent - The current tactical intent.
 * @returns {ContextualMoveScore} The scored move with detailed analysis.
 */
export function scoreMoveWithContext(
  move: Ability,
  me: BattleCharacter,
  enemy: BattleCharacter,
  context: BattleTacticalContext,
  intent: Intent
): ContextualMoveScore {
  let score = 0;
  const reasons: string[] = [];
  const contextFactors: string[] = [];
  let intentAlignment = 0;

  // Base scoring by move type
  if (move.type === 'attack') {
    score += scoreAttackMove(move, enemy, context, intent, reasons, contextFactors);
  } else if (move.type === 'defense_buff') {
    score += scoreDefenseMove(move, context, intent, reasons, contextFactors);
  }

  // Resource cost penalties
  if (move.chiCost && (me.resources.chi || 0) < move.chiCost) {
    score -= 15;
    reasons.push(`Cannot afford chi cost (${move.chiCost})`);
  }

  // Cooldown penalties
  if (me.cooldowns[move.name] && me.cooldowns[move.name] > 0) {
    score -= 20;
    reasons.push(`Move on cooldown (${me.cooldowns[move.name]} turns)`);
  }

  // Intent alignment scoring
  intentAlignment = calculateIntentAlignment(move, intent);
  score += intentAlignment * 2; // Intent alignment is very important

  // Context-specific bonuses
  score += calculateContextBonuses(move, context, contextFactors);

  // Small random nudge for unpredictability (reduced since we have sophisticated scoring)
  const randomNudge = (Math.random() - 0.5) * 1.5; // ±0.75 points
  score += randomNudge;
  if (Math.abs(randomNudge) > 0.3) {
    reasons.push(`Random nudge (${randomNudge > 0 ? '+' : ''}${randomNudge.toFixed(1)})`);
  }

  return {
    move,
    score: Math.max(0, score),
    reasons,
    contextFactors,
    intentAlignment
  };
}

/**
 * @description Scores an attack move based on context and intent.
 */
function scoreAttackMove(
  move: Ability,
  enemy: BattleCharacter,
  context: BattleTacticalContext,
  intent: Intent,
  reasons: string[],
  contextFactors: string[]
): number {
  let score = 0;
  
  // Base damage calculation
  const netDamage = Math.max(1, move.power - (enemy.currentDefense || 0));
  const damageRatio = netDamage / Math.max(1, enemy.currentHealth);
  
  score += netDamage * 0.8; // Base damage value
  reasons.push(`Base attack (${netDamage} damage)`);
  
  // Intent-specific scoring
  switch (intent.type) {
    case 'go_for_finish':
      if (move.power > 40) {
        score += 15;
        reasons.push('High power for finishing blow');
      }
      if (context.enemyVulnerable) {
        score += 8;
        reasons.push('Enemy vulnerable - perfect for finish');
      }
      break;
      
    case 'break_defense':
      if (move.tags?.includes('piercing')) {
        score += 12;
        reasons.push('Piercing move for defense breaking');
      }
      if (move.power > 30) {
        score += 6;
        reasons.push('High power for defense breaking');
      }
      break;
      
    case 'pressure_enemy':
      score += netDamage * 0.5;
      reasons.push('Pressure enemy with damage');
      break;
      
    case 'build_momentum':
      if (context.hasMomentum) {
        score += 5;
        reasons.push('Build on existing momentum');
      }
      break;
      
    case 'desperate_attack':
      score += move.power * 0.3; // Prioritize raw power
      reasons.push('Desperate situation - maximize damage');
      break;
      
    case 'counter_attack':
      if (context.enemyPattern === 'aggressive') {
        score += 4;
        reasons.push('Counter aggressive enemy');
      }
      break;
  }
  
  // Context-specific bonuses
  if (context.enemyVulnerable) {
    score += 12;
    contextFactors.push('Enemy vulnerable');
  }
  
  if (context.enemyDefenseStreak >= 3) {
    score += 8;
    contextFactors.push('Enemy turtling');
  }
  
  if (context.hasMomentum) {
    score += 5;
    contextFactors.push('We have momentum');
  }
  
  if (context.isLateGame && damageRatio > 0.3) {
    score += 8;
    contextFactors.push('Late game high damage');
  }
  
  // Desperate move bonuses
  if (context.healthPressure && move.tags?.includes('desperate')) {
    score += 15;
    contextFactors.push('Desperate situation - use desperate move');
  }
  
  // High damage move bonuses when enemy is weak
  if (context.enemyHealth < 30 && move.tags?.includes('high-damage')) {
    score += 12;
    contextFactors.push('Enemy is weak - finish them');
  }
  
  // Piercing move bonuses when enemy has high defense
  if (context.enemyDefense > 15 && move.tags?.includes('piercing')) {
    score += 10;
    contextFactors.push('Enemy has high defense - use piercing');
  }
  
  // Chi pressure penalties for expensive attacks
  if (context.chiPressure && (move.chiCost || 0) > 3) {
    score -= 8;
    contextFactors.push('Chi pressure - avoid expensive attacks');
  }
  
  return score;
}

/**
 * @description Scores a defense move based on context and intent.
 */
function scoreDefenseMove(
  move: Ability,
  context: BattleTacticalContext,
  intent: Intent,
  reasons: string[],
  contextFactors: string[]
): number {
  let score = 0;
  
  // Base defense value
  score += move.power * 0.6;
  reasons.push(`Base defense buff (${move.power} defense)`);
  
  // Intent-specific scoring
  switch (intent.type) {
    case 'defend':
      score += 12;
      reasons.push('Defensive intent - prioritize defense');
      break;
      
    case 'stall':
      score += 8;
      reasons.push('Stalling - build defense');
      break;
      
    case 'restore_chi':
      if ((move.chiCost || 0) === 0) {
        score += 6;
        reasons.push('Free defense while restoring chi');
      }
      break;
      
    case 'conservative_play':
      score += 4;
      reasons.push('Conservative play - build defense');
      break;
  }
  
  // Context-specific bonuses
  if (context.healthPressure) {
    score += 15;
    contextFactors.push('Low health - need defense');
  }
  
  if (context.enemyBurstThreat) {
    score += 12;
    contextFactors.push('Enemy has burst threat');
  }
  
  if (context.myDefense < 15) {
    score += 8;
    contextFactors.push('Low current defense');
  }
  
  if (context.enemyPattern === 'aggressive') {
    score += 6;
    contextFactors.push('Enemy is aggressive');
  }
  
  // Desperate defense bonuses
  if (context.healthPressure && move.tags?.includes('desperate')) {
    score += 20;
    contextFactors.push('Desperate situation - use desperate defense');
  }
  
  // Healing move bonuses
  if (context.healthPressure && move.tags?.includes('healing')) {
    score += 18;
    contextFactors.push('Low health - need healing');
  }
  
  // Chi pressure bonuses for free moves
  if (context.chiPressure && (move.chiCost || 0) === 0) {
    score += 15;
    contextFactors.push('Chi pressure - use free defense');
  }
  
  // Chi pressure penalties for expensive moves
  if (context.chiPressure && (move.chiCost || 0) > 3) {
    score -= 10;
    contextFactors.push('Chi pressure - avoid expensive moves');
  }
  
  return score;
}

/**
 * @description Calculates how well a move aligns with the current intent.
 */
function calculateIntentAlignment(move: Ability, intent: Intent): number {
  let alignment = 0;
  
  switch (intent.type) {
    case 'defend':
      if (move.type === 'defense_buff') alignment += 8;
      if (move.type === 'attack') alignment -= 3;
      break;
      
    case 'restore_chi':
      if ((move.chiCost || 0) === 0) alignment += 6;
      if ((move.chiCost || 0) > 2) alignment -= 4;
      break;
      
    case 'go_for_finish':
      if (move.type === 'attack' && move.power > 40) alignment += 8;
      if (move.type === 'defense_buff') alignment -= 5;
      break;
      
    case 'break_defense':
      if (move.tags?.includes('piercing')) alignment += 8;
      if (move.type === 'attack' && move.power > 30) alignment += 4;
      break;
      
    case 'pressure_enemy':
      if (move.type === 'attack') alignment += 6;
      if (move.type === 'defense_buff') alignment -= 2;
      break;
      
    case 'build_momentum':
      if (move.type === 'attack') alignment += 5;
      break;
      
    case 'desperate_attack':
      if (move.type === 'attack' && move.power > 30) alignment += 7;
      if (move.type === 'defense_buff') alignment -= 6;
      break;
      
    case 'counter_attack':
      if (move.type === 'attack') alignment += 4;
      break;
      
    case 'stall':
      if (move.type === 'defense_buff') alignment += 6;
      if (move.type === 'attack') alignment -= 2;
      break;
      
    case 'conservative_play':
      if (move.type === 'defense_buff') alignment += 4;
      if (move.type === 'attack' && move.power > 40) alignment -= 3;
      break;
      
    default:
      alignment = 3; // Neutral alignment for standard attacks
  }
  
  return Math.max(0, Math.min(10, alignment));
}

/**
 * @description Calculates context-specific bonuses for a move.
 */
function calculateContextBonuses(
  move: Ability,
  context: BattleTacticalContext,
  contextFactors: string[]
): number {
  let bonus = 0;
  
  // Game phase bonuses
  if (context.isEarlyGame && move.type === 'defense_buff') {
    bonus += 2;
    contextFactors.push('Early game defense building');
  }
  
  if (context.isLateGame && move.type === 'attack' && move.power > 35) {
    bonus += 3;
    contextFactors.push('Late game high damage');
  }
  
  // Pattern-based bonuses
  if (context.enemyPattern === 'defensive' && move.tags?.includes('piercing')) {
    bonus += 4;
    contextFactors.push('Counter defensive enemy');
  }
  
  if (context.myPattern === 'aggressive' && move.type === 'attack') {
    bonus += 2;
    contextFactors.push('Maintain aggressive pattern');
  }
  
  // Resource-based bonuses
  if (context.chiPressure && (move.chiCost || 0) === 0) {
    bonus += 3;
    contextFactors.push('Free move during chi pressure');
  }
  
  // Cooldown-based bonuses
  if (!context.myCooldownPressure && move.cooldown && move.cooldown > 0) {
    bonus += 1;
    contextFactors.push('No cooldown pressure');
  }
  
  return bonus;
}

/**
 * @description Scores multiple moves with context and returns them sorted.
 * @param {Ability[]} moves - The moves to score.
 * @param {BattleCharacter} me - The character using the moves.
 * @param {BattleCharacter} enemy - The enemy character.
 * @param {BattleContext} context - The current battle context.
 * @param {Intent} intent - The current tactical intent.
 * @returns {ContextualMoveScore[]} The scored moves sorted by score (highest first).
 */
export function scoreMovesWithContext(
  moves: Ability[],
  me: BattleCharacter,
  enemy: BattleCharacter,
  context: BattleTacticalContext,
  intent: Intent
): ContextualMoveScore[] {
  return moves
    .map(move => scoreMoveWithContext(move, me, enemy, context, intent))
    .sort((a, b) => b.score - a.score);
}

/**
 * @description Gets the top scoring moves with context.
 * @param {ContextualMoveScore[]} moveScores - The scored moves.
 * @param {number} count - Number of top moves to return.
 * @returns {ContextualMoveScore[]} The top scoring moves.
 */
export function getTopContextualMoves(moveScores: ContextualMoveScore[], count: number = 3): ContextualMoveScore[] {
  return moveScores.slice(0, count);
} 