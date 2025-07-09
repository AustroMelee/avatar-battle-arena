/**
 * @file moveSelection.ts
 * @description Tactical AI move selection and scoring logic for Avatar Battle Arena. Handles weighted random selection, variance application, and tactical memory for move choice.
 * @exports WeightedMove, applyVariance, weightedRandom, selectMove, selectTacticalMove
 * @owner AustroMelee
 * @lastUpdated 2025-07-08
 * @related metaState.ts, moveScoring.ts, tacticalMemory.service.ts, BattleCharacter, Move
 */

// CONTEXT: AI Move Selection
// RESPONSIBILITY: Weighted random selection from scored moves
import { MetaState } from './metaState';
import { MoveScore } from './moveScoring';
import { Move } from '../../types/move.types';
import { getPatternBans } from './patternDetection';

/**
 * @type WeightedMove
 * @description A move with an associated weight and reasoning for selection.
 * @property move Move The move being considered.
 * @property weight number The computed weight for selection.
 * @property reasons string[] Explanations for the assigned weight.
 */
export interface WeightedMove {
  move: Move;
  weight: number;
  reasons: string[];
}

/**
 * @function applyVariance
 * @description Applies meta-state-driven variance to move scores, increasing weights for moves that match emotional or tactical context.
 * @param moveScores MoveScore[] The scored moves.
 * @param meta MetaState The current meta-state.
 * @returns WeightedMove[] The weighted moves.
 * @related MetaState, MoveScore
 */
export function applyVariance(moveScores: MoveScore[], meta: MetaState): WeightedMove[] {
  return moveScores.map(({ move, score, reasons }) => {
    let weight = Math.max(0.1, score);
    
    // Emotional variance
    if (meta.bored && move.baseDamage > 40) {
      weight *= 1.5;
    }
    if (meta.frustrated && move.tags?.includes('high-damage')) {
      weight *= 1.8;
    }
    if (meta.desperate && move.baseDamage > 60) {
      weight *= 2.0;
    }
    
    // Tactical variance
    if (meta.stuckLoop && move.baseDamage > 40) {
      weight *= 1.6;
    }
    if (meta.finishingTime && move.baseDamage > 60) {
      weight *= 2.2;
    }
    
    return { move, weight, reasons };
  });
}

/**
 * @function weightedRandom
 * @description Performs weighted random selection from the top moves.
 * @param weightedMoves WeightedMove[] The weighted moves.
 * @returns WeightedMove The selected move.
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
 * @function selectMove
 * @description Selects a move using the complete weighted selection pipeline (variance + weighted random).
 * @param moveScores MoveScore[] The scored moves.
 * @param meta MetaState The current meta-state.
 * @returns WeightedMove The selected move with reasons.
 */
export function selectMove(moveScores: MoveScore[], meta: MetaState): WeightedMove {
  const weightedMoves = applyVariance(moveScores, meta);
  return weightedRandom(weightedMoves);
}

// CONTEXT: Tactical AI Move Selection
// RESPONSIBILITY: All move scoring, filtering, and selection logic for tactical AI

import { BattleCharacter, ArcStateModifier } from '../../types';
import { getLocationType } from '../../types/move.types';
import { canUseMove, applyPositionBonuses } from '../battle/positioningMechanics.service';
import { adjustScoresByIdentity } from '../identity/tacticalPersonality.engine';
import type { BattleLogEntry } from '../../types';
import { TacticalMemory } from './tacticalMemory.service';
import type { BattleState } from '../../types';
import { getMoveById } from '../../data/moves';

/**
 * Utility: Checks if a move is considered basic/fallback.
 * @param move Move
 * @returns boolean
 */
export function isBasicMove(move: Move): boolean {
  return !!move.isBasic;
}

/**
 * Utility: Checks if a move is stale (used N times in a row).
 * @param moveId string
 * @param moveHistory string[]
 * @param N number (default 3)
 * @returns boolean
 */
export function isMoveStale(moveId: string, moveHistory: string[], N = 2): boolean {
  if (!moveHistory || moveHistory.length < N) return false;
  const recent = moveHistory.slice(-N);
  return recent.every(id => id === moveId);
}

// TacticalMemory instance per AI (could be attached to BattleCharacter or managed externally)
const tacticalMemoryMap = new WeakMap<BattleCharacter, TacticalMemory>();

/**
 * Updates pattern bans for a character: decrements counters, removes expired, and adds new bans if needed.
 * @param self BattleCharacter
 * @param repeatThreshold number
 * @param banDuration number
 * @returns { banned: string[], forcedAllow: boolean, log: string[] }
 */
function updatePatternBans(self: BattleCharacter, repeatThreshold = 3, banDuration = 2) {
  const log: string[] = [];
  // Decrement turnsLeft for existing bans
  self.patternBans = (self.patternBans || []).map(ban => ({ ...ban, turnsLeft: ban.turnsLeft - 1 }))
    .filter(ban => ban.turnsLeft > 0);
  // Detect new bans
  const newBans = getPatternBans(self.moveHistory, repeatThreshold, banDuration);
  for (const ban of newBans) {
    if (!self.patternBans.some(b => b.moveId === ban.moveId)) {
      self.patternBans.push(ban);
      log.push(`[SYSTEM] Move '${ban.moveId}' banned for ${ban.turnsLeft} turns due to repetition.`);
      // Analytics: increment patternAdaptations if present
      if (self.analytics) self.analytics.patternAdaptations = (self.analytics.patternAdaptations || 0) + 1;
    }
  }
  // Update restrictedMoves for compatibility
  self.restrictedMoves = self.patternBans.map(ban => ban.moveId);
  return { banned: self.restrictedMoves, forcedAllow: false, log };
}

/**
 * @function selectTacticalMove
 * @description Selects the best tactical move for a BattleCharacter, considering memory, escalation, and environmental constraints.
 * @param self BattleCharacter The acting character.
 * @param availableMoves Move[] All available moves.
 * @param location string The current location.
 * @param arcModifiers ArcStateModifier Optional arc state modifiers.
 * @param battleState BattleState The current battle state for phase detection.
 * @returns { move: Move; reasoning: string; tacticalAnalysis: string, tacticalMemoryLog?: string, tacticalMemoryLogEntry?: BattleLogEntry } Tactical move selection result and reasoning.
 * @related TacticalMemory, adjustScoresByIdentity, canUseMove
 */
export function selectTacticalMove(
  self: BattleCharacter,
  availableMoves: Move[],
  location: string,
  arcModifiers?: ArcStateModifier,
  battleState?: BattleState
): { move: Move | null; reasoning: string; tacticalAnalysis: string, forcedEnding?: boolean, tacticalMemoryLog?: string, tacticalMemoryLogEntry?: BattleLogEntry, systemLog?: string[] } {
  // --- Pattern Ban Enforcement ---
  const { banned, log } = updatePatternBans(self);
  let filteredMoves = availableMoves.filter(move => !banned.includes(move.id));
  // If only one legal move remains, allow it and log
  if (filteredMoves.length === 0 && availableMoves.length === 1) {
    filteredMoves = availableMoves;
    log.push(`[SYSTEM] Only one legal move ('${availableMoves[0].id}') available; forced to allow despite ban.`);
  }
  const locationType = getLocationType(location);
  // --- STRICT PHASE-BASED ESCALATION FILTERING ---
  const restricted = self.restrictedMoves || [];
  filteredMoves = filteredMoves.filter(move => !restricted.includes(move.id));
  const isDesperationPhase = battleState?.tacticalPhase === 'desperation';
  const isEscalationPhase = battleState?.tacticalPhase === 'escalation';
  const isClimaxPhase = battleState?.tacticalPhase === 'climax';
  // --- Tag-based filtering remains as before ---
  if (isDesperationPhase || isClimaxPhase) {
    const dramaMoves = filteredMoves.filter(move => move.tags?.some(tag => ['desperation', 'finisher', 'lastResort'].includes(tag)));
    if (dramaMoves.length > 0) {
      filteredMoves = dramaMoves;
    } else {
      return { move: null, reasoning: 'No valid dramatic moves in desperation/climax', tacticalAnalysis: 'Forced ending', forcedEnding: true };
    }
  } else if (isEscalationPhase) {
    const escalationMoves = filteredMoves.filter(move => move.tags?.includes('escalation') || move.tags?.includes('finisher') || move.tags?.includes('lastResort') || !isBasicMove(move));
    if (escalationMoves.length > 0) {
      filteredMoves = escalationMoves;
    } else {
      return { move: null, reasoning: 'No valid moves in escalation', tacticalAnalysis: 'Forced ending', forcedEnding: true };
    }
  } else {
    const nonStaleMoves = filteredMoves.filter(move => !isMoveStale(move.id, self.moveHistory, 2));
    if (nonStaleMoves.length > 0) {
      filteredMoves = nonStaleMoves;
    }
  }
  // --- FORCE BREAKTHROUGH LOGIC: If escalation/desperation or 10+ turns no damage, only allow breakthrough/damaging moves ---
  const turnsSinceLastDamage = battleState?.analytics?.turnsSinceLastDamage || 0;
  const isBreakthroughPhase = isDesperationPhase || isEscalationPhase || isClimaxPhase || turnsSinceLastDamage >= 10;
  if (isBreakthroughPhase) {
    let breakthroughMoves = filteredMoves.filter(move =>
      (move.baseDamage && move.baseDamage >= 10) ||
      move.tags?.some(tag => ['finisher', 'escalation', 'lastResort', 'comeback'].includes(tag))
    );
    // Filter out Basic Strike unless it's the only move left
    if (breakthroughMoves.length > 1) {
      breakthroughMoves = breakthroughMoves.filter(move => move.name !== 'Basic Strike');
    }
    // Debug log the move pool
    console.log('[DEBUG] Move pool during escalation:', breakthroughMoves.map(m => `${m.name} (${m.baseDamage})`).join(', '));
    if (breakthroughMoves.length > 0) {
      // Pick the move with the highest baseDamage
      const highestDamageMove = breakthroughMoves.reduce((max, move) => (move.baseDamage > (max.baseDamage || 0) ? move : max), breakthroughMoves[0]);
      console.log('[DEBUG] Picked:', highestDamageMove.name, 'baseDamage:', highestDamageMove.baseDamage);
      return {
        move: highestDamageMove,
        reasoning: 'Breakthrough phase: Forcing highest-damage or finisher move.',
        tacticalAnalysis: 'Breakthrough/forced escalation',
        systemLog: ['[SYSTEM] Breakthrough phase: Forcing highest-damage or finisher move.']
      };
    } else {
      // No damaging move available, log error and end battle
      console.error('[ERROR] No valid breakthrough move found—ending battle as a fail-safe.');
      return {
        move: null,
        reasoning: 'No damaging or breakthrough move available in escalation/desperation/breakthrough phase.',
        tacticalAnalysis: 'Forced ending',
        forcedEnding: true,
        systemLog: ['[ERROR] No valid breakthrough move found—ending battle as a fail-safe.']
      };
    }
  }
  // --- FORCE RELEASE LOGIC: If character is charging, always pick the release move ---
  if (self.status === 'charging') {
    const lastMove = self.moveHistory && self.moveHistory.length > 0 ? getMoveById(self.moveHistory[self.moveHistory.length - 1]) : null;
    if (lastMove && lastMove.releaseMoveId) {
      const releaseMove = getMoveById(lastMove.releaseMoveId);
      if (releaseMove) {
        console.log('[DEBUG] Forcing release move due to charging:', releaseMove.name);
        return {
          move: releaseMove,
          reasoning: 'Forced release after charging',
          tacticalAnalysis: 'Charge-release enforcement',
          systemLog: ['[SYSTEM] Forced release move after charging.']
        };
      } else {
        console.error('ERROR: Charging but releaseMoveId not found in move data!');
        return { move: null, reasoning: 'No release move found after charging', tacticalAnalysis: 'Error', forcedEnding: true, systemLog: ['[ERROR] No release move found after charging.'] };
      }
    } else {
      console.error('ERROR: Charging but no releaseMoveId on last move!');
      return { move: null, reasoning: 'No releaseMoveId on last move after charging', tacticalAnalysis: 'Error', forcedEnding: true, systemLog: ['[ERROR] No releaseMoveId on last move after charging.'] };
    }
  }
  // If all moves are filtered, force a different move if possible
  if (filteredMoves.length === 0 && availableMoves.length > 0) {
    const lastMoveId = self.moveHistory[self.moveHistory.length - 1];
    const altMoves = availableMoves.filter(move => move.id !== lastMoveId && !restricted.includes(move.id));
    if (altMoves.length > 0) {
      filteredMoves = [altMoves[Math.floor(Math.random() * altMoves.length)]];
      let tacticalMemory = tacticalMemoryMap.get(self);
      if (!tacticalMemory) {
        tacticalMemory = new TacticalMemory();
        tacticalMemoryMap.set(self, tacticalMemory);
      }
      tacticalMemory.recordForcedVariety?.(lastMoveId, altMoves.map(m => m.id));
    } else {
      return { move: null, reasoning: 'All moves restricted or stale', tacticalAnalysis: 'Forced ending', forcedEnding: true };
    }
  }
  if (filteredMoves.length === 0) {
    return { move: null, reasoning: 'No moves available after filtering', tacticalAnalysis: 'Forced ending', forcedEnding: true };
  }
  if ((isDesperationPhase || isEscalationPhase) && filteredMoves.some(m => isBasicMove(m))) {
    return { move: null, reasoning: 'Basic move would be selected in escalation/desperation', tacticalAnalysis: 'Forced ending', forcedEnding: true };
  }
  const usableMoves = filteredMoves.filter(move => canUseMove(move, self, self, location));
  const identityAdjustments = adjustScoresByIdentity(self, usableMoves);
  let tacticalMemory = tacticalMemoryMap.get(self);
  if (!tacticalMemory) {
    tacticalMemory = new TacticalMemory();
    tacticalMemoryMap.set(self, tacticalMemory);
  }
  let tacticalMemoryLog = '';
  const scoredMoves = usableMoves.map(move => {
    let score = 0;
    let reasoning = "";
    const tacticalFactors: string[] = [];
    const tagBoosts: string[] = [];
    let tagBoostScore = 0;
    // --- Escalation/Desperation Tag Boosts ---
    if (isEscalationPhase) {
      const escalationTags = ['escalation', 'finisher', 'lastResort'];
      const matches = move.tags?.filter(tag => escalationTags.includes(tag)) || [];
      if (matches.length > 0) {
        tagBoostScore += 200 * matches.length;
        tagBoosts.push(...matches);
        if (self.analytics) self.analytics.escalationEvents = (self.analytics.escalationEvents || 0) + 1;
        log.push(`[SYSTEM] Escalation boost: Move '${move.name}' +${200 * matches.length} (tags: ${matches.join(', ')})`);
      }
    }
    if (isDesperationPhase || isClimaxPhase) {
      const desperationTags = ['desperation', 'comeback', 'all-in'];
      const matches = move.tags?.filter(tag => desperationTags.includes(tag)) || [];
      if (matches.length > 0) {
        tagBoostScore += 200 * matches.length;
        tagBoosts.push(...matches);
        if (self.analytics) self.analytics.desperationMoves = (self.analytics.desperationMoves || 0) + 1;
        log.push(`[SYSTEM] Desperation boost: Move '${move.name}' +${200 * matches.length} (tags: ${matches.join(', ')})`);
      }
    }
    score += tagBoostScore;
    if (tagBoosts.length > 0) {
      tacticalFactors.push(`Tag Boost: ${tagBoosts.join(', ')}`);
    }
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
    if (self.isCharging || self.position === "repositioning" || self.position === "stunned") {
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
    if (move.isChargeUp && canChargeSafely(self, locationType)) {
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
      const repositionScore = evaluateRepositionNeed(self, locationType);
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
    score += evaluateDefensiveMoves(move, self);
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
    const isVulnerable = self.isCharging || self.position === 'repositioning' || self.position === 'stunned';
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
    if (self.activeFlags.has('isManipulated')) {
      score += 50;
      reasoning += "Target is manipulated - easier to exploit. ";
    }
    if (self.activeFlags.has('isExposed')) {
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
    tacticalMemoryLog,
    systemLog: log
  };
}

export { canChargeSafely, evaluateRepositionNeed, evaluateDefensiveMoves };

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
  locationType: string
): number {
  let score = 0;
  if (self.position === "high_ground" || self.position === "aggressive") {
    return -10;
  }
  if (self.position === "cornered") {
    score += 30;
  }
  if (self.isCharging) {
    score += 25;
  }
  if (locationType === "Desert") {
    score -= 20;
  }
  return score;
}

function evaluateDefensiveMoves(
  move: Move, 
  self: BattleCharacter
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