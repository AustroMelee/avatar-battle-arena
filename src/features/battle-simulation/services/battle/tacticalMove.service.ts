// CONTEXT: Tactical Move Service
// RESPONSIBILITY: Execute tactical moves with enhanced narrative generation

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

import { createNarrativeService } from '../narrative';

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
 * @description Executes a tactical move with enhanced narrative generation
 * @param {Move} move - The move to execute
 * @param {BattleCharacter} attacker - The attacking character
 * @param {BattleCharacter} target - The target character
 * @param {BattleState} state - Current battle state
 * @returns {TacticalMoveResult} The execution result with enhanced narrative
 */
export function executeTacticalMove(
  move: Move,
  attacker: BattleCharacter,
  target: BattleCharacter,
  state: BattleState
): TacticalMoveResult {
  const newAttacker = { ...attacker };
  const newTarget = { ...target };
  let narrative = '';
  
  // Initialize narrative service for enhanced storytelling
  const narrativeService = createNarrativeService();
  
  // Helper function to update analytics
  const updateAnalytics = (damage: number, chiCost: number, punishDamage: number = 0) => {
    if (state.analytics) {
      state.analytics.totalDamage += damage;
      state.analytics.totalChiSpent += chiCost;
      if (punishDamage > 0) {
        state.analytics.punishOpportunities += 1;
      }
    }
  };
  
  // Handle repositioning moves
  if (move.changesPosition === "repositioning") {
    const repositionResult = performReposition(newAttacker, state.location || 'Open Field', state.turn);
    
    if (repositionResult.damage) {
      newAttacker.currentHealth = Math.max(0, newAttacker.currentHealth - repositionResult.damage);
      // Update analytics immediately for reposition damage
      updateAnalytics(repositionResult.damage, 0);
    }
    
    // Generate enhanced narrative for repositioning
    const context = {
      damage: repositionResult.damage || 0,
      maxHealth: newTarget.stats.power + newTarget.stats.defense + newTarget.stats.agility,
      isMiss: false,
      isCritical: false,
      isPatternBreak: newAttacker.flags?.forcedEscalation === 'true' && newAttacker.flags?.damageMultiplier === '2.0',
      isEscalation: newAttacker.flags?.forcedEscalation === 'true',
      consecutiveHits: 0,
      consecutiveMisses: 0,
      turnNumber: state.turn,
      characterState: (newAttacker.flags?.usedDesperation === true ? 'desperate' : 
                     newAttacker.currentHealth < 30 ? 'wounded' : 
                     newAttacker.currentHealth < 60 ? 'exhausted' : 'fresh') as 'fresh' | 'wounded' | 'exhausted' | 'desperate',
      chi: newAttacker.resources.chi || 0
    };
    
    // Generate enhanced narrative for repositioning
    const repositionNarrative = narrativeService.generateNarrative(
      newAttacker.name,
      context,
      'miss',
      move.name
    );
    
    if (repositionNarrative && repositionNarrative.trim()) {
      narrative = repositionNarrative;
      console.log(`DEBUG: Enhanced reposition narrative for ${newAttacker.name}: "${narrative}"`);
    } else {
      narrative = repositionResult.narrative || `${newAttacker.name} repositions to gain advantage!`;
      console.log(`DEBUG: Fallback reposition narrative for ${newAttacker.name}: "${narrative}"`);
    }
    
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
      // Update analytics immediately for charge interruption damage
      updateAnalytics(chargeResult.damage || 0, 0);
      
      // Generate enhanced narrative for charge interruption
      const context = {
        damage: chargeResult.damage || 0,
        maxHealth: newTarget.stats.power + newTarget.stats.defense + newTarget.stats.agility,
        isMiss: false,
        isCritical: false,
        isPatternBreak: newAttacker.flags?.forcedEscalation === 'true' && newAttacker.flags?.damageMultiplier === '2.0',
        isEscalation: newAttacker.flags?.forcedEscalation === 'true',
        consecutiveHits: 0,
        consecutiveMisses: 0,
        turnNumber: state.turn,
        characterState: (newAttacker.flags?.usedDesperation === true ? 'desperate' : 
                       newAttacker.currentHealth < 30 ? 'wounded' : 
                       newAttacker.currentHealth < 60 ? 'exhausted' : 'fresh') as 'fresh' | 'wounded' | 'exhausted' | 'desperate',
        chi: newAttacker.resources.chi || 0
      };
      
      // Generate enhanced narrative for charge interruption
      const interruptionNarrative = narrativeService.generateNarrative(
        newAttacker.name,
        context,
        'miss',
        move.name
      );
      
      if (interruptionNarrative && interruptionNarrative.trim()) {
        narrative = interruptionNarrative;
        console.log(`DEBUG: Enhanced interruption narrative for ${newAttacker.name}: "${narrative}"`);
      } else {
        narrative = chargeResult.narrative || `${newAttacker.name}'s charge is interrupted!`;
        console.log(`DEBUG: Fallback interruption narrative for ${newAttacker.name}: "${narrative}"`);
      }
      
      // Update move usage limits even for interrupted charge-ups
      if (move.maxUses) {
        if (!newAttacker.usesLeft) {
          newAttacker.usesLeft = {};
        }
        const currentUses = newAttacker.usesLeft[move.name] ?? move.maxUses;
        newAttacker.usesLeft[move.name] = Math.max(0, currentUses - 1);
        console.log(`DEBUG: ${newAttacker.name} interrupted charge-up of ${move.name}, uses left: ${newAttacker.usesLeft[move.name]}`);
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
        console.log(`DEBUG: ${newAttacker.name} escalation charge damage: ${chargeDamage} (${escalationMultiplier}x multiplier)`);
      }
      
      // Apply real punishment damage for vulnerable enemies
      let chargePunishDamage = 0;
      if (newTarget.isCharging || newTarget.position === "repositioning" || newTarget.position === "stunned") {
        const punishMultiplier = move.punishIfCharging ? 3 : 2;
        const baseChargeDamage = chargeDamage;
        chargeDamage = Math.floor(chargeDamage * punishMultiplier);
        chargePunishDamage = chargeDamage - baseChargeDamage;
        console.log(`DEBUG: ${newAttacker.name} PUNISHING VULNERABLE ENEMY with charge: ${chargeDamage} damage (${punishMultiplier}x multiplier)`);
      }
      
      newTarget.currentHealth = Math.max(0, newTarget.currentHealth - chargeDamage);
      
      // Update analytics immediately for charge damage and chi cost
      const actualChiCost = Math.max(0, move.chiCost - positionBonus.chiCostReduction);
      updateAnalytics(chargeDamage, actualChiCost, chargePunishDamage);
      
      // Generate enhanced narrative for charged attack
      const context = {
        damage: chargeDamage,
        maxHealth: newTarget.stats.power + newTarget.stats.defense + newTarget.stats.agility,
        isMiss: false,
        isCritical: false,
        isPatternBreak: newAttacker.flags?.forcedEscalation === 'true' && newAttacker.flags?.damageMultiplier === '2.0',
        isEscalation: newAttacker.flags?.forcedEscalation === 'true',
        consecutiveHits: 0,
        consecutiveMisses: 0,
        turnNumber: state.turn,
        characterState: (newAttacker.flags?.usedDesperation === true ? 'desperate' : 
                       newAttacker.currentHealth < 30 ? 'wounded' : 
                       newAttacker.currentHealth < 60 ? 'exhausted' : 'fresh') as 'fresh' | 'wounded' | 'exhausted' | 'desperate',
        chi: newAttacker.resources.chi || 0
      };
      
      // Generate enhanced narrative for charged attack
      const chargeNarrative = narrativeService.generateNarrative(
        newAttacker.name,
        context,
        'devastating',
        move.name
      );
      
      if (chargeNarrative && chargeNarrative.trim()) {
        narrative = chargeNarrative;
        console.log(`DEBUG: Enhanced charge narrative for ${newAttacker.name}: "${narrative}"`);
      } else {
        narrative = `CHARGED ATTACK! ${newAttacker.name} unleashes ${move.name} for ${chargeDamage} damage!`;
        console.log(`DEBUG: Fallback charge narrative for ${newAttacker.name}: "${narrative}"`);
      }
      
      // Update move usage limits for completed charge-up moves
      if (move.maxUses) {
        if (!newAttacker.usesLeft) {
          newAttacker.usesLeft = {};
        }
        const currentUses = newAttacker.usesLeft[move.name] ?? move.maxUses;
        newAttacker.usesLeft[move.name] = Math.max(0, currentUses - 1);
        console.log(`DEBUG: ${newAttacker.name} completed charge-up of ${move.name}, uses left: ${newAttacker.usesLeft[move.name]}`);
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
      // Generate enhanced narrative for charging
      const context = {
        damage: 0,
        maxHealth: newTarget.stats.power + newTarget.stats.defense + newTarget.stats.agility,
        isMiss: false,
        isCritical: false,
        isPatternBreak: newAttacker.flags?.forcedEscalation === 'true' && newAttacker.flags?.damageMultiplier === '2.0',
        isEscalation: newAttacker.flags?.forcedEscalation === 'true',
        consecutiveHits: 0,
        consecutiveMisses: 0,
        turnNumber: state.turn,
        characterState: (newAttacker.flags?.usedDesperation === true ? 'desperate' : 
                       newAttacker.currentHealth < 30 ? 'wounded' : 
                       newAttacker.currentHealth < 60 ? 'exhausted' : 'fresh') as 'fresh' | 'wounded' | 'exhausted' | 'desperate',
        chi: newAttacker.resources.chi || 0
      };
      
      // Generate enhanced narrative for charging
      const chargingNarrative = narrativeService.generateNarrative(
        newAttacker.name,
        context,
        'miss',
        move.name
      );
      
      if (chargingNarrative && chargingNarrative.trim()) {
        narrative = chargingNarrative;
        console.log(`DEBUG: Enhanced charging narrative for ${newAttacker.name}: "${narrative}"`);
      } else {
        narrative = chargeResult.narrative || `${newAttacker.name} continues charging ${move.name}...`;
        console.log(`DEBUG: Fallback charging narrative for ${newAttacker.name}: "${narrative}"`);
      }
      
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
  
  // ENHANCED: Real punishment mechanics
  let finalDamage = Math.floor(move.baseDamage * positionBonus.damageMultiplier) + punishBonus;
  
  // Apply escalation damage multiplier if in forced escalation
  if (newAttacker.flags?.forcedEscalation === 'true') {
    const escalationMultiplier = parseFloat(newAttacker.flags.damageMultiplier || '1.0');
    finalDamage = Math.floor(finalDamage * escalationMultiplier);
    console.log(`DEBUG: ${newAttacker.name} escalation damage: ${finalDamage} (${escalationMultiplier}x multiplier)`);
  }
  
  // Apply real punishment damage for vulnerable enemies
  let punishDamage = 0;
  if (newTarget.isCharging || newTarget.position === "repositioning" || newTarget.position === "stunned") {
    const punishMultiplier = move.punishIfCharging ? 3 : 2; // Triple damage for punish moves, double for regular attacks
    const baseDamage = finalDamage;
    finalDamage = Math.floor(finalDamage * punishMultiplier);
    punishDamage = finalDamage - baseDamage;
    console.log(`DEBUG: ${newAttacker.name} PUNISHING VULNERABLE ENEMY: ${finalDamage} damage (${punishMultiplier}x multiplier)`);
  }
  
  newTarget.currentHealth = Math.max(0, newTarget.currentHealth - finalDamage);
  
  // Update analytics immediately for damage and chi cost
  const actualChiCost = Math.max(0, move.chiCost - positionBonus.chiCostReduction);
  updateAnalytics(finalDamage, actualChiCost, punishDamage);
  
  // Apply position changes
  const positionResult = updatePositionAfterMove(newAttacker, move, state.turn);
  if (positionResult.positionChanged) {
    narrative += positionResult.narrative + " ";
  }
  
  // Generate enhanced narrative for regular attack
  const context = {
    damage: finalDamage,
    maxHealth: newTarget.stats.power + newTarget.stats.defense + newTarget.stats.agility,
    isMiss: finalDamage === 0,
    isCritical: false, // Could be enhanced to detect critical hits
    isPatternBreak: newAttacker.flags?.forcedEscalation === 'true' && newAttacker.flags?.damageMultiplier === '2.0',
    isEscalation: newAttacker.flags?.forcedEscalation === 'true',
    consecutiveHits: 0, // Could be calculated from battle log
    consecutiveMisses: 0, // Could be calculated from battle log
    turnNumber: state.turn,
    characterState: (newAttacker.flags?.usedDesperation === true ? 'desperate' : 
                   newAttacker.currentHealth < 30 ? 'wounded' : 
                   newAttacker.currentHealth < 60 ? 'exhausted' : 'fresh') as 'fresh' | 'wounded' | 'exhausted' | 'desperate',
    chi: newAttacker.resources.chi || 0
  };
  
  // Generate enhanced narrative
  const attackNarrative = narrativeService.generateNarrative(
    newAttacker.name,
    context,
    finalDamage === 0 ? 'miss' : finalDamage < 10 ? 'glance' : finalDamage < 25 ? 'hit' : 'devastating',
    move.name
  );
  
  // Use enhanced narrative if generated, otherwise fallback
  if (attackNarrative && attackNarrative.trim()) {
    narrative = attackNarrative;
    console.log(`DEBUG: Enhanced narrative for ${newAttacker.name}: "${narrative}"`);
  } else {
    narrative = `${newAttacker.name} uses ${move.name} and deals ${finalDamage} damage!`;
    console.log(`DEBUG: Fallback narrative for ${newAttacker.name}: "${narrative}"`);
  }
  
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
    console.log(`DEBUG: ${newAttacker.name} used ${move.name}, uses left: ${newAttacker.usesLeft[move.name]}`);
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
      resourceCost: actualChiCost,
      positionBonus: positionBonus.damageMultiplier,
      punishBonus,
      punishDamage: punishDamage > 0 ? punishDamage : undefined,
      positionChange: positionResult.positionChanged ? {
        from: attacker.position,
        to: newAttacker.position,
        success: true
      } : undefined
    }
  );
  
  return { newAttacker, newTarget, logEntry, narrative };
} 