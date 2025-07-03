import type { Character, Ability } from '../../../../common/types';
import type { BattleCharacter } from '../../types';

/**
 * @description Determines the tactical priority for AI decision making based on current battle state
 * @param self - The AI character making the decision
 * @param enemy - The opponent character
 * @param availableAbilities - List of abilities that can be used this turn
 * @returns Tactical priority that guides move selection
 */
export function determineTacticalPriority(
  self: BattleCharacter,
  enemy: BattleCharacter,
  availableAbilities: Ability[]
): 'defend' | 'pierce' | 'finish' | 'recover' | 'attack' | 'heal' {
  
  // CRITICAL: Defend when health is dangerously low
  if (self.currentHealth < 25) {
    return 'defend';
  }
  
  // FINISH: Use high-damage moves when enemy is vulnerable
  if (enemy.currentHealth < 20 && availableAbilities.some(a => a.tags?.includes('high-damage'))) {
    return 'finish';
  }
  
  // PIERCE: Use piercing moves when enemy has high defense
  if (enemy.currentDefense > 25 && availableAbilities.some(a => a.tags?.includes('piercing'))) {
    return 'pierce';
  }
  
  // HEAL: Use healing moves when health is low but not critical
  if (self.currentHealth < 40 && availableAbilities.some(a => a.tags?.includes('healing'))) {
    return 'heal';
  }
  
  // RECOVER: Conserve chi when resources are low
  if ((self.resources.chi || 0) < 3 && availableAbilities.some(a => a.type === 'defense_buff')) {
    return 'recover';
  }
  
  // DEFAULT: Standard attack pattern
  return 'attack';
}

/**
 * @description Gets a human-readable explanation of the tactical priority
 * @param priority - The tactical priority
 * @param self - The AI character
 * @param enemy - The opponent character
 * @returns Explanation of why this priority was chosen
 */
export function getTacticalExplanation(
  priority: ReturnType<typeof determineTacticalPriority>,
  self: BattleCharacter,
  enemy: BattleCharacter
): string {
  switch (priority) {
    case 'defend':
      return `${self.name} is critically wounded (${self.currentHealth} HP) and must defend!`;
    case 'finish':
      return `${enemy.name} is vulnerable (${enemy.currentHealth} HP) - time to finish them!`;
    case 'pierce':
      return `${enemy.name} has high defenses (${enemy.currentDefense}) - need piercing power!`;
    case 'heal':
      return `${self.name} is wounded (${self.currentHealth} HP) and needs healing!`;
    case 'recover':
      return `${self.name} is low on chi (${self.resources.chi}) and must recover!`;
    case 'attack':
      return `${self.name} maintains offensive pressure!`;
    default:
      return `${self.name} makes a tactical decision.`;
  }
}

/**
 * @description Analyzes the current battle state for tactical insights
 * @param self - The AI character
 * @param enemy - The opponent character
 * @returns Object containing tactical analysis
 */
export function analyzeBattleState(
  self: BattleCharacter,
  enemy: BattleCharacter
): {
  selfVulnerable: boolean;
  enemyVulnerable: boolean;
  enemyDefended: boolean;
  resourcePressure: boolean;
  healthPressure: boolean;
} {
  return {
    selfVulnerable: self.currentHealth < 30,
    enemyVulnerable: enemy.currentHealth < 25,
    enemyDefended: enemy.currentDefense > 20,
    resourcePressure: (self.resources.chi || 0) < 4,
    healthPressure: self.currentHealth < 50
  };
} 