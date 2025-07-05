// CONTEXT: Tactical Move Service
// RESPONSIBILITY: Execute tactical moves with pure game logic

import { BattleState, BattleCharacter, BattleLogEntry } from '../../types';
import { Move } from '../../types/move.types';
import { 
  performReposition, 
  handleChargeUp, 
  applyPositionBonuses, 
  calculatePunishBonus,
  updatePositionAfterMove,
  createTacticalLogEntry
} from './positioningMechanics.service';

import { 
  generateRepositionNarrative,
  generateChargeNarrative,
  generateInterruptionNarrative,
  generateRegularTacticalNarrative
} from './TacticalNarrativeService';

import { 
  logTacticalMove,
  logEscalation,
  logPunishment,
  logNarrative,
  logMoveUsage,
  logCharge
} from './BattleLogger';

import { 
  updateTacticalAnalytics,
  trackEscalationEvent
} from './BattleAnalyticsTracker';

/**
 * @description Result of executing a tactical move
 */
export interface TacticalMoveResult {
  newAttacker: BattleCharacter;
  newTarget: BattleCharacter;
  logEntry: BattleLogEntry;
  narrative: string;
}

/**
 * @description Executes a tactical move with pure game logic
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
  const newAttacker = { ...attacker };
  const newTarget = { ...target };
  let narrative = '';
  
  // Handle repositioning moves
  if (move.changesPosition === "repositioning") {
    const repositionResult = performReposition(newAttacker, state.location || 'Open Field', state.turn);
    
    if (repositionResult.damage) {
      newAttacker.currentHealth = Math.max(0, newAttacker.currentHealth - repositionResult.damage);
      // Update analytics for reposition damage
      updateTacticalAnalytics(state, repositionResult.damage, 0);
    }
    
    // Generate narrative for repositioning
    const narrativeResult = await generateRepositionNarrative(
      newAttacker,
      newTarget,
      move,
      repositionResult.damage || 0,
      state,
      repositionResult.narrative
    );
    narrative = narrativeResult.narrative;
    
    // Log reposition execution
    logTacticalMove(newAttacker.name, move.name, repositionResult.damage || 0, 'repositioned');
    logNarrative(newAttacker.name, narrative, 'enhanced');
    
    const logEntry = createTacticalLogEntry(
      state.turn,
      newAttacker.name,
      'REPOSITION',
      move.name,
      repositionResult.success ? 'Success' : 'Failed',
      narrative,
      {
        positionChange: {
          from: attacker.position,
          to: repositionResult.newPosition,
          success: repositionResult.success
        },
        damage: repositionResult.damage
      }
    );
    
    return { newAttacker, newTarget, logEntry, narrative };
  }
  
  // Handle charge-up moves
  if (move.isChargeUp) {
    const chargeResult = handleChargeUp(newAttacker, newTarget, move);
    
    if (chargeResult.interrupted) {
      newAttacker.currentHealth = Math.max(0, newAttacker.currentHealth - (chargeResult.damage || 0));
      // Update analytics for charge interruption damage
      updateTacticalAnalytics(state, chargeResult.damage || 0, 0);
      
      // Generate narrative for charge interruption
      const narrativeResult = await generateInterruptionNarrative(
        newAttacker,
        newTarget,
        move,
        chargeResult.damage || 0,
        state,
        chargeResult.narrative
      );
      narrative = narrativeResult.narrative;
      
      // Log charge interruption
      logTacticalMove(newAttacker.name, move.name, chargeResult.damage || 0, 'charge interrupted');
      logNarrative(newAttacker.name, narrative, 'enhanced');
      
      // Update move usage limits even for interrupted charge-ups
      if (move.maxUses) {
        if (!newAttacker.usesLeft) {
          newAttacker.usesLeft = {};
        }
        const currentUses = newAttacker.usesLeft[move.name] ?? move.maxUses;
        newAttacker.usesLeft[move.name] = Math.max(0, currentUses - 1);
        logMoveUsage(newAttacker.name, move.name, newAttacker.usesLeft[move.name], 'interrupted charge-up of');
      }
      
      const logEntry = createTacticalLogEntry(
        state.turn,
        newAttacker.name,
        'INTERRUPT',
        move.name,
        'Interrupted',
        narrative,
        {
          chargeInterrupted: true,
          damage: chargeResult.damage
        }
      );
      
      return { newAttacker, newTarget, logEntry, narrative };
    }
    
    if ((newAttacker.chargeProgress || 0) >= 100) {
      // Charge complete - execute the move
      const positionBonus = applyPositionBonuses(move, newAttacker);
      const punishBonus = calculatePunishBonus(move, newTarget);
      
      let chargeDamage = Math.floor(move.baseDamage * positionBonus.damageMultiplier) + punishBonus;
      
      // Apply escalation damage multiplier if in forced escalation
      if (newAttacker.flags?.forcedEscalation === 'true') {
        const escalationMultiplier = parseFloat(newAttacker.flags.damageMultiplier || '1.0');
        chargeDamage = Math.floor(chargeDamage * escalationMultiplier);
        logEscalation(newAttacker.name, chargeDamage, escalationMultiplier);
        trackEscalationEvent(state);
      }
      
      // Apply real punishment damage for vulnerable enemies
      let chargePunishDamage = 0;
      if (newTarget.isCharging || newTarget.position === "repositioning" || newTarget.position === "stunned") {
        const punishMultiplier = move.punishIfCharging ? 3 : 2;
        const baseChargeDamage = chargeDamage;
        chargeDamage = Math.floor(chargeDamage * punishMultiplier);
        chargePunishDamage = chargeDamage - baseChargeDamage;
        logPunishment(newAttacker.name, chargeDamage, punishMultiplier, 'vulnerable enemy with charge');
      }
      
      newTarget.currentHealth = Math.max(0, newTarget.currentHealth - chargeDamage);
      
      // Update analytics for charge damage and chi cost
      const actualChiCost = Math.max(0, move.chiCost - positionBonus.chiCostReduction);
      updateTacticalAnalytics(state, chargeDamage, actualChiCost, chargePunishDamage);
      
      // Generate narrative for charged attack
      const narrativeResult = await generateChargeNarrative(
        newAttacker,
        newTarget,
        move,
        chargeDamage,
        state,
        true // isComplete
      );
      narrative = narrativeResult.narrative;
      
      // Log charge completion
      logTacticalMove(newAttacker.name, move.name, chargeDamage, 'completed charge-up of');
      logNarrative(newAttacker.name, narrative, 'enhanced');
      
      // Update move usage limits for completed charge-up moves
      if (move.maxUses) {
        if (!newAttacker.usesLeft) {
          newAttacker.usesLeft = {};
        }
        const currentUses = newAttacker.usesLeft[move.name] ?? move.maxUses;
        newAttacker.usesLeft[move.name] = Math.max(0, currentUses - 1);
        logMoveUsage(newAttacker.name, move.name, newAttacker.usesLeft[move.name], 'completed charge-up of');
      }
      
      const logEntry = createTacticalLogEntry(
        state.turn,
        newAttacker.name,
        'CHARGE',
        move.name,
        `Deals ${chargeDamage} damage`,
        narrative,
        {
          damage: chargeDamage,
          chargeProgress: 100,
          positionBonus: positionBonus.damageMultiplier,
          punishBonus,
          punishDamage: chargePunishDamage > 0 ? chargePunishDamage : undefined
        }
      );
      
      return { newAttacker, newTarget, logEntry, narrative };
    } else {
      // Still charging
      // Generate narrative for charging
      const narrativeResult = await generateChargeNarrative(
        newAttacker,
        newTarget,
        move,
        0,
        state,
        false // isComplete
      );
      narrative = narrativeResult.narrative;
      
      // Log charging progress
      logCharge(newAttacker.name, move.name, newAttacker.chargeProgress || 0, 'continues charging');
      logNarrative(newAttacker.name, narrative, 'enhanced');
      
      const logEntry = createTacticalLogEntry(
        state.turn,
        newAttacker.name,
        'CHARGE',
        move.name,
        'Charging',
        narrative,
        {
          chargeProgress: newAttacker.chargeProgress
        }
      );
      
      return { newAttacker, newTarget, logEntry, narrative };
    }
  }
  
  // Handle regular moves
  const positionBonus = applyPositionBonuses(move, newAttacker);
  const punishBonus = calculatePunishBonus(move, newTarget);
  
  // Real punishment mechanics
  let finalDamage = Math.floor(move.baseDamage * positionBonus.damageMultiplier) + punishBonus;
  
  // Apply escalation damage multiplier if in forced escalation
  if (newAttacker.flags?.forcedEscalation === 'true') {
    const escalationMultiplier = parseFloat(newAttacker.flags.damageMultiplier || '1.0');
    finalDamage = Math.floor(finalDamage * escalationMultiplier);
    logEscalation(newAttacker.name, finalDamage, escalationMultiplier);
    trackEscalationEvent(state);
  }
  
  // Apply real punishment damage for vulnerable enemies
  let punishDamage = 0;
  if (newTarget.isCharging || newTarget.position === "repositioning" || newTarget.position === "stunned") {
    const punishMultiplier = move.punishIfCharging ? 3 : 2; // Triple damage for punish moves, double for regular attacks
    const baseDamage = finalDamage;
    finalDamage = Math.floor(finalDamage * punishMultiplier);
    punishDamage = finalDamage - baseDamage;
    logPunishment(newAttacker.name, finalDamage, punishMultiplier, 'vulnerable enemy');
  }
  
  newTarget.currentHealth = Math.max(0, newTarget.currentHealth - finalDamage);
  
  // Update analytics for damage and chi cost
  const actualChiCost = Math.max(0, move.chiCost - positionBonus.chiCostReduction);
  updateTacticalAnalytics(state, finalDamage, actualChiCost, punishDamage);
  
  // Apply position changes
  const positionResult = updatePositionAfterMove(newAttacker, move, state.turn);
  if (positionResult.positionChanged) {
    narrative += positionResult.narrative + " ";
  }
  
  // Generate narrative for regular attack
  const narrativeResult = await generateRegularTacticalNarrative(
    newAttacker,
    newTarget,
    move,
    finalDamage,
    state
  );
  narrative = narrativeResult.narrative;
  
  // Log regular move execution
  logTacticalMove(newAttacker.name, move.name, finalDamage, 'used');
  logNarrative(newAttacker.name, narrative, 'enhanced');
  
  // Spend chi
  newAttacker.resources.chi = Math.max(0, newAttacker.resources.chi - actualChiCost);
  
  // Apply cooldown
  if (move.cooldown > 0) {
    newAttacker.cooldowns[move.id] = move.cooldown;
  }
  
  // Update move usage limits
  if (move.maxUses) {
    if (!newAttacker.usesLeft) {
      newAttacker.usesLeft = {};
    }
    const currentUses = newAttacker.usesLeft[move.name] ?? move.maxUses;
    newAttacker.usesLeft[move.name] = Math.max(0, currentUses - 1);
    logMoveUsage(newAttacker.name, move.name, newAttacker.usesLeft[move.name], 'used');
  }
  
  // Update move history
  newAttacker.lastMove = move.name;
  newAttacker.moveHistory.push(move.name);
  
  const logEntry = createTacticalLogEntry(
    state.turn,
    newAttacker.name,
    'POSITION' as const,
    move.name,
    `Deals ${finalDamage} damage`,
    narrative,
    {
      damage: finalDamage,
      positionBonus: positionBonus.damageMultiplier,
      punishBonus,
      punishDamage: punishDamage > 0 ? punishDamage : undefined,
      positionChanged: positionResult.positionChanged
    }
  );
  
  return { newAttacker, newTarget, logEntry, narrative };
}