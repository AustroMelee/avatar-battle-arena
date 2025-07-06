// CONTEXT: Tactical AI Decision Making
// RESPONSIBILITY: AI that considers positioning, charge-ups, and environmental factors

import { BattleCharacter, ArcStateModifier } from '../../types';
import { Move, getLocationType } from '../../types/move.types';
import { canUseMove, applyPositionBonuses } from '../battle/positioningMechanics.service';
import { adjustScoresByIdentity } from '../identity/tacticalPersonality.engine';

/**
 * @description Enhanced AI move selection with tactical awareness and arc state influence.
 */
export function selectTacticalMove(
  self: BattleCharacter,
  enemy: BattleCharacter,
  availableMoves: Move[],
  location: string,
  arcModifiers?: ArcStateModifier
): { move: Move; reasoning: string; tacticalAnalysis: string } {
  const locationType = getLocationType(location);
  const isAirbender = self.name.toLowerCase().includes('aang');
  const isFirebender = self.name.toLowerCase().includes('azula');
  
  // Filter moves that can be used
  const usableMoves = availableMoves.filter(move => 
    canUseMove(move, self, enemy, location)
  );
  
  // --- NEW IDTB INTEGRATION ---
  const identityAdjustments = adjustScoresByIdentity(self, usableMoves);
  // --- END OF NEW INTEGRATION ---
  
  if (usableMoves.length === 0) {
    // During escalation, try to find any damaging move before falling back to basic
    if (self.flags?.forcedEscalation === 'true') {
      // First try signature moves
      const signatureMoves = availableMoves.filter(move => 
        move.id.includes('Blazing') || move.id.includes('Wind') || move.id.includes('Blue') || move.id.includes('Fire') || move.id.includes('Slice')
      );
      if (signatureMoves.length > 0) {
        return {
          move: signatureMoves[0],
          reasoning: "Escalation fallback: using available signature move",
          tacticalAnalysis: "Escalation Signature Fallback"
        };
      }
      
      // Then try any damaging move
      const damagingMoves = availableMoves.filter(move => 
        move.baseDamage > 5 && !move.isChargeUp
      );
      if (damagingMoves.length > 0) {
        return {
          move: damagingMoves[0],
          reasoning: "Escalation fallback: using available damaging move",
          tacticalAnalysis: "Escalation Fallback"
        };
      }
    }
    
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
        score += 120; // Increased bonus for high-damage moves
        reasoning += "High damage move for escalation! ";
        tacticalFactors.push("Escalation Damage");
      }
      
      // Prioritize signature moves during escalation
      if (move.id.includes('Blazing') || move.id.includes('Wind') || move.id.includes('Blue') || move.id.includes('Fire')) {
        score += 80;
        reasoning += "Signature move for escalation! ";
        tacticalFactors.push("Escalation Signature");
      }
      
      // Avoid basic moves during escalation unless necessary
      if (move.baseDamage <= 10 && !move.id.includes('Blazing') && !move.id.includes('Wind') && !move.id.includes('Blue') && !move.id.includes('Fire')) {
        score -= 100; // Increased penalty for weak moves during escalation
        reasoning += "Avoiding weak moves during escalation. ";
        tacticalFactors.push("Escalation Avoidance");
      }
      
      // Completely disable Basic Strike during escalation
      if (move.id.includes('Basic') && self.flags?.forcedEscalation === 'true') {
        score = -1000; // Effectively disable Basic Strike during escalation
        reasoning += "Basic Strike completely disabled during escalation! ";
        tacticalFactors.push("Escalation Disabled");
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
    
    // NEW: DEFENSIVE MOVE SCORING
    score += evaluateDefensiveMoves(move, self, enemy, isAirbender, isFirebender);
    if (move.id.includes('evade') || move.id.includes('parry') || move.id.includes('counter')) {
      tacticalFactors.push("Defensive Strategy");
    }
    
    // 8. BASE MOVE STRENGTH
    score += move.baseDamage * 2;
    score -= move.chiCost;
    
    // 9. COOLDOWN CONSIDERATION
    if (self.cooldowns[move.id] && self.cooldowns[move.id] > 0) {
      // During escalation, reduce cooldown penalty for signature moves
      if (self.flags?.forcedEscalation === 'true' && 
          (move.id.includes('Blazing') || move.id.includes('Wind') || move.id.includes('Blue') || move.id.includes('Fire') || move.id.includes('Slice'))) {
        score -= 5; // Reduced penalty for signature moves during escalation
      } else {
        score -= 10;
      }
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
    
    // 11. MOVE VARIETY - Penalize using the same move repeatedly (reduced during escalation)
    if (self.lastMove === move.name) {
      // Allow immediate repetition for signature moves during escalation
      if (self.flags?.forcedEscalation === 'true' && 
          (move.id.includes('Blazing') || move.id.includes('Wind') || move.id.includes('Blue') || move.id.includes('Fire') || move.id.includes('Slice'))) {
        score += 20; // Bonus for signature move repetition during escalation
        reasoning += "Signature move repetition during escalation. ";
        tacticalFactors.push("Escalation Signature Repetition");
      } else {
        const repetitionPenalty = self.flags?.forcedEscalation === 'true' ? 30 : 60; // Reduced penalty during escalation
        score -= repetitionPenalty;
        reasoning += "Avoiding move repetition. ";
        tacticalFactors.push("Move Variety");
      }
    }
    
    // 12. MOVE HISTORY PENALTY - Penalize moves used recently (reduced during escalation)
    const recentMoves = self.moveHistory.slice(-3); // Last 3 moves (increased from 2)
    if (recentMoves.includes(move.name)) {
      const recentPenalty = self.flags?.forcedEscalation === 'true' ? 10 : 25; // Reduced penalty during escalation
      score -= recentPenalty;
      reasoning += "Move used recently. ";
      tacticalFactors.push("Recent Use");
    }
    
    // 13. EXTENDED MOVE HISTORY - Penalize moves used in last 5 turns (reduced during escalation)
    const extendedMoves = self.moveHistory.slice(-5); // Last 5 moves
    if (extendedMoves.filter(m => m === move.name).length >= 2) {
      const overusePenalty = self.flags?.forcedEscalation === 'true' ? 5 : 15; // Reduced penalty during escalation
      score -= overusePenalty;
      reasoning += "Move overused recently. ";
      tacticalFactors.push("Overuse Penalty");
    }

    // --- APPLY IDENTITY MODIFIER ---
    const identityMod = identityAdjustments[move.name];
    if (identityMod) {
      score += identityMod.adjustment;
      reasoning += `${identityMod.reason}. `;
      tacticalFactors.push("Identity Influence");
    }
    // --- END OF MODIFIER ---

    // 14. BEHAVIORAL FLAG CONSIDERATIONS - NEW: AI reacts to behavioral effects
    if (self.activeFlags.has('overconfidenceActive')) {
      // Overconfidence disables finisher moves completely
      if (move.name.toLowerCase().includes('finisher') || move.baseDamage > 15) {
        score = -Infinity;
        reasoning += "Overconfidence disables finisher moves. ";
      } else {
        // But boosts flashy, high-damage moves
        score += 70;
        reasoning += "Overconfidence demands flashy display. ";
      }
    }

    if (enemy.activeFlags.has('isManipulated')) {
      // Manipulated targets are easier to hit and less effective at defense
      score += 50;
      reasoning += "Target is manipulated - easier to exploit. ";
    }

    if (enemy.activeFlags.has('isExposed')) {
      // Exposed targets are extremely vulnerable
      score += 100;
      reasoning += "Target is completely exposed - perfect opportunity! ";
    }

    // Store the final score for debugging
    const _originalScore = score;

    // 15. ARC STATE AI RISK FACTOR - Apply arc state influence on AI behavior
    if (arcModifiers && move.baseDamage > 20) { // Only apply to risky, high-damage moves
      const originalScore = score;
      score *= arcModifiers.aiRiskFactor;
      if (arcModifiers.aiRiskFactor > 1.0) {
        reasoning += `Arc state makes AI more aggressive (${arcModifiers.aiRiskFactor.toFixed(1)}x). `;
        tacticalFactors.push("Arc State Aggression");
      } else if (arcModifiers.aiRiskFactor < 1.0) {
        reasoning += `Arc state makes AI more conservative (${arcModifiers.aiRiskFactor.toFixed(1)}x). `;
        tacticalFactors.push("Arc State Caution");
      }
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

/**
 * @description Evaluates defensive moves based on character personality and tactical situation.
 */
function evaluateDefensiveMoves(
  move: Move, 
  self: BattleCharacter, 
  enemy: BattleCharacter, 
  isAirbender: boolean, 
  isFirebender: boolean
): number {
  let score = 0;
  
  // Check if this is a defensive move by name
  const isEvadeMove = move.id.includes('evade') || move.id.includes('evasion') || move.id.includes('flowing');
  const isParryMove = move.id.includes('parry') || move.id.includes('counter') || move.id.includes('blazing');
  
  if (!isEvadeMove && !isParryMove) {
    return 0; // Not a defensive move
  }
  
  // HIGH PRIORITY: Use defensive moves when health is low
  if (self.currentHealth < 30) {
    score += 80; // Very high priority when health is low
  } else if (self.currentHealth < 50) {
    score += 40; // Medium priority when health is moderate
  }
  
  // HIGH PRIORITY: Use defensive moves when enemy is charging a powerful attack
  if (enemy.isCharging && enemy.chargeProgress && enemy.chargeProgress > 50) {
    score += 60; // High priority to defend against charged attacks
  }
  
  // MEDIUM PRIORITY: Use defensive moves when enemy has high damage potential
  if (enemy.stats.power > 80) {
    score += 30; // Defend against high-power enemies
  }
  
  // CHARACTER-SPECIFIC DEFENSIVE STRATEGIES
  
  // AANG (Airbender) - Prefers evasion
  if (isAirbender && isEvadeMove) {
    score += 25; // Aang prefers flowing evasion
    // Aang uses evasion more when he's mobile
    if (self.position === "flying" || self.position === "repositioning") {
      score += 15;
    }
  }
  
  // AZULA (Firebender) - Prefers parry/counter
  if (isFirebender && isParryMove) {
    score += 25; // Azula prefers aggressive counter-attacks
    // Azula uses counter more when enemy is predictable
    if (enemy.moveHistory.length > 0) {
      const lastMove = enemy.moveHistory[enemy.moveHistory.length - 1];
      const moveCount = enemy.moveHistory.filter(m => m === lastMove).length;
      if (moveCount > 1) {
        score += 20; // Bonus for countering predictable enemies
      }
    }
  }
  
  // PENALTIES
  
  // Don't spam defensive moves
  if (self.lastMove && (self.lastMove.includes('evade') || self.lastMove.includes('parry') || self.lastMove.includes('counter'))) {
    score -= 30; // Penalty for defensive move spam
  }
  
  // Don't use defensive moves when we have the advantage
  if (self.currentHealth > 80 && enemy.currentHealth < 40) {
    score -= 40; // Don't defend when we're winning
  }
  
  // Don't use defensive moves during forced escalation
  if (self.flags?.forcedEscalation === 'true') {
    score -= 50; // Focus on attack during escalation
  }
  
  // Don't use defensive moves when we have counter-attack opportunity
  if (self.flags?.isCountering === true) {
    score -= 60; // Use the counter-attack instead of defending
  }
  
  return score;
} 