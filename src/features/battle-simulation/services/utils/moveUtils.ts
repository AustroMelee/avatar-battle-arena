// CONTEXT: Move Utilities
// RESPONSIBILITY: Determine available moves based on cooldowns, resources, and meta-state
import { Ability } from '@/common/types';
import { BattleCharacter } from '../../types';
import { MetaState } from '../ai/metaState';


/**
 * @description Gets available moves for a character considering cooldowns, resources, and meta-state.
 * @param {BattleCharacter} character - The character whose moves to check.
 * @param {MetaState} meta - The current meta-state for hard gating.
 * @returns {Ability[]} The available moves.
 */
export function getAvailableMoves(character: BattleCharacter, meta: MetaState): Ability[] {
  let moves = character.abilities.filter(ability => {
    // Check cooldown using the cooldown object system
    if (character.cooldowns[ability.name] && character.cooldowns[ability.name] > 0) {
      return false; // Ability is on cooldown
    }
    
    // Check uses remaining
    const usesLeft = character.usesLeft[ability.name] ?? (ability.maxUses || Infinity);
    if (usesLeft <= 0) {
      return false; // No uses remaining
    }
    
    // Check resource cost
    const chiCost = ability.chiCost || 0;
    if (character.resources.chi < chiCost) return false;
    
    return true;
  });
  
  // 1. HARD Pattern Breaker - Remove last move if in loop
  if (meta.stuckLoop && moves.length > 1) {
    const lastMove = character.moveHistory[character.moveHistory.length - 1];
    moves = moves.filter(m => m.name !== lastMove);
    console.log(`HARD PATTERN BREAK: Removed ${lastMove} from available moves`);
  }
  
  // 2. HARD Escalation - Force big moves when needed
  if (meta.escalationNeeded && moves.some(m => m.power > 50)) {
    moves = moves.filter(m => m.power > 50);
    console.log(`HARD ESCALATION: Only high-power moves available`);
  }
  
  // 3. HARD Finisher - Force devastating moves for finishing
  if (meta.finishingTime && moves.some(m => m.power > 60)) {
    moves = moves.filter(m => m.power > 60);
    console.log(`HARD FINISHER: Only devastating moves available`);
  }
  
  // 4. HARD Desperation - Force any high-damage move when desperate
  if (meta.desperate && moves.some(m => m.power > 40)) {
    moves = moves.filter(m => m.power > 40);
    console.log(`HARD DESPERATION: Only high-damage moves available`);
  }
  
  // 5. HARD Timeout Pressure - Force maximum damage
  if (meta.timeoutPressure && moves.some(m => m.power > 45)) {
    moves = moves.filter(m => m.power > 45);
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
  if (meta.frustrated && moves.some(m => m.type === 'attack' && m.power > 30)) {
    moves = moves.filter(m => m.type === 'attack' && m.power > 30);
    console.log(`HARD FRUSTRATION: Only aggressive attacks available`);
  }
  
  // Fallback: If we filtered too aggressively, allow some moves back
  if (moves.length === 0) {
    console.log(`HARD GATING: Too restrictive, allowing fallback moves`);
    moves = character.abilities.filter(ability => {
      const chiCost = ability.chiCost || 0;
      return character.resources.chi >= chiCost;
    });
  }
  
  return moves;
}

/**
 * @description Checks if a move is on cooldown.
 * @param {string} moveName - The name of the move to check.
 * @param {BattleCharacter} character - The character to check.
 * @returns {boolean} True if the move is on cooldown.
 */
export function isMoveOnCooldown(moveName: string, character: BattleCharacter): boolean {
  return !!(character.cooldowns[moveName] && character.cooldowns[moveName] > 0);
}

/**
 * @description Checks if a character has enough resources for a move.
 * @param {Ability} ability - The ability to check.
 * @param {BattleCharacter} character - The character to check.
 * @returns {boolean} True if the character has enough resources.
 */
export function hasEnoughResources(ability: Ability, character: BattleCharacter): boolean {
  const chiCost = ability.chiCost || 0;
  return character.resources.chi >= chiCost;
} 