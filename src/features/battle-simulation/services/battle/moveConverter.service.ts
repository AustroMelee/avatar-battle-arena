// CONTEXT: Move Converter Service
// RESPONSIBILITY: Convert between Ability and Move types

import { Ability } from '@/common/types';
import { Move } from '../../types/move.types';

/**
 * @description Convert Ability to Move for the new dramatic mechanics system
 * @param {Ability} ability - The ability to convert
 * @returns {Move} The converted move
 */
export function convertAbilityToMove(ability: Ability): Move {
  return {
    id: ability.name.toLowerCase().replace(/\s+/g, '_'),
    name: ability.name,
    baseDamage: ability.power,
    chiCost: ability.chiCost || 0,
    cooldown: ability.cooldown || 0,
    maxUses: ability.maxUses,
    description: ability.description,
    changesPosition: undefined,
    isChargeUp: false,
    chargeTime: 1,
    punishIfCharging: false,
    positionBonus: {},
    critChance: ability.critChance,
    critMultiplier: ability.critMultiplier,
    isFinisher: ability.isFinisher,
    oncePerBattle: ability.oncePerBattle,
    finisherCondition: ability.finisherCondition ? 
      ability.finisherCondition.type === 'hp_below' ? {
        type: 'hp_below' as const,
        percent: ability.finisherCondition.percent!
      } : ability.finisherCondition.type === 'phase' ? {
        type: 'phase' as const,
        phase: ability.finisherCondition.phase as 'climax' | 'stalemate'
      } : undefined
    : undefined,
    desperationBuff: ability.desperationBuff,
    appliesEffect: ability.appliesEffect
  };
} 