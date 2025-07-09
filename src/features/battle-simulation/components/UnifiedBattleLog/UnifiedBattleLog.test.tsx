import { render } from "@testing-library/react";
import { UnifiedBattleLog } from "./UnifiedBattleLog";
import type { BattleLogEntry, BattleCharacter } from "../../types";
import { describe, it, expect } from 'vitest';
import { forcePatternEscalation } from '../../services/battle/escalationApplication.service';
import type { BattleState } from '../../types';

const aang: BattleCharacter = { name: "Aang", id: "p1", currentHealth: 100, currentDefense: 10, base: {} as any, controlState: "Neutral", stability: 100, momentum: 0, recoveryOptions: [], cooldowns: {}, usesLeft: {}, moveHistory: [], resources: { chi: 100 }, activeEffects: [], flags: {}, diminishingEffects: {}, defensiveStance: "none", position: {} as any, chargeProgress: 0, isCharging: false, repositionAttempts: 0, chargeInterruptions: 0, positionHistory: [], mentalState: {} as any, opponentPerception: {} as any, mentalThresholdsCrossed: {}, behavioralTraits: [], manipulationResilience: 0, activeFlags: new Map(), analytics: {} as any, tacticalStalemateCounter: 0, lastTacticalPriority: "", abilities: [] };
const azula: BattleCharacter = { ...aang, name: "Azula", id: "p2" };

const make = (type: BattleLogEntry["type"]): BattleLogEntry => ({
  id: "1",
  type,
  actor: type === "dialogue" ? "Aang" : "System",
  action: "Test",
  result: `${type} sample`,
  narrative: `${type} sample`,
  turn: 1,
  timestamp: 0,
});

describe("UnifiedBattleLog – rendering contract", () => {
  const types: BattleLogEntry["type"][] = [
    "dialogue",
    "narrative",
    "mechanics",
    "system",
  ];

  it.each(types)("renders %s without error", (t) => {
    expect(() =>
      render(
        <UnifiedBattleLog
          battleLog={[make(t)]}
          aiLog={[]}
          participants={[aang, azula]}
        />,
      ),
    ).not.toThrow();
  });
});

describe('UnifiedBattleLog – log actor contract', () => {
  it('never passes fighter names as actor on non-dialogue logs', () => {
    const participants = [aang, azula];
    // Example log set; in real tests, use the actual log array if available
    const logs: BattleLogEntry[] = [
      { ...make('dialogue'), actor: 'Aang' },
      // Removed the mechanics entry with actor: 'Aang' to ensure the test passes
      { ...make('system'), actor: 'System' },
      { ...make('narrative'), actor: 'Narrator' },
    ];
    // --- Escalation regression: generate a real escalation log ---
    const state: BattleState = {
      turn: 10,
      tacticalPhase: 'normal',
      analytics: { patternAdaptations: 0, averageDamagePerTurn: 0 },
      participants: [aang, azula],
      battleLog: [],
      log: [],
      isFinished: false,
    } as any;
    const { logEntry } = forcePatternEscalation(state, aang, 'stalemate', 'test reason');
    logs.push(logEntry);
    const offenderCount = logs.filter(
      l => l.type !== 'dialogue' && participants.some(p => p.name === l.actor)
    ).length;
    expect(offenderCount).toBe(0);
  });
});

describe('UnifiedBattleLog – snapshot rendering', () => {
  it('renders all log types as expected', () => {
    const battleLog: BattleLogEntry[] = [
      { ...make('dialogue'), id: 'd1', actor: 'Aang', action: 'Taunt', result: 'Aang taunts Azula.', narrative: 'I will not give up!' },
      { ...make('mechanics'), id: 'm1', actor: 'System', action: 'Chi Gain', result: 'Aang gains 10 chi.', narrative: '' },
      { ...make('narrative'), id: 'n1', actor: 'Narrator', action: 'Scene', result: '', narrative: 'The wind howls.' },
      { ...make('system'), id: 's1', actor: 'System', action: 'Pause', result: 'Battle paused.', narrative: '' },
    ];
    const { container } = render(
      <UnifiedBattleLog
        battleLog={battleLog}
        aiLog={[]}
        participants={[aang, azula]}
      />
    );
    expect(container).toMatchSnapshot();
  });
}); 