import type { Ability } from '../../../../common/types';
import type { BattleCharacter } from '../../types';
import { determineTacticalPriority, getTacticalExplanation } from './tacticalAnalysis';

/**
 * @description Enhanced move scoring that considers tactical priorities and battle state
 * @param move - The ability being scored
 * @param self - The AI character
 * @param enemy - The opponent character
 * @param availableAbilities - All abilities that can be used this turn
 * @returns Scored move with reasoning
 */
export function scoreMoveWithTactics(
  move: Ability,
  self: BattleCharacter,
  enemy: BattleCharacter,
  availableAbilities: Ability[]
): { move: Ability; score: number; reasons: string[]; priority: string } {
  let score = 0;
  const reasons: string[] = [];
  
  // Get tactical priority for this situation
  const priority = determineTacticalPriority(self, enemy, availableAbilities);
  const tacticalExplanation = getTacticalExplanation(priority, self, enemy);
  reasons.push(`Tactical: ${tacticalExplanation}`);
  
  // Score based on tactical priority
  switch (priority) {
    case 'defend':
      if (move.type === 'defense_buff' || move.type === 'evade' || move.type === 'parry_retaliate') {
        score += 20;
        reasons.push('High priority: Critical defense needed');
      }
      if (move.tags?.includes('desperate')) {
        score += 15;
        reasons.push('Desperate move bonus for critical situation');
      }
      break;
      
    case 'finish':
      if (move.tags?.includes('high-damage')) {
        score += 25;
        reasons.push('Finisher move against vulnerable enemy');
      }
      if ((move.type === 'attack' || move.type === 'parry_retaliate') && move.power > 15) {
        score += 18;
        reasons.push('High damage attack to finish');
      }
      break;
      
    case 'pierce':
      if (move.tags?.includes('piercing')) {
        score += 22;
        reasons.push('Piercing attack against high defense');
      }
      if ((move.type === 'attack' || move.type === 'parry_retaliate') && move.power > 12) {
        score += 12;
        reasons.push('Strong attack to test defenses');
      }
      break;
      
    case 'heal':
      if (move.tags?.includes('healing')) {
        score += 18;
        reasons.push('Healing move when wounded');
      }
      if (move.type === 'defense_buff' && move.power > 20) {
        score += 15;
        reasons.push('Strong defense buff for safety');
      }
      break;
      
    case 'recover':
      if (move.type === 'defense_buff' && !move.chiCost) {
        score += 16;
        reasons.push('Free defense buff to conserve chi');
      }
      if (move.chiCost && move.chiCost <= 1) {
        score += 12;
        reasons.push('Low chi cost move for resource management');
      }
      break;
      
    case 'attack':
      if (move.type === 'attack' || move.type === 'parry_retaliate') {
        score += 10;
        reasons.push('Standard attack pressure');
      }
      if (move.power > 15) {
        score += 8;
        reasons.push('High damage attack');
      }
      break;
  }
  
  // Additional contextual bonuses
  if (move.tags?.includes('desperate') && self.currentHealth < 30) {
    score += 12;
    reasons.push('Desperate move bonus for low health');
  }
  
  if (move.tags?.includes('piercing') && enemy.currentDefense > 20) {
    score += 8;
    reasons.push('Piercing bonus against high defense');
  }
  
  if (move.tags?.includes('healing') && self.currentHealth < 40) {
    score += 10;
    reasons.push('Healing bonus when wounded');
  }
  
  // NEW: Defensive move scoring
  if (move.type === 'evade') {
    // High priority when health is low
    if (self.currentHealth < 40) {
      score += 25;
      reasons.push('High evade priority when health is low');
    }
    // Good when enemy is charging a powerful attack
    if (enemy.isCharging && enemy.chargeProgress && enemy.chargeProgress > 50) {
      score += 20;
      reasons.push('Evade to avoid charging enemy attack');
    }
    // Character-specific bonus for Aang
    if (self.name.toLowerCase().includes('aang')) {
      score += 15;
      reasons.push('Aang\'s natural evasive tendencies');
    }
  }
  
  if (move.type === 'parry_retaliate') {
    // High priority when health is low but want to counter
    if (self.currentHealth < 50) {
      score += 20;
      reasons.push('Parry-retaliate for defensive counter-attack');
    }
    // Good against predictable enemies
    if (enemy.moveHistory.length > 2) {
      const recentMoves = enemy.moveHistory.slice(-3);
      const isPredictable = recentMoves.every(move => move === recentMoves[0]);
      if (isPredictable) {
        score += 18;
        reasons.push('Parry-retaliate against predictable enemy');
      }
    }
    // Character-specific bonus for Azula
    if (self.name.toLowerCase().includes('azula')) {
      score += 15;
      reasons.push('Azula\'s aggressive counter-attack style');
    }
  }
  
  // Cooldown consideration
  if (self.cooldowns[move.name]) {
    score -= 15;
    reasons.push('Penalty: Move on cooldown');
  }
  
  // Uses remaining consideration
  const usesLeft = self.usesLeft[move.name] ?? (move.maxUses || Infinity);
  if (usesLeft <= 0) {
    score -= 25;
    reasons.push('Penalty: No uses remaining');
  } else if (usesLeft === 1 && move.maxUses) {
    score += 5; // Bonus for last use of limited move
    reasons.push('Bonus: Last use of limited move');
  }
  
  // Chi cost consideration
  if (move.chiCost && move.chiCost > (self.resources.chi || 0)) {
    score -= 20;
    reasons.push('Penalty: Cannot afford chi cost');
  }
  
  // Variety bonus (avoid repeating moves)
  if (self.lastMove === move.name) {
    score -= 8;
    reasons.push('Penalty: Repeated move');
  }
  
  return { move, score, reasons, priority };
}

/**
 * @description Selects the best move based on tactical scoring
 * @param availableAbilities - List of abilities that can be used
 * @param self - The AI character
 * @param enemy - The opponent character
 * @returns The best move with full tactical analysis
 */
export function selectBestTacticalMove(
  availableAbilities: Ability[],
  self: BattleCharacter,
  enemy: BattleCharacter
): { 
  chosenAbility: Ability; 
  score: number; 
  reasons: string[]; 
  priority: string;
  tacticalExplanation: string;
} {
  const scoredMoves = availableAbilities.map(ability => 
    scoreMoveWithTactics(ability, self, enemy, availableAbilities)
  );
  
  // Sort by score (highest first)
  scoredMoves.sort((a, b) => b.score - a.score);
  
  const bestMove = scoredMoves[0];
  const priority = determineTacticalPriority(self, enemy, availableAbilities);
  const tacticalExplanation = getTacticalExplanation(priority, self, enemy);
  
  return {
    chosenAbility: bestMove.move,
    score: bestMove.score,
    reasons: bestMove.reasons,
    priority,
    tacticalExplanation
  };
} 