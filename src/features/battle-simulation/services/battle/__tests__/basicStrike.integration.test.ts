import { describe, it, expect } from 'vitest';
import { processTurn } from '../processTurn';
import { createMockState } from './helpers/mockState';

describe('processTurn – Basic Strike end-to-end', () => {
  it('damage persists through all phases', async () => {
    let state = createMockState();
    const initialHP = state.participants[1].currentHealth;

    state = await processTurn({
      participants: [
        { name: 'Aang', id: 'p1', currentHealth: 100, currentDefense: 10, base: {} as any, controlState: 'Neutral', stability: 100, momentum: 0, recoveryOptions: [], cooldowns: {}, usesLeft: {}, moveHistory: [], resources: { chi: 100 }, activeEffects: [], flags: {}, diminishingEffects: {}, defensiveStance: 'none', position: {} as any, chargeProgress: 0, isCharging: false, repositionAttempts: 0, chargeInterruptions: 0, positionHistory: [], mentalState: {} as any, opponentPerception: {} as any, mentalThresholdsCrossed: {}, behavioralTraits: [], manipulationResilience: 0, activeFlags: new Map(), analytics: {
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
          lastUpdated: 0,
          // Optional: stalematePreventionTriggered: false,
        }, tacticalStalemateCounter: 0, lastTacticalPriority: '', abilities: [] },
        { name: 'Azula', id: 'p2', currentHealth: 100, currentDefense: 10, base: {} as any, controlState: 'Neutral', stability: 100, momentum: 0, recoveryOptions: [], cooldowns: {}, usesLeft: {}, moveHistory: [], resources: { chi: 100 }, activeEffects: [], flags: {}, diminishingEffects: {}, defensiveStance: 'none', position: {} as any, chargeProgress: 0, isCharging: false, repositionAttempts: 0, chargeInterruptions: 0, positionHistory: [], mentalState: {} as any, opponentPerception: {} as any, mentalThresholdsCrossed: {}, behavioralTraits: [], manipulationResilience: 0, activeFlags: new Map(), analytics: {
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
          lastUpdated: 0,
          // Optional: stalematePreventionTriggered: false,
        }, tacticalStalemateCounter: 0, lastTacticalPriority: '', abilities: [] }
      ],
      turn: 1,
      activeParticipantIndex: 0,
      log: [],
      battleLog: [],
      aiLog: [],
      isFinished: false,
      winner: null,
      tacticalPhase: 'normal' as any, // Replace with a valid TacticalPhase if available
      analytics: {
        // Remove lastPatternBreakTurn and any other properties not in BattleAnalytics
        // Keep only the properties defined in the BattleAnalytics type
        totalDamage: 0,
        totalChiSpent: 0,
        turnsSinceLastDamage: 0,
        averageDamagePerTurn: 0,
        patternAdaptations: 0,
        lastEscalationTurn: 0,
        lastDesperationTurn: 0,
        lastFinisherTurn: 0,
        lastCriticalTurn: 0,
        lastClashTurn: 0,
        lastMomentumShiftTurn: 0,
        lastStalemateTurn: 0,
      },
      // Add any other required properties with mock values as needed
    });

    expect(state.participants[1].currentHealth).toBeLessThan(initialHP);
    expect(state.participants[1].currentHealth).toBeGreaterThanOrEqual(0);
  });
});
