// CONTEXT: Battle Analysis Service
// RESPONSIBILITY: Analyze overall battle performance metrics

import { BattleState, BattleLogEntry } from '../../types';

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
  victoryMethod: 'health' | 'desperation' | 'climax' | 'stalemate' | 'deadlock';
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