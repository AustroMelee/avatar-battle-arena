import { describe, it, expect } from 'vitest';
import { processTurn } from '../processTurn';
import { createMockState } from './helpers/mockState';
import { BattleArcState } from '../../../types';
import { getCharacterById } from '../../../../character-selection/data/characterData';

describe('processTurn – Basic Strike end-to-end', () => {
  it('damage persists through all phases', async () => {
    let state = createMockState();
    const initialHP = state.participants[1].currentHealth;

    const minimalMentalState = { stability: 100, pride: 100, activeStates: [] };
    const minimalOpponentPerception = { aggressionLevel: 0, predictability: 0, respect: 0 };

    state = await processTurn({
      participants: [
        { name: 'Aang', id: 'p1', currentHealth: 100, currentDefense: 10, base: getCharacterById('aang')!, controlState: 'Neutral', stability: 100, momentum: 0, recoveryOptions: [], cooldowns: {}, usesLeft: {}, moveHistory: [], resources: { chi: 100 }, activeEffects: [], flags: {}, diminishingEffects: {}, defensiveStance: 'none', position: 'neutral', chargeProgress: 0, isCharging: false, repositionAttempts: 0, chargeInterruptions: 0, positionHistory: ['neutral'], mentalState: minimalMentalState, opponentPerception: minimalOpponentPerception, mentalThresholdsCrossed: {}, behavioralTraits: [], manipulationResilience: 0, activeFlags: new Map(), analytics: { totalDamage: 0, totalChiSpent: 0, turnsSinceLastDamage: 0, averageDamagePerTurn: 0, lastUpdatedTurn: 0, patternAdaptations: 0, stalematePreventions: 0, escalationEvents: 0, punishOpportunities: 0, criticalHits: 0, desperationMoves: 0, lastUpdated: 0 }, tacticalStalemateCounter: 0, lastTacticalPriority: '', abilities: [], restrictedMoves: [] },
        { name: 'Azula', id: 'p2', currentHealth: 100, currentDefense: 10, base: getCharacterById('azula')!, controlState: 'Neutral', stability: 100, momentum: 0, recoveryOptions: [], cooldowns: {}, usesLeft: {}, moveHistory: [], resources: { chi: 100 }, activeEffects: [], flags: {}, diminishingEffects: {}, defensiveStance: 'none', position: 'neutral', chargeProgress: 0, isCharging: false, repositionAttempts: 0, chargeInterruptions: 0, positionHistory: ['neutral'], mentalState: minimalMentalState, opponentPerception: minimalOpponentPerception, mentalThresholdsCrossed: {}, behavioralTraits: [], manipulationResilience: 0, activeFlags: new Map(), analytics: { totalDamage: 0, totalChiSpent: 0, turnsSinceLastDamage: 0, averageDamagePerTurn: 0, lastUpdatedTurn: 0, patternAdaptations: 0, stalematePreventions: 0, escalationEvents: 0, punishOpportunities: 0, criticalHits: 0, desperationMoves: 0, lastUpdated: 0 }, tacticalStalemateCounter: 0, lastTacticalPriority: '', abilities: [], restrictedMoves: [] }
      ],
      turn: 1,
      activeParticipantIndex: 0,
      log: [],
      battleLog: [],
      aiLog: [],
      isFinished: false,
      winner: null,
      tacticalPhase: 'positioning',
      analytics: { totalDamage: 0, totalChiSpent: 0, turnsSinceLastDamage: 0, averageDamagePerTurn: 0, lastUpdatedTurn: 0, patternAdaptations: 0, stalematePreventions: 0, escalationEvents: 0, punishOpportunities: 0, criticalHits: 0, desperationMoves: 0, lastUpdated: 0 },
      locationType: 'Open',
      environmentalFactors: [],
      positionAdvantage: 0,
      arcState: BattleArcState.Opening,
      arcStateHistory: [BattleArcState.Opening],
      climaxTriggered: false,
      tacticalStalemateCounter: 0,
      lastTacticalPriority: ''
    });

    expect(state.participants[1].currentHealth).toBeLessThan(initialHP);
    expect(state.participants[1].currentHealth).toBeGreaterThanOrEqual(0);
  });
});
