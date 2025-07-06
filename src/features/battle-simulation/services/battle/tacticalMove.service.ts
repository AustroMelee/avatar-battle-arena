// CONTEXT: Tactical Move Service
// RESPONSIBILITY: Execute tactical moves with positioning, charge-up, and status effect mechanics

import { BattleState, BattleCharacter, BattleLogEntry } from '../../types';
import { Move } from '../../types/move.types';
import { resolveMove } from './moveLogic.service';
import { createBattleContext } from './battleContext.service';
// Removed unused import
import { modifyDamageWithEffects } from '../effects/statusEffect.service';
import { createStatusEffect, applyEffect } from '../effects/statusEffect.service';
import { handleChargeUp, calculatePunishBonus, applyPositionBonuses } from './positioningMechanics.service';
import { generateTacticalNarrative } from './TacticalNarrativeService';
import { resolveImpact } from './resolveImpact';
import { checkDefeat } from './checkDefeat';
import { getMoveFatigueMultiplier, applyMoveFatigue } from './moveFatigue.service';
import { canOpenDisruptionWindow, openDisruptionWindow, resolveDisruptionWindow } from './disruptionWindow.service';
import { generateUniqueLogId } from '../ai/logQueries';

/**
 * @description Result of executing a tactical move
 */
export interface TacticalMoveResult {
  newAttacker: BattleCharacter;
  newTarget: BattleCharacter;
  logEntry: BattleLogEntry;
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
      const statusEffect = createStatusEffect(move.name, move.appliesEffect, target.name);
      const updatedTarget = applyEffect(newTarget, statusEffect);
      Object.assign(newTarget, updatedTarget);
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
    logEntry,
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
    const moveResult = resolveMove(move, battleContext, attacker, target, state.turn);
    damage = moveResult.damage;
    
    // Apply status effects if any
    if (move.appliesEffect) {
      const shouldApply = !move.appliesEffect.chance || Math.random() < move.appliesEffect.chance;
      if (shouldApply) {
        const statusEffect = createStatusEffect(move.name, move.appliesEffect, target.name);
        const updatedTarget = applyEffect(newTarget, statusEffect);
        Object.assign(newTarget, updatedTarget);
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
  
  // Create log entry
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
  
  return {
    newAttacker: attacker,
    newTarget: newTarget,
    logEntry,
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
  // --- MOVE FATIGUE ---
  const fatigueMultiplier = getMoveFatigueMultiplier(attacker, move as any);
  let impactResult = resolveImpact(attacker, newTarget, move as any);
  if (impactResult && typeof impactResult.stabilityDamage === 'number') {
    impactResult = {
      ...impactResult,
      stabilityDamage: applyMoveFatigue(impactResult.stabilityDamage, fatigueMultiplier),
      controlShift: applyMoveFatigue(impactResult.controlShift, fatigueMultiplier)
    };
  }
  // --- HEALTH DAMAGE LOGIC ---
  // Calculate base damage using resolveMove
  const battleContext = createBattleContext(attacker, newTarget, state);
  const moveResult = resolveMove(move, battleContext, attacker, newTarget, state.turn);
  let damage = applyMoveFatigue(moveResult.damage, fatigueMultiplier);
  // Apply punish bonus if applicable
  const punishBonus = calculatePunishBonus(move, newTarget);
  if (punishBonus > 0) {
    damage += punishBonus;
  }
  // Apply position bonus
  const positionBonus = applyPositionBonuses(move, attacker);
  damage = Math.floor(damage * positionBonus.damageMultiplier);
  // Apply final damage to target's health
  newTarget.currentHealth = Math.max(0, newTarget.currentHealth - damage);
  // --- END HEALTH DAMAGE LOGIC ---
  // --- UPDATE STATE ---
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
  // Spend chi, cooldown, move history as before
  const chiCost = move.chiCost || 0;
  attacker.resources.chi = Math.max(0, attacker.resources.chi - chiCost);
  if (move.cooldown && move.cooldown > 0) {
    attacker.cooldowns[move.id] = move.cooldown;
  }
  attacker.lastMove = move.name;
  attacker.moveHistory.push(move.name);
  // Narrative
  const narrative = impactResult.narrative || moveResult.narrative;
  // --- SINGLE LOG ENTRY ---
  const logEntry: BattleLogEntry = {
    id: generateUniqueLogId('tactical'),
    turn: state.turn,
    actor: attacker.name,
    type: 'TACTICAL',
    action: move.name,
    target: target.name,
    damage, // Include calculated damage
    result: `${target.name} takes ${damage} damage. ${narrative}`,
    narrative,
    timestamp: Date.now(),
    meta: {
      controlShift: impactResult.controlShift,
      stabilityChange: impactResult.stabilityDamage,
      newControlState: newTarget.controlState,
      fatigueMultiplier
    }
  };
  // If controlState changed, add explicit log entry
  let stateChangeLogEntry: BattleLogEntry | undefined;
  if (prevControlState !== newTarget.controlState) {
    stateChangeLogEntry = {
      id: generateUniqueLogId('statechange'),
      turn: state.turn,
      actor: newTarget.name,
      type: 'STATUS',
      action: 'State Change',
      result: `${newTarget.name} is now ${newTarget.controlState}!`,
      narrative: `${newTarget.name} is now ${newTarget.controlState}!`,
      timestamp: Date.now(),
      meta: {
        newControlState: newTarget.controlState
      }
    };
  }
  // Return only the main log entry (and state change if needed)
  return {
    newAttacker: attacker,
    newTarget,
    logEntry,
    narrative,
    ...(stateChangeLogEntry ? { stateChangeLogEntry } : {})
  };
}