// CONTEXT: Narrative System, // FOCUS: Type Definitions
import type { BattleCharacter, BattleLogEntry } from '../../types';
import type { Ability } from '@/common/types';

/**
 * @description Mechanical states that drive narrative generation
 */
export type MechanicalState = {
  // Escalation states
  forcedEscalation: boolean;
  escalationType?: 'damage' | 'repetition' | 'stalemate' | 'reposition';
  escalationMultiplier: number;
  
  // Vulnerability and punishment
  isVulnerable: boolean;
  vulnerabilityType?: 'charging' | 'repositioning' | 'stunned';
  punishMultiplier: number;
  punishDamage: number;
  
  // Pattern and repetition
  moveRepetition: number;
  patternAdaptations: number;
  repositionAttempts: number;
  isRepetitive: boolean;
  
  // Position and charging
  position: string;
  isCharging: boolean;
  chargeProgress: number;
  positionChanged: boolean;
  
  // Damage and performance
  damageDealt: number;
  damageMultiplier: number;
  isLowDamage: boolean;
  isHighDamage: boolean;
  
  // Battle flow
  turnsWithoutDamage: number;
  averageDamagePerTurn: number;
  isStalemate: boolean;
  
  // Character-specific mechanics
  isDesperation: boolean;
  isLastUse: boolean;
  isRally: boolean;
  isComeback: boolean;
};

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
  
  // Enhanced mechanical context
  mechanics: MechanicalState;
  
  // Narrative-specific context
  narrativeTone: 'desperate' | 'confident' | 'furious' | 'calculated' | 'chaotic' | 'defensive' | 'aggressive';
  narrativeIntensity: 'low' | 'medium' | 'high' | 'extreme';
  narrativeFocus: 'damage' | 'position' | 'pattern' | 'vulnerability' | 'escalation' | 'recovery';
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
  useTemplateSystem?: boolean; // Enable new template system
};

/**
 * @description Damage outcome categories for narrative mapping
 */
export type DamageOutcome = 'miss' | 'glance' | 'hit' | 'devastating' | 'overwhelming';

/**
 * @description Narrative mechanic categories for anti-repetition tracking
 */
export type NarrativeMechanic = 
  | 'pattern_break'
  | 'forced_escalation' 
  | 'vulnerability_punish'
  | 'position_change'
  | 'desperation_unlock'
  | 'climax'
  | 'finisher'
  | 'miss'
  | 'glance'
  | 'hit'
  | 'devastating';

/**
 * @description Tracks recent narratives to prevent repetition
 */
export type RecentNarrativeTracker = {
  [mechanic in NarrativeMechanic]?: {
    [characterName: string]: {
      lastUsed: number; // turn number
      lineText: string;
    }[];
  };
};

/**
 * @description Damage thresholds for narrative outcome mapping
 */
export const DAMAGE_OUTCOME_THRESHOLDS = {
  MISS: 0,
  GLANCE: 5,
  HIT: 15,
  DEVASTATING: 30,
  OVERWHELMING: 50
} as const;

/**
 * @description Anti-repetition configuration
 */
export const ANTI_REPETITION_CONFIG = {
  MIN_TURNS_BETWEEN_REPEATS: 3,
  MAX_RECENT_LINES_PER_MECHANIC: 5,
  RESET_BUFFER_AFTER_TURNS: 10
} as const; 