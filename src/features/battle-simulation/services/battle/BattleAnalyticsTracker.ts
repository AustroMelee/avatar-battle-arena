// CONTEXT: Battle Analytics Tracker
// RESPONSIBILITY: Track and update battle analytics data

import { BattleState } from '../../types';
import type { BattleAnalytics } from '../../types';

/**
 * @description Result of analytics update
 */
export interface AnalyticsUpdateResult {
  previousTotalDamage: number;
  previousTotalChiSpent: number;
  damageIncrease: number;
  chiIncrease: number;
}

/**
 * @description Initialize analytics if not present
 */
export function initializeAnalytics(state: BattleState): void {
  if (!state.analytics) {
    state.analytics = {
      totalDamage: 0,
      totalChiSpent: 0,
      turnsSinceLastDamage: 0,
      averageDamagePerTurn: 0,
      lastUpdatedTurn: 0,
      patternAdaptations: 0,
      stalematePreventions: 0,
      escalationEvents: 0,
      punishOpportunities: 0,
      criticalHits: 0,
      desperationMoves: 0,
      lastUpdated: Date.now(),
      stalematePreventionTriggered: false
    };
  }
}

/**
 * @description Update analytics for tactical move execution
 */
export function updateTacticalAnalytics(
  state: BattleState,
  damage: number,
  chiCost: number,
  punishDamage: number = 0,
  additionalMetrics?: Partial<BattleAnalytics>
): AnalyticsUpdateResult {
  initializeAnalytics(state);
  
  const previousTotalDamage = state.analytics!.totalDamage;
  const previousTotalChiSpent = state.analytics!.totalChiSpent;
  
  // Update core metrics
  state.analytics!.totalDamage += damage;
  state.analytics!.totalChiSpent += chiCost;
  state.analytics!.lastUpdated = Date.now();
  
  // Update punish opportunities if applicable
  if (punishDamage > 0) {
    state.analytics!.punishOpportunities += 1;
  }
  
  // Update additional metrics if provided
  if (additionalMetrics) {
    Object.entries(additionalMetrics).forEach(([key, value]) => {
      // Only update numeric fields, skip booleans (like stalematePreventionTriggered)
      if (key in state.analytics! && typeof value === 'number' && typeof (state.analytics as any)[key] === 'number') {
        (state.analytics as any)[key] += value;
      }
    });
  }
  
  return {
    previousTotalDamage,
    previousTotalChiSpent,
    damageIncrease: damage,
    chiIncrease: chiCost
  };
}

/**
 * @description Track pattern adaptation
 */
export function trackPatternAdaptation(state: BattleState): void {
  initializeAnalytics(state);
  state.analytics!.patternAdaptations += 1;
  state.analytics!.lastUpdated = Date.now();
}

/**
 * @description Track stalemate prevention
 */
export function trackStalematePrevention(state: BattleState): void {
  initializeAnalytics(state);
  state.analytics!.stalematePreventions += 1;
  state.analytics!.lastUpdated = Date.now();
}

/**
 * @description Track escalation event
 */
export function trackEscalationEvent(state: BattleState): void {
  initializeAnalytics(state);
  state.analytics!.escalationEvents += 1;
  state.analytics!.lastUpdated = Date.now();
}

/**
 * @description Track critical hit
 */
export function trackCriticalHit(state: BattleState): void {
  initializeAnalytics(state);
  state.analytics!.criticalHits += 1;
  state.analytics!.lastUpdated = Date.now();
}

/**
 * @description Track desperation move
 */
export function trackDesperationMove(state: BattleState): void {
  initializeAnalytics(state);
  state.analytics!.desperationMoves += 1;
  state.analytics!.lastUpdated = Date.now();
}

/**
 * @description Get analytics summary
 */
export function getAnalyticsSummary(state: BattleState): BattleAnalytics | null {
  return state.analytics || null;
}

/**
 * @description Reset analytics
 */
export function resetAnalytics(state: BattleState): void {
  state.analytics = {
    totalDamage: 0,
    totalChiSpent: 0,
    turnsSinceLastDamage: 0,
    averageDamagePerTurn: 0,
    lastUpdatedTurn: 0,
    patternAdaptations: 0,
    stalematePreventions: 0,
    escalationEvents: 0,
    punishOpportunities: 0,
    criticalHits: 0,
    desperationMoves: 0,
    lastUpdated: Date.now(),
    stalematePreventionTriggered: false
  };
} 