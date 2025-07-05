// CONTEXT: Battle Context Service
// RESPONSIBILITY: Create and manage battle context for move resolution

import { BattleState, BattleCharacter } from '../../types';
import { BattleContext } from '../../types/move.types';
import { getLocationType } from '../../types/move.types';

/**
 * @description Create battle context for move resolution
 * @param {BattleCharacter} attacker - The attacking character
 * @param {BattleCharacter} target - The target character
 * @param {BattleState} state - Current battle state
 * @returns {BattleContext} The battle context
 */
export function createBattleContext(
  attacker: BattleCharacter,
  target: BattleCharacter,
  state: BattleState
): BattleContext {
  const locationType = getLocationType(state.location || 'Open Field');
  
  return {
    phase: 'normal', // TODO: Implement phase detection
    turn: state.turn,
    selfHP: attacker.currentHealth,
    selfMaxHP: 100, // All characters have 100 max HP
    enemyHP: target.currentHealth,
    enemyMaxHP: 100, // All characters have 100 max HP
    hasUsedFinisher: attacker.flags?.usedFinisher || false,
    location: state.location || 'Open Field',
    locationType,
    selfPosition: attacker.position,
    enemyPosition: target.position,
    lastAction: attacker.lastMove || '',
    isSelfStunned: attacker.position === 'stunned',
    isEnemyStunned: target.position === 'stunned',
    isSelfCharging: attacker.isCharging,
    isEnemyCharging: target.isCharging,
    selfChargeProgress: attacker.chargeProgress,
    enemyChargeProgress: target.chargeProgress,
    repositionAttempts: attacker.repositionAttempts,
    chargeInterruptions: attacker.chargeInterruptions
  };
} 