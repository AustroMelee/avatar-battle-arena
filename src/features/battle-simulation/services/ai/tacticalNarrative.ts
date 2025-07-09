// Used via dynamic registry in AI engine. See SYSTEM ARCHITECTURE.MD for flow.
import type { Ability } from '../../../../common/types';
import type { BattleCharacter } from '../../types';

/**
 * @description Generates context-aware battle narratives that explain tactical reasoning
 * @param character - The character performing the action
 * @param move - The ability being used
 * @param priority - The tactical priority that led to this choice
 * @param self - The AI character's current state
 * @param enemy - The opponent's current state
 * @returns A narrative that explains the tactical reasoning
 */
export function buildTacticalNarrative(
  character: BattleCharacter,
  move: Ability,
  priority: string,
  self: BattleCharacter,
  enemy: BattleCharacter
): string {
  
  // Base narrative with tactical context
  switch (priority) {
    case 'defend':
      return `${character.name} (${self.currentHealth} HP) is critically wounded and desperately activates ${move.name}, their aura flaring with renewed defensive strength!`;
      
    case 'finish':
      return `${character.name} sees ${enemy.name} vulnerable (${enemy.currentHealth} HP) and launches ${move.name} for the decisive blow!`;
      
    case 'pierce':
      return `${character.name} spots ${enemy.name}'s towering defenses (${enemy.currentDefense}) and counters with ${move.name}, piercing through their guard!`;
      
    case 'heal':
      return `${character.name} (${self.currentHealth} HP) channels healing energy through ${move.name}, feeling their wounds begin to close!`;
      
    case 'recover':
      return `${character.name} (${self.resources.chi} chi) conserves their dwindling energy with ${move.name}!`;
      
    case 'attack':
      return `${character.name} maintains offensive pressure with ${move.name}!`;
      
    default:
      return `${character.name} uses ${move.name}.`;
  }
}

/**
 * @description Generates a detailed tactical explanation for the battle log
 * @param character - The character performing the action
 * @param move - The ability being used
 * @param priority - The tactical priority
 * @param self - The AI character's current state
 * @param enemy - The opponent's current state
 * @returns A detailed explanation of the tactical reasoning
 */
export function buildTacticalExplanation(
  character: BattleCharacter,
  move: Ability,
  priority: string,
  self: BattleCharacter,
  enemy: BattleCharacter
): string {
  
  const explanations: string[] = [];
  
  // Add priority-based explanation
  switch (priority) {
    case 'defend':
      explanations.push(`${character.name} is critically wounded (${self.currentHealth} HP) and must defend!`);
      break;
    case 'finish':
      explanations.push(`${enemy.name} is vulnerable (${enemy.currentHealth} HP) - time to finish them!`);
      break;
    case 'pierce':
      explanations.push(`${enemy.name} has high defenses (${enemy.currentDefense}) - need piercing power!`);
      break;
    case 'heal':
      explanations.push(`${character.name} is wounded (${self.currentHealth} HP) and needs healing!`);
      break;
    case 'recover':
      explanations.push(`${character.name} is low on chi (${self.resources.chi}) and must recover!`);
      break;
    case 'attack':
      explanations.push(`${character.name} maintains offensive pressure!`);
      break;
  }
  
  // Add move-specific context
  if (move.tags?.includes('piercing') && enemy.currentDefense > 20) {
    explanations.push(`${move.name} pierces through ${enemy.name}'s defenses!`);
  }
  
  if (move.tags?.includes('desperate') && self.currentHealth < 30) {
    explanations.push(`${move.name} is a desperate move for critical situation!`);
  }
  
  if (move.tags?.includes('healing') && self.currentHealth < 40) {
    explanations.push(`${move.name} provides much-needed healing!`);
  }
  
  if (move.tags?.includes('high-damage') && enemy.currentHealth < 25) {
    explanations.push(`${move.name} is a finisher move against vulnerable enemy!`);
  }
  
  return explanations.join(' ');
}

/**
 * @description Creates a comprehensive battle log entry with tactical context
 * @param turn - Current turn number
 * @param character - The character performing the action
 * @param move - The ability being used
 * @param target - The target character
 * @param priority - The tactical priority
 * @param self - The AI character's current state
 * @param enemy - The opponent's current state
 * @param result - The mechanical result of the action
 * @returns Enhanced battle log entry with tactical context
 */
export function createTacticalLogEntry(
  turn: number,
  character: BattleCharacter,
  move: Ability,
  target: BattleCharacter,
  priority: string,
  self: BattleCharacter,
  enemy: BattleCharacter,
  result: string
): {
  turn: number;
  actor: string;
  action: string;
  target: string;
  result: string;
  narrative: string;
  tacticalExplanation: string;
  priority: string;
  abilityType: string;
  timestamp: number;
} {
  
  const narrative = buildTacticalNarrative(character, move, priority, self, enemy);
  const tacticalExplanation = buildTacticalExplanation(character, move, priority, self, enemy);
  
  return {
    turn,
    actor: 'System',
    action: move.name,
    target: target.name,
    result,
    narrative,
    tacticalExplanation,
    priority,
    abilityType: move.type,
    timestamp: Date.now()
  };
} 