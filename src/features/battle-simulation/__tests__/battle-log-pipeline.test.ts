// battle-log-pipeline.test.ts
import { simulateBattle } from '../services/battleSimulator.service';
import type { BattleLogEntry, SimulateBattleParams } from '../types';

/**
 * @jest-environment jsdom
 */
import { describe, it, expect } from 'vitest';

describe('Battle Log Pipeline Invariants', () => {
  let logs: BattleLogEntry[];
  beforeAll(async () => {
    // Minimal stub for two characters and a location
    const params: SimulateBattleParams = {
      player1: { name: 'Aang', id: 'aang', base: { name: 'Aang' } },
      player2: { name: 'Azula', id: 'azula', base: { name: 'Azula' } },
      location: { name: 'Caldera', id: 'caldera' }
    } as any;
    const result = await simulateBattle(params);
    logs = result.battleLog;
  });

  it('all non-dialogue logs have no actor', () => {
    expect(allNonDialogueHaveNoActor(logs)).toBe(true);
  });

  it('all turns are defined and ordered', () => {
    expect(allTurnsDefinedAndOrdered(logs)).toBe(true);
  });

  it('no placeholder strings like Mechanics exist', () => {
    expect(noPlaceholderStrings(logs)).toBe(true);
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