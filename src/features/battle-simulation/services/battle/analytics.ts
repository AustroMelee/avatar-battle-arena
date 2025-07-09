// CONTEXT: Analytics Service
// RESPONSIBILITY: Route analytics requests to appropriate analysis services

import type { BattleState, BattleLogEntry } from '../../types';
import type { BattleMetrics } from './battleAnalysis.service';
// import type { Move } from '../../types/move.types';

export { analyzeCharacterPerformance } from './characterAnalysis.service';
export type { CharacterMetrics } from './characterAnalysis.service';

export { analyzeAIPerformance } from './aiAnalysis.service';
export type { AIMetrics } from './aiAnalysis.service';

export { generateBattleReport } from './reportGenerator.service';

export type { BattleMetrics } from './battleAnalysis.service';

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
    .filter(entry => entry.type === 'mechanics' && (entry.meta?.moveType === 'MOVE' || entry.meta?.moveType === 'DESPERATION'))
    .forEach(entry => {
      moveUsage[entry.action] = (moveUsage[entry.action] || 0) + 1;
    });
  const criticalHits = battleLog.filter(entry => entry.meta?.crit).length;
  // Use improved desperationMoves logic
  const desperationMoves = finalState.analytics?.desperationMoves || 0;
  const finisherMoves = battleLog.filter(entry => entry.meta?.finisher).length;
  const climaxEvents = battleLog.filter(entry => entry.meta?.climax).length;
  const patternAdaptations = finalState.analytics?.patternAdaptations || 0;
  const totalChiSpent = battleLog
    .filter(entry => typeof entry.meta?.resourceCost === 'number')
    .reduce((sum, entry) => sum + (entry.meta?.resourceCost as number), 0);
  const chiEfficiency = totalChiSpent > 0 ? totalDamage / totalChiSpent : 0;
  let victoryMethod: BattleMetrics['victoryMethod'] = 'health';
  if (finalState.winner && finalState.winner.name) {
    const lastLog = battleLog[battleLog.length - 1];
    // Check if the final blow was from a BURN effect
    if (lastLog && lastLog.action === 'Burn Damage' && lastLog.target === finalState.winner.name) {
      const loser = finalState.participants.find(p => p.name !== finalState.winner?.name);
      if(loser && lastLog.target === loser.name) {
        victoryMethod = 'burnout';
      }
    } else if (lastLog && lastLog.meta?.finisher) {
        victoryMethod = 'climax';
    } else if (desperationMoves > 0) {
        victoryMethod = 'desperation';
    }
  } else if (finalState.analytics.totalDamage === 0) {
      victoryMethod = 'deadlock';
  } else {
      victoryMethod = 'stalemate';
  }
  // Improved stalematePrevention logic
  const stalematePrevention = finalState.analytics?.stalematePreventionTriggered || 
    battleLog.some(e => e.meta?.escalation || e.meta?.crisis || e.meta?.mechanic === 'SUDDEN DEATH');
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