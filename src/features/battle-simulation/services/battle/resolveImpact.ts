import type { BattleCharacter, ControlState } from '../../types';
import type { Ability } from '../../types/move.types';

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

  const IMPACT_CRITICAL_LINES = [
    `${move.name} crashes through—${defender.name} is sent reeling, their control shattered.`,
    `A devastating impact—${defender.name} staggers, the world spinning as balance gives way.`,
    `The force of ${move.name} overwhelms, leaving ${defender.name} exposed and vulnerable.`,
    `The blow lands like a hammer—${defender.name} is flung off balance, composure stripped away.`
  ];
  const IMPACT_DIRECT_HIT_LINES = [
    `${move.name} strikes true, driving the wind from ${defender.name}’s lungs.`,
    `A resounding impact—${defender.name} is rocked by the clean hit.`,
    `${move.name} connects with brutal precision, momentum shifting in an instant.`,
    `The attack finds its mark, sending a ripple of pain through ${defender.name}’s stance.`
  ];
  const IMPACT_GLANCING_HIT_LINES = [
    `${move.name} brushes past—${defender.name} feels the sting but stands firm.`,
    `A near miss—the attack glances off, drawing only a grunt of pain.`,
    `The edge of ${move.name} catches ${defender.name}, not enough to break their resolve.`,
    `A glancing blow—${defender.name}’s reflexes soften the worst of it.`
  ];
  const IMPACT_GRAZE_LINES = [
    `${defender.name} barely notices the hit, their focus unbroken.`,
    `The impact is little more than a whisper—${defender.name} shrugs it off.`,
    `A harmless touch—${defender.name} remains unmoved, their eyes on the fight ahead.`,
    `The attack skims ${defender.name}, drawing neither blood nor hesitation.`
  ];

  // Example scaling logic (expand for traits, impactClass, etc.)
  if (roll > 90) {
    impact = 'critical_disruption';
    controlShift = -40;
    stabilityDamage = 30;
    narrative = IMPACT_CRITICAL_LINES[Math.floor(Math.random() * IMPACT_CRITICAL_LINES.length)];
  } else if (roll > 70) {
    impact = 'direct_hit';
    controlShift = -25;
    stabilityDamage = 20;
    narrative = IMPACT_DIRECT_HIT_LINES[Math.floor(Math.random() * IMPACT_DIRECT_HIT_LINES.length)];
  } else if (roll > 50) {
    impact = 'glancing_hit';
    controlShift = -10;
    stabilityDamage = 10;
    narrative = IMPACT_GLANCING_HIT_LINES[Math.floor(Math.random() * IMPACT_GLANCING_HIT_LINES.length)];
  } else {
    impact = 'graze';
    controlShift = -5;
    stabilityDamage = 0;
    narrative = IMPACT_GRAZE_LINES[Math.floor(Math.random() * IMPACT_GRAZE_LINES.length)];
  }

  return { impact, narrative, controlShift, stabilityDamage };
} 