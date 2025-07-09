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
  patternAdaptations: number;
  stalematePreventions: number;
  escalationEvents: number;
  punishOpportunities: number;
  mostUsedMove: { name: string; count: number } | null;
  averageDamagePerTurn: number;
  moveUsageBreakdown: Record<string, number>;
  damageByCharacter: Record<string, number>;
  criticalHitRate: number;
  desperationMoveRate: number;
  chiEfficiency: number;
  totalChiSpent: number;
}

/**
 * @description Generates comprehensive battle analytics summary
 * @param {BattleState} state - The battle state to analyze
 * @returns {BattleAnalytics} Detailed battle analytics
 */
export function generateBattleAnalytics(state: BattleState): BattleAnalytics {
  const totalTurns = state.turn;
  
  // FIXED: Track damage from ALL log entry types, not just 'MOVE'
  const totalDamage = state.battleLog
    .filter(entry => entry.damage && entry.damage > 0)
    .reduce((sum, entry) => sum + (entry.damage || 0), 0);
  
  const criticalHits = state.battleLog.filter(entry => entry.meta?.crit).length;
  const desperationMoves = state.battleLog.filter(entry => entry.meta?.isDesperation).length;
  
  // FIXED: Track pattern adaptations and escalation events
  const patternAdaptations = state.battleLog.filter(entry => entry.type === 'mechanics' && entry.meta?.escalation).length;
  const stalematePreventions = state.battleLog.filter(entry => 
    entry.type === 'mechanics' && entry.meta?.escalationType === 'stalemate'
  ).length;
  const escalationEvents = state.battleLog.filter(entry => entry.type === 'mechanics' && entry.meta?.escalation).length;
  const punishOpportunities = state.battleLog.filter(entry => 
    entry.meta?.punishDamage && entry.meta.punishDamage > 0
  ).length;
  
  // FIXED: Track move usage from ALL move-related log types
  const moveUsage: Record<string, number> = {};
  state.battleLog
    .filter(entry => ['MOVE', 'DESPERATION', 'POSITION', 'CHARGE', 'REPOSITION', 'TACTICAL'].includes(entry.type))
    .forEach(entry => {
      moveUsage[entry.action] = (moveUsage[entry.action] || 0) + 1;
    });
  
  const mostUsedMove = Object.entries(moveUsage)
    .sort(([,a], [,b]) => b - a)[0];
  
  // FIXED: Track damage by character from ALL log types
  const damageByCharacter: Record<string, number> = {};
  state.battleLog
    .filter(entry => entry.damage && entry.damage > 0)
    .forEach(entry => {
      if (typeof entry.actor === 'string' && entry.actor !== 'System' && entry.actor !== 'Narrator') {
        damageByCharacter[entry.actor] = (damageByCharacter[entry.actor] || 0) + (entry.damage || 0);
      }
    });

  // FIXED: Track chi spent from resource cost meta
  const totalChiSpent = state.battleLog
    .filter(entry => entry.meta?.resourceCost)
    .reduce((sum, entry) => sum + (entry.meta?.resourceCost || 0), 0);
  
  const chiEfficiency = totalChiSpent > 0 ? totalDamage / totalChiSpent : 0;

  const totalMoves = state.battleLog.filter(entry => 
    ['MOVE', 'DESPERATION', 'POSITION', 'CHARGE', 'REPOSITION', 'TACTICAL'].includes(entry.type)
  ).length;
  const criticalHitRate = totalMoves > 0 ? (criticalHits / totalMoves) * 100 : 0;
  const desperationMoveRate = totalMoves > 0 ? (desperationMoves / totalMoves) * 100 : 0;

  return {
    totalTurns,
    totalDamage,
    criticalHits,
    desperationMoves,
    patternAdaptations,
    stalematePreventions,
    escalationEvents,
    punishOpportunities,
    mostUsedMove: mostUsedMove ? { name: mostUsedMove[0], count: mostUsedMove[1] } : null,
    averageDamagePerTurn: totalTurns > 0 ? totalDamage / totalTurns : 0,
    moveUsageBreakdown: moveUsage,
    damageByCharacter,
    criticalHitRate,
    desperationMoveRate,
    chiEfficiency,
    totalChiSpent
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
Chi Efficiency: ${analytics.chiEfficiency.toFixed(2)} (${analytics.totalChiSpent} chi spent)
Critical Hits: ${analytics.criticalHits} (${analytics.criticalHitRate.toFixed(1)}%)
Desperation Moves: ${analytics.desperationMoves} (${analytics.desperationMoveRate.toFixed(1)}%)
Pattern Adaptations: ${analytics.patternAdaptations}
Stalemate Preventions: ${analytics.stalematePreventions}
Escalation Events: ${analytics.escalationEvents}
Punish Opportunities: ${analytics.punishOpportunities}
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