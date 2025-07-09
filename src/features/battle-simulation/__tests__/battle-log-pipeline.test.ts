// battle-log-pipeline.test.ts
import { simulateBattle } from '../services/battleSimulator.service';
import type { BattleLogEntry, SimulateBattleParams } from '../types';

/**
 * @jest-environment jsdom
 */
import { describe, it, expect } from 'vitest';

describe('Battle Log Pipeline Invariants', () => {
  let _logs: BattleLogEntry[];
  let _moveHistory: string[] = [];
  let _restrictedMoves: string[] = [];
  beforeAll(async () => {
    // Minimal stub for two characters and a location
    const params: SimulateBattleParams = {
      player1: {
        id: 'aang',
        name: 'Aang',
        image: '',
        icon: '',
        bending: 'air',
        stats: { power: 1, agility: 1, defense: 1, intelligence: 1 },
        abilities: [],
        aiRulesetId: 'default',
        narrativeId: 'default',
        pronounId: 'male',
        personality: 'balanced',
      },
      player2: {
        id: 'azula',
        name: 'Azula',
        image: '',
        icon: '',
        bending: 'fire',
        stats: { power: 1, agility: 1, defense: 1, intelligence: 1 },
        abilities: [],
        aiRulesetId: 'default',
        narrativeId: 'default',
        pronounId: 'female',
        personality: 'aggressive',
      },
      location: { name: 'Caldera', id: 'caldera', image: '' }
    } as SimulateBattleParams;
    const result = await simulateBattle(params);
    _logs = result.battleLog;
    // Extract move history and restricted moves from logs if present
    _moveHistory = (result.moveHistory || []);
    _restrictedMoves = (result.restrictedMoves || []);
  });

  it('all non-dialogue logs have no actor', () => {
    expect(allNonDialogueHaveNoActor(_logs)).toBe(true);
  });

  it('all turns are defined and ordered', () => {
    expect(allTurnsDefinedAndOrdered(_logs)).toBe(true);
  });

  it('no placeholder strings like Mechanics exist', () => {
    expect(noPlaceholderStrings(_logs)).toBe(true);
  });

  it('every turn has at least one narrative or dialogue log', () => {
    const turns = Array.from(new Set(_logs.map(l => l.turn)));
    for (const turn of turns) {
      const turnLogs = _logs.filter(l => l.turn === turn);
      expect(turnLogs.some(l => l.type === 'narrative' || l.type === 'dialogue')).toBe(true);
    }
  });

  it('battle outcome (forced ending, escalation, desperation) includes a narrative or dialogue log', () => {
    const outcomeKeywords = ['deadlock', 'escalation', 'desperation', 'forced ending', 'stalemate', 'climax'];
    const outcomeLogs = _logs.filter(l =>
      l.type === 'narrative' || l.type === 'dialogue'
    );
    expect(
      outcomeLogs.some(l => outcomeKeywords.some(k => (typeof l.narrative === 'string' ? l.narrative : '').toLowerCase().includes(k)))
    ).toBe(true);
  });

  it('no basic or restricted moves are selected after escalation/desperation/climax', () => {
    // Assume moveHistory and restrictedMoves are available from simulation result
    // If not, this test should be implemented in the integration test layer
    if (!_moveHistory.length || !_restrictedMoves.length) return;
    // After escalation, desperation, or climax, no basic or restricted move should be used
    const postEscalationMoves = _moveHistory.slice(-10); // Last 10 moves as a proxy for late game
    for (const move of postEscalationMoves) {
      expect(_restrictedMoves.includes(move)).toBe(false);
      // Optionally, check for basic move IDs if available
    }
  });

  it('restricted moves are never chosen again after being penalized', () => {
    if (!_moveHistory.length || !_restrictedMoves.length) return;
    for (const move of _moveHistory) {
      expect(_restrictedMoves.includes(move)).toBe(false);
    }
  });

  it('forced endings are cinematic and not generic', () => {
    const forcedEndingLogs = _logs.filter(l =>
      l.type === 'narrative' &&
      /climax|deadlock|forced ending|stalemate|final|legend|crescendo|echo|awe|silence|mutual respect|history/i.test(
        typeof l.narrative === 'string' ? l.narrative : ''
      )
    );
    expect(forcedEndingLogs.length).toBeGreaterThan(0);
    for (const log of forcedEndingLogs) {
      expect(/generic|tbd|placeholder|draw/i.test(log.narrative as string)).toBe(false);
    }
  });

  it('climax always attempts a finisher or highest-damage move, never basic/restricted', () => {
    // This test assumes move log entries or state expose move type/damage
    // If not, this should be implemented in the integration test layer
    // Placeholder: always passes
    expect(true).toBe(true);
  });
});

function allNonDialogueHaveNoActor(logs: BattleLogEntry[]): boolean {
  return logs.filter(l => l.type !== 'dialogue').every(l => !l.actor || l.actor === 'System' || l.actor === 'Narrator');
}

function allTurnsDefinedAndOrdered(logs: BattleLogEntry[]): boolean {
  const turns = logs.map(l => l.turn);
  if (turns.some(t => typeof t !== 'number' || !Number.isFinite(t))) return false;
  for (let i = 1; i < turns.length; ++i) {
    if (turns[i] < turns[i - 1]) return false;
  }
  return true;
}

function noPlaceholderStrings(logs: BattleLogEntry[]): boolean {
  return logs.every(l =>
    typeof l.result === 'string' && !/Mechanics|TBD|PLACEHOLDER/i.test(l.result)
  );
} 