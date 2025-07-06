// CONTEXT: Battle Tactical Mechanics
// RESPONSIBILITY: Handle positioning, charge-up, and environmental mechanics

import { BattleCharacter, BattleLogEntry } from '../../types';
import { Move, Position, getLocationType } from '../../types/move.types';
import { generateUniqueLogId } from '../ai/logQueries';

/**
 * @description Determines if a move can be used based on positioning and environmental constraints.
 */
export function canUseMove(move: Move, character: BattleCharacter, enemy: BattleCharacter, location: string): boolean {
  const locationType = getLocationType(location);
  
  // Check location constraints
  if (move.environmentalConstraints && !move.environmentalConstraints.includes(locationType)) {
    return false;
  }
  
  // Check position requirements
  if (move.requiresPosition && !move.requiresPosition.includes(character.position)) {
    return false;
  }
  
  // Charge-up only if opponent is vulnerable
  if (move.isChargeUp && move.onlyIfEnemyState) {
    const enemyVulnerable = move.onlyIfEnemyState.includes(enemy.position as "repositioning" | "stunned" | "charging") || 
                           (enemy.isCharging && move.onlyIfEnemyState.includes('charging'));
    if (!enemyVulnerable) {
      return false;
    }
  }
  
  // Check chi cost
  if (character.resources.chi < move.chiCost) {
    return false;
  }
  
  // Check cooldown
  if (character.cooldowns[move.id] && character.cooldowns[move.id] > 0) {
    return false;
  }
  
  // Check move usage limits
  if (move.maxUses) {
    const usesLeft = character.usesLeft?.[move.name] ?? move.maxUses;
    if (usesLeft <= 0) {
      console.log(`DEBUG: ${character.name} cannot use ${move.name} - no uses left (maxUses: ${move.maxUses})`);
      return false;
    }
    console.log(`DEBUG: ${character.name} can use ${move.name} - ${usesLeft}/${move.maxUses} uses left`);
  }
  
  return true;
}

/**
 * @description Performs repositioning with environmental and character-specific factors.
 */
export function performReposition(
  character: BattleCharacter, 
  location: string
): { success: boolean; newPosition: Position; narrative: string; damage?: number } {
  const locationType = getLocationType(location);
  const isAirbender = character.name.toLowerCase().includes('aang');
  const isFirebender = character.name.toLowerCase().includes('azula');
  
  // Environmental constraints
  const canReposition = 
    !["Desert", "Enclosed"].includes(locationType) || 
    isAirbender || // Airbenders get more freedom
    character.position === "flying";
  
  if (!canReposition) {
    // Failed reposition: risky!
    character.position = "cornered";
    character.repositionAttempts++;
    
    const damage = Math.min(character.repositionAttempts * 2, 8); // Escalating penalty
    
    return {
      success: false,
      newPosition: "cornered",
      narrative: `No room to maneuver—${character.name} is cornered and vulnerable!`,
      damage
    };
  }
  
  // Success rate based on character and diminishing returns
  const baseSuccessRate = isAirbender ? 0.9 : isFirebender ? 0.7 : 0.6;
  const diminishingPenalty = Math.min(character.repositionAttempts * 0.1, 0.3);
  const successRate = Math.max(baseSuccessRate - diminishingPenalty, 0.3);
  
  const success = Math.random() < successRate;
  
  if (success) {
    character.position = "repositioning";
    character.repositionAttempts++;
    character.lastPositionChange = Date.now();
    character.positionHistory.push("repositioning");
    
    return {
      success: true,
      newPosition: "repositioning",
      narrative: isAirbender 
        ? `${character.name} glides gracefully through the air to new ground.`
        : isFirebender
        ? `${character.name} uses fire propulsion to dash to a new position.`
        : `${character.name} dashes to new ground, watching for an opening.`
    };
  } else {
    // Failed reposition
    character.position = "cornered";
    character.repositionAttempts++;
    
    return {
      success: false,
      newPosition: "cornered",
      narrative: `${character.name}'s reposition attempt fails, leaving them vulnerable!`,
      damage: 3
    };
  }
}

/**
 * @description Handles charge-up mechanics with interruption risks.
 */
export function handleChargeUp(
  character: BattleCharacter,
  enemy: BattleCharacter,
  move: Move
): { success: boolean; narrative: string; damage?: number; interrupted?: boolean } {
  if (!move.isChargeUp) {
    return { success: true, narrative: "" };
  }
  
  character.isCharging = true;
  character.chargeProgress = (character.chargeProgress || 0) + (100 / (move.chargeTime || 1));
  
  // Check if enemy can punish the charge
  if (enemy.position === "aggressive" || enemy.position === "neutral") {
    const punishChance = 0.4; // 40% chance of being punished while charging
    const isPunished = Math.random() < punishChance;
    
    if (isPunished) {
      character.isCharging = false;
      character.chargeProgress = 0;
      character.chargeInterruptions++;
      
      const damage = move.chargeInterruptionPenalty || 5;
      
      return {
        success: false,
        narrative: `${character.name}'s charge is interrupted! ${enemy.name} seizes the opportunity for a punishing counter!`,
        damage,
        interrupted: true
      };
    }
  }
  
  // Check if charge is complete
  if (character.chargeProgress >= 100) {
    character.isCharging = false;
    character.chargeProgress = 0;
    
    return {
      success: true,
      narrative: `${character.name} completes the charge! ${move.name} is ready to unleash!`
    };
  }
  
  return {
    success: true,
    narrative: `${character.name} continues charging ${move.name}...`
  };
}

/**
 * @description Applies position bonuses to move damage and costs.
 */
export function applyPositionBonuses(move: Move, character: BattleCharacter): { 
  damageMultiplier: number; 
  chiCostReduction: number; 
  defenseBonus: number; 
} {
  const positionBonus = move.positionBonus?.[character.position];
  
  return {
    damageMultiplier: positionBonus?.damageMultiplier || 1,
    chiCostReduction: positionBonus?.chiCostReduction || 0,
    defenseBonus: positionBonus?.defenseBonus || 0
  };
}

/**
 * @description Determines if a move should get a punish bonus against charging/repositioning enemies.
 */
export function calculatePunishBonus(move: Move, enemy: BattleCharacter): number {
  if (!move.punishIfCharging) return 0;
  
  if (enemy.isCharging) return 3; // Bonus damage against charging enemies
  if (enemy.position === "repositioning") return 2; // Bonus damage against repositioning enemies
  if (enemy.position === "stunned") return 4; // High bonus against stunned enemies
  
  return 0;
}

/**
 * @description Updates character positions after move execution.
 */
export function updatePositionAfterMove(
  character: BattleCharacter, 
  move: Move
): { positionChanged: boolean; narrative: string } {
  if (!move.changesPosition) {
    return { positionChanged: false, narrative: "" };
  }
  
  character.position = move.changesPosition;
  character.lastPositionChange = Date.now();
  character.positionHistory.push(move.changesPosition);
  
  let narrative = "";
  switch (move.changesPosition) {
    case "aggressive":
      narrative = `${character.name} adopts an aggressive stance.`;
      break;
    case "defensive":
      narrative = `${character.name} takes a defensive position.`;
      break;
    case "flying":
      narrative = `${character.name} takes to the air.`;
      break;
    case "high_ground":
      narrative = `${character.name} gains the high ground advantage.`;
      break;
    case "neutral":
      narrative = `${character.name} returns to a neutral stance.`;
      break;
    default:
      narrative = `${character.name} changes position.`;
  }
  
  return { positionChanged: true, narrative };
}

/**
 * @description Resets repositioning status at the end of turn.
 */
export function resetRepositioningStatus(character: BattleCharacter): void {
  if (character.position === "repositioning") {
    character.position = "neutral";
  }
}

/**
 * @description Calculates environmental factors affecting the battle.
 */
export function getEnvironmentalFactors(location: string): string[] {
  const locationType = getLocationType(location);
  const factors: string[] = [];
  
  switch (locationType) {
    case "Desert":
      factors.push("Desert", "No Repositioning", "Airbender Disadvantage");
      break;
    case "Enclosed":
      factors.push("Enclosed", "Limited Movement", "Airbender Disadvantage");
      break;
    case "Air-Friendly":
      factors.push("Air-Friendly", "Airbender Advantage");
      break;
    case "Fire-Friendly":
      factors.push("Fire-Friendly", "Firebender Advantage");
      break;
    case "Water-Friendly":
      factors.push("Water-Friendly", "Waterbender Advantage");
      break;
    case "Earth-Friendly":
      factors.push("Earth-Friendly", "Earthbender Advantage");
      break;
    default:
      factors.push("Open Terrain");
  }
  
  return factors;
}

/**
 * @description Creates a battle log entry for positioning/tactical events.
 */
export function createTacticalLogEntry(
  turn: number,
  actor: string,
  type: 'POSITION' | 'CHARGE' | 'REPOSITION' | 'INTERRUPT',
  action: string,
  result: string,
  narrative: string,
  meta?: Record<string, unknown>
): BattleLogEntry {
  return {
    id: generateUniqueLogId('positioning'),
    turn,
    actor,
    type,
    action,
    result,
    narrative,
    timestamp: Date.now(),
    meta: {
      ...meta,
      tacticalEvent: true
    }
  };
} 