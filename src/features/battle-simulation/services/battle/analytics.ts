// CONTEXT: Battle Analytics System
// RESPONSIBILITY: Track and analyze battle performance metrics

import { BattleState, BattleLogEntry, BattleCharacter, AILogEntry } from '../../types';

/**
 * @description Represents battle performance metrics.
 */
export interface BattleMetrics {
  totalTurns: number;
  totalDamage: number;
  averageDamagePerTurn: number;
  moveUsage: Record<string, number>;
  chiEfficiency: number;
  criticalHits: number;
  desperationMoves: number;
  finisherMoves: number;
  climaxEvents: number;
  patternAdaptations: number;
  stalematePrevention: boolean;
  battleDuration: number; // in milliseconds
  winner: string | null;
  victoryMethod: 'health' | 'desperation' | 'climax' | 'stalemate';
}

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
 * @description Represents AI performance metrics.
 */
export interface AIMetrics {
  patternRecognitionAccuracy: number;
  antiSpamEffectiveness: number;
  adaptationSpeed: number;
  decisionQuality: number;
  reasoningDiversity: number;
}

/**
 * @description Analyzes battle performance and generates comprehensive metrics.
 * @param {BattleState} finalState - The final state of the battle.
 * @param {BattleLogEntry[]} battleLog - The complete battle log.
 * @param {number} startTime - The timestamp when the battle started.
 * @returns {BattleMetrics} Comprehensive battle metrics.
 */
export function analyzeBattlePerformance(
  finalState: BattleState,
  battleLog: BattleLogEntry[],
  startTime: number
): BattleMetrics {
  const endTime = Date.now();
  const battleDuration = endTime - startTime;
  
  // Calculate basic metrics
  const totalTurns = finalState.turn;
  const totalDamage = battleLog
    .filter(entry => entry.damage && entry.damage > 0)
    .reduce((sum, entry) => sum + (entry.damage || 0), 0);
  
  const averageDamagePerTurn = totalTurns > 0 ? totalDamage / totalTurns : 0;
  
  // Analyze move usage
  const moveUsage: Record<string, number> = {};
  battleLog
    .filter(entry => entry.type === 'MOVE' || entry.type === 'DESPERATION')
    .forEach(entry => {
      moveUsage[entry.action] = (moveUsage[entry.action] || 0) + 1;
    });
  
  // Count special events
  const criticalHits = battleLog.filter(entry => entry.meta?.crit).length;
  const desperationMoves = battleLog.filter(entry => entry.meta?.desperation).length;
  const finisherMoves = battleLog.filter(entry => entry.meta?.finisher).length;
  const climaxEvents = battleLog.filter(entry => entry.meta?.climax).length;
  const patternAdaptations = battleLog.filter(entry => entry.meta?.aiRule?.includes('Anti-pattern')).length;
  
  // Calculate chi efficiency
  const totalChiSpent = battleLog
    .filter(entry => entry.meta?.resourceCost)
    .reduce((sum, entry) => sum + (entry.meta?.resourceCost || 0), 0);
  const chiEfficiency = totalChiSpent > 0 ? totalDamage / totalChiSpent : 0;
  
  // Determine victory method
  let victoryMethod: 'health' | 'desperation' | 'climax' | 'stalemate' = 'health';
  if (finalState.winner && finalState.winner.name) {
    const winnerLogs = battleLog.filter(entry => entry.actor === finalState.winner!.name);
    if (winnerLogs.some(entry => entry.meta?.desperation)) {
      victoryMethod = 'desperation';
    } else if (winnerLogs.some(entry => entry.meta?.climax)) {
      victoryMethod = 'climax';
    }
  } else {
    victoryMethod = 'stalemate';
  }
  
  // Check for stalemate prevention
  const stalematePrevention = battleLog.some(entry => 
    entry.meta?.climax || entry.meta?.desperation || entry.meta?.finisher
  );
  
  return {
    totalTurns,
    totalDamage,
    averageDamagePerTurn,
    moveUsage,
    chiEfficiency,
    criticalHits,
    desperationMoves,
    finisherMoves,
    climaxEvents,
    patternAdaptations,
    stalematePrevention,
    battleDuration,
    winner: finalState.winner?.name || null,
    victoryMethod
  };
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
    .filter(entry => entry.type === 'MOVE' || entry.type === 'DESPERATION')
    .forEach(entry => {
      movesUsed[entry.action] = (movesUsed[entry.action] || 0) + 1;
    });
  
  // Calculate chi metrics
  const chiSpent = characterLogs
    .filter(entry => entry.meta?.resourceCost)
    .reduce((sum, entry) => sum + (entry.meta?.resourceCost || 0), 0);
  
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

/**
 * @description Analyzes AI performance metrics.
 * @param {BattleLogEntry[]} battleLog - The battle log.
 * @param {AILogEntry[]} aiLog - The AI decision log.
 * @returns {AIMetrics} AI performance metrics.
 */
export function analyzeAIPerformance(
  battleLog: BattleLogEntry[],
  aiLog: AILogEntry[]
): AIMetrics {
  // Pattern recognition accuracy
  const patternAdaptations = battleLog.filter(entry => 
    entry.meta?.aiRule?.includes('Anti-pattern')
  ).length;
  const totalAIDecisions = aiLog.length;
  const patternRecognitionAccuracy = totalAIDecisions > 0 ? patternAdaptations / totalAIDecisions : 0;
  
  // Anti-spam effectiveness
  const spamPreventionMoves = battleLog.filter(entry => 
    entry.meta?.aiRule?.includes('Anti-spam') || entry.meta?.aiRule?.includes('Avoid')
  ).length;
  const antiSpamEffectiveness = totalAIDecisions > 0 ? spamPreventionMoves / totalAIDecisions : 0;
  
  // Adaptation speed (how quickly AI changes strategy)
  const strategyChanges = aiLog.filter((entry, index) => {
    if (index === 0) return false;
    const previousReasoning = aiLog[index - 1].reasoning;
    const currentReasoning = entry.reasoning;
    return previousReasoning !== currentReasoning;
  }).length;
  const adaptationSpeed = totalAIDecisions > 1 ? strategyChanges / (totalAIDecisions - 1) : 0;
  
  // Decision quality (based on move effectiveness)
  const effectiveMoves = battleLog.filter(entry => 
    entry.damage && entry.damage > 5 || entry.meta?.heal || entry.meta?.defense
  ).length;
  const decisionQuality = totalAIDecisions > 0 ? effectiveMoves / totalAIDecisions : 0;
  
  // Reasoning diversity
  const uniqueReasonings = new Set(aiLog.map(entry => entry.reasoning)).size;
  const reasoningDiversity = totalAIDecisions > 0 ? uniqueReasonings / totalAIDecisions : 0;
  
  return {
    patternRecognitionAccuracy,
    antiSpamEffectiveness,
    adaptationSpeed,
    decisionQuality,
    reasoningDiversity
  };
}

/**
 * @description Generates a comprehensive battle report.
 * @param {BattleMetrics} battleMetrics - Battle performance metrics.
 * @param {CharacterMetrics[]} characterMetrics - Character performance metrics.
 * @param {AIMetrics} aiMetrics - AI performance metrics.
 * @returns {string} Formatted battle report.
 */
export function generateBattleReport(
  battleMetrics: BattleMetrics,
  characterMetrics: CharacterMetrics[],
  aiMetrics: AIMetrics
): string {
  const report = [
    '=== BATTLE PERFORMANCE REPORT ===',
    '',
    `Battle Duration: ${Math.round(battleMetrics.battleDuration / 1000)}s`,
    `Total Turns: ${battleMetrics.totalTurns}`,
    `Winner: ${battleMetrics.winner || 'Draw'}`,
    `Victory Method: ${battleMetrics.victoryMethod}`,
    '',
    '=== DAMAGE METRICS ===',
    `Total Damage: ${battleMetrics.totalDamage}`,
    `Average Damage/Turn: ${battleMetrics.averageDamagePerTurn.toFixed(1)}`,
    `Chi Efficiency: ${battleMetrics.chiEfficiency.toFixed(2)} damage/chi`,
    '',
    '=== SPECIAL EVENTS ===',
    `Critical Hits: ${battleMetrics.criticalHits}`,
    `Desperation Moves: ${battleMetrics.desperationMoves}`,
    `Finisher Moves: ${battleMetrics.finisherMoves}`,
    `Climax Events: ${battleMetrics.climaxEvents}`,
    `Pattern Adaptations: ${battleMetrics.patternAdaptations}`,
    `Stalemate Prevention: ${battleMetrics.stalematePrevention ? 'Yes' : 'No'}`,
    '',
    '=== CHARACTER PERFORMANCE ==='
  ];
  
  characterMetrics.forEach(char => {
    report.push(
      `${char.characterName}:`,
      `  Damage Dealt: ${char.damageDealt}`,
      `  Damage Taken: ${char.damageTaken}`,
      `  Chi Spent: ${char.chiSpent}`,
      `  Efficiency: ${char.efficiency.toFixed(2)} damage/chi`,
      `  Critical Hits: ${char.criticalHits}`,
      `  Desperation Moves: ${char.desperationMovesUsed}`,
      ''
    );
  });
  
  report.push(
    '=== AI PERFORMANCE ===',
    `Pattern Recognition: ${(aiMetrics.patternRecognitionAccuracy * 100).toFixed(1)}%`,
    `Anti-Spam Effectiveness: ${(aiMetrics.antiSpamEffectiveness * 100).toFixed(1)}%`,
    `Adaptation Speed: ${(aiMetrics.adaptationSpeed * 100).toFixed(1)}%`,
    `Decision Quality: ${(aiMetrics.decisionQuality * 100).toFixed(1)}%`,
    `Reasoning Diversity: ${(aiMetrics.reasoningDiversity * 100).toFixed(1)}%`
  );
  
  return report.join('\n');
}

/**
 * @description Tracks analytics during battle execution.
 * @param {BattleLogEntry} logEntry - New log entry.
 * @returns {void}
 */
export function trackBattleAnalytics(
  logEntry: BattleLogEntry
): void {
  // This function can be called during battle execution to track real-time metrics
  // For now, we'll just log significant events
  if (logEntry.meta?.desperation) {
    console.log(`[ANALYTICS] Desperation move used: ${logEntry.actor} - ${logEntry.action}`);
  }
  
  if (logEntry.meta?.climax) {
    console.log(`[ANALYTICS] Climax event triggered: ${logEntry.actor} - ${logEntry.action}`);
  }
  
  if (logEntry.meta?.aiRule?.includes('Anti-pattern')) {
    console.log(`[ANALYTICS] Pattern adaptation: ${logEntry.actor} - ${logEntry.meta.aiRule}`);
  }
} 