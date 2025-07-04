// CONTEXT: Report Generator Service
// RESPONSIBILITY: Generate battle reports and summaries

import { BattleMetrics } from './battleAnalysis.service';
import { CharacterMetrics } from './characterAnalysis.service';
import { AIMetrics } from './aiAnalysis.service';

/**
 * @description Generates a comprehensive battle report from all metrics.
 * @param {BattleMetrics} battleMetrics - Overall battle metrics.
 * @param {CharacterMetrics[]} characterMetrics - Character-specific metrics.
 * @param {AIMetrics} aiMetrics - AI performance metrics.
 * @returns {string} Formatted battle report.
 */
export function generateBattleReport(
  battleMetrics: BattleMetrics,
  characterMetrics: CharacterMetrics[],
  aiMetrics: AIMetrics
): string {
  let report = `=== BATTLE REPORT ===\n\n`;
  
  // Battle Overview
  report += `BATTLE OVERVIEW:\n`;
  report += `Duration: ${(battleMetrics.battleDuration / 1000).toFixed(2)}s\n`;
  report += `Turns: ${battleMetrics.totalTurns}\n`;
  report += `Winner: ${battleMetrics.winner || 'Stalemate'}\n`;
  report += `Victory Method: ${battleMetrics.victoryMethod}\n\n`;
  
  // Performance Metrics
  report += `PERFORMANCE METRICS:\n`;
  report += `Total Damage: ${battleMetrics.totalDamage}\n`;
  report += `Average Damage/Turn: ${battleMetrics.averageDamagePerTurn.toFixed(2)}\n`;
  report += `Chi Efficiency: ${battleMetrics.chiEfficiency.toFixed(2)}\n`;
  report += `Critical Hits: ${battleMetrics.criticalHits}\n`;
  report += `Desperation Moves: ${battleMetrics.desperationMoves}\n`;
  report += `Finisher Moves: ${battleMetrics.finisherMoves}\n`;
  report += `Climax Events: ${battleMetrics.climaxEvents}\n`;
  report += `Pattern Adaptations: ${battleMetrics.patternAdaptations}\n`;
  report += `Stalemate Prevention: ${battleMetrics.stalematePrevention ? 'Yes' : 'No'}\n\n`;
  
  // Character Performance
  report += `CHARACTER PERFORMANCE:\n`;
  characterMetrics.forEach(char => {
    report += `${char.characterName}:\n`;
    report += `  Damage Dealt: ${char.damageDealt}\n`;
    report += `  Damage Taken: ${char.damageTaken}\n`;
    report += `  Chi Spent: ${char.chiSpent}\n`;
    report += `  Efficiency: ${char.efficiency.toFixed(2)}\n`;
    report += `  Critical Hits: ${char.criticalHits}\n`;
    report += `  Desperation Moves: ${char.desperationMovesUsed}\n`;
    report += `  Defense Buffs: ${char.defenseBuffs}\n`;
    report += `  Healing Received: ${char.healingReceived}\n\n`;
  });
  
  // AI Performance
  report += `AI PERFORMANCE:\n`;
  report += `Pattern Recognition Accuracy: ${(aiMetrics.patternRecognitionAccuracy * 100).toFixed(1)}%\n`;
  report += `Anti-Spam Effectiveness: ${(aiMetrics.antiSpamEffectiveness * 100).toFixed(1)}%\n`;
  report += `Adaptation Speed: ${aiMetrics.adaptationSpeed.toFixed(1)} turns\n`;
  report += `Decision Quality: ${(aiMetrics.decisionQuality * 100).toFixed(1)}%\n`;
  report += `Reasoning Diversity: ${(aiMetrics.reasoningDiversity * 100).toFixed(1)}%\n\n`;
  
  // Move Usage Summary
  report += `MOVE USAGE SUMMARY:\n`;
  Object.entries(battleMetrics.moveUsage)
    .sort(([,a], [,b]) => b - a)
    .forEach(([move, count]) => {
      report += `  ${move}: ${count} uses\n`;
    });
  
  return report;
} 