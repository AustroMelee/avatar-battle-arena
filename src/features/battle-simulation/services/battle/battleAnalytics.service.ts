// CONTEXT: Battle Analytics Service
// RESPONSIBILITY: Generate battle analytics and statistics

import { BattleState } from '../../types';

/**
 * @description Battle analytics summary with detailed statistics
 */
export interface BattleAnalytics {
  totalTurns: number;
  totalDamage: number;
  criticalHits: number;
  desperationMoves: number;
  mostUsedMove: { name: string; count: number } | null;
  averageDamagePerTurn: number;
  moveUsageBreakdown: Record<string, number>;
  damageByCharacter: Record<string, number>;
  criticalHitRate: number;
  desperationMoveRate: number;
}

/**
 * @description Generates comprehensive battle analytics summary
 * @param {BattleState} state - The battle state to analyze
 * @returns {BattleAnalytics} Detailed battle analytics
 */
export function generateBattleAnalytics(state: BattleState): BattleAnalytics {
  const totalTurns = state.turn;
  const totalDamage = state.battleLog
    .filter(entry => entry.damage && entry.damage > 0)
    .reduce((sum, entry) => sum + (entry.damage || 0), 0);
  
  const criticalHits = state.battleLog.filter(entry => entry.meta?.crit).length;
  const desperationMoves = state.battleLog.filter(entry => entry.meta?.desperation).length;
  
  const moveUsage: Record<string, number> = {};
  state.battleLog
    .filter(entry => entry.type === 'MOVE' || entry.type === 'DESPERATION')
    .forEach(entry => {
      moveUsage[entry.action] = (moveUsage[entry.action] || 0) + 1;
    });
  
  const mostUsedMove = Object.entries(moveUsage)
    .sort(([,a], [,b]) => b - a)[0];
  
  const damageByCharacter: Record<string, number> = {};
  state.battleLog
    .filter(entry => entry.damage && entry.damage > 0)
    .forEach(entry => {
      damageByCharacter[entry.actor] = (damageByCharacter[entry.actor] || 0) + (entry.damage || 0);
    });

  const totalMoves = state.battleLog.filter(entry => entry.type === 'MOVE' || entry.type === 'DESPERATION').length;
  const criticalHitRate = totalMoves > 0 ? (criticalHits / totalMoves) * 100 : 0;
  const desperationMoveRate = totalMoves > 0 ? (desperationMoves / totalMoves) * 100 : 0;

  return {
    totalTurns,
    totalDamage,
    criticalHits,
    desperationMoves,
    mostUsedMove: mostUsedMove ? { name: mostUsedMove[0], count: mostUsedMove[1] } : null,
    averageDamagePerTurn: totalTurns > 0 ? totalDamage / totalTurns : 0,
    moveUsageBreakdown: moveUsage,
    damageByCharacter,
    criticalHitRate,
    desperationMoveRate
  };
}

/**
 * @description Formats battle analytics as a readable string
 * @param {BattleAnalytics} analytics - The analytics to format
 * @returns {string} Formatted analytics string
 */
export function formatBattleAnalytics(analytics: BattleAnalytics): string {
  return `=== BATTLE ANALYTICS ===
Total Turns: ${analytics.totalTurns}
Total Damage: ${analytics.totalDamage}
Critical Hits: ${analytics.criticalHits} (${analytics.criticalHitRate.toFixed(1)}%)
Desperation Moves: ${analytics.desperationMoves} (${analytics.desperationMoveRate.toFixed(1)}%)
Most Used Move: ${analytics.mostUsedMove ? `${analytics.mostUsedMove.name} (${analytics.mostUsedMove.count} times)` : 'None'}
Average Damage/Turn: ${analytics.averageDamagePerTurn.toFixed(1)}
Damage by Character: ${Object.entries(analytics.damageByCharacter)
  .map(([name, damage]) => `${name}: ${damage}`)
  .join(', ')}`;
}

/**
 * @description Generates and formats battle analytics for logging
 * @param {BattleState} state - The battle state to analyze
 * @returns {string} Formatted analytics string ready for logging
 */
export function generateAndFormatBattleAnalytics(state: BattleState): string {
  const analytics = generateBattleAnalytics(state);
  return formatBattleAnalytics(analytics);
} 