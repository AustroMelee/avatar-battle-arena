// Used via dynamic registry in BattleEngine. See SYSTEM ARCHITECTURE.MD for flow.
// CONTEXT: Move Router Service
// RESPONSIBILITY: Route moves to appropriate execution services based on type

import { BattleState, BattleCharacter, BattleLogEntry } from '../../types';
import { Ability } from '@/common/types';
import { executeAttackMove } from './attackMove.service';
import { executeDefenseMove } from './defenseMove.service';
import { executeGenericMove } from './genericMove.service';

/**
 * @description Result of executing any move
 */
export interface MoveExecutionResult {
  newState: BattleState;
  logEntry: BattleLogEntry;
  damage: number;
  result: string;
  narrative: string;
  isCritical: boolean;
}

/**
 * @description Result of move routing
 */
export interface MoveRouterResult {
  success: boolean;
  logEntry: BattleLogEntry;
  narrative?: string;
}

/**
 * @description Executes any move based on its type
 * @param {Ability} ability - The ability to execute
 * @param {BattleCharacter} attacker - The attacking character
 * @param {BattleCharacter} target - The target character
 * @param {BattleState} state - Current battle state
 * @param {number} attackerIndex - Index of attacker in participants array
 * @param {number} targetIndex - Index of target in participants array
 * @returns {Promise<MoveExecutionResult>} The execution result
 */
export async function executeMove(
  ability: Ability,
  attacker: BattleCharacter,
  target: BattleCharacter,
  state: BattleState,
  attackerIndex: number,
  targetIndex: number
): Promise<MoveExecutionResult> {
  switch (ability.type) {
    case 'attack':
      return await executeAttackMove(ability, attacker, target, state, targetIndex);
    case 'defense_buff':
    case 'evade':
    case 'parry_retaliate':
      // Convert Ability to Move if possible (temporary fix)
      if ('baseDamage' in ability && 'id' in ability) {
        return await executeDefenseMove(ability as any, attacker, state, attackerIndex);
      } else {
        throw new TypeError('Ability is missing required Move properties (id, baseDamage)');
      }
    default:
      if ('baseDamage' in ability && 'id' in ability) {
        return await executeGenericMove(ability as any, attacker, state);
      } else {
        throw new TypeError('Ability is missing required Move properties (id, baseDamage)');
      }
  }
} 