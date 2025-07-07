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
      const { updatedCharacter } = applyEffect(newTarget, statusEffect, state.turn);
      Object.assign(newTarget, updatedCharacter);
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
    result: damage > 0 ? `${target.name} takes ${damage} damage.` : `${attacker.name} repositions.`,
    narrative,
    timestamp: Date.now(),
    details: {
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
        const { updatedCharacter } = applyEffect(newTarget, statusEffect, state.turn);
        Object.assign(newTarget, updatedCharacter);
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
    result: chargeResult.interrupted ? `${attacker.name}'s charge was interrupted!` : 
            damage > 0 ? `${target.name} takes ${damage} damage.` : `${attacker.name} continues charging.`,
    narrative,
    timestamp: Date.now(),
    details: {
      moveType: 'charge-up',
      chargeComplete: Number(attacker.chargeProgress && attacker.chargeProgress >= 100),
      interrupted: chargeResult.interrupted,
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
      const { updatedCharacter } = applyEffect(newTarget, statusEffect, state.turn);
      Object.assign(newTarget, updatedCharacter);
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
  }
  // --- COLLATERAL DAMAGE LOGIC ---
  if (move.collateralDamage && move.collateralDamage > 0) {
  }
  // --- DISRUPTION & STATE CHANGE ---
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
  const logEntry: BattleLogEntry = {
    id: generateUniqueLogId('tactical'),
    turn: state.turn,
    actor: newAttacker.name,
    type: 'TACTICAL', // Main event type
    action: move.name,
    target: target.name,
    result: `${target.name} takes ${damage} damage. ${narrative}`,
    narrative,
    timestamp: Date.now(),
    details: {
      controlShift: impactResult.controlShift,
      stabilityChange: impactResult.stabilityDamage,
      newControlState: newTarget.controlState,
      fatigueMultiplier
    }
  };
  return {
    newAttacker: newAttacker,
    newTarget: newTarget,
    logEntries: [logEntry],
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
      reasoning += ` Using fallback move: ${chosenMove.name}.`;
    }
  } else {
    // ... (rest of the function remains unchanged) ...
  }
  // ... (rest of the function remains unchanged) ...
  return {
    move: usableMoves[0],
    reasoning: 'Fallback: no valid move selection path reached.',
    tacticalAnalysis: 'Fallback',
  };
}
