// UPGRADED BATTLE LOGIC FOR DRAMATIC MECHANICS

import type { Move, BattleContext } from '../../types/move.types';
import type { BattleCharacter } from '../../types';
import { modifyDamageWithEffects } from '../effects/statusEffect.service';

export interface MoveResult {
  damage: number;
  narrative: string;
  wasCrit: boolean;
  wasFinisher: boolean;
  wasDesperation: boolean;
}

/**
 * @description Check if a move can be used based on battle context
 * @param {Move} move - The move to check
 * @param {BattleContext} ctx - Current battle context
 * @returns {boolean} Whether the move can be used
 */
export function canUseMove(move: Move, ctx: BattleContext): boolean {
  // Check if it's a finisher
  if (move.isFinisher) {
    if (move.oncePerBattle && ctx.hasUsedFinisher) return false;
    if (!move.finisherCondition) return false;
    
    switch (move.finisherCondition.type) {
      case 'hp_below':
        return (ctx.selfHP / ctx.selfMaxHP) * 100 <= move.finisherCondition.percent;
      case 'phase':
        return ctx.phase === move.finisherCondition.phase;
      case 'custom':
        return move.finisherCondition.isAvailable(ctx);
      default:
        return false;
    }
  }
  
  // Add other checks as needed (cooldown, chi, etc.)
  return true;
}

/**
 * @description Resolve a move with all dramatic mechanics applied
 * @param {Move} move - The move to resolve
 * @param {BattleContext} ctx - Current battle context
 * @param {BattleCharacter} attacker - The attacking character
 * @param {BattleCharacter} target - The target character
 * @returns {MoveResult} The resolved move result
 */
export function resolveMove(
  move: Move,
  ctx: BattleContext,
  attacker: BattleCharacter,
  target: BattleCharacter
): MoveResult {
  let damage = move.baseDamage;
  let wasCrit = false;
  let wasDesperation = false;

  // Finisher logic - massive damage, dramatic narrative
  if (move.isFinisher) {
    // Finishers can still get crits and desperation buffs for even more drama!
    let finisherDamage = move.baseDamage;
    let finisherWasCrit = false;
    let finisherWasDesperation = false;
    
    // Apply desperation buff to finisher
    if (move.desperationBuff && (ctx.selfHP / ctx.selfMaxHP) * 100 <= move.desperationBuff.hpThreshold) {
      finisherDamage += move.desperationBuff.damageBonus;
      finisherWasDesperation = true;
    }
    
    // Apply crit to finisher
    if (move.critChance && Math.random() < move.critChance) {
      finisherDamage *= move.critMultiplier ?? 2;
      finisherWasCrit = true;
    }
    
    return {
      damage: finisherDamage,
      narrative: `FINISHER! ${move.name} unleashes devastating power, dealing ${finisherDamage} damage! The arena quakes as ${attacker.name} channels their final strength.`,
      wasCrit: finisherWasCrit,
      wasFinisher: true,
      wasDesperation: finisherWasDesperation,
    };
  }

  // Desperation buff - increased damage when HP is low
  if (move.desperationBuff && (ctx.selfHP / ctx.selfMaxHP) * 100 <= move.desperationBuff.hpThreshold) {
    damage += move.desperationBuff.damageBonus;
    wasDesperation = true;
  }

  // Critical hit - multiply damage
  if (move.critChance && Math.random() < move.critChance) {
    damage *= move.critMultiplier ?? 2;
    wasCrit = true;
  }

  // Apply status effect damage modifiers
  damage = modifyDamageWithEffects(damage, attacker, target);

  // --- EXPOSED TARGET MECHANIC ---
  // Ensure target's activeFlags is a Map
  if (!(target.activeFlags instanceof Map)) {
    target.activeFlags = new Map(Object.entries(target.activeFlags || {}));
  }
  
  if (target.activeFlags.has('isExposed')) {
    damage = Math.round(damage * 1.5); // Target takes 50% more damage!
    target.activeFlags.delete('isExposed'); // The flag is consumed.
  }

  // Generate narrative based on what happened
  let narrative: string;
  if (wasCrit) {
    narrative = `CRITICAL HIT! ${move.name} strikes with devastating precision, dealing ${damage} damage!`;
  } else if (wasDesperation) {
    narrative = `DESPERATION MOVE! ${move.name} surges with raw power, dealing ${damage} damage!`;
  } else {
    narrative = `${move.name} deals ${damage} damage.`;
  }

  return {
    damage,
    narrative,
    wasCrit,
    wasFinisher: false,
    wasDesperation
  };
} 