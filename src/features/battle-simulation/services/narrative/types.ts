// CONTEXT: Narrative System, // FOCUS: Type Definitions
import type { BattleCharacter, BattleLogEntry } from '../../types';
import type { Ability } from '@/common/types';

/**
 * @description Complete battle context available to narrative hooks
 */
export type BattleContext = {
  actor: BattleCharacter;
  target: BattleCharacter;
  move: Ability;
  turnIndex: number;
  battleLog: BattleLogEntry[];
  location: string;
  matchup?: [string, string];
  collateralTolerance: Record<string, number>; // e.g., { aang: 0.7, azula: 0.2 }
  battlePhase: 'start' | 'mid' | 'end';
  isCritical?: boolean;
  isDesperation?: boolean;
  damage?: number;
  isFirstBlood?: boolean;
  isComeback?: boolean;
  isRally?: boolean;
  actorHealthPercent: number;
  targetHealthPercent: number;
  actorChiPercent: number;
  targetChiPercent: number;
};

/**
 * @description Character moods for narrative hooks
 */
export type CharacterMood = 
  | 'smug' 
  | 'scared' 
  | 'heroic' 
  | 'taunt' 
  | 'stoic' 
  | 'desperate' 
  | 'thought'
  | 'defiant'
  | 'confident'
  | 'worried'
  | 'amused'
  | 'furious';

/**
 * @description A narrative hook that can trigger based on battle context
 */
export type NarrativeHook = {
  when: (ctx: BattleContext) => boolean;
  speaker: string | 'Narrator';
  text: (ctx: BattleContext) => string | string[];
  mood?: CharacterMood;
  oncePerBattle?: boolean;
  priority?: number; // Higher priority hooks trigger first
  location?: string; // Optional location restriction
  matchup?: string[]; // Optional character matchup restriction
};

/**
 * @description A triggered narrative hook with resolved text
 */
export type TriggeredNarrative = {
  id: string; // Unique log entry id for debouncing
  speaker: string | 'Narrator';
  text: string;
  mood?: CharacterMood;
  priority: number;
  timestamp: number;
};

/**
 * @description Battle phase detection thresholds
 */
export const BATTLE_PHASE_THRESHOLDS = {
  START_MAX_TURNS: 3, // Extended start phase for better pacing
  END_HEALTH_THRESHOLD: 0.25, // Lower threshold for more dramatic end phase
  END_TURN_THRESHOLD: 10, // Extended mid phase
  END_FINAL_TURNS: 4 // More turns in end phase
} as const;

/**
 * @description Character-specific narrative collections
 */
export type CharacterNarratives = {
  [characterName: string]: NarrativeHook[];
};

/**
 * @description Complete narrative system configuration
 */
export type NarrativeSystemConfig = {
  characterHooks: CharacterNarratives;
  narratorHooks: NarrativeHook[];
  globalHooks: NarrativeHook[];
  enabled: boolean;
  maxHooksPerTurn: number;
  priorityThreshold: number;
}; 