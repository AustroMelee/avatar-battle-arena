import type { Move } from '../../types/move.types';
import type { BattleCharacter } from '../../types';
import { determineTacticalPriority, getTacticalExplanation } from './tacticalAnalysis';

/**
 * @description Enhanced move scoring that considers tactical priorities and battle state
 * @param move - The move being scored
 * @param self - The AI character
 * @param enemy - The opponent character
 * @param availableAbilities - All abilities that can be used this turn
 * @param stalemateCounter - NEW: Stalemate counter from tactical phase
 * @returns Scored move with reasoning
 */
export function scoreMoveWithTactics(
  move: Move,
  self: BattleCharacter,
  enemy: BattleCharacter,
  availableAbilities: Move[],
  stalemateCounter: number = 0 // NEW: Accept stalemateCounter
): { move: Move; score: number; reasons: string[]; priority: string } {
  let score = 0;
  const reasons: string[] = [];
  
  // Get tactical priority for this situation
  const priority = determineTacticalPriority(self, enemy, availableAbilities, stalemateCounter);
  const tacticalExplanation = getTacticalExplanation(priority, self, enemy);
  reasons.push(`Tactical: ${tacticalExplanation}`);
  
  // Base Score: Always add the move's power
  score += move.baseDamage;
  
  // NEW: Context-aware penalty for useless defensive moves
  // Use the same getLastMoveType logic as in tacticalAnalysis
  function getLastMoveType(character: BattleCharacter): 'attack' | 'defense' | 'other' {
    const lastMoveName = character.lastMove?.toLowerCase() || '';
    if (lastMoveName.includes('shield') || lastMoveName.includes('evasion') || lastMoveName.includes('glide') || lastMoveName.includes('jets')) {
      return 'defense';
    }
    if (lastMoveName.includes('strike') || lastMoveName.includes('fire') || lastMoveName.includes('slice') || lastMoveName.includes('blast')) {
      return 'attack';
    }
    return 'other';
  }
  const enemyLastMoveType = getLastMoveType(enemy);
  if (move.type === 'parry_retaliate' && enemyLastMoveType !== 'attack') {
    score -= 150; // Heavy penalty for using a counter when the enemy isn't attacking
    reasons.push('Penalty: Opponent is not attacking, counter is useless.');
  }
  
  // Score based on tactical priority
  switch (priority) {
    case 'gamble':
      if (move.isFinisher) {
        score += 200; // Extremely high priority for finishers
        reasons.push('High priority: Gamble with a finisher!');
      } else if (move.critChance && move.critChance > 0.15) {
        score += 80; // Prioritize high-crit moves
        reasons.push('High priority: Gamble on a critical hit!');
      } else if (move.baseDamage > 8) {
        score += 60; // Prioritize high-damage moves
        reasons.push('High priority: Gamble with a powerful attack!');
      } else {
        score += move.baseDamage; // Still prefer some damage
      }
      break;
      
    case 'defend':
      if (move.type === 'defense_buff' || move.type === 'evade' || move.type === 'parry_retaliate') {
        score += 80;
        reasons.push('High priority: Critical defense needed');
      }
      if (move.tags?.includes('desperate')) {
        score += 15;
        reasons.push('Desperate move bonus for critical situation');
      }
      break;
      
    case 'finish':
      if ((move.type === 'attack' || move.type === 'parry_retaliate') && move.baseDamage > 15) {
        score += 70;
        reasons.push('High damage attack to finish');
      }
      break;
      
    case 'pierce':
      // --- MODIFIED: Heavily penalize non-damaging moves when piercing is needed ---
      if (move.type === 'defense_buff' || move.type === 'evade') {
        score -= 200; // Massive penalty
        reasons.push('Penalty: A non-damaging move cannot pierce defenses.');
      } else if (typeof move.tags === 'object' && Array.isArray(move.tags) && move.tags.includes('piercing')) {
        score += 150; // Massive bonus
        reasons.push('High priority: Piercing move required!');
      } else if (move.type === 'attack') {
        score += move.baseDamage * 2; // Still prioritize any attack over a defensive move
        reasons.push('Prioritizing any attack to apply pressure.');
      }
      break;
      
    case 'heal':
      if (move.type === 'defense_buff' && move.baseDamage > 20) {
        score += 15;
        reasons.push('Strong defense buff for safety');
      }
      break;
      
    case 'recover':
      if (move.type === 'defense_buff' && !move.chiCost) {
        score += 60;
        reasons.push('Free defense buff to conserve chi');
      }
      if (move.chiCost && move.chiCost <= 1) {
        score += 12;
        reasons.push('Low chi cost move for resource management');
      }
      break;
      
    case 'attack':
      if (move.type === 'attack') { // Only give bonus to pure attacks
        score += 20;
        reasons.push('Standard attack pressure');
      }
      if (move.baseDamage > 15) {
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
  
  // Variety bonus (avoid repeating moves)
  if (self.lastMove === move.name) {
    score -= 10;
    reasons.push('Penalty: Repeated move');
  }
  
  // Universal Penalty for Basic Strike (unless it's the only option)
  if (move.name === 'Basic Strike' && availableAbilities.length > 1) {
    score -= 100;
    reasons.push('Penalty: Avoiding weak Basic Strike');
  }
  
  return { move, score, reasons, priority };
}

/**
 * @description Selects the best move based on tactical scoring
 * @param availableAbilities - List of moves that can be used
 * @param self - The AI character
 * @param enemy - The opponent character
 * @param stalemateCounter - NEW: Stalemate counter from tactical phase
 * @returns The best move with full tactical analysis
 */
export function selectBestTacticalMove(
  availableAbilities: Move[],
  self: BattleCharacter,
  enemy: BattleCharacter,
  stalemateCounter: number = 0 // NEW: Accept stalemateCounter
): { 
  chosenAbility: Move; 
  score: number; 
  reasons: string[]; 
  priority: string;
  tacticalExplanation: string;
} {
  if (availableAbilities.length === 0) {
    // This case should be handled by the caller, but as a safeguard:
    const basicStrike = self.abilities.find(a => a.name === 'Basic Strike')!;
    return {
      chosenAbility: basicStrike,
      score: 0,
      reasons: ['No other moves available'],
      priority: 'attack',
      tacticalExplanation: 'No other options, using Basic Strike.'
    };
  }

  const scoredMoves = availableAbilities.map(move =>
    scoreMoveWithTactics(move, self, enemy, availableAbilities, stalemateCounter)
  );
  
  // Sort by score (highest first)
  scoredMoves.sort((a, b) => b.score - a.score);
  
  const bestMove = scoredMoves[0];
  const priority = determineTacticalPriority(self, enemy, availableAbilities, stalemateCounter);
  const tacticalExplanation = getTacticalExplanation(priority, self, enemy);
  
  return {
    chosenAbility: bestMove.move,
    score: bestMove.score,
    reasons: bestMove.reasons,
    priority,
    tacticalExplanation
  };
}

// (Removed moveToAbility; all logic is now Move-centric)

// ... existing code ... 