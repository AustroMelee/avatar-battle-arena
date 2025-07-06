import type { BattleCharacter } from '../../types';

/**
 * Returns true if the defender is defeated/collapsed in the disruption system.
 */
export function checkDefeat(defender: BattleCharacter): boolean {
  return (
    defender.controlState === 'Compromised' &&
    defender.stability < 10 &&
    defender.momentum < -50
  );
} 