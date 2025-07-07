// CONTEXT: Tactical Move Service
// RESPONSIBILITY: Execute tactical moves with positioning, charge-up, and status effect mechanics

import { BattleState, BattleCharacter, BattleLogEntry } from '../../types';
import { Move } from '../../types/move.types';
import { createBattleContext } from './battleContext.service';
import { createStatusEffect, applyEffect } from '../effects/statusEffect.service';
import { handleChargeUp, calculatePunishBonus, applyPositionBonuses, updatePositionAfterMove } from './positioningMechanics.service';
import { generateUniqueLogId } from '../ai/logQueries';
import type { Ability } from '../../types/move.types';
import { getMoveFatigueMultiplier, applyMoveFatigue } from './moveFatigue.service';
import { resolveMove } from './moveLogic.service';
import { resolveImpact } from './resolveImpact';
import { checkDefeat } from './checkDefeat';
// import { getLocationType } from '../../types/move.types';
import { canUseMove } from './positioningMechanics.service';
import { TacticalMemory } from '../ai/tacticalMemory.service';
import { adjustScoresByIdentity } from '../identity/tacticalPersonality.engine';

/**
 * @description Result of executing a tactical move
 */
export interface TacticalMoveResult {
  newAttacker: BattleCharacter;
  newTarget: BattleCharacter;
  logEntries: BattleLogEntry[];
  narrative: string;
  // NEW: Collateral damage log entry for environmental damage
  collateralLogEntry?: BattleLogEntry;
  stateChangeLogEntry?: BattleLogEntry;
  fatigueLogEntry?: BattleLogEntry;
}

/**
 * @description Executes a tactical move with positioning, charge-up, and status effect mechanics
 * @param {Move} move - The move to execute
 * @param {BattleCharacter} attacker - The attacking character
 * @param {BattleCharacter} target - The target character
 * @param {BattleState} state - Current battle state
 * @returns {TacticalMoveResult} The execution result with narrative
 */
export async function executeTacticalMove(
  move: Move,
  attacker: BattleCharacter,
  target: BattleCharacter,
  state: BattleState
): Promise<TacticalMoveResult> {
  console.log('DEBUG: Entered executeTacticalMove for', move.name, 'by', attacker.name, 'on', target.name);
  
  const newAttacker = { ...attacker };
  const newTarget = { ...target };
  
  // Handle repositioning moves
  if (move.changesPosition === "repositioning") {
    return handleRepositioningMove(move, newAttacker, newTarget, state);
  }
  
  // Handle charge-up moves
  if (move.isChargeUp) {
    return handleChargeUpMove(move, newAttacker, newTarget, state);
  }
  
  // Handle regular tactical moves
  return handleRegularTacticalMove(move, newAttacker, newTarget, state);
}

/**
 * @description Handles repositioning moves
 */
async function handleRepositioningMove(
  move: Move,
  attacker: BattleCharacter,
  target: BattleCharacter,
  state: BattleState
): Promise<TacticalMoveResult> {
  console.log(`DEBUG: ${attacker.name} starts repositioning`);
  
  const newTarget = { ...target };
  
  // Set attacker to repositioning state
  attacker.position = "repositioning";
  attacker.repositionAttempts++;
  
  // Calculate reposition success
  const successRate = move.repositionSuccessRate || 0.8;
  const isSuccessful = Math.random() < successRate;
  
  let damage = 0;
  let narrative = `${attacker.name} repositions to gain advantage!`;
  
  if (isSuccessful) {
    // Successful reposition - minimal damage but tactical advantage
    damage = Math.floor(move.baseDamage * 0.3);
    narrative = `${attacker.name} successfully repositions, gaining tactical advantage!`;
  } else {
    // Failed reposition - no damage
    damage = 0;
    narrative = `${attacker.name} attempts to reposition but fails to gain advantage.`;
  }
  
  // Apply damage to target
  newTarget.currentHealth = Math.max(0, target.currentHealth - damage);
  
  // Apply status effects if any
  if (move.appliesEffect) {
    const shouldApply = !move.appliesEffect.chance || Math.random() < move.appliesEffect.chance;
    if (shouldApply) {
      const statusEffect = createStatusEffect(move.name, move.appliesEffect, target.name, state.turn);
      const { updatedCharacter, logEntry } = applyEffect(newTarget, statusEffect, state.turn);
      Object.assign(newTarget, updatedCharacter);
      if (state.battleLog) state.battleLog.push(logEntry);
    }
  }
  
  // Spend chi
  const chiCost = move.chiCost || 0;
  attacker.resources.chi = Math.max(0, attacker.resources.chi - chiCost);
  
  // Apply cooldown
  if (move.cooldown && move.cooldown > 0) {
    attacker.cooldowns[move.id] = move.cooldown;
  }
  
  // Update move history
  attacker.lastMove = move.name;
  attacker.moveHistory.push(move.name);
  
  // Create log entry
  const logEntry: BattleLogEntry = {
    id: generateUniqueLogId('reposition'),
    turn: state.turn,
    actor: attacker.name,
    type: 'REPOSITION',
    action: move.name,
    target: target.name,
    damage,
    result: damage > 0 ? `${target.name} takes ${damage} damage.` : `${attacker.name} repositions.`,
    narrative,
    timestamp: Date.now(),
    meta: {
      moveType: 'repositioning',
      success: isSuccessful,
      resourceCost: chiCost
    }
  };
  
  return {
    newAttacker: attacker,
    newTarget: newTarget,
    logEntries: [logEntry],
    narrative
  };
}

/**
 * @description Handles charge-up moves
 */
async function handleChargeUpMove(
  move: Move,
  attacker: BattleCharacter,
  target: BattleCharacter,
  state: BattleState
): Promise<TacticalMoveResult> {
  console.log(`DEBUG: ${attacker.name} starts charging ${move.name}`);
  
  const newTarget = { ...target };
  const logEntries: BattleLogEntry[] = [];

  // Handle charge-up mechanics
  const chargeResult = handleChargeUp(attacker, target, move);
  
  let damage = 0;
  let narrative = chargeResult.narrative;
  
  // If charge was interrupted, apply damage to attacker
  if (chargeResult.interrupted && chargeResult.damage) {
    attacker.currentHealth = Math.max(0, attacker.currentHealth - chargeResult.damage);
    narrative = chargeResult.narrative;
  } else if (chargeResult.success && attacker.chargeProgress && attacker.chargeProgress >= 100) {
    // Charge complete - calculate full damage
    const battleContext = createBattleContext(attacker, target, state);
    const moveResult = resolveMove(move, battleContext, attacker, target);
    damage = moveResult.damage;
    
    // Apply status effects if any
    if (move.appliesEffect) {
      const shouldApply = !move.appliesEffect.chance || Math.random() < move.appliesEffect.chance;
      if (shouldApply) {
        const statusEffect = createStatusEffect(move.name, move.appliesEffect, target.name, state.turn);
        const { updatedCharacter, logEntry } = applyEffect(newTarget, statusEffect, state.turn);
        Object.assign(newTarget, updatedCharacter);
        logEntries.push(logEntry);
      }
    }
    
    // Apply damage to target
    newTarget.currentHealth = Math.max(0, target.currentHealth - damage);
    
    narrative = `CHARGED ATTACK! ${attacker.name} unleashes ${move.name} for ${damage} damage!`;
  }
  
  // Spend chi
  const chiCost = move.chiCost || 0;
  attacker.resources.chi = Math.max(0, attacker.resources.chi - chiCost);
  
  // Apply cooldown
  if (move.cooldown && move.cooldown > 0) {
    attacker.cooldowns[move.id] = move.cooldown;
  }
  
  // Update move history
  attacker.lastMove = move.name;
  attacker.moveHistory.push(move.name);
  
  // Create and collect main log entry
  const logEntry: BattleLogEntry = {
    id: generateUniqueLogId('charge'),
    turn: state.turn,
    actor: attacker.name,
    type: 'CHARGE',
    action: move.name,
    target: target.name,
    damage,
    result: chargeResult.interrupted ? `${attacker.name}'s charge was interrupted!` : 
            damage > 0 ? `${target.name} takes ${damage} damage.` : `${attacker.name} continues charging.`,
    narrative,
    timestamp: Date.now(),
    meta: {
      moveType: 'charge-up',
      chargeComplete: attacker.chargeProgress && attacker.chargeProgress >= 100,
      interrupted: chargeResult.interrupted,
      resourceCost: chiCost
    }
  };
  logEntries.push(logEntry);
  
  return {
    newAttacker: attacker,
    newTarget: newTarget,
    logEntries,
    narrative
  };
}

/**
 * @description Handles regular tactical moves
 */
async function handleRegularTacticalMove(
  move: Move,
  attacker: BattleCharacter,
  target: BattleCharacter,
  state: BattleState
): Promise<TacticalMoveResult> {
  const newTarget = { ...target };
  const newAttacker = { ...attacker }; // Clone attacker as well
  const logEntries: BattleLogEntry[] = [];
  // --- MOVE FATIGUE ---
  const fatigueMultiplier = getMoveFatigueMultiplier(newAttacker, moveToAbility(move));
  let impactResult = resolveImpact(newTarget, moveToAbility(move));
  if (impactResult && typeof impactResult.stabilityDamage === 'number') {
    impactResult = {
      ...impactResult,
      stabilityDamage: applyMoveFatigue(impactResult.stabilityDamage, fatigueMultiplier),
      controlShift: applyMoveFatigue(impactResult.controlShift, fatigueMultiplier)
    };
  }
  // --- HEALTH DAMAGE LOGIC ---
  const battleContext = createBattleContext(newAttacker, newTarget, state);
  const moveResult = resolveMove(move, battleContext, newAttacker, target);
  let damage = applyMoveFatigue(moveResult.damage, fatigueMultiplier);
  const punishBonus = calculatePunishBonus(move, newTarget);
  if (punishBonus > 0) {
    damage += punishBonus;
  }
  const positionBonus = applyPositionBonuses(move, newAttacker);
  damage = Math.floor(damage * positionBonus.damageMultiplier);
  newTarget.currentHealth = Math.max(0, newTarget.currentHealth - damage);
  // --- STATUS EFFECT LOGIC ---
  if (move.appliesEffect) {
    const shouldApply = !move.appliesEffect.chance || Math.random() < move.appliesEffect.chance;
    if (shouldApply) {
      const statusEffect = createStatusEffect(move.name, move.appliesEffect, target.name, state.turn);
      const { updatedCharacter, logEntry: statusLogEntry } = applyEffect(newTarget, statusEffect, state.turn);
      Object.assign(newTarget, updatedCharacter);
      logEntries.push(statusLogEntry);
    }
  }
  // --- UPDATE ATTACKER STATE ---
  const chiCost = move.chiCost || 0;
  newAttacker.resources.chi = Math.max(0, newAttacker.resources.chi - chiCost);
  if (move.cooldown && move.cooldown > 0) {
    newAttacker.cooldowns[move.id] = move.cooldown;
  }
  newAttacker.lastMove = move.name;
  newAttacker.moveHistory.push(move.name);
  // --- POSITIONING LOGIC ---
  const positionResult = updatePositionAfterMove(newAttacker, move);
  if (positionResult && positionResult.positionChanged) {
    logEntries.push({
      id: generateUniqueLogId('position'),
      turn: state.turn,
      actor: newAttacker.name,
      type: 'POSITION',
      action: 'Change Stance',
      result: `Adopted ${newAttacker.position} stance.`,
      narrative: positionResult.narrative,
      timestamp: Date.now(),
      meta: { newPosition: newAttacker.position },
    });
  }
  // --- COLLATERAL DAMAGE LOGIC ---
  if (move.collateralDamage && move.collateralDamage > 0) {
    logEntries.push({
      id: generateUniqueLogId('collateral'),
      turn: state.turn,
      actor: 'Environment',
      type: 'NARRATIVE',
      action: 'Collateral Damage',
      result: `The force of ${move.name} causes environmental damage.`,
      narrative: move.collateralDamageNarrative || `The force of ${move.name} ripples through the environment.`,
      timestamp: Date.now(),
      meta: { damageLevel: move.collateralDamage },
    });
  }
  // --- DISRUPTION & STATE CHANGE ---
  const prevControlState = newTarget.controlState;
  newTarget.momentum = (newTarget.momentum ?? 0) + impactResult.controlShift;
  newTarget.stability = (newTarget.stability ?? 100) - impactResult.stabilityDamage;
  if (impactResult.causesStateShift && impactResult.newControlState) {
    newTarget.controlState = impactResult.newControlState;
  } else if (newTarget.stability < 10 || newTarget.momentum < -50) {
    newTarget.controlState = 'Compromised';
  }
  if (checkDefeat(newTarget)) {
    newTarget.controlState = 'Defeated';
  }
  const narrative = impactResult.narrative || moveResult.narrative;
  // --- MAIN LOG ENTRY ---
  logEntries.push({
    id: generateUniqueLogId('tactical'),
    turn: state.turn,
    actor: newAttacker.name,
    type: 'TACTICAL', // Main event type
    action: move.name,
    target: target.name,
    damage,
    result: `${target.name} takes ${damage} damage. ${narrative}`,
    narrative,
    timestamp: Date.now(),
    meta: {
      controlShift: impactResult.controlShift,
      stabilityChange: impactResult.stabilityDamage,
      newControlState: newTarget.controlState,
      fatigueMultiplier
    }
  });
  // If controlState changed, add explicit log entry
  if (prevControlState !== newTarget.controlState) {
    logEntries.push({
      id: generateUniqueLogId('statechange'),
      turn: state.turn,
      actor: newTarget.name,
      type: 'STATUS',
      action: 'State Change',
      result: `${newTarget.name} is now ${newTarget.controlState}!`,
      narrative: `${newTarget.name}'s composure falters; they are now ${newTarget.controlState}!`,
      timestamp: Date.now(),
      meta: {
        newControlState: newTarget.controlState
      }
    });
  }
  return {
    newAttacker: newAttacker,
    newTarget: newTarget,
    logEntries,
    narrative
  };
}

// Utility to convert Move to Ability for disruption logic
export function moveToAbility(move: Move): Ability {
  return {
    id: move.id,
    name: move.name,
    type: 'attack', // Fallback, as Move does not have disruption/positioning
    impactClass: 'moderate', // Fallback, as Move does not have impactClass
    description: move.description || move.name,
  };
}

// TacticalMemory instance per AI (could be attached to BattleCharacter or managed externally)
const tacticalMemoryMap = new WeakMap<BattleCharacter, TacticalMemory>();

export function selectTacticalMove(
  self: BattleCharacter,
  enemy: BattleCharacter,
  availableMoves: Move[],
  location: string,
  // arcModifiers?: ArcStateModifier
): { move: Move; reasoning: string; tacticalAnalysis: string, tacticalMemoryLog?: string, tacticalMemoryLogEntry?: BattleLogEntry } {
  // const locationType = getLocationType(location);
  // const isAirbender = self.base.bending === 'air';
  let tacticalMemory = tacticalMemoryMap.get(self);
  if (!tacticalMemory) {
    tacticalMemory = new TacticalMemory();
    tacticalMemoryMap.set(self, tacticalMemory);
  }
  const usableMoves = availableMoves.filter(move => 
    canUseMove(move, self, enemy, location)
  );
  if (usableMoves.length === 0) {
    // ... (fallback logic remains the same) ...
  }
  // --- NEW: ESCALATION MODE OVERRIDE ---
  if (self.flags?.forcedEscalation === 'true') {
    const signatureMoves = usableMoves.filter(move =>
      move.id.includes('Blazing') || move.id.includes('Wind') || move.id.includes('Blue') || move.id.includes('Fire') || move.id.includes('Slice') || move.id.includes('Relentless')
    );
    const highDamageMoves = usableMoves.filter(move => move.baseDamage >= 5 && !move.isChargeUp);
    let chosenMove: Move | undefined;
    let reasoning = "FORCED ESCALATION - Prioritizing signature and high-damage moves!";
    // 1. Prioritize Signature Moves
    if (signatureMoves.length > 0) {
      chosenMove = signatureMoves.sort((a, b) => b.baseDamage - a.baseDamage)[0];
      reasoning += ` Using signature move: ${chosenMove.name}.`;
    } 
    // 2. Prioritize other High Damage Moves
    else if (highDamageMoves.length > 0) {
      chosenMove = highDamageMoves.sort((a, b) => b.baseDamage - a.baseDamage)[0];
      reasoning += ` Using high-damage move: ${chosenMove.name}.`;
    } 
    // 3. Fallback to any available non-Basic Strike move
    else {
      chosenMove = usableMoves.find(m => !m.id.includes('Basic')) || usableMoves[0];
      reasoning += ` No signature/high-damage moves available, using best option: ${chosenMove.name}.`;
    }
    return {
      move: chosenMove,
      reasoning,
      tacticalAnalysis: "Forced Escalation",
    };
  }
  // --- END OF ESCALATION MODE OVERRIDE ---
  // --- Regular Tactical Scoring (for non-escalation turns) ---
  const identityAdjustments = adjustScoresByIdentity(self, usableMoves);
  const scoredMoves = usableMoves.map(move => {
    let score = 0;
    let reasoning = "";
    const tacticalFactors: string[] = [];
    // --- ENHANCED: Punish bonus now scales with move power ---
    if (enemy.isCharging || enemy.position === "repositioning" || enemy.position === "stunned") {
      if (move.punishIfCharging) {
        score += 200;
        reasoning += "PUNISHING VULNERABLE ENEMY! ";
      }
      if (move.baseDamage > 0) {
        score += 80;
        reasoning += "Enemy is vulnerable, attacking! ";
      }
    }
    // --- NEW: Add a penalty for using Basic Strike when other options are available ---
    if (move.id.includes('basic_strike') && usableMoves.length > 1) {
      score -= 50; // Heavily discourage Basic Strike if other moves can be used
      reasoning += "Avoiding weak Basic Strike. ";
      tacticalFactors.push("Weak Move Avoidance");
    }
    // --- (Keep charge-up, position, and environmental logic as is) ---
    score += move.baseDamage * 2;
    score -= move.chiCost;
    // ... (cooldown and maxUses logic remains the same) ...
    // --- TUNED: Reduced repetition penalties ---
    if (self.lastMove === move.name) {
      if (self.flags?.forcedEscalation === 'true' && 
          (move.id.includes('Blazing') || move.id.includes('Wind') || move.id.includes('Blue') || move.id.includes('Fire') || move.id.includes('Slice'))) {
        score += 20;
        reasoning += "Signature move repetition during escalation. ";
        tacticalFactors.push("Escalation Signature Repetition");
      } else {
        const repetitionPenalty = self.flags?.forcedEscalation === 'true' ? 15 : 30; // Reduced from 60
        score -= repetitionPenalty;
        reasoning += "Avoiding move repetition. ";
        tacticalFactors.push("Move Variety");
      }
    }
    const recentMoves = self.moveHistory.slice(-3);
    if (recentMoves.includes(move.name)) {
      const recentPenalty = self.flags?.forcedEscalation === 'true' ? 5 : 15; // Reduced from 25
      score -= recentPenalty;
      reasoning += "Move used recently. ";
      tacticalFactors.push("Recent Use");
    }
    // --- (Keep the rest of the scoring logic as is) ---
    const identityMod = identityAdjustments[move.name];
    if (identityMod) {
      score += identityMod.adjustment;
      reasoning += `${identityMod.reason}. `;
      tacticalFactors.push("Identity Influence");
    }
    // ... (and so on for the rest of the function)
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
  };
}