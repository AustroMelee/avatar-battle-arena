// Used via dynamic registry in BattleEngine. See SYSTEM ARCHITECTURE.MD for flow.
// CONTEXT: Move Disabling Service
// RESPONSIBILITY: Handle move disabling and cooldown logic

import { BattleCharacter } from '../../types';
import { Move } from '../../types/move.types';

/**
 * @description Applies escalation modifiers to a move
 */
export function applyEscalationModifiers(move: Move, character: BattleCharacter): Move {
  if (character.flags?.forcedEscalation === 'true') {
    const damageMultiplier = parseFloat(character.flags.damageMultiplier || '1.0');
    return {
      ...move,
      baseDamage: Math.floor(move.baseDamage * damageMultiplier)
    };
  }
  return move;
}

/**
 * @description Checks if a move is disabled for a character
 */
export function isMoveDisabled(move: Move, character: BattleCharacter): boolean {
  // Check cooldowns
  if (character.cooldowns && character.cooldowns[move.id] > 0) {
    return true;
  }
  
  // Check move usage limits
  if (move.maxUses) {
    const usesLeft = character.usesLeft?.[move.name] ?? move.maxUses;
    if (usesLeft <= 0) {
      return true;
    }
  }
  
  // Check reposition disabling
  if (move.changesPosition === 'repositioning' && 
      character.flags?.repositionDisabled && 
      parseInt(character.flags.repositionDisabled) > 0) {
    return true;
  }
  
  // Check once-per-battle moves
  if (move.oncePerBattle && character.flags?.usedFinisher) {
    return true;
  }
  
  return false;
} 