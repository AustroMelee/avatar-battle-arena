import type { Move } from '../../types/move.types';
import type { BattleCharacter } from '../../types';

// New helper function to classify the last move
function getLastMoveType(character: BattleCharacter): 'attack' | 'defense' | 'other' {
  const lastMoveName = character.lastMove?.toLowerCase() || '';
  if (lastMoveName.includes('shield') || lastMoveName.includes('evasion') || lastMoveName.includes('glide') || lastMoveName.includes('jets')) {
    return 'defense';
  }
  if (lastMoveName.includes('strike') || lastMoveName.includes('fire') || lastMoveName.includes('slice') || lastMoveName.includes('blast')) {
    return 'attack';
  }
  return 'other';
}

/**
 * @description Determines the tactical priority for AI decision making based on current battle state
 * @param self - The AI character making the decision
 * @param enemy - The opponent character
 * @param availableAbilities - List of abilities that can be used this turn
 * @param stalemateCounter - NEW: How many consecutive turns the same priority has been chosen
 * @returns Tactical priority that guides move selection
 */
export function determineTacticalPriority(
  self: BattleCharacter,
  enemy: BattleCharacter,
  availableAbilities: Move[],
  stalemateCounter: number = 0 // NEW: Track tactical stalemates
): 'defend' | 'pierce' | 'finish' | 'recover' | 'attack' | 'heal' | 'gamble' { // NEW: Added 'gamble'
  const enemyLastMoveType = getLastMoveType(enemy);

  // --- NEW: Tactical Stalemate Breaker ---
  if (stalemateCounter >= 3) {
    // If stuck in the same loop for 3+ turns, force a high-risk, high-reward move.
    return 'gamble';
  }

  // CRITICAL: Defend when health is dangerously low
  if (self.currentHealth < 25) {
    return 'defend';
  }
  // FINISH: Use high-damage moves when enemy is vulnerable
  if (enemy.currentHealth < 20 && availableAbilities.some(a => typeof a.tags === 'object' && Array.isArray(a.tags) && a.tags.includes('high-damage'))) {
    return 'finish';
  }
  // PIERCE: Use piercing moves when enemy has high defense OR just defended
  if ((enemy.currentDefense > 25 || enemyLastMoveType === 'defense') && availableAbilities.some(a => typeof a.tags === 'object' && Array.isArray(a.tags) && a.tags.includes('piercing'))) {
    return 'pierce';
  }
  // HEAL: Use healing moves when health is low but not critical
  if (self.currentHealth < 40 && availableAbilities.some(a => typeof a.tags === 'object' && Array.isArray(a.tags) && a.tags.includes('healing'))) {
    return 'heal';
  }
  // RECOVER: Conserve chi when resources are low
  if ((self.resources?.chi || 0) < 3 && availableAbilities.some(a => a.type === 'defense_buff')) {
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
  const enemyLastMoveType = getLastMoveType(enemy);
  switch (priority) {
    case 'gamble': // NEW: Explanation for the gamble state
      return `${self.name} is breaking the tactical loop and going for a high-risk gamble!`;
    case 'defend':
      return `${self.name} is critically wounded (${self.currentHealth} HP) and must defend!`;
    case 'finish':
      return `${enemy.name} is vulnerable (${enemy.currentHealth} HP) - time to finish them!`;
    case 'pierce':
      if (enemyLastMoveType === 'defense') {
        return `${enemy.name} is defending; attempting to pierce their guard!`;
      }
      return `${enemy.name} has high defenses (${enemy.currentDefense}) - need piercing power!`;
    case 'heal':
      return `${self.name} is wounded (${self.currentHealth} HP) and needs healing!`;
    case 'recover':
      return `${self.name} is low on chi (${self.resources?.chi}) and must recover!`;
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
    resourcePressure: (self.resources?.chi || 0) < 4,
    healthPressure: self.currentHealth < 50
  };
} 