// CONTEXT: Tactical Move Service
// RESPONSIBILITY: Execute tactical moves with positioning, charge-up, and status effect mechanics

import { BattleState, BattleCharacter, BattleLogEntry } from '../../types';
import { Move } from '../../types/move.types';
import { createBattleContext } from './battleContext.service';
import { createStatusEffect, applyEffect } from '../effects/statusEffect.service';
import { handleChargeUp, calculatePunishBonus, applyPositionBonuses, updatePositionAfterMove } from './positioningMechanics.service';
import { generateUniqueLogId } from '../ai/logQueries';
import { mapRawType } from '../utils/mechanicLogUtils';
import type { Ability } from '../../types/move.types';
import { getMoveFatigueMultiplier, applyMoveFatigue } from './moveFatigue.service';
import { resolveMove } from './moveLogic.service';
import { resolveImpact } from './resolveImpact';
import { checkDefeat } from './checkDefeat';
// import { getLocationType } from '../../types/move.types';
import { canUseMove } from './positioningMechanics.service';
import { TacticalMemory } from '../ai/tacticalMemory.service';
import { nes } from '@/common/branding/nonEmptyString';
import type { NonEmptyString } from '../../types';

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
    actor: 'System',
    type: mapRawType('REPOSITION'),
    action: move.name,
    target: target.name,
    result: nes((damage > 0 ? `${target.name} takes ${damage} damage.` : 'No result') as unknown as NonEmptyString),
    narrative: nes((narrative && narrative.length > 0 ? narrative : 'No narrative') as unknown as NonEmptyString),
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
    narrative: nes((narrative && narrative.length > 0 ? narrative : 'No narrative') as unknown as NonEmptyString)
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
    actor: 'System',
    type: mapRawType('CHARGE'),
    action: move.name,
    target: target.name,
    result: chargeResult.interrupted ? nes(`${attacker.name}'s charge was interrupted!`) : 
            damage > 0 ? nes(`${target.name} takes ${damage} damage.`) : nes(`${attacker.name} continues charging.`),
    narrative: nes((narrative && narrative.length > 0 ? narrative : 'No narrative') as unknown as NonEmptyString),
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
    narrative: nes((narrative && narrative.length > 0 ? narrative : 'No narrative') as unknown as NonEmptyString)
  };
}

/**
 * @description Handles regular tactical moves
 */
export async function handleRegularTacticalMove(
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
  // Ensure Gather Power cooldown is set even if move.cooldown is not defined
  if (move.name === 'Gather Power') {
    newAttacker.cooldowns['Gather Power'] = 1;
  }
  newAttacker.lastMove = move.name;
  newAttacker.moveHistory.push(move.name);

  // --- INTENT/STATUS FLAG LOGIC ---
  // If the move is evasive (by tag or name), set Evasive status for 1 turn
  if ((move.tags && move.tags.includes('evasive')) || move.name.toLowerCase().includes('glide')) {
    if (!newAttacker.statusFlags) newAttacker.statusFlags = [];
    newAttacker.statusFlags.push({ type: 'Evasive', turns: 1 });
  }
  // --- POSITIONING LOGIC ---
  updatePositionAfterMove(newAttacker, move);
  // (Position change logic can be added here if needed)
  // --- COLLATERAL DAMAGE LOGIC ---
  if (move.collateralDamage && move.collateralDamage > 0) {
    // (Collateral damage logic can be added here if needed)
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
    actor: 'System',
    type: mapRawType('TACTICAL'), // Main event type
    action: move.name,
    target: newTarget.name,
    result: damage > 0 ? nes(`${newTarget.name} takes ${damage} damage.`) : nes(`${newAttacker.name} attacks with ${move.name}.`),
    narrative: nes((narrative && narrative.length > 0 ? narrative : 'No narrative') as unknown as NonEmptyString),
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
    narrative: nes((narrative && narrative.length > 0 ? narrative : 'No narrative') as unknown as NonEmptyString)
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
  location: string
): { move: Move; tacticalAnalysis: string, tacticalMemoryLog?: string, tacticalMemoryLogEntry?: BattleLogEntry } {
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
    // 1. Prioritize Signature Moves
    if (signatureMoves.length > 0) {
      return {
        move: signatureMoves.sort((a, b) => b.baseDamage - a.baseDamage)[0],
        tacticalAnalysis: 'Signature Move',
      };
    } 
    // 2. Prioritize other High Damage Moves
    else if (highDamageMoves.length > 0) {
      return {
        move: highDamageMoves.sort((a, b) => b.baseDamage - a.baseDamage)[0],
        tacticalAnalysis: 'High Damage Move',
      };
    } 
    // 3. Fallback to any available non-Basic Strike move
    else {
      return {
        move: usableMoves.find(m => !m.id.includes('Basic')) || usableMoves[0],
        tacticalAnalysis: 'Fallback',
      };
    }
  } else {
    // ... (rest of the function remains unchanged) ...
  }
  // ... (rest of the function remains unchanged) ...
  return {
    move: usableMoves[0],
    tacticalAnalysis: 'Fallback',
  };
}

// --- Dramatic Move Selection Enforcement ---
/**
 * Selects a move, guaranteeing a dramatic/finisher/last-resort move in escalation, desperation, and climax phases.
 * Falls back to forced ending if none available.
 */
export function selectDramaticMove(availableMoves: Move[], phase: string): Move {
  // Filter for dramatic/finisher/last-resort moves
  const dramaticMoves = availableMoves.filter(m =>
    m.tags && (m.tags.includes('escalation') || m.tags.includes('desperation') || m.tags.includes('finisher') || m.tags.includes('last-resort'))
  );
  // If in dramatic phase, must select a dramatic move if available
  if ((phase === 'escalation' || phase === 'desperation' || phase === 'climax') && dramaticMoves.length > 0) {
    // Prefer finisher/last-resort if only those remain
    const finisher = dramaticMoves.find(m => m.tags && (m.tags.includes('finisher') || m.tags.includes('last-resort')));
    return finisher || dramaticMoves[0];
  }
  // If no dramatic move is available, trigger forced ending
  if ((phase === 'escalation' || phase === 'desperation' || phase === 'climax') && dramaticMoves.length === 0) {
    // Fallback to a static unique cinematic string for forced ending
    const uniqueLog = 'A forced ending occurs: the battle concludes in a dramatic, unforgettable moment.';
    return { id: 'forced_ending', name: 'Forced Ending', type: 'attack', baseDamage: 0, chiCost: 0, cooldown: 0, description: uniqueLog, tags: ['forced-ending'] };
  }
  // Otherwise, fallback to normal selection
  return availableMoves[0];
}

// --- Penalty Logic Update ---
/**
 * Ensures penalty logic cannot block all dramatic moves.
 * Exempts moves with 'finisher', 'last-resort', or 'desperation' tags from total restriction.
 */
export function filterPenalties(moves: Move[]): Move[] {
  const dramaticMoves = moves.filter(m => m.tags && (m.tags.includes('finisher') || m.tags.includes('last-resort') || m.tags.includes('desperation')));
  if (dramaticMoves.length > 0) {
    // Always leave at least one dramatic move available
    return moves.map(m => {
      if (m.tags && (m.tags.includes('finisher') || m.tags.includes('last-resort') || m.tags.includes('desperation'))) {
        return { ...m, restricted: false };
      }
      return m;
    });
  }
  return moves;
}
