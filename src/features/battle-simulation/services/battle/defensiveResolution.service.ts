// CONTEXT: BattleSimulation, // FOCUS: DefensiveResolution
import { BattleCharacter, ClashResult } from '../../types';
import { Move } from '../../types/move.types';

/**
 * Simulates a "clash" between an incoming attack and an active defensive maneuver.
 * This system handles evasion, parrying, and future mixup attacks that can counter specific defenses.
 * 
 * @param attacker - The character performing the attack
 * @param defender - The character with active defensive stance
 * @param attackingMove - The move being used against the defender
 * @returns ClashResult with outcome, damage, and narrative
 */
export function resolveClash(
  attacker: BattleCharacter,
  defender: BattleCharacter,
  attackingMove: Move
): ClashResult {
  // If no active defense, attack lands normally
  if (!defender.activeDefense) {
    return { 
      outcome: 'full_hit', 
      damageDealt: attackingMove.baseDamage, 
      narrative: `${attackingMove.name} lands a solid blow!` 
    };
  }

  // --- MIXUP LOGIC: Check if the attack is a specific counter to the defense type ---
  if (attackingMove.beatsDefenseType === defender.activeDefense.type) {
    defender.activeDefense = undefined; // Defense is broken
    defender.defensiveStance = 'none';
    return { 
      outcome: 'full_hit', 
      damageDealt: attackingMove.baseDamage, 
      narrative: `${attacker.name}'s ${attackingMove.name} cleverly bypasses ${defender.name}'s defense!` 
    };
  }

  // --- EVASION LOGIC (AANG) ---
  if (defender.activeDefense.type === 'evade') {
    const wasEvaded = Math.random() * 100 < defender.activeDefense.evadeChance!;
    defender.activeDefense = undefined;
    defender.defensiveStance = 'none';

    if (wasEvaded) {
      return { 
        outcome: 'evaded', 
        damageDealt: 0, 
        narrative: `${defender.name} gracefully sidesteps the ${attackingMove.name}!` 
      };
    } else {
      return { 
        outcome: 'full_hit', 
        damageDealt: attackingMove.baseDamage, 
        narrative: `Despite the evasive stance, ${attackingMove.name} connects!` 
      };
    }
  }

  // --- PARRY/RETALIATE LOGIC (AZULA) ---
  if (defender.activeDefense.type === 'parry_retaliate') {
    const canParry = attackingMove.baseDamage <= defender.activeDefense.parryThreshold!;
    defender.activeDefense = undefined;
    defender.defensiveStance = 'none';

    if (canParry) {
      defender.flags.isCountering = true;
      return { 
        outcome: 'parried', 
        damageDealt: 0, 
        narrative: `${defender.name} expertly parries the ${attackingMove.name}, creating an opening!` 
      };
    } else {
      return { 
        outcome: 'full_hit', 
        damageDealt: attackingMove.baseDamage, 
        narrative: `${attackingMove.name} is too powerful and breaks through ${defender.name}'s counter!` 
      };
    }
  }

  // Fallback for unknown defense types
  return { 
    outcome: 'full_hit', 
    damageDealt: attackingMove.baseDamage, 
    narrative: `${attackingMove.name} connects!` 
  };
} 