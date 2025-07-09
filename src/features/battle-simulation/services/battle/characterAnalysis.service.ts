// CONTEXT: Character Analysis Service
// RESPONSIBILITY: Analyze character-specific performance metrics

import { BattleCharacter, BattleLogEntry } from '../../types';

/**
 * @description Represents character-specific performance metrics.
 */
export interface CharacterMetrics {
  characterName: string;
  damageDealt: number;
  damageTaken: number;
  movesUsed: Record<string, number>;
  chiSpent: number;
  chiRecovered: number;
  defenseBuffs: number;
  healingReceived: number;
  criticalHits: number;
  desperationMovesUsed: number;
  efficiency: number; // damage per chi spent
}

/**
 * @description Analyzes character-specific performance metrics.
 * @param {BattleCharacter} character - The character to analyze.
 * @param {BattleLogEntry[]} battleLog - The battle log.
 * @returns {CharacterMetrics} Character-specific metrics.
 */
export function analyzeCharacterPerformance(
  character: BattleCharacter,
  battleLog: BattleLogEntry[]
): CharacterMetrics {
  const characterLogs = battleLog.filter(entry => entry.actor === character.name);
  
  // Calculate damage metrics
  const damageDealt = characterLogs
    .filter(entry => entry.damage && entry.damage > 0)
    .reduce((sum, entry) => sum + (entry.damage || 0), 0);
  
  const damageTaken = battleLog
    .filter(entry => entry.target === character.name && entry.damage && entry.damage > 0)
    .reduce((sum, entry) => sum + (entry.damage || 0), 0);
  
  // Analyze move usage
  const movesUsed: Record<string, number> = {};
  characterLogs
    .filter(entry => entry.type === 'mechanics' && (entry.meta?.moveType === 'MOVE' || entry.meta?.moveType === 'DESPERATION'))
    .forEach(entry => {
      movesUsed[entry.action] = (movesUsed[entry.action] || 0) + 1;
    });
  
  // Calculate chi metrics
  const chiSpent = characterLogs
    .filter(entry => typeof entry.meta?.resourceCost === 'number')
    .reduce((sum, entry) => sum + (entry.meta?.resourceCost as number), 0);
  
  const chiRecovered = characterLogs
    .filter(entry => entry.action === 'Focus' || entry.meta?.heal)
    .length * 3; // Estimate chi recovery from rest/healing moves
  
  // Count special events
  const defenseBuffs = characterLogs
    .filter(entry => entry.abilityType === 'defense_buff').length;
  
  const healingReceived = characterLogs
    .filter(entry => entry.meta?.heal).length;
  
  const criticalHits = characterLogs
    .filter(entry => entry.meta?.crit).length;
  
  const desperationMovesUsed = characterLogs
    .filter(entry => entry.meta?.desperation).length;
  
  // Calculate efficiency
  const efficiency = chiSpent > 0 ? damageDealt / chiSpent : 0;
  
  return {
    characterName: character.name,
    damageDealt,
    damageTaken,
    movesUsed,
    chiSpent,
    chiRecovered,
    defenseBuffs,
    healingReceived,
    criticalHits,
    desperationMovesUsed,
    efficiency
  };
} 