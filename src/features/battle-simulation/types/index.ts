// @docs
// @description: Barrel export for all battle-simulation types. All types are designed for registry/data-driven, plug-and-play extensibility. No hard-coded content. SRP-compliant. See SYSTEM ARCHITECTURE.MD for integration points.
// @criticality: 💎 Types
// @owner: AustroMelee
// @tags: types, state, SRP, registry, plug-and-play, extensibility
//
// All type boundaries are enforced: static data uses IDs, runtime state hydrates objects via registries.
//
// Updated for 2025 registry-driven architecture overhaul.
import { Character, Location } from '@/common/types';
import { Position, LocationType } from './move.types';
import { MentalState, OpponentPerception } from './identity.types';
import { BehavioralTraitInstance, ActiveFlag } from './behavioral.types';
import type { Move } from './move.types';

/** @description The narrative phases of a battle. */
export enum BattleArcState {
  Opening = 'Opening',
  RisingAction = 'RisingAction',
  Climax = 'Climax',
  FallingAction = 'FallingAction',
  Resolution = 'Resolution',
  Twilight = 'Twilight', // For rare, dramatic edge cases like a double KO
}

/** @description Global modifiers applied during a specific arc state. */
export interface ArcStateModifier {
  damageBonus: number;
  defenseBonus: number;
  chiRegenBonus: number;
  statusEffectDurationModifier: number; // e.g., 0.5 to halve durations
  aiRiskFactor: number; // 1.0 is normal, 1.5 makes AI 50% more aggressive
  unlocksFinishers: boolean;
}

/** @description A transition rule between battle arc states. */
export interface ArcTransition {
  from: BattleArcState;
  to: BattleArcState;
  priority: number; // Higher priority transitions are checked first
  condition: (state: BattleState) => boolean;
  narrative: string; // Description of the transition for battle logs
}

/** @description The specific defensive stance a character is currently in. */
export type DefensiveStance = 'none' | 'evading' | 'parrying';

/** @description The result of a clash between an attack and a defensive maneuver. */
export type ClashResult = {
  outcome: 'full_hit' | 'evaded' | 'parried';
  damageDealt: number;
  narrative: string;
};

/** @description The category of the status effect. */
export type EffectCategory = 'buff' | 'debuff';

/** @description The specific type of the status effect, dictating its mechanical function. */
export type EffectType =
  // Buffs
  | 'DEFENSE_UP' // Increases defense stat
  | 'ATTACK_UP'  // Increases power stat
  | 'CRIT_CHANCE_UP' // Increases critical hit chance
  | 'HEAL_OVER_TIME' // Regenerates health each turn
  // Debuffs
  | 'BURN' // Deals damage over time
  | 'STUN' // Skips the target's next turn
  | 'DEFENSE_DOWN' // Reduces defense stat
  | 'SLOW'; // Reduces agility/speed

/** @description Represents an active status effect on a character. */
export interface ActiveStatusEffect {
  id: string; // Unique instance ID, e.g., "burn_azula_167..."
  name: string; // Display name, e.g., "Searing Burn"
  type: EffectType;
  category: EffectCategory;
  duration: number; // How many turns it lasts
  potency: number; // e.g., Damage per turn for BURN, or % increase for BUFF
  sourceAbility: string; // The name of the ability that applied it
  turnApplied: number; // NEW: Track when the effect was applied
}

/**
 * @description Represents a positive status effect on a character.
 * @deprecated Use ActiveStatusEffect instead
 */
export type Buff = {
  id: string;
  name: string;
  duration: number;
  potency?: number;
  description: string;
  source: string; // Which ability created this buff
};

/**
 * @description Represents a negative status effect on a character.
 * @deprecated Use ActiveStatusEffect instead
 */
export type Debuff = {
  id: string;
  name: string;
  duration: number;
  potency?: number;
  description: string;
  source: string; // Which ability created this debuff
};

/**
 * @description The input parameters for the battle simulation service.
 */
export type SimulateBattleParams = {
  player1: Character;
  player2: Character;
  location: Location;
};

// Disruption-based control state for narrative-first battle system
export type ControlState =
  | 'Dominating'
  | 'Advantaged'
  | 'Neutral'
  | 'Pressured'
  | 'Compromised'
  | 'Defeated';

// Recovery option for future extensibility
export interface RecoveryOption {
  id: string;
  name: string;
  description: string;
  // ...future fields
}

/**
 * @description Represents a character's dynamic state during a battle.
 */
export type BattleCharacter = {
  /**
   * @description The static character data (abilities: string[])
   */
  base: Character; // static data
  id: string;
  name: string;
  controlState: ControlState;
  stability: number; // 0-100
  momentum: number; // -100 to +100
  recoveryOptions: RecoveryOption[];
  currentHealth: number;
  currentDefense: number;
  cooldowns: Record<string, number>;
  usesLeft: Record<string, number>; // Track remaining uses for limited moves
  lastMove?: string;
  moveHistory: string[];
  /**
   * @description List of move IDs that are restricted due to repetition penalties (pattern breaking).
   */
  restrictedMoves: string[];
  /**
   * @description List of currently pattern-banned moves with remaining ban duration.
   */
  patternBans?: { moveId: string, turnsLeft: number }[];
  resources: {
    chi: number;
  };
  activeEffects: ActiveStatusEffect[]; // Unified status effects system
  flags: BattleCharacterFlags;
  diminishingEffects: Record<string, number>; // Track power reduction from diminishing returns
  defensiveStance: DefensiveStance; // The character's current defensive state for UI/VFX
  activeDefense?: {
    type: 'evade' | 'parry_retaliate';
    sourceAbility: string;
    evadeChance?: number;
    parryThreshold?: number;
  };
  position: Position;
  chargeProgress?: number; // 0-100 for charge-up moves
  isCharging: boolean;
  repositionAttempts: number; // Track reposition attempts for diminishing returns
  chargeInterruptions: number; // Track failed charge attempts
  lastPositionChange?: number; // Turn when position last changed
  positionHistory: Position[]; // Track position changes for AI analysis
  mentalState: MentalState;
  opponentPerception: OpponentPerception;
  mentalThresholdsCrossed: {
    unhinged?: boolean;
    broken?: boolean;
  };
  behavioralTraits: BehavioralTraitInstance[];
  manipulationResilience: number;
  activeFlags: Map<string, ActiveFlag>;
  analytics: BattleAnalytics;
  tacticalStalemateCounter: number;
  lastTacticalPriority: string;
  /**
   * @description The hydrated Move objects for this character (runtime only).
   * Always hydrate from base.abilities (string[]) using MoveRegistry.getMovesByIds().
   */
  abilities: Move[];
  /**
   * @description Intent/status flags for tactical and AI logic (e.g., Evasive, Charging, etc.)
   */
  statusFlags?: Array<{ type: string; turns: number }>;
  // --- NEW: Climax Trigger Flag ---
  climaxTriggered?: boolean;
  // --- NEW: Narrative/UX Polish ---
  noMoveTurns?: number; // Track consecutive no-move turns for Sudden Death logic
  suddenDeathTriggered?: boolean; // Flag for Sudden Death event
  status?: string;
  pendingReleaseMoveId?: string;
};

/**
 * @description Represents the perceived state for AI decision making.
 */
export type PerceivedState = {
  self: {
    health: number;
    defense: number;
    personality: string;
    abilities: Array<{ id: string; name: string; type: string; power: number; cooldown?: number }>;
    cooldowns: Record<string, number>;
    lastMove?: string;
    moveHistory: string[];
    activeEffects: ActiveStatusEffect[];
    resources: {
      chi: number;
    };
    // NEW: Positioning context for AI
    position: Position;
    isCharging: boolean;
    chargeProgress?: number;
    repositionAttempts: number;
  };
  enemy: {
    health: number;
    defense: number
    personality: string;
    name: string;
    lastMove?: string;
    moveHistory: string[];
    activeEffects: ActiveStatusEffect[];
    // NEW: Enemy positioning context
    position: Position;
    isCharging: boolean;
    chargeProgress?: number;
    repositionAttempts: number;
  };
  round: number;
  cooldowns: Record<string, number>; // Legacy field - can be removed after migration
  // NEW: Environmental context
  location: string;
  locationType: LocationType;
};

/**
 * @description Represents an AI's considered action with scoring.
 */
export type ConsideredAction = {
  move: string;
  score: number;
  reason: string;
  abilityId: string;
  // NEW: Tactical reasoning
  tacticalReason?: string;
  positionAdvantage?: boolean;
  chargeOpportunity?: boolean;
  punishOpportunity?: boolean;
};

/**
 * @description AI decision log entry for introspective analysis.
 */
export type AILogEntry = {
  turn: number;
  agent: string;
  perceivedState: PerceivedState;
  consideredActions: ConsideredAction[];
  chosenAction: string;
  reasoning: string;
  narrative?: string;
  timestamp: number;
  // NEW: Tactical analysis
  tacticalAnalysis?: {
    positionAdvantage: boolean;
    chargeOpportunity: boolean;
    punishOpportunity: boolean;
    environmentalFactor: string;
  };
};

/**
 * @description Event types for structured battle logging.
 */
export type LogEntryType = 'dialogue' | 'mechanics' | 'narrative' | 'system';

/**
 * @description Battle resolution types for special end conditions.
 */
export type BattleResolution = 'victory' | 'draw' | 'escape' | 'desperation' | 'mutual_ko';

/**
 * @description NEW: Structured object for mechanical log details.
 */
export interface LogDetails {
  mechanic?: string;
  reason?: string;
  chi?: number;
  moveType?: string;
  chargeComplete?: number;
  interrupted?: boolean;
  tacticalAnalysis?: string;
  escalationType?: EscalationType;
  forcedState?: 'pattern_break' | 'climax';
  damageLevel?: number;
  controlShift?: number;
  stabilityChange?: number;
  newControlState?: string;
  fatigueMultiplier?: number;
  desperationLevel?: 'desperate' | 'extreme' | 'final';
  resolution?: string;
  winner?: string;
  [key: string]: unknown; // Allows other meta fields
}

export type FighterName = string;
/** Unique brand guaranteeing a non-empty (trimmed) string */
export type NonEmptyString<T extends string = string> = T & { readonly __brand: 'NonEmptyString' };

export { ensureNonEmpty } from '../services/utils/strings';

export type DialogueLogEntry = {
  id: string;
  turn: number;
  actor: FighterName;
  type: 'dialogue';
  action: string;
  target?: string;
  result: NonEmptyString;
  narrative: NonEmptyString | NonEmptyString[];
  timestamp: number;
  details?: LogDetails;
  damage?: number;
  meta?: Record<string, unknown>;
  abilityType?: string;
  prologue?: boolean;
};

export type NonDialogueLogEntry = {
  id: string;
  turn: number;
  actor?: 'System' | 'Narrator';
  type: Exclude<LogEntryType, 'dialogue'>;
  action: string;
  target?: string;
  result: NonEmptyString;
  narrative: NonEmptyString | NonEmptyString[];
  timestamp: number;
  details?: LogDetails;
  damage?: number;
  meta?: Record<string, unknown>;
  abilityType?: string;
  prologue?: boolean;
};

export type BattleLogEntry = DialogueLogEntry | NonDialogueLogEntry;

/**
 * @description Log detail level for user preferences.
 */
export type LogDetailLevel = 'narrative' | 'battle' | 'ai' | 'all';

/**
 * @description The entire state of the battle at any given moment.
 */
export type BattleState = {
  participants: [BattleCharacter, BattleCharacter];
  turn: number;
  activeParticipantIndex: 0 | 1;
  log: string[];
  battleLog: BattleLogEntry[];
  aiLog: AILogEntry[];
  isFinished: boolean;
  winner: BattleCharacter | null;
  location?: string; // Battle location for narrative context
  // NEW: Environmental and tactical context
  locationType: LocationType;
  environmentalFactors: string[]; // e.g., ["Desert", "No Repositioning"]
  tacticalPhase: TacticalPhase;
  positionAdvantage: number; // -1 to 1, negative means player1 advantage, positive means player2
  // NEW: Dynamic Escalation Timeline
  arcState: BattleArcState;
  arcStateHistory: BattleArcState[]; // Tracks the progression to prevent reversion
  // NEW: Real-time analytics tracking
  analytics: BattleAnalytics;
  // --- NEW: Tactical Stalemate Tracking ---
  tacticalStalemateCounter: number;
  lastTacticalPriority: string;
  // --- NEW: Climax Trigger Flag ---
  climaxTriggered?: boolean;
  // --- NEW: Narrative/UX Polish ---
  noMoveTurns?: number; // Track consecutive no-move turns for Sudden Death logic
  suddenDeathTriggered?: boolean; // Flag for Sudden Death event
  // --- NEW: Forced Ending Flag for Deadlock Breaker ---
  forcedEnding?: boolean;
};

/**
 * @description The structured result returned by the battle simulation service.
 */
export type BattleResult = {
  winner: Character;
  humanLog: string[];
  technicalLog: string[];
  aiLog: AILogEntry[];
  battleLog: BattleLogEntry[];
};

/**
 * @description Props for the horizontal player card component in the versus UI.
 */
export type PlayerCardHorizontalProps = {
  character: BattleCharacter;
  isActive: boolean;
  playerColor: string;
  onChange?: () => void;
};

// Re-export cooldown types for convenience
export type {
  AbilityCooldownState,
  CharacterCooldownState,
  InitializeCooldownParams,
  CheckAbilityAvailabilityParams,
  AbilityAvailabilityResult,
  UseAbilityParams,
  ResetCooldownsParams,
  CooldownDisplayInfo
} from './cooldown.types';

/**
 * Flags for special battle mechanics (extensible for new systems)
 */
export interface BattleCharacterFlags {
  usedDesperation?: boolean;
  usedFinisher?: boolean;
  desperationState?: string;
  lowHealthTurns?: number;
  stalemateTurns?: number;
  forcedEscalation?: string;
  damageMultiplier?: string;
  repositionDisabled?: string;
  escalationTurns?: string; // String: turn number when escalation was triggered
  escalationDuration?: string;
  isCountering?: boolean;
  disruptionWindowActive?: boolean;
  disruptionWindowCooldown?: number;
  disruptionWindowOpenedTurn?: number;
  heroicReversalUsed?: boolean;
  heroicReversalActive?: boolean;
  heroicReversalBuff?: number;
  stuckMoveCounter?: number;
  // --- NEW: Final Phase Flags ---
  suddenDeath?: boolean;
  escalationCycleCount?: number;
  /**
   * @description Number of turns remaining in forced escalation (stateful escalation duration)
   */
  forcedEscalationTurns?: number;
  /**
   * @description True if this character has triggered escalation in this battle
   */
  usedEscalation?: boolean;
  /**
   * @description Number of turns remaining stunned (for stun effects)
   */
  stunDuration?: number;
}

// Add EscalationType and TacticalPhase at the top, before their usage
export type EscalationType =
  | 'damage'
  | 'repetition'
  | 'stalemate'
  | 'reposition'
  | 'desperation';

export type TacticalPhase =
  | 'positioning'
  | 'engagement'
  | 'climax'
  | 'stalemate'
  | 'escalation'
  | 'desperation';

// --- Analytics type for both BattleCharacter and BattleState ---
export type BattleAnalytics = {
  totalDamage: number;
  totalChiSpent: number;
  turnsSinceLastDamage: number;
  averageDamagePerTurn: number;
  lastUpdatedTurn: number;
  patternAdaptations: number;
  stalematePreventions: number;
  escalationEvents: number;
  punishOpportunities: number;
  criticalHits: number;
  desperationMoves: number;
  lastUpdated: number;
  stalematePreventionTriggered?: boolean;
}; 