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
  
  // Use new dramatic mechanics system
  const moveResult = resolveMove(move, battleContext, attacker, target, state.turn);
  
  // Apply status effect damage modifiers
  const modifiedDamage = modifyDamageWithEffects(moveResult.damage, attacker, target);
  
  // Apply damage to target
  const newState = { ...state };
  newState.participants[targetIndex].currentHealth = Math.max(0, target.currentHealth - modifiedDamage);
  
  // Apply status effects to target if the ability has them
  if (ability.appliesEffect) {
    console.log(`⚡⚡⚡ STATUS EFFECT CHECK - ${ability.name} has appliesEffect:`, ability.appliesEffect);
    // Check if the effect should be applied based on chance
    const shouldApply = !ability.appliesEffect.chance || Math.random() < ability.appliesEffect.chance;
    console.log(`⚡⚡⚡ STATUS EFFECT CHANCE - ${ability.name} chance: ${ability.appliesEffect.chance}, shouldApply: ${shouldApply}`);
    
    if (shouldApply) {
      const statusEffect = createStatusEffect(
        ability.name,
        ability.appliesEffect,
        target.name
      );
      
      // Apply the status effect to the target
      const updatedTarget = applyEffect(newState.participants[targetIndex], statusEffect);
      newState.participants[targetIndex] = updatedTarget;
      
      console.log(`🎯🎯🎯 STATUS EFFECT APPLIED - ${attacker.name} applied ${statusEffect.name} to ${target.name} for ${statusEffect.duration} turns 🎯🎯🎯`);
      console.log(`🎯🎯🎯 TARGET EFFECTS AFTER - ${target.name} now has ${updatedTarget.activeEffects.length} active effects:`, updatedTarget.activeEffects);
    } else {
      console.log(`❌❌❌ STATUS EFFECT FAILED - ${attacker.name}'s ${ability.name} did not apply status effect (chance check failed) ❌❌❌`);
    }
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
  if (moveResult.wasFinisher) {
    newState.participants[state.activeParticipantIndex].flags = {
      ...newState.participants[state.activeParticipantIndex].flags,
      usedFinisher: true
    };
  }
  
  // Initialize narrative service for enhanced storytelling (lazy)
  const narrativeService = createNarrativeService();
  
  // Generate enhanced narrative for attack using new system
  const context = {
    damage: modifiedDamage,
    maxHealth: target.stats.power + target.stats.defense + target.stats.agility,
    isMiss: modifiedDamage === 0,
    isCritical: moveResult.wasCrit,
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
  const attackNarrative = await narrativeService.generateNarrative(
    attacker.name,
    context,
    modifiedDamage === 0 ? 'miss' : modifiedDamage < 10 ? 'glance' : modifiedDamage < 25 ? 'hit' : 'devastating',
    ability.name
  );
  
  let narrative: string;
  if (attackNarrative && attackNarrative.trim()) {
    narrative = attackNarrative;
    console.log(`DEBUG: Enhanced attack narrative for ${attacker.name}: "${narrative}"`);
  } else {
    narrative = moveResult.narrative || `${attacker.name} uses ${ability.name} and deals ${modifiedDamage} damage!`;
    console.log(`DEBUG: Fallback attack narrative for ${attacker.name}: "${narrative}"`);
  }
  
  // Add status effect information to narrative if applicable
  if (ability.appliesEffect) {
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
  if (moveResult.wasCrit) {
    result = `CRITICAL HIT! ${target.name} takes ${modifiedDamage} damage!`;
  } else if (moveResult.wasDesperation) {
    result = `DESPERATION MOVE! ${target.name} takes ${modifiedDamage} damage!`;
  } else {
    result = `${target.name} takes ${modifiedDamage} damage.`;
  }
  
  // Add status effect information to result if applicable
  if (ability.appliesEffect) {
    result += ` ${target.name} is affected by ${ability.appliesEffect.type.toLowerCase().replace('_', ' ')}!`;
  }
  
  return {
    newState,
    logEntry: {
      ...moveResult.logEntry,
      damage: modifiedDamage,
      result,
      narrative,
      meta: {
        ...moveResult.logEntry.meta,
        resourceCost: chiCost,
        statusEffect: ability.appliesEffect ? {
          type: ability.appliesEffect.type,
          duration: ability.appliesEffect.duration,
          potency: ability.appliesEffect.potency
        } : undefined
      }
    },
    damage: modifiedDamage,
    result,
    narrative,
    isCritical: moveResult.wasCrit
  };
} 