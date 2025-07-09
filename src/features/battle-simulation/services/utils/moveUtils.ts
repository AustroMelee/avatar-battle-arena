// Used via dynamic registry in BattleEngine/utilities. See SYSTEM ARCHITECTURE.MD for flow.
// CONTEXT: Move Utilities
// RESPONSIBILITY: The SINGLE SOURCE OF TRUTH for determining which moves a character can legally use in a turn.

import { BattleCharacter } from '../../types';
import { MetaState } from '../ai/metaState';
// import { createMechanicLogEntry } from './mechanicLogUtils';
import type { Move } from '../../types/move.types';

/**
 * Checks if a character has enough resources for a move.
 * @param ability - The move to check.
 * @param character - The character to check.
 * @returns True if the character has enough resources.
 */
function hasEnoughResources(ability: Move, character: BattleCharacter): boolean {
  return character.resources.chi >= (ability.chiCost || 0);
}

/**
 * Checks if a move is on cooldown.
 * @param moveName - The name of the move to check.
 * @param character - The character to check.
 * @returns True if the move is on cooldown.
 */
function isMoveOnCooldown(moveName: string, character: BattleCharacter): boolean {
  return (character.cooldowns?.[moveName] || 0) > 0;
}

/**
 * Checks if a move has any uses left.
 * @param ability - The move to check.
 * @param character - The character to check.
 * @returns True if the move has uses left.
 */
function hasUsesLeft(ability: Move, character: BattleCharacter): boolean {
  if (ability.maxUses === undefined) return true; // Unlimited uses
  return (character.usesLeft[ability.name] ?? 0) < ability.maxUses;
}

/**
 * Checks if the conditions for a finisher move are met.
 * @param ability - The finisher move to check.
 * @param attacker - The character attempting the finisher.
 * @param target - The target of the finisher.
 * @returns True if the finisher conditions are met.
 */
function areFinisherConditionsMet(ability: Move, attacker: BattleCharacter, target: BattleCharacter): boolean {
  if (!ability.isFinisher) return true; // Not a finisher, no special conditions

  if (attacker.flags?.usedFinisher && ability.oncePerBattle) return false;

  const condition = ability.finisherCondition;
  if (!condition) return false; // Finisher must have a condition

  switch (condition.type) {
    case 'hp_below':
      return (target.currentHealth / 100) * 100 <= condition.percent;
    // Add cases for other finisher condition types here, like 'phase'
    default:
      return false;
  }
}

/**
 * Gets all available moves for a character, enforcing all game rules.
 * This is the definitive gatekeeper for AI move selection.
 * @param character - The character whose moves to check.
 * @param enemy - The opponent, for condition checking.
 * @param location - The battle location.
 * @returns A filtered array of legally usable moves.
 */
export function getAvailableMoves(
  character: BattleCharacter,
  enemy: BattleCharacter
): Move[] {
  const available = character.abilities.filter((move: Move) => {
    if (!hasEnoughResources(move, character)) return false;
    // Filter out any move on cooldown, including Gather Power
    if (isMoveOnCooldown(move.name, character)) return false;
    if (!hasUsesLeft(move, character)) return false;
    if (!areFinisherConditionsMet(move, character, enemy)) return false;
    // TODO: Add browser-safe dev check if needed
    return true;
  });

  // If no moves are available after filtering, always allow Basic Strike as a fallback.
  if (available.length === 0) {
    const basicStrike = character.abilities.find(m => m.id.includes('basic_strike'));
    if (basicStrike) {
      return [basicStrike];
    }
  }

  return available;
}

/**
 * @description Gets available moves for a character considering cooldowns, resources, meta-state, and collateral damage.
 * @param {BattleCharacter} character - The character whose moves to check.
 * @param {MetaState} meta - The current meta-state for hard gating.
 * @param {Location} location - The battle location for collateral damage checks.
 * @returns {Move[]} The available moves.
 */
export function getAvailableMovesOld(character: BattleCharacter, meta: MetaState): Move[] {
  let moves = character.abilities.filter((ability: Move) => {
    // Check cooldown using the cooldown object system
    if (character.cooldowns[ability.name] && character.cooldowns[ability.name] > 0) {
      // const logEntry = createMechanicLogEntry({
      return false; // Ability is on cooldown
    }
    
    // Check uses remaining
    const usesLeft = character.usesLeft[ability.name] ?? (ability.maxUses || Infinity);
    if (ability.maxUses && usesLeft <= 0) {
      // const logEntry = createMechanicLogEntry({
      return false;
    }
    
    // Check resource cost
    const chiCost = ability.chiCost || 0;
    if (character.resources.chi < chiCost) return false;
    
    // NEW: Check collateral damage tolerance
    // const currentTolerance = getDynamicCollateralTolerance(character, location);
    // if (ability.collateralDamage && ability.collateralDamage > currentTolerance) {
    //   return false; // Move is too destructive for current tolerance
    // }
    
    return true;
  });
  
  // 1. HARD Pattern Breaker - Remove last move if in loop
  if (meta.stuckLoop && moves.length > 1) {
    const lastMove = character.moveHistory[character.moveHistory.length - 1];
    moves = moves.filter(m => m.name !== lastMove);
    console.log(`HARD PATTERN BREAK: Removed ${lastMove} from available moves`);
  }
  
  // 2. HARD Escalation - Force big moves when needed
  if (meta.escalationNeeded && moves.some(m => m.baseDamage > 50)) {
    moves = moves.filter(m => m.baseDamage > 50);
    console.log(`HARD ESCALATION: Only high-damage moves available`);
  }
  
  // 3. HARD Finisher - Force devastating moves for finishing
  if (meta.finishingTime && moves.some(m => m.baseDamage > 60)) {
    moves = moves.filter(m => m.baseDamage > 60);
    console.log(`HARD FINISHER: Only devastating moves available`);
  }
  
  // 4. HARD Desperation - Force any high-damage move when desperate
  if (meta.desperate && moves.some(m => m.baseDamage > 40)) {
    moves = moves.filter(m => m.baseDamage > 40);
    console.log(`HARD DESPERATION: Only high-damage moves available`);
  }
  
  // 5. HARD Timeout Pressure - Force maximum damage
  if (meta.timeoutPressure && moves.some(m => m.baseDamage > 45)) {
    moves = moves.filter(m => m.baseDamage > 45);
    console.log(`HARD TIMEOUT: Only maximum damage moves available`);
  }
  
  // 6. HARD Stalemate Breaking - Force piercing moves
  if (meta.stalemate && moves.some(m => m.tags?.includes('piercing'))) {
    moves = moves.filter(m => m.tags?.includes('piercing'));
    console.log(`HARD STALEMATE: Only piercing moves available`);
  }
  
  // 7. HARD Boredom - Force variety by excluding recent moves
  if (meta.bored && moves.length > 1) {
    const recentMoves = character.moveHistory.slice(-3);
    moves = moves.filter(m => !recentMoves.includes(m.name));
    console.log(`HARD BOREDOM: Excluded recent moves for variety`);
  }
  
  // 8. HARD Frustration - Force aggressive moves
  if (meta.frustrated && moves.some(m => (m.type === 'attack' || m.type === 'parry_retaliate') && m.baseDamage > 30)) {
    moves = moves.filter(m => (m.type === 'attack' || m.type === 'parry_retaliate') && m.baseDamage > 30);
    console.log(`HARD FRUSTRATION: Only aggressive attacks and counters available`);
  }
  
  // 9. HARD Defensive Pressure - Force defensive moves when under heavy attack
  if (meta.desperate && character.currentHealth < 30 && moves.some(m => m.type === 'evade' || m.type === 'parry_retaliate')) {
    moves = moves.filter(m => m.type === 'evade' || m.type === 'parry_retaliate');
    console.log(`HARD DEFENSIVE: Only defensive moves available due to low health`);
  }
  
  // Fallback: If we filtered too aggressively, allow some moves back
  if (moves.length === 0) {
    console.log(`HARD GATING: Too restrictive, allowing fallback moves`);
    moves = character.abilities.filter((ability: Move) => {
      const chiCost = ability.chiCost || 0;
      return character.resources.chi >= chiCost;
    });
  }
  
  return moves;
} 