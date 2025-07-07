// CONTEXT: Analytics Service
// RESPONSIBILITY: Route analytics requests to appropriate analysis services

import type { BattleState, BattleLogEntry } from '../../types';
import type { BattleMetrics } from './battleAnalysis.service';

export { analyzeCharacterPerformance } from './characterAnalysis.service';
export type { CharacterMetrics } from './characterAnalysis.service';

export { analyzeAIPerformance } from './aiAnalysis.service';
export type { AIMetrics } from './aiAnalysis.service';

export { generateBattleReport } from './reportGenerator.service';

// Local implementation of analyzeBattlePerformance
export function analyzeBattlePerformance(
  finalState: BattleState,
  battleLog: BattleLogEntry[],
  startTime: number
): BattleMetrics {
  const endTime = Date.now();
  const battleDuration = endTime - startTime;
  const totalTurns = finalState.turn;
  const totalDamage = battleLog
    .filter(entry => entry.damage && entry.damage > 0)
    .reduce((sum, entry) => sum + (entry.damage || 0), 0);
  const averageDamagePerTurn = totalTurns > 0 ? totalDamage / totalTurns : 0;
  const moveUsage: Record<string, number> = {};
  battleLog
    .filter(entry => entry.type === 'MOVE' || entry.type === 'DESPERATION')
    .forEach(entry => {
      moveUsage[entry.action] = (moveUsage[entry.action] || 0) + 1;
    });
  const criticalHits = battleLog.filter(entry => entry.meta?.crit).length;
  // Use improved desperationMoves logic
  const desperationMoves = finalState.analytics?.desperationMoves || battleLog.filter(entry => entry.meta?.desperation).length;
  const finisherMoves = battleLog.filter(entry => entry.meta?.finisher).length;
  const climaxEvents = battleLog.filter(entry => entry.meta?.climax).length;
  const patternAdaptations = battleLog.filter(entry => entry.meta?.aiRule?.includes('Anti-pattern')).length;
  const totalChiSpent = battleLog
    .filter(entry => entry.meta?.resourceCost)
    .reduce((sum, entry) => sum + (entry.meta?.resourceCost || 0), 0);
  const chiEfficiency = totalChiSpent > 0 ? totalDamage / totalChiSpent : 0;
  let victoryMethod: 'health' | 'desperation' | 'climax' | 'stalemate' | 'deadlock' = 'health';
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
  // Improved stalematePrevention logic
  const stalematePrevention = finalState.analytics?.stalematePreventionTriggered || 
    battleLog.some(e => e.type === 'ESCALATION' || e.meta?.crisis || e.meta?.climax || e.meta?.desperation || e.meta?.finisher);
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