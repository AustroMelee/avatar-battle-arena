// CONTEXT: Tactical AI Decision Making
// RESPONSIBILITY: AI that considers positioning, charge-ups, and environmental factors

import { BattleCharacter } from '../../types';
import { Move, getLocationType } from '../../types/move.types';
import { canUseMove, applyPositionBonuses } from '../battle/positioningMechanics.service';

/**
 * @description Enhanced AI move selection with tactical awareness.
 */
export function selectTacticalMove(
  self: BattleCharacter,
  enemy: BattleCharacter,
  availableMoves: Move[],
  location: string
): { move: Move; reasoning: string; tacticalAnalysis: string } {
  const locationType = getLocationType(location);
  const isAirbender = self.name.toLowerCase().includes('aang');
  const isFirebender = self.name.toLowerCase().includes('azula');
  
  // Filter moves that can be used
  const usableMoves = availableMoves.filter(move => 
    canUseMove(move, self, enemy, location)
  );
  
  if (usableMoves.length === 0) {
    // Fallback to basic moves if no tactical moves available
    const basicMoves = availableMoves.filter(move => 
      move.chiCost === 0 && !move.isChargeUp && !move.changesPosition
    );
    return {
      move: basicMoves[0] || availableMoves[0],
      reasoning: "No tactical options available, using basic move",
      tacticalAnalysis: "Limited by environmental constraints or position requirements"
    };
  }
  
  // Score each move based on tactical considerations
  const scoredMoves = usableMoves.map(move => {
    let score = 0;
    let reasoning = "";
    const tacticalFactors: string[] = [];
    
    // 0. ESCALATION AWARENESS - Highest priority when forced escalation is active
    if (self.flags?.forcedEscalation === 'true') {
      score += 200; // Massive priority boost during escalation
      reasoning += "FORCED ESCALATION - ALL OUT ATTACK! ";
      tacticalFactors.push("Forced Escalation");
      
      // Prioritize high-damage moves during escalation
      if (move.baseDamage >= 5) {
        score += 100;
        reasoning += "High damage move for escalation! ";
        tacticalFactors.push("Escalation Damage");
      }
      
      // Avoid repositioning during escalation unless forced
      if (move.changesPosition === "repositioning" && !self.flags?.repositionDisabled) {
        score -= 100;
        reasoning += "No time for repositioning during escalation! ";
        tacticalFactors.push("Escalation Focus");
      }
    }
    
    // 1. PUNISH OPPORTUNITIES (Highest Priority)
    if (enemy.isCharging || enemy.position === "repositioning" || enemy.position === "stunned") {
      console.log(`DEBUG: ${self.name} sees vulnerable enemy: charging=${enemy.isCharging}, position=${enemy.position}`);
      if (move.punishIfCharging) {
        score += 150; // Very high priority for punish moves
        reasoning += "PUNISHING VULNERABLE ENEMY! ";
        tacticalFactors.push("Punish Opportunity");
        console.log(`DEBUG: ${self.name} prioritizing punish move: ${move.name}`);
      }
      // Also prioritize any damaging move against vulnerable enemies
      if (move.baseDamage > 0) {
        score += 80; // Increased priority for any attack on vulnerable enemies
        reasoning += "Enemy is vulnerable, attacking! ";
        tacticalFactors.push("Vulnerability Exploit");
        console.log(`DEBUG: ${self.name} prioritizing attack on vulnerable enemy: ${move.name}`);
      }
    }
    
    // 2. CHARGE-UP OPPORTUNITIES
    if (move.isChargeUp && canChargeSafely(enemy, locationType)) {
      score += 60; // Increased priority for charge-ups
      reasoning += "SAFE CHARGE-UP OPPORTUNITY! ";
      tacticalFactors.push("Charge Opportunity");
    }
    
    // 3. CONTINUE CHARGING if already charging
    if (move.isChargeUp && self.isCharging && (self.chargeProgress || 0) < 100) {
      score += 70; // Very high priority to continue charging
      reasoning += "Continuing charge-up! ";
      tacticalFactors.push("Continue Charge");
    }
    
    // 4. POSITION ADVANTAGES
    const positionBonus = applyPositionBonuses(move, self);
    if (positionBonus.damageMultiplier > 1) {
      score += 30; // Increased position bonus
      reasoning += "Position provides damage bonus. ";
      tacticalFactors.push("Position Advantage");
    }
    
    // 5. REPOSITIONING STRATEGY
    if (move.changesPosition === "repositioning") {
      const repositionScore = evaluateRepositionNeed(self, enemy, locationType, isAirbender);
      score += repositionScore;
      if (repositionScore > 0) {
        reasoning += "Repositioning for tactical advantage. ";
        tacticalFactors.push("Repositioning");
      }
      
      // Heavy penalty for repositioning spam
      if (self.repositionAttempts > 2) {
        score -= 50; // Heavy penalty for too much repositioning
        reasoning += "Too much repositioning, avoiding. ";
        tacticalFactors.push("Repositioning Spam");
        console.log(`DEBUG: ${self.name} penalizing repositioning spam (attempts: ${self.repositionAttempts})`);
      }
    }
    
    // 6. ENVIRONMENTAL ADVANTAGES
    if (move.environmentalConstraints?.includes(locationType)) {
      score += 25; // Increased environmental bonus
      reasoning += "Environmental advantage. ";
      tacticalFactors.push("Environmental Bonus");
    }
    
    // 7. CHARACTER-SPECIFIC TACTICS
    if (isAirbender) {
      score += evaluateAirbenderTactics(move, locationType);
      tacticalFactors.push("Airbender Tactics");
    } else if (isFirebender) {
      score += evaluateFirebenderTactics(move, locationType);
      tacticalFactors.push("Firebender Tactics");
    }
    
    // 8. BASE MOVE STRENGTH
    score += move.baseDamage * 2;
    score -= move.chiCost;
    
    // 9. COOLDOWN CONSIDERATION
    if (self.cooldowns[move.id] && self.cooldowns[move.id] > 0) {
      score -= 10;
    }
    
    // 10. MOVE USAGE LIMITS
    if (move.maxUses) {
      const usesLeft = self.usesLeft?.[move.name] ?? move.maxUses;
      if (usesLeft === 1) {
        score += 20; // Prioritize last use of limited moves
        reasoning += "Last use of powerful move! ";
        tacticalFactors.push("Last Use");
      } else if (usesLeft <= 0) {
        score = -1000; // Cannot use exhausted moves
      }
    }
    
    // 11. MOVE VARIETY - Penalize using the same move repeatedly
    if (self.lastMove === move.name) {
      score -= 30; // Significant penalty for repeating moves
      reasoning += "Avoiding move repetition. ";
      tacticalFactors.push("Move Variety");
    }
    
    // 12. MOVE HISTORY PENALTY - Penalize moves used recently
    const recentMoves = self.moveHistory.slice(-3); // Last 3 moves
    if (recentMoves.includes(move.name)) {
      score -= 20; // Penalty for recently used moves
      reasoning += "Move used recently. ";
      tacticalFactors.push("Recent Use");
    }
    
    return {
      move,
      score,
      reasoning: reasoning || "Standard tactical move",
      tacticalFactors
    };
  });
  
  // Sort by score and select best move
  scoredMoves.sort((a, b) => b.score - a.score);
  const bestMove = scoredMoves[0];
  
  console.log(`DEBUG: ${self.name} move selection:`);
  console.log(`  - Best move: ${bestMove.move.name} (score: ${bestMove.score})`);
  console.log(`  - Reasoning: ${bestMove.reasoning}`);
  console.log(`  - Top 3 moves:`, scoredMoves.slice(0, 3).map(m => `${m.move.name}(${m.score})`));
  
  return {
    move: bestMove.move,
    reasoning: bestMove.reasoning,
    tacticalAnalysis: bestMove.tacticalFactors.join(", ")
  };
}

/**
 * @description Evaluates if it's safe to charge up based on enemy state and location.
 */
function canChargeSafely(enemy: BattleCharacter, locationType: string): boolean {
  // Can charge if enemy is repositioning, stunned, or charging themselves
  if (enemy.position === "repositioning" || enemy.position === "stunned" || enemy.isCharging) {
    return true;
  }
  
  // Can charge in enclosed spaces if enemy is defensive
  if (locationType === "Enclosed" && enemy.position === "defensive") {
    return true;
  }
  
  return false;
}

/**
 * @description Evaluates if repositioning is needed based on current tactical situation.
 */
function evaluateRepositionNeed(
  self: BattleCharacter, 
  enemy: BattleCharacter, 
  locationType: string, 
  isAirbender: boolean
): number {
  let score = 0;
  
  // Don't reposition if already in good position
  if (self.position === "high_ground" || self.position === "aggressive") {
    return -10;
  }
  
  // Reposition if cornered
  if (self.position === "cornered") {
    score += 30;
  }
  
  // Reposition if enemy is charging (get out of the way)
  if (enemy.isCharging) {
    score += 25;
  }
  
  // Airbenders prefer repositioning more
  if (isAirbender) {
    score += 10;
  }
  
  // Don't reposition too much (diminishing returns)
  if (self.repositionAttempts > 3) {
    score -= self.repositionAttempts * 5;
  }
  
  // Environmental constraints
  if (locationType === "Desert" && !isAirbender) {
    score -= 20; // Don't reposition in desert unless airbender
  }
  
  return score;
}

/**
 * @description Airbender-specific tactical evaluation.
 */
function evaluateAirbenderTactics(move: Move, locationType: string): number {
  let score = 0;
  
  // Airbenders excel at repositioning
  if (move.changesPosition === "repositioning") {
    score += 15;
  }
  
  // Airbenders prefer flying positions
  if (move.changesPosition === "flying") {
    score += 20;
  }
  
  // Airbenders are disadvantaged in enclosed spaces
  if (locationType === "Enclosed") {
    score -= 10;
  }
  
  // Airbenders excel in open spaces
  if (locationType === "Open" || locationType === "Air-Friendly") {
    score += 10;
  }
  
  return score;
}

/**
 * @description Firebender-specific tactical evaluation.
 */
function evaluateFirebenderTactics(move: Move, locationType: string): number {
  let score = 0;
  
  // Firebenders prefer aggressive positions
  if (move.changesPosition === "aggressive") {
    score += 15;
  }
  
  // Firebenders excel in fire-friendly environments
  if (locationType === "Fire-Friendly") {
    score += 15;
  }
  
  // Firebenders are good at maintaining pressure
  if (move.baseDamage > 0 && !move.isChargeUp) {
    score += 10;
  }
  
  // Firebenders can reposition but prefer to maintain pressure
  if (move.changesPosition === "repositioning") {
    score += 5; // Lower than airbenders
  }
  
  return score;
}

/**
 * @description Creates a tactical analysis for AI decision logging.
 */
export function createTacticalAnalysis(
  self: BattleCharacter,
  enemy: BattleCharacter,
  location: string,
  chosenMove: Move
): {
  positionAdvantage: boolean;
  chargeOpportunity: boolean;
  punishOpportunity: boolean;
  environmentalFactor: string;
} {
  const locationType = getLocationType(location);
  
  return {
    positionAdvantage: chosenMove.positionBonus?.[self.position] !== undefined,
    chargeOpportunity: !!(chosenMove.isChargeUp && canChargeSafely(enemy, locationType)),
    punishOpportunity: !!(chosenMove.punishIfCharging && 
      (enemy.isCharging || enemy.position === "repositioning" || enemy.position === "stunned")),
    environmentalFactor: locationType
  };
}

/**
 * @description Determines if the AI should prioritize positioning over attacking.
 */
export function shouldPrioritizePositioning(
  self: BattleCharacter,
  enemy: BattleCharacter,
  turn: number
): boolean {
  const isAirbender = self.name.toLowerCase().includes('aang');
  
  // Always reposition if cornered
  if (self.position === "cornered") {
    return true;
  }
  
  // Airbenders reposition more frequently
  if (isAirbender && turn % 3 === 0) {
    return true;
  }
  
  // Reposition if enemy is charging
  if (enemy.isCharging) {
    return true;
  }
  
  // Don't reposition too frequently
  if (self.repositionAttempts > 2) {
    return false;
  }
  
  return false;
} 