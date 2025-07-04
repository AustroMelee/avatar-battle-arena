// CONTEXT: Contextual Move Scoring
// RESPONSIBILITY: Score moves based on battle context and tactical intent
import { Ability } from '@/common/types';
import { BattleCharacter } from '../../types';
import { BattleTacticalContext } from './battleStateAwareness';
import { Intent } from './intentSystem';
import { scoreAttackMove, getAttackMoveScoringReasons, getAttackMoveContextFactors } from './attackMoveScoring.service';
import { scoreDefenseMove, getDefenseMoveScoringReasons, getDefenseMoveContextFactors } from './defenseMoveScoring.service';
import { calculateIntentAlignment } from './intentAlignment.service';

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
    score += scoreAttackMove(move, enemy, context, intent);
    reasons.push(...getAttackMoveScoringReasons(move, enemy, context, intent));
    contextFactors.push(...getAttackMoveContextFactors(move, context));
  } else if (move.type === 'defense_buff') {
    score += scoreDefenseMove(move, context, intent);
    reasons.push(...getDefenseMoveScoringReasons(move, intent));
    contextFactors.push(...getDefenseMoveContextFactors(move, context));
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