// CONTEXT: AI Move Scoring
// RESPONSIBILITY: Score moves based on state and meta-state
import { BattleCharacter } from '../../types';
import type { Move } from '../../types/move.types';
import { MetaState } from './metaState';

export interface MoveScore {
  move: Move;
  score: number;
  reasons: string[];
}

/**
 * @description Scores a move based on current battle state and meta-state.
 * @param {Move} move - The move to score.
 * @param {BattleCharacter} character - The character using the move.
 * @param {BattleCharacter} enemy - The enemy character.
 * @param {MetaState} meta - The current meta-state.
 * @returns {MoveScore} The scored move with reasons.
 */
export function scoreMove(
  move: Move, 
  character: BattleCharacter, 
  enemy: BattleCharacter, 
  meta: MetaState
): MoveScore {
  let score = 0;
  const reasons: string[] = [];
  
  // Base scoring by move type
  switch (move.type) {
    case 'attack': {
      const potentialDamage = Math.max(1, move.baseDamage - enemy.currentDefense);
      const damageRatio = potentialDamage / enemy.currentHealth;
      score = damageRatio * 8 + Math.random() * 2;
      reasons.push(`Base attack (${potentialDamage} damage)`);
      break;
    }
      
    case 'defense_buff': {
      if (character.currentHealth < 25) {
        score = 12;
        reasons.push('Low health - defensive priority');
      } else if (character.currentDefense > 100) {
        score = 2;
        reasons.push('Over-defended - low priority');
      } else {
        score = 6;
        reasons.push('Moderate defense buff');
      }
      break;
    }
      
    default:
      score = 5 + Math.random() * 3;
      reasons.push(`Standard ${move.type} move`);
  }
  
  // HARD GATING BONUSES - Reward moves that survived hard gating
  if (meta.stuckLoop) {
    score += 15; // Bonus for breaking pattern
    reasons.push('HARD PATTERN BREAK: Forced variety');
  }
  
  if (meta.escalationNeeded) {
    score += 20; // Bonus for escalation
    reasons.push('HARD ESCALATION: Forced dramatic action');
  }
  
  if (meta.finishingTime) {
    score += 25; // Bonus for finishing
    reasons.push('HARD FINISHER: Forced decisive blow');
  }
  
  if (meta.desperate) {
    score += 18; // Bonus for desperation
    reasons.push('HARD DESPERATION: Forced high-damage');
  }
  
  if (meta.timeoutPressure) {
    score += 22; // Bonus for timeout pressure
    reasons.push('HARD TIMEOUT: Forced maximum damage');
  }
  
  if (meta.stalemate) {
    score += 16; // Bonus for stalemate breaking
    reasons.push('HARD STALEMATE: Forced piercing action');
  }
  
  if (meta.bored) {
    score += 12; // Bonus for variety
    reasons.push('HARD BOREDOM: Forced variety');
  }
  
  if (meta.frustrated) {
    score += 14; // Bonus for aggression
    reasons.push('HARD FRUSTRATION: Forced aggression');
  }
  
  // Random unpredictability (reduced since we have hard gating)
  const randomNudge = (Math.random() - 0.5) * 2; // ±1 point
  score += randomNudge;
  if (Math.abs(randomNudge) > 0.3) {
    reasons.push(`Random nudge (${randomNudge > 0 ? '+' : ''}${randomNudge.toFixed(1)})`);
  }
  
  return { move, score: Math.max(0, score), reasons };
}

/**
 * @description Scores multiple moves and returns them sorted by score.
 * @param {Move[]} moves - The moves to score.
 * @param {BattleCharacter} character - The character using the moves.
 * @param {BattleCharacter} enemy - The enemy character.
 * @param {MetaState} meta - The current meta-state.
 * @param {number} turn - Current turn number.
 * @returns {MoveScore[]} The scored moves sorted by score (highest first).
 */
export function scoreMoves(
  moves: Move[],
  character: BattleCharacter,
  enemy: BattleCharacter,
  meta: MetaState
): MoveScore[] {
  return moves
    .map(move => scoreMove(move, character, enemy, meta))
    .sort((a, b) => b.score - a.score);
}

/**
 * @description Gets the top scoring moves.
 * @param {MoveScore[]} moveScores - The scored moves.
 * @param {number} count - Number of top moves to return.
 * @returns {MoveScore[]} The top scoring moves.
 */
export function getTopMoves(moveScores: MoveScore[], count: number = 3): MoveScore[] {
  return moveScores.slice(0, count);
} 