import type { BattleCharacter, ControlState } from '../../types';
import type { Ability, ImpactClass } from '../../types/move.types';

export type ImpactType = 'graze' | 'redirected' | 'glancing_hit' | 'direct_hit' | 'critical_disruption';

export interface ImpactResult {
  impact: ImpactType;
  narrative: string;
  controlShift: number;
  stabilityDamage: number;
  causesStateShift?: boolean;
  newControlState?: ControlState;
}

// Example: defenderHasEvaded is a placeholder for actual evasion logic
function defenderHasEvaded(_defender: BattleCharacter, _move: Ability): boolean {
  // TODO: Implement real evasion logic
  return false;
}

/**
 * Pure function to resolve the impact of a move in the disruption system.
 * Scales odds and magnitude based on move.impactClass, defender.controlState, traits, etc.
 */
export function resolveImpact(
  attacker: BattleCharacter,
  defender: BattleCharacter,
  move: Ability
): ImpactResult {
  if (defenderHasEvaded(defender, move)) {
    return {
      impact: 'redirected',
      narrative: `${defender.name} evades the blow!`,
      controlShift: -5,
      stabilityDamage: 0,
    };
  }

  const roll = Math.random() * 100;
  let impact: ImpactType, controlShift: number, stabilityDamage: number, narrative: string;

  // Example scaling logic (expand for traits, impactClass, etc.)
  if (roll > 90) {
    impact = 'critical_disruption';
    controlShift = -40;
    stabilityDamage = 30;
    narrative = `${move.name} lands hard—${defender.name} loses control!`;
  } else if (roll > 70) {
    impact = 'direct_hit';
    controlShift = -25;
    stabilityDamage = 20;
    narrative = `${move.name} connects cleanly—${defender.name} is thrown off balance!`;
  } else if (roll > 50) {
    impact = 'glancing_hit';
    controlShift = -10;
    stabilityDamage = 10;
    narrative = `${move.name} clips ${defender.name}.`;
  } else {
    impact = 'graze';
    controlShift = -5;
    stabilityDamage = 0;
    narrative = `${defender.name} barely feels the impact.`;
  }

  return { impact, narrative, controlShift, stabilityDamage };
} 