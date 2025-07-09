import { render } from "@testing-library/react";
import { UnifiedBattleLog } from "./UnifiedBattleLog";
import type { BattleLogEntry, BattleCharacter, DialogueLogEntry, NonDialogueLogEntry } from "../../types";
import { describe, it, expect } from 'vitest';
import { forcePatternEscalation } from '../../services/battle/escalationApplication.service';
import type { BattleState } from '../../types';
import { simulateBattle } from '../../services/battleSimulator.service';
import { availableCharacters } from '../../../character-selection/data/characterData';
import { availableLocations } from '../../../location-selection/data/locationData';
import { nes } from '@/common/branding/nonEmptyString';

const aang: BattleCharacter = { name: "Aang", id: "p1", currentHealth: 100, currentDefense: 10, base: {} as any, controlState: "Neutral", stability: 100, momentum: 0, recoveryOptions: [], cooldowns: {}, usesLeft: {}, moveHistory: [], resources: { chi: 100 }, activeEffects: [], flags: {}, diminishingEffects: {}, defensiveStance: "none", position: {} as any, chargeProgress: 0, isCharging: false, repositionAttempts: 0, chargeInterruptions: 0, positionHistory: [], mentalState: {} as any, opponentPerception: {} as any, mentalThresholdsCrossed: {}, behavioralTraits: [], manipulationResilience: 0, activeFlags: new Map(), analytics: {} as any, tacticalStalemateCounter: 0, lastTacticalPriority: "", abilities: [] };
const azula: BattleCharacter = { ...aang, name: "Azula", id: "p2" };

describe("UnifiedBattleLog – rendering contract", () => {
  const types: BattleLogEntry["type"][] = [
    "dialogue",
    "narrative",
    "mechanics",
    "system",
  ];

  it.each(types)("renders %s without error", (t) => {
    let entry: BattleLogEntry;
    if (t === 'dialogue') {
      entry = {
        id: 'test-dialogue',
        type: 'dialogue',
        actor: 'Aang',
        action: 'Test',
        result: nes('dialogue sample'),
        narrative: nes('dialogue sample'),
        turn: 1,
        timestamp: 0
      };
    } else if (t === 'narrative') {
      entry = {
        id: 'test-narrative',
        type: 'narrative',
        actor: 'Narrator',
        action: 'Test',
        result: nes('narrative sample'),
        narrative: nes('narrative sample'),
        turn: 1,
        timestamp: 0
      };
    } else {
      entry = {
        id: `test-${t}`,
        type: t as Exclude<BattleLogEntry["type"], "dialogue" | "narrative">,
        actor: 'System',
        action: 'Test',
        result: nes(`${t} sample`),
        narrative: nes(`${t} sample`),
        turn: 1,
        timestamp: 0
      };
    }
    expect(() =>
      render(
        <UnifiedBattleLog
          battleLog={[entry]}
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
    const logs: BattleLogEntry[] = [
      {
        id: 'd1',
        type: 'dialogue',
        actor: 'Aang',
        action: 'Test',
        result: nes('dialogue sample'),
        narrative: nes('dialogue sample'),
        turn: 1,
        timestamp: 0
      },
      {
        id: 's1',
        type: 'system',
        actor: 'System',
        action: 'Test',
        result: nes('system sample'),
        narrative: nes('system sample'),
        turn: 1,
        timestamp: 0
      },
      {
        id: 'n1',
        type: 'narrative',
        actor: 'Narrator',
        action: 'Test',
        result: nes('narrative sample'),
        narrative: nes('narrative sample'),
        turn: 1,
        timestamp: 0
      },
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
    const { logEntry } = forcePatternEscalation(state, aang, 'stalemate');
    logs.push(logEntry);
    const offenderCount = logs.filter(
      l => l.type !== 'dialogue' && participants.some(p => p.name === l.actor)
    ).length;
    expect(offenderCount).toBe(0);
  });
});

describe('UnifiedBattleLog – full simulation log actor contract', () => {
  it('never produces a non-dialogue log with a fighter as actor in a real battle', async () => {
    const params = {
      player1: availableCharacters[0],
      player2: availableCharacters[1],
      location: availableLocations[0],
    };
    const { battleLog } = await simulateBattle(params);
    const fighterNames = [availableCharacters[0].name, availableCharacters[1].name];
    const offenderCount = battleLog.filter(
      l => l.type !== 'dialogue' && l.actor && fighterNames.includes(l.actor)
    ).length;
    expect(offenderCount).toBe(0);
  });
});

describe('UnifiedBattleLog – snapshot rendering', () => {
  it('renders all log types as expected', () => {
    const dialogueLogs: DialogueLogEntry[] = [
      {
        id: 'd1',
        type: 'dialogue',
        actor: 'Aang',
        action: 'Taunt',
        result: nes('Aang taunts Azula.'),
        narrative: nes('I will not give up!'),
        turn: 1,
        timestamp: 0
      }
    ];
    const nonDialogueLogs: NonDialogueLogEntry[] = [
      {
        id: 'm1',
        type: 'mechanics',
        actor: 'System',
        action: 'Chi Gain',
        result: nes('Aang gains 10 chi.'),
        narrative: nes('No narrative'),
        turn: 1,
        timestamp: 0
      },
      {
        id: 'n1',
        type: 'narrative',
        actor: 'Narrator',
        action: 'Scene',
        result: nes('No result'),
        narrative: nes('The wind howls.'),
        turn: 1,
        timestamp: 0
      },
      {
        id: 's1',
        type: 'system',
        actor: 'System',
        action: 'Pause',
        result: nes('Battle paused.'),
        narrative: nes('No narrative'),
        turn: 1,
        timestamp: 0
      }
    ];
    const battleLog: BattleLogEntry[] = [...dialogueLogs, ...nonDialogueLogs];
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