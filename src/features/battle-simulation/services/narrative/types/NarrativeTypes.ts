// CONTEXT: Narrative Types
// RESPONSIBILITY: Shared type definitions for the narrative system

/**
 * @description Core narrative states for battle progression
 */
export type NarrativeState = 
  | 'normal' 
  | 'escalation' 
  | 'desperation' 
  | 'pattern_break' 
  | 'late_game' 
  | 'climax' 
  | 'exhaustion' 
  | 'final_gambit' 
  | 'burnout';

/**
 * @description Emotional state for characters
 */
export interface EmotionalState {
  primary: string;
  intensity: number;
  confidence: number;
  fear: number;
  anger: number;
  determination: number;
}

/**
 * @description Character emotion with timestamp
 */
export interface CharacterEmotion {
  characterName: string;
  emotion: EmotionalState;
  timestamp: number;
}

/**
 * @description Context for narrative generation
 */
export interface NarrativeContext {
  turnNumber: number;
  health: number;
  maxHealth: number;
  chi: number;
  isCritical: boolean;
  damage: number;
  characterState: string;
  isEscalation: boolean;
  isPatternBreak: boolean;
}

/**
 * @description Request for narrative generation
 */
export interface NarrativeRequest {
  characterName: string;
  moveName: string;
  damageOutcome: DamageOutcome;
  context: NarrativeContext;
}

/**
 * @description Damage outcome types for narrative suffixes
 */
export type DamageOutcome = 'miss' | 'glance' | 'hit' | 'devastating' | 'overwhelming';

/**
 * @description Narrative tier for progression-based selection
 */
export type NarrativeTier = 'early' | 'mid' | 'late' | 'exhausted';

/**
 * @description State announcement types
 */
export type StateAnnouncementType = 'breaking_point' | 'escalation' | 'desperation' | 'pattern_break';

/**
 * @description One-off dramatic moment types
 */
export type OneOffMomentType = 
  | 'first_blood'
  | 'critical_hit'
  | 'desperation_trigger'
  | 'escalation_trigger'
  | 'pattern_break'
  | 'final_gambit'
  | 'victory_moment'
  | 'defeat_moment';

/**
 * @description Context for one-off dramatic moments
 */
export interface OneOffMomentContext {
  turnNumber: number;
  health: number;
  maxHealth: number;
  chi: number;
  isCritical: boolean;
  damage: number;
  isLastChi?: boolean;
  isLastMove?: boolean;
  isDesperation?: boolean;
  isEscalation?: boolean;
  isPatternBreak?: boolean;
}

/**
 * @description Recent usage tracking for anti-repetition
 */
export interface RecentUsageTracker {
  [characterName: string]: {
    [narrativeType: string]: {
      recentLines: string[];
      maxRecent: number;
      lastResetTurn: number;
    };
  };
}

/**
 * @description One-off moment tracking
 */
export interface OneOffTracker {
  [characterName: string]: {
    [momentType: string]: {
      used: boolean;
      turnUsed?: number;
      context?: string;
    };
  };
}

/**
 * @description Entry for narrative memory (key past events)
 */
export interface NarrativeMemoryEntry {
  type: 'dodge' | 'critical_hit' | 'reversal' | 'one_off_moment' | 'finisher' | 'defeat' | 'victory' | string;
  turn: number;
  actor: string;
  target?: string;
  move?: string;
  context?: Record<string, any>;
} 