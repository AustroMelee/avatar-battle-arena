// CONTEXT: Real-time Analytics Tracker
// RESPONSIBILITY: Track battle metrics in real-time during execution

import { BattleLogEntry, BattleState } from '../../types';

/**
 * @description Real-time analytics tracking during battle execution
 */
export interface RealTimeAnalytics {
  totalDamage: number;
  totalChiSpent: number;
  patternAdaptations: number;
  stalematePreventions: number;
  escalationEvents: number;
  punishOpportunities: number;
  criticalHits: number;
  desperationMoves: number;
  lastUpdated: number;
  lastUpdatedTurn: number;
  turnsSinceLastDamage: number;
  averageDamagePerTurn: number;
}

/**
 * @description Initialize real-time analytics tracker
 */
export function initializeAnalyticsTracker(): RealTimeAnalytics {
  return {
    totalDamage: 0,
    totalChiSpent: 0,
    patternAdaptations: 0,
    stalematePreventions: 0,
    escalationEvents: 0,
    punishOpportunities: 0,
    criticalHits: 0,
    desperationMoves: 0,
    lastUpdated: Date.now(),
    lastUpdatedTurn: 0,
    turnsSinceLastDamage: 0,
    averageDamagePerTurn: 0
  };
}

/**
 * @description Update analytics when damage is dealt
 */
export function trackDamage(
  analytics: RealTimeAnalytics,
  damage: number,
  isCritical: boolean = false
): RealTimeAnalytics {
  return {
    ...analytics,
    totalDamage: analytics.totalDamage + damage,
    criticalHits: analytics.criticalHits + (isCritical ? 1 : 0),
    lastUpdated: Date.now()
  };
}

/**
 * @description Update analytics when chi is spent
 */
export function trackChiSpent(
  analytics: RealTimeAnalytics,
  chiCost: number
): RealTimeAnalytics {
  return {
    ...analytics,
    totalChiSpent: analytics.totalChiSpent + chiCost,
    lastUpdated: Date.now()
  };
}

/**
 * @description Update analytics when pattern adaptation occurs
 */
export function trackPatternAdaptation(
  analytics: RealTimeAnalytics,
  adaptationType: 'escalation' | 'stalemate' | 'repetition' | 'reposition'
): RealTimeAnalytics {
  const updates: Partial<RealTimeAnalytics> = {
    patternAdaptations: analytics.patternAdaptations + 1,
    lastUpdated: Date.now()
  };

  switch (adaptationType) {
    case 'escalation':
      updates.escalationEvents = analytics.escalationEvents + 1;
      break;
    case 'stalemate':
      updates.stalematePreventions = analytics.stalematePreventions + 1;
      break;
  }

  return {
    ...analytics,
    ...updates
  };
}

/**
 * @description Update analytics when punish opportunity is exploited
 */
export function trackPunishOpportunity(
  analytics: RealTimeAnalytics
): RealTimeAnalytics {
  return {
    ...analytics,
    punishOpportunities: analytics.punishOpportunities + 1,
    lastUpdated: Date.now()
  };
}

/**
 * @description Update analytics when desperation move is used
 */
export function trackDesperationMove(
  analytics: RealTimeAnalytics
): RealTimeAnalytics {
  return {
    ...analytics,
    desperationMoves: analytics.desperationMoves + 1,
    lastUpdated: Date.now()
  };
}

/**
 * @description Process a log entry and update analytics accordingly
 */
export function processLogEntryForAnalytics(
  analytics: RealTimeAnalytics,
  logEntry: BattleLogEntry
): RealTimeAnalytics {
  let updatedAnalytics = { ...analytics };

  // Track damage - look in meta.damage first, then fallback to direct damage property
  const damage = logEntry.meta?.damage as number || logEntry.damage || 0;
  if (damage > 0) {
    updatedAnalytics = trackDamage(
      updatedAnalytics,
      damage,
      logEntry.meta?.crit as boolean || false
    );
  }

  // Track chi spent - look in meta.resourceCost
  const resourceCost = logEntry.meta?.resourceCost as number || 0;
  if (resourceCost > 0) {
    updatedAnalytics = trackChiSpent(updatedAnalytics, resourceCost);
  }

  // Track pattern adaptations
  if (logEntry.type === 'ESCALATION') {
    const escalationType = logEntry.meta?.escalationType as string;
    if (escalationType === 'stalemate') {
      updatedAnalytics = trackPatternAdaptation(updatedAnalytics, 'stalemate');
    } else if (escalationType === 'repetition') {
      updatedAnalytics = trackPatternAdaptation(updatedAnalytics, 'repetition');
    } else if (escalationType === 'reposition') {
      updatedAnalytics = trackPatternAdaptation(updatedAnalytics, 'reposition');
    } else {
      updatedAnalytics = trackPatternAdaptation(updatedAnalytics, 'escalation');
    }
  }

  // Track punish opportunities
  const punishDamage = logEntry.meta?.punishDamage as number || 0;
  if (punishDamage > 0) {
    updatedAnalytics = trackPunishOpportunity(updatedAnalytics);
  }

  // Track desperation moves
  if (logEntry.meta?.isDesperation) {
    updatedAnalytics = trackDesperationMove(updatedAnalytics);
  }

  return updatedAnalytics;
}

/**
 * @description Get chi efficiency from analytics
 */
export function getChiEfficiency(analytics: RealTimeAnalytics): number {
  return analytics.totalChiSpent > 0 ? analytics.totalDamage / analytics.totalChiSpent : 0;
}

/**
 * @description Format real-time analytics for debugging
 */
export function formatRealTimeAnalytics(analytics: RealTimeAnalytics): string {
  const chiEfficiency = getChiEfficiency(analytics);
  return `REAL-TIME ANALYTICS:
  Total Damage: ${analytics.totalDamage}
  Chi Spent: ${analytics.totalChiSpent}
  Chi Efficiency: ${chiEfficiency.toFixed(2)}
  Pattern Adaptations: ${analytics.patternAdaptations}
  Stalemate Preventions: ${analytics.stalematePreventions}
  Escalation Events: ${analytics.escalationEvents}
  Punish Opportunities: ${analytics.punishOpportunities}
  Critical Hits: ${analytics.criticalHits}
  Desperation Moves: ${analytics.desperationMoves}`;
}

/**
 * @description Updates the real-time analytics stored in the battle state.
 * This should be called after each turn or significant action.
 * @param {BattleState} state - The current battle state.
 * @returns {BattleState} The battle state with updated analytics.
 */
export function updateRealTimeAnalytics(state: BattleState): BattleState {
  const newState = { ...state };
  const lastLogEntry = newState.battleLog[newState.battleLog.length - 1];

  // Only update analytics if the turn has advanced
  if (newState.turn === newState.analytics.lastUpdatedTurn) {
    return newState;
  }
  
  let damageThisTurn = 0;
  newState.battleLog
    .filter(entry => entry.turn === newState.turn -1) // Analyze the turn that just finished
    .forEach(entry => {
      if (entry.damage) {
        damageThisTurn += entry.damage;
        newState.analytics.totalDamage += entry.damage;
      }
      if (entry.meta?.resourceCost) {
        newState.analytics.totalChiSpent += entry.meta.resourceCost as number;
      }
    });

  if (damageThisTurn > 0) {
    newState.analytics.turnsSinceLastDamage = 0;
  } else {
    newState.analytics.turnsSinceLastDamage += 1;
  }

  // Recalculate average damage per turn
  newState.analytics.averageDamagePerTurn = newState.turn > 0 
    ? newState.analytics.totalDamage / newState.turn 
    : 0;

  newState.analytics.lastUpdatedTurn = newState.turn;

  return newState;
} 