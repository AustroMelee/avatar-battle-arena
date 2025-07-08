import { render } from "@testing-library/react";
import { UnifiedBattleLog } from "./UnifiedBattleLog";
import type { BattleLogEntry, BattleCharacter } from "../../types";
import { describe, it, expect } from 'vitest';

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