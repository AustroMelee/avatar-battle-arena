// CONTEXT: Attack Move Service
// RESPONSIBILITY: Execute attack moves with enhanced narrative generation

import { BattleState, BattleCharacter, BattleLogEntry } from '../../types';
import { Ability } from '@/common/types';
// Removed unused import
import { convertAbilityToMove } from './moveConverter.service';
import { createBattleContext } from './battleContext.service';
import { resolveMove } from './moveLogic.service';
import { createNarrativeService } from '../narrative';
import { applyEffect, createStatusEffect, modifyDamageWithEffects } from '../effects/statusEffect.service';
import { resolveClash } from './defensiveResolution.service';
import { logStory } from '../utils/mechanicLogUtils';
import { ensureNonEmpty } from '../utils/strings';

/**
 * @description Result of executing an attack move
 */
export interface AttackMoveResult {
  newState: BattleState;
  logEntry: BattleLogEntry;
  damage: number;
  result: string;
  narrative: string;
  isCritical: boolean;
}

/**
 * @description Executes an attack move and calculates damage using the new dramatic mechanics with enhanced narrative generation
 * @param {Ability} ability - The attack ability to execute
 * @param {BattleCharacter} attacker - The attacking character
 * @param {BattleCharacter} target - The target character
 * @param {BattleState} state - Current battle state
 * @param {number} targetIndex - Index of target in participants array
 * @returns {Promise<AttackMoveResult>} The execution result
 */
export async function executeAttackMove(
  ability: Ability,
  attacker: BattleCharacter,
  target: BattleCharacter,
  state: BattleState,
  targetIndex: number
): Promise<AttackMoveResult> {
  console.log(`🔥🔥🔥 EXECUTING ATTACK MOVE - ${attacker.name} using ${ability.name} on ${target.name} 🔥🔥🔥`);
  
  // Convert ability to move format
  const move = convertAbilityToMove(ability);
  const battleContext = createBattleContext(attacker, target, state);
  
  // NEW: Check for defensive clash before damage calculation
  let finalDamage = 0;
  let clashNarrative = '';
  let wasEvaded = false;
  let wasParried = false;
  
  if (target.activeDefense) {
    console.log(`🛡️🛡️🛡️ DEFENSIVE CLASH DETECTED - ${target.name} has active defense: ${target.activeDefense.type} 🛡️🛡️🛡️`);
    
    const clashResult = resolveClash(attacker, target, move);
    finalDamage = clashResult.damageDealt;
    clashNarrative = clashResult.narrative;
    
    // Update target state after clash resolution
    state.participants[targetIndex] = target;
    
    if (clashResult.outcome === 'evaded') {
      wasEvaded = true;
    } else if (clashResult.outcome === 'parried') {
      wasParried = true;
    }
    
    console.log(`⚔️⚔️⚔️ CLASH RESULT - ${clashResult.outcome}: ${clashResult.narrative} ⚔️⚔️⚔️`);
  } else {
    // Use new dramatic mechanics system for normal attacks
    const moveResult = resolveMove(move, battleContext, attacker, target);
    
    // Apply status effect damage modifiers
    const modifiedDamage = modifyDamageWithEffects(moveResult.damage, attacker, target);
    finalDamage = modifiedDamage;
  }
  
  // Apply damage to target
  const newState = { ...state };
  newState.participants[targetIndex].currentHealth = Math.max(0, target.currentHealth - finalDamage);
  
  // Apply status effects to target if the ability has them (only if not evaded/parried)
  if (ability.appliesEffect && !wasEvaded && !wasParried) {
    console.log(`⚡⚡⚡ STATUS EFFECT CHECK - ${ability.name} has appliesEffect:`, ability.appliesEffect);
    // Check if the effect should be applied based on chance
    const shouldApply = !ability.appliesEffect.chance || Math.random() < ability.appliesEffect.chance;
    console.log(`⚡⚡⚡ STATUS EFFECT CHANCE - ${ability.name} chance: ${ability.appliesEffect.chance}, shouldApply: ${shouldApply}`);
    
    if (shouldApply) {
      const statusEffect = createStatusEffect(
        ability.name,
        ability.appliesEffect,
        target.name,
        state.turn
      );
      
      // Apply the status effect to the target
      const { updatedCharacter, logEntry } = applyEffect(newState.participants[targetIndex], statusEffect, state.turn);
      newState.participants[targetIndex] = updatedCharacter;
      if (newState.battleLog) newState.battleLog.push(logEntry);
      
      console.log(`🎯🎯🎯 STATUS EFFECT APPLIED - ${attacker.name} applied ${statusEffect.name} to ${target.name} for ${statusEffect.duration} turns 🎯🎯🎯`);
      console.log(`🎯🎯🎯 TARGET EFFECTS AFTER - ${target.name} now has ${updatedCharacter.activeEffects.length} active effects:`, updatedCharacter.activeEffects);
    } else {
      console.log(`❌❌❌ STATUS EFFECT FAILED - ${attacker.name}'s ${ability.name} did not apply status effect (chance check failed) ❌❌❌`);
    }
  } else if (wasEvaded || wasParried) {
    console.log(`🛡️🛡️🛡️ STATUS EFFECT BLOCKED - ${ability.name} status effect blocked by ${wasEvaded ? 'evasion' : 'parry'} 🛡️🛡️🛡️`);
  } else {
    console.log(`🚫🚫🚫 NO STATUS EFFECT - ${ability.name} does not have appliesEffect property 🚫🚫🚫`);
  }
  
  // Spend chi
  const chiCost = ability.chiCost || 0;
  newState.participants[state.activeParticipantIndex].resources.chi = Math.max(0, newState.participants[state.activeParticipantIndex].resources.chi - chiCost);
  
  // Apply cooldown
  if (ability.cooldown && ability.cooldown > 0) {
    newState.participants[state.activeParticipantIndex].cooldowns[ability.name] = ability.cooldown;
  }
  
  // Update move history
  newState.participants[state.activeParticipantIndex].lastMove = ability.name;
  newState.participants[state.activeParticipantIndex].moveHistory.push(ability.name);
  
  // Mark finisher as used if it was a finisher
  if (!wasEvaded && !wasParried) {
    const moveResult = resolveMove(move, battleContext, attacker, target);
    if (moveResult.wasFinisher) {
      newState.participants[state.activeParticipantIndex].flags = {
        ...newState.participants[state.activeParticipantIndex].flags,
        usedFinisher: true
      };
    }
  }
  
  // Initialize narrative service for enhanced storytelling (lazy)
  const narrativeService = createNarrativeService();
  
  // Generate enhanced narrative for attack using new system
  const context = {
    damage: finalDamage,
    maxHealth: target.base.stats.power + target.base.stats.defense + target.base.stats.agility,
    isMiss: finalDamage === 0,
    isCritical: !wasEvaded && !wasParried ? resolveMove(move, battleContext, attacker, target).wasCrit : false,
    isPatternBreak: attacker.flags?.forcedEscalation === 'true' && attacker.flags?.damageMultiplier === '2.0',
    isEscalation: attacker.flags?.forcedEscalation === 'true',
    consecutiveHits: 0,
    consecutiveMisses: 0,
    turnNumber: state.turn,
    characterState: (attacker.flags?.usedDesperation === true ? 'desperate' : 
                   attacker.currentHealth < 30 ? 'wounded' : 
                   attacker.currentHealth < 60 ? 'exhausted' : 'fresh') as 'fresh' | 'wounded' | 'exhausted' | 'desperate',
    chi: attacker.resources.chi || 0
  };
  
  // Generate enhanced narrative for attack
  let narrative: string;
  if (wasEvaded || wasParried) {
    // Use clash narrative for defensive outcomes
    narrative = clashNarrative;
    console.log(`DEBUG: Defensive clash narrative for ${attacker.name}: "${narrative}"`);
  } else {
    const attackNarrative = await narrativeService.generateNarrative(
      attacker.name,
      context,
      finalDamage === 0 ? 'miss' : finalDamage < 10 ? 'glance' : finalDamage < 25 ? 'hit' : 'devastating',
      ability.name
    );
    
    if (attackNarrative && attackNarrative.trim()) {
      narrative = attackNarrative;
      console.log(`DEBUG: Enhanced attack narrative for ${attacker.name}: "${narrative}"`);
    } else {
      const moveResult = resolveMove(move, battleContext, attacker, target);
      narrative = moveResult.narrative || `${attacker.name} uses ${ability.name} and deals ${finalDamage} damage!`;
      console.log(`DEBUG: Fallback attack narrative for ${attacker.name}: "${narrative}"`);
    }
  }
  
  // Add status effect information to narrative if applicable (only if not evaded/parried)
  if (ability.appliesEffect && !wasEvaded && !wasParried) {
    const effectInfo = ability.appliesEffect.type === 'BURN' 
      ? ` and ${target.name} begins to burn`
      : ability.appliesEffect.type === 'STUN'
      ? ` and ${target.name} is stunned`
      : ability.appliesEffect.type === 'DEFENSE_DOWN'
      ? ` and ${target.name}'s defenses are weakened`
      : ` and ${target.name} gains a ${ability.appliesEffect.type.toLowerCase().replace('_', ' ')} effect`;
    
    narrative += effectInfo;
  }
  
  // Create result string
  let result: string;
  if (wasEvaded) {
    result = `${target.name} evades the attack!`;
  } else if (wasParried) {
    result = `${target.name} parries the attack and creates an opening!`;
  } else if (!wasEvaded && !wasParried) {
    const moveResult = resolveMove(move, battleContext, attacker, target);
    if (moveResult.wasCrit) {
      result = `CRITICAL HIT! ${target.name} takes ${finalDamage} damage!`;
    } else if (moveResult.wasDesperation) {
      result = `DESPERATION MOVE! ${target.name} takes ${finalDamage} damage!`;
    } else {
      result = `${target.name} takes ${finalDamage} damage.`;
    }
  } else {
    result = `${target.name} takes ${finalDamage} damage.`;
  }
  
  // Add status effect information to result if applicable (only if not evaded/parried)
  if (ability.appliesEffect && !wasEvaded && !wasParried) {
    result += ` ${target.name} is affected by ${ability.appliesEffect.type.toLowerCase().replace('_', ' ')}!`;
  }
  
  // Create log entry
  const logEntry = logStory({
    turn: state.turn,
    narrative: ensureNonEmpty(narrative),
    target: target.name
  });
  if (logEntry) {
    return {
      newState,
      logEntry,
      damage: finalDamage,
      result: ensureNonEmpty(result),
      narrative: ensureNonEmpty(narrative),
      isCritical: !wasEvaded && !wasParried ? resolveMove(move, battleContext, attacker, target).wasCrit : false
    };
  }
  // Fallback if logEntry is null
  return {
    newState,
    logEntry: {
      id: 'attack-fallback',
      turn: state.turn,
      actor: 'System',
      type: 'mechanics',
      action: 'Attack',
      result: ensureNonEmpty(result),
      target: target.name,
      narrative: ensureNonEmpty(narrative),
      timestamp: Date.now(),
      details: undefined
    },
    damage: finalDamage,
    result: ensureNonEmpty(result),
    narrative: ensureNonEmpty(narrative),
    isCritical: !wasEvaded && !wasParried ? resolveMove(move, battleContext, attacker, target).wasCrit : false
  };
} 