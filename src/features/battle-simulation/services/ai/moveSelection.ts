// CONTEXT: AI Move Selection
// RESPONSIBILITY: Weighted random selection from scored moves
import { Ability } from '@/common/types';
import { MetaState } from './metaState';
import { MoveScore } from './moveScoring';

export interface WeightedMove {
  move: Ability;
  weight: number;
  reasons: string[];
}

/**
 * @description Applies variance to move scores based on meta-state.
 * @param {MoveScore[]} moveScores - The scored moves.
 * @param {MetaState} meta - The current meta-state.
 * @returns {WeightedMove[]} The weighted moves.
 */
export function applyVariance(moveScores: MoveScore[], meta: MetaState): WeightedMove[] {
  return moveScores.map(({ move, score, reasons }) => {
    let weight = Math.max(0.1, score);
    
    // Emotional variance
    if (meta.bored && move.power > 40) {
      weight *= 1.5;
    }
    if (meta.frustrated && move.tags?.includes('high-damage')) {
      weight *= 1.8;
    }
    if (meta.desperate && move.power > 60) {
      weight *= 2.0;
    }
    
    // Tactical variance
    if (meta.stuckLoop && move.power > 40) {
      weight *= 1.6;
    }
    if (meta.finishingTime && move.power > 60) {
      weight *= 2.2;
    }
    
    return { move, weight, reasons };
  });
}

/**
 * @description Performs weighted random selection from the top moves.
 * @param {WeightedMove[]} weightedMoves - The weighted moves.
 * @returns {WeightedMove} The selected move.
 */
export function weightedRandom(weightedMoves: WeightedMove[]): WeightedMove {
  const topMoves = weightedMoves.slice(0, 3);
  const totalWeight = topMoves.reduce((sum, move) => sum + move.weight, 0);
  
  // Normalize weights
  topMoves.forEach(move => {
    move.weight = move.weight / totalWeight;
  });
  
  // Weighted random selection
  const random = Math.random();
  let cumulativeWeight = 0;
  
  for (const move of topMoves) {
    cumulativeWeight += move.weight;
    if (random <= cumulativeWeight) {
      return move;
    }
  }
  
  return topMoves[0]; // Fallback
}

/**
 * @description Selects a move using the complete weighted selection pipeline.
 * @param {MoveScore[]} moveScores - The scored moves.
 * @param {MetaState} meta - The current meta-state.
 * @returns {WeightedMove} The selected move with reasons.
 */
export function selectMove(moveScores: MoveScore[], meta: MetaState): WeightedMove {
  const weightedMoves = applyVariance(moveScores, meta);
  return weightedRandom(weightedMoves);
}

// CONTEXT: Tactical AI Move Selection
// RESPONSIBILITY: All move scoring, filtering, and selection logic for tactical AI

import { BattleCharacter, ArcStateModifier } from '../../types';
import { Move, getLocationType } from '../../types/move.types';
import { canUseMove, applyPositionBonuses } from '../battle/positioningMechanics.service';
import { adjustScoresByIdentity } from '../identity/tacticalPersonality.engine';
import type { BattleLogEntry } from '../../types';
import { TacticalMemory, checkTacticalMemoryWithLog } from './tacticalMemory.service';

// TacticalMemory instance per AI (could be attached to BattleCharacter or managed externally)
const tacticalMemoryMap = new WeakMap<BattleCharacter, TacticalMemory>();

export function selectTacticalMove(
  self: BattleCharacter,
  enemy: BattleCharacter,
  availableMoves: Move[],
  location: string,
  arcModifiers?: ArcStateModifier
): { move: Move; reasoning: string; tacticalAnalysis: string, tacticalMemoryLog?: string, tacticalMemoryLogEntry?: BattleLogEntry } {
  const locationType = getLocationType(location);
  const isAirbender = self.name.toLowerCase().includes('aang');
  const isFirebender = self.name.toLowerCase().includes('azula');
  // Filter moves that can be used
  const usableMoves = availableMoves.filter(move => 
    canUseMove(move, self, enemy, location)
  );
  const identityAdjustments = adjustScoresByIdentity(self, usableMoves);
  let tacticalMemory = tacticalMemoryMap.get(self);
  if (!tacticalMemory) {
    tacticalMemory = new TacticalMemory();
    tacticalMemoryMap.set(self, tacticalMemory);
  }
  if (usableMoves.length === 0) {
    if (self.flags?.forcedEscalation === 'true') {
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
    const basicMoves = availableMoves.filter(move => 
      move.chiCost === 0 && !move.isChargeUp && !move.changesPosition
    );
    return {
      move: basicMoves[0] || availableMoves[0],
      reasoning: "No tactical options available, using basic move",
      tacticalAnalysis: "Limited by environmental constraints or position requirements"
    };
  }
  let tacticalMemoryLog = '';
  const scoredMoves = usableMoves.map(move => {
    let score = 0;
    let reasoning = "";
    const tacticalFactors: string[] = [];
    const staleMoves = tacticalMemory!.getStaleMoves();
    if (staleMoves.includes(move.name)) {
      score = -1000;
      reasoning += `Move is stale/ineffective (Tactical Memory). `;
      tacticalFactors.push('Tactical Memory Avoidance');
      tacticalMemoryLog += `Tactical Memory: ${move.name} is stale/ineffective and avoided.\n`;
    }
    if (self.flags?.forcedEscalation === 'true') {
      score += 200;
      reasoning += "FORCED ESCALATION - ALL OUT ATTACK! ";
      tacticalFactors.push("Forced Escalation");
      if (move.baseDamage >= 5) {
        score += 120;
        reasoning += "High damage move for escalation! ";
        tacticalFactors.push("Escalation Damage");
      }
      if (move.id.includes('Blazing') || move.id.includes('Wind') || move.id.includes('Blue') || move.id.includes('Fire')) {
        score += 80;
        reasoning += "Signature move for escalation! ";
        tacticalFactors.push("Escalation Signature");
      }
      if (move.baseDamage <= 10 && !move.id.includes('Blazing') && !move.id.includes('Wind') && !move.id.includes('Blue') && !move.id.includes('Fire')) {
        score -= 100;
        reasoning += "Avoiding weak moves during escalation. ";
        tacticalFactors.push("Escalation Avoidance");
      }
      if (move.id.includes('Basic') && self.flags?.forcedEscalation === 'true') {
        score = -1000;
        reasoning += "Basic Strike completely disabled during escalation! ";
        tacticalFactors.push("Escalation Disabled");
      }
      if (move.changesPosition === "repositioning" && !self.flags?.repositionDisabled) {
        score -= 100;
        reasoning += "No time for repositioning during escalation! ";
        tacticalFactors.push("Escalation Focus");
      }
    }
    if (enemy.isCharging || enemy.position === "repositioning" || enemy.position === "stunned") {
      if (move.punishIfCharging) {
        score += 200;
        reasoning += "PUNISHING VULNERABLE ENEMY! ";
        tacticalFactors.push("Punish Opportunity");
      }
      if (move.baseDamage > 0) {
        score += 80;
        reasoning += "Enemy is vulnerable, attacking! ";
        tacticalFactors.push("Vulnerability Exploit");
      }
    }
    if (move.isChargeUp && canChargeSafely(enemy, locationType)) {
      score += 60;
      reasoning += "SAFE CHARGE-UP OPPORTUNITY! ";
      tacticalFactors.push("Charge Opportunity");
    }
    if (move.isChargeUp && self.isCharging && (self.chargeProgress || 0) < 100) {
      score += 70;
      reasoning += "Continuing charge-up! ";
      tacticalFactors.push("Continue Charge");
    }
    const positionBonus = applyPositionBonuses(move, self);
    if (positionBonus.damageMultiplier > 1) {
      score += 30;
      reasoning += "Position provides damage bonus. ";
      tacticalFactors.push("Position Advantage");
    }
    if (move.changesPosition === "repositioning") {
      const repositionScore = evaluateRepositionNeed(self, enemy, locationType, isAirbender);
      score += repositionScore;
      if (repositionScore > 0) {
        reasoning += "Repositioning for tactical advantage. ";
        tacticalFactors.push("Repositioning");
      }
      if (self.repositionAttempts > 2) {
        score -= 50;
        reasoning += "Too much repositioning, avoiding. ";
        tacticalFactors.push("Repositioning Spam");
      }
    }
    if (move.environmentalConstraints?.includes(locationType)) {
      score += 25;
      reasoning += "Environmental advantage. ";
      tacticalFactors.push("Environmental Bonus");
    }
    if (isAirbender) {
      score += evaluateAirbenderTactics(move, locationType);
      tacticalFactors.push("Airbender Tactics");
    } else if (isFirebender) {
      score += evaluateFirebenderTactics(move, locationType);
      tacticalFactors.push("Firebender Tactics");
    }
    score += evaluateDefensiveMoves(move, self, enemy);
    if (move.id.includes('evade') || move.id.includes('parry') || move.id.includes('counter')) {
      tacticalFactors.push("Defensive Strategy");
    }
    if (move.type === 'attack') {
      score += 100;
      reasoning += 'Offensive move bonus. ';
      tacticalFactors.push('Attack Incentive');
    }
    const wasLastMoveDefensive = self.lastMove === 'Flowing Evasion' || self.lastMove === 'Blazing Counter' || self.lastMove === 'Air Shield';
    if (wasLastMoveDefensive && (move.type === 'evade' || move.type === 'parry_retaliate')) {
      score -= 30;
      reasoning += 'Avoiding defensive spam. ';
      tacticalFactors.push('Defensive Spam Penalty');
    }
    const isVulnerable = enemy.isCharging || enemy.position === 'repositioning' || enemy.position === 'stunned';
    const isCriticallyLowHealth = self.currentHealth < 30;
    const isDefensiveOrUtilityMove = move.type !== 'attack';
    if (!isVulnerable && !isCriticallyLowHealth && isDefensiveOrUtilityMove) {
        score -= 100;
        reasoning += 'No immediate threat, focusing on offense. ';
        tacticalFactors.push('Offensive Focus');
    }
    score += move.baseDamage * 2;
    score -= move.chiCost;
    if (self.cooldowns[move.id] && self.cooldowns[move.id] > 0) {
      if (self.flags?.forcedEscalation === 'true' && 
          (move.id.includes('Blazing') || move.id.includes('Wind') || move.id.includes('Blue') || move.id.includes('Fire') || move.id.includes('Slice'))) {
        score -= 5;
      } else {
        score -= 10;
      }
    }
    if (move.maxUses) {
      const usesLeft = self.usesLeft?.[move.name] ?? move.maxUses;
      if (usesLeft === 1) {
        score += 20;
        reasoning += "Last use of powerful move! ";
        tacticalFactors.push("Last Use");
      } else if (usesLeft <= 0) {
        score = -1000;
      }
    }
    if (self.lastMove === move.name) {
      if (self.flags?.forcedEscalation === 'true' && 
          (move.id.includes('Blazing') || move.id.includes('Wind') || move.id.includes('Blue') || move.id.includes('Fire') || move.id.includes('Slice'))) {
        score += 20;
        reasoning += "Signature move repetition during escalation. ";
        tacticalFactors.push("Escalation Signature Repetition");
      } else {
        const repetitionPenalty = self.flags?.forcedEscalation === 'true' ? 30 : 60;
        score -= repetitionPenalty;
        reasoning += "Avoiding move repetition. ";
        tacticalFactors.push("Move Variety");
      }
    }
    const recentMoves = self.moveHistory.slice(-3);
    if (recentMoves.includes(move.name)) {
      const recentPenalty = self.flags?.forcedEscalation === 'true' ? 10 : 25;
      score -= recentPenalty;
      reasoning += "Move used recently. ";
      tacticalFactors.push("Recent Use");
    }
    const extendedMoves = self.moveHistory.slice(-5);
    if (extendedMoves.filter(m => m === move.name).length >= 2) {
      const overusePenalty = self.flags?.forcedEscalation === 'true' ? 5 : 15;
      score -= overusePenalty;
      reasoning += "Move overused recently. ";
      tacticalFactors.push("Overuse Penalty");
    }
    const identityMod = identityAdjustments[move.name];
    if (identityMod) {
      score += identityMod.adjustment;
      reasoning += `${identityMod.reason}. `;
      tacticalFactors.push("Identity Influence");
    }
    if (self.activeFlags.has('overconfidenceActive')) {
      if (move.name.toLowerCase().includes('finisher') || move.baseDamage > 15) {
        score = -Infinity;
        reasoning += "Overconfidence disables finisher moves. ";
      } else {
        score += 70;
        reasoning += "Overconfidence demands flashy display. ";
      }
    }
    if (enemy.activeFlags.has('isManipulated')) {
      score += 50;
      reasoning += "Target is manipulated - easier to exploit. ";
    }
    if (enemy.activeFlags.has('isExposed')) {
      score += 100;
      reasoning += "Target is completely exposed - perfect opportunity! ";
    }
    if (arcModifiers && move.baseDamage > 20) {
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
  scoredMoves.sort((a, b) => b.score - a.score);
  const bestMove = scoredMoves[0];
  return {
    move: bestMove.move,
    reasoning: bestMove.reasoning,
    tacticalAnalysis: bestMove.tacticalFactors.join(", "),
    tacticalMemoryLog
  };
}

export { canChargeSafely, evaluateRepositionNeed, evaluateAirbenderTactics, evaluateFirebenderTactics, evaluateDefensiveMoves };

function canChargeSafely(enemy: BattleCharacter, locationType: string): boolean {
  if (enemy.position === "repositioning" || enemy.position === "stunned" || enemy.isCharging) {
    return true;
  }
  if (locationType === "Enclosed" && enemy.position === "defensive") {
    return true;
  }
  return false;
}

function evaluateRepositionNeed(
  self: BattleCharacter, 
  enemy: BattleCharacter, 
  locationType: string, 
  isAirbender: boolean
): number {
  let score = 0;
  if (self.position === "high_ground" || self.position === "aggressive") {
    return -10;
  }
  if (self.position === "cornered") {
    score += 30;
  }
  if (enemy.isCharging) {
    score += 25;
  }
  if (isAirbender) {
    score += 10;
  }
  if (self.repositionAttempts > 3) {
    score -= self.repositionAttempts * 5;
  }
  if (locationType === "Desert" && !isAirbender) {
    score -= 20;
  }
  return score;
}

function evaluateAirbenderTactics(move: Move, locationType: string): number {
  let score = 0;
  if (move.changesPosition === "repositioning") {
    score += 15;
  }
  if (move.changesPosition === "flying") {
    score += 20;
  }
  if (locationType === "Enclosed") {
    score -= 10;
  }
  if (locationType === "Open" || locationType === "Air-Friendly") {
    score += 10;
  }
  return score;
}

function evaluateFirebenderTactics(move: Move, locationType: string): number {
  let score = 0;
  if (move.changesPosition === "aggressive") {
    score += 15;
  }
  if (locationType === "Fire-Friendly") {
    score += 15;
  }
  if (move.baseDamage > 0 && !move.isChargeUp) {
    score += 10;
  }
  if (move.changesPosition === "repositioning") {
    score += 5;
  }
  return score;
}

function evaluateDefensiveMoves(
  move: Move, 
  self: BattleCharacter, 
  enemy: BattleCharacter
): number {
  let score = 0;
  const isEvadeMove = move.id.includes('evade') || move.id.includes('evasion') || move.id.includes('flowing');
  const isParryMove = move.id.includes('parry') || move.id.includes('counter') || move.id.includes('blazing');
  if (!isEvadeMove && !isParryMove) {
    return 0;
  }
  if (self.currentHealth < 30) {
    score += 80;
  } else if (self.currentHealth < 50) {
    score += 40;
  }
  return score;
} 