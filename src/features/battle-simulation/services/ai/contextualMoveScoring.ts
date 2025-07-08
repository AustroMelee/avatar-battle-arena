/*
 * @file contextualMoveScoring.ts
 * @description Provides context-aware move scoring logic for AI in the battle simulation.
 * @criticality 🧠 AI, Move Scoring
 * @owner AustroMelee
 * @lastUpdated 2025-07-08
 * @related moveUtils.ts, enhancedMoveScoring.ts
 */
// @file contextualMoveScoring.ts
// @description Scores moves for the AI based on battle context and tactical intent, integrating attack/defense scoring, intent alignment, and context bonuses.
// @criticality 🧠 AI Move Scoring (High) | Depends on: attackMoveScoring, defenseMoveScoring, intentAlignment, battleStateAwareness, intentSystem
// @owner AustroMelee
// @lastUpdated 2025-07-07
// @related attackMoveScoring.service.ts, defenseMoveScoring.service.ts, intentAlignment.service.ts, battleStateAwareness.ts, intentSystem.ts
//
// All exports are documented below.
// CONTEXT: Contextual Move Scoring
// RESPONSIBILITY: Score moves based on battle context and tactical intent
import type { Move } from '../../types/move.types';
import { BattleCharacter } from '../../types';
import { BattleTacticalContext } from './battleStateAwareness';
import { Intent } from './intentSystem';
import { scoreAttackMove, getAttackMoveScoringReasons, getAttackMoveContextFactors } from './attackMoveScoring.service';
import { scoreDefenseMove, getDefenseMoveScoringReasons, getDefenseMoveContextFactors } from './defenseMoveScoring.service';
import { calculateIntentAlignment } from './intentAlignment.service';

/**
 * @description Enhanced move score with detailed reasoning.
 * @exports ContextualMoveScore
 * @owner AustroMelee
 * @lastUpdated 2025-07-07
 */
export interface ContextualMoveScore {
  move: Move;
  score: number;
  reasons: string[];
  contextFactors: string[];
  intentAlignment: number; // How well the move aligns with current intent (0-10)
}

/**
 * @description Scores a move based on battle context and tactical intent.
 * @function scoreMoveWithContext
 * @param {Move} move - The move to score.
 * @param {BattleCharacter} me - The character using the move.
 * @param {BattleCharacter} enemy - The enemy character.
 * @param {BattleTacticalContext} context - The current battle context.
 * @param {Intent} intent - The current tactical intent.
 * @returns {ContextualMoveScore} The scored move with detailed analysis.
 * @owner AustroMelee
 * @lastUpdated 2025-07-07
 */
export function scoreMoveWithContext(
  move: Move,
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
  if (move.type === 'attack' || move.type === 'parry_retaliate') {
    score += scoreAttackMove(move, enemy, context, intent);
    reasons.push(...getAttackMoveScoringReasons(move, enemy, context, intent));
    contextFactors.push(...getAttackMoveContextFactors(move, context));
  } else if (move.type === 'defense_buff' || move.type === 'evade') {
    score += scoreDefenseMove(move, me, enemy, context, intent);
    reasons.push(...getDefenseMoveScoringReasons(move, me, enemy, context, intent));
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

  // --- STATUS FLAG LOGIC: Penalize attacks if enemy is evasive ---
  const enemyIsEvasive = Array.isArray(enemy.statusFlags) && enemy.statusFlags.some(flag => flag.type === 'Evasive' && flag.turns > 0);
  if (enemyIsEvasive) {
    if (move.type === 'attack' && !(move.tags && (move.tags.includes('aoe') || move.tags.includes('tracking')))) {
      score -= 30;
      reasons.push('Penalty: Opponent is evasive, standard attacks likely to miss.');
    }
    if (move.tags && (move.tags.includes('aoe') || move.tags.includes('tracking'))) {
      score += 20;
      reasons.push('Bonus: AoE or tracking move counters evasive opponent.');
    }
    if (move.tags && move.tags.includes('gather')) {
      score += 15;
      reasons.push('Bonus: Gathering power is a smart response to evasive opponent.');
    }
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
  move: Move,
  context: BattleTacticalContext,
  contextFactors: string[]
): number {
  let bonus = 0;
  
  // Game phase bonuses
  if (context.isEarlyGame && (move.type === 'defense_buff' || move.type === 'evade')) {
    bonus += 2;
    contextFactors.push('Early game defense building');
  }
  
  if (context.isLateGame && (move.type === 'attack' || move.type === 'parry_retaliate') && move.baseDamage > 35) {
    bonus += 3;
    contextFactors.push('Late game high damage');
  }
  
  // Pattern-based bonuses
  if (context.enemyPattern === 'defensive' && move.tags?.includes('piercing')) {
    bonus += 4;
    contextFactors.push('Counter defensive enemy');
  }
  
  if (context.myPattern === 'aggressive' && (move.type === 'attack' || move.type === 'parry_retaliate')) {
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
 * @function scoreMovesWithContext
 * @param {Move[]} moves - The moves to score.
 * @param {BattleCharacter} me - The character using the moves.
 * @param {BattleCharacter} enemy - The enemy character.
 * @param {BattleTacticalContext} context - The current battle context.
 * @param {Intent} intent - The current tactical intent.
 * @returns {ContextualMoveScore[]} The scored moves sorted by score (highest first).
 * @owner AustroMelee
 * @lastUpdated 2025-07-07
 */
export function scoreMovesWithContext(
  moves: Move[],
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
 * @function getTopContextualMoves
 * @param {ContextualMoveScore[]} moveScores - The scored moves.
 * @param {number} count - Number of top moves to return.
 * @returns {ContextualMoveScore[]} The top scoring moves.
 * @owner AustroMelee
 * @lastUpdated 2025-07-07
 */
export function getTopContextualMoves(moveScores: ContextualMoveScore[], count: number = 3): ContextualMoveScore[] {
  return moveScores.slice(0, count);
} 