// @docs
// @description: Canonical helpers for building type-safe battle test fixtures.
// @tags: testing, helpers, type-safety

import { nes } from '@/common/branding/nonEmptyString';
import type { NonEmptyString } from '@/common/branding/nonEmptyString';
import { availableLocations } from '@/features/location-selection/data/locationData';
import { getCharacterById } from '@/features/character-selection/data/characterData';
import type { Character, Location } from '@/common/types';
import type {
  BattleState,
  BattleLogEntry,
  BattleCharacter,
} from '@/features/battle-simulation/types';
import { BattleArcState } from '@/features/battle-simulation/types';

/**
 * Converts a Character to a minimal BattleCharacter for test purposes.
 * Fills required fields with safe defaults.
 */
function createBattleCharacter(char: Character): BattleCharacter {
  return {
    base: char,
    id: char.id,
    name: char.name,
    controlState: 'Neutral',
    stability: 100,
    momentum: 0,
    recoveryOptions: [],
    currentHealth: 100,
    currentDefense: char.stats.defense,
    cooldowns: {},
    usesLeft: {},
    moveHistory: [],
    resources: { chi: 100 },
    activeEffects: [],
    flags: {},
    diminishingEffects: {},
    defensiveStance: 'none',
    position: 'neutral',
    isCharging: false,
    repositionAttempts: 0,
    chargeInterruptions: 0,
    positionHistory: [],
    mentalState: { stability: 100, pride: 100, activeStates: [] },
    opponentPerception: { aggressionLevel: 0, predictability: 0, respect: 0 },
    mentalThresholdsCrossed: {},
    behavioralTraits: char.behavioralTraits || [],
    manipulationResilience: char.manipulationResilience || 0,
    activeFlags: new Map(),
    analytics: {
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
    },
    tacticalStalemateCounter: 0,
    lastTacticalPriority: '',
    abilities: [],
  };
}

/**
 * Build a fully-schema-complete BattleState for tests.
 * – Participants come from the real registry.
 * – Location is the real availableLocations[0] (may be overridden).
 * – Log starts empty; add entries with the helpers below.
 */
export function buildBattleState(
  p1Id: string = 'aang',
  p2Id: string = 'azula',
  location: Location = availableLocations[0]
): BattleState {
  const p1Char = getCharacterById(p1Id)!;
  const p2Char = getCharacterById(p2Id)!;
  const p1 = createBattleCharacter(p1Char);
  const p2 = createBattleCharacter(p2Char);
  return {
    turn: 1,
    location: location.name,
    participants: [p1, p2],
    battleLog: [] as BattleLogEntry[],
    activeParticipantIndex: 0,
    log: [],
    aiLog: [],
    isFinished: false,
    winner: null,
    locationType: 'Open',
    environmentalFactors: [],
    tacticalPhase: 'positioning',
    positionAdvantage: 0,
    arcState: BattleArcState.Opening,
    arcStateHistory: [],
    analytics: {
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
    },
    tacticalStalemateCounter: 0,
    lastTacticalPriority: '',
  };
}

/** Quick helper for a mechanics/technical log entry. */
export function techLog(text: string, turn = 1): BattleLogEntry {
  const message: NonEmptyString = nes((text && text.length ? text : 'No result') as NonEmptyString);
  return {
    type: 'mechanics',
    turn,
    result: nes((text && text.length ? text : 'No result') as NonEmptyString),
    narrative: nes((text && text.length ? text : 'No result') as NonEmptyString),
    id: 'test',
    timestamp: Date.now(),
    action: 'test',
  } as BattleLogEntry;
}

/** Dialogue helper to keep tests terse. */
export function dialogue(
  actor: string,
  text: string,
  turn = 1
): BattleLogEntry {
  const actorBranded: NonEmptyString = nes(actor);
  return {
    type: 'dialogue',
    turn,
    actor: actorBranded,
    result: nes((text && text.length ? text : 'No result') as NonEmptyString),
    narrative: nes((text && text.length ? text : 'No result') as NonEmptyString),
    id: 'test',
    timestamp: Date.now(),
    action: 'test',
  } as BattleLogEntry;
} 