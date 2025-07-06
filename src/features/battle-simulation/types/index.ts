// CONTEXT: BattleSimulation, // FOCUS: Types
import { Character, Location } from '@/common/types';
import { Position, LocationType } from './move.types';

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

/**
 * @description Represents a character's dynamic state during a battle.
 */
export type BattleCharacter = Character & {
  currentHealth: number;
  currentDefense: number;
  cooldowns: Record<string, number>;
  usesLeft: Record<string, number>; // Track remaining uses for limited moves
  lastMove?: string;
  moveHistory: string[];
  resources: {
    chi: number;
  };
  activeEffects: ActiveStatusEffect[]; // Unified status effects system
  flags: {
    usedDesperation?: boolean; // Track if desperation move was used
    usedFinisher?: boolean; // Track if finisher move was used
    desperationState?: string; // JSON string of current desperation state
    lowHealthTurns?: number; // Track consecutive turns at low health
    stalemateTurns?: number; // Track consecutive stalemate turns
    isResting?: boolean; // Track if character is resting/focusing for enhanced regeneration
    stunned?: boolean; // Track if character is stunned
    stunDuration?: number; // Duration of stun effect
    // NEW: Pattern breaking and escalation flags
    forcedEscalation?: string; // 'true' if forced into escalation state
    damageMultiplier?: string; // Damage multiplier as string (e.g., '2.0')
    repositionDisabled?: string; // Turns remaining as string (e.g., '3')
    escalationTurns?: string; // Turns in escalation state as string
  };
  diminishingEffects: Record<string, number>; // Track power reduction from diminishing returns
  
  // NEW: Positioning and tactical state
  position: Position;
  chargeProgress?: number; // 0-100 for charge-up moves
  isCharging: boolean;
  repositionAttempts: number; // Track reposition attempts for diminishing returns
  chargeInterruptions: number; // Track failed charge attempts
  lastPositionChange?: number; // Turn when position last changed
  positionHistory: Position[]; // Track position changes for AI analysis
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
export type LogEventType = 'MOVE' | 'STATUS' | 'KO' | 'TURN' | 'INFO' | 'VICTORY' | 'DRAW' | 'ESCAPE' | 'DESPERATION' | 'NARRATIVE' | 'FINISHER' | 'POSITION' | 'CHARGE' | 'REPOSITION' | 'INTERRUPT' | 'TACTICAL' | 'ESCALATION';

/**
 * @description Battle resolution types for special end conditions.
 */
export type BattleResolution = 'victory' | 'draw' | 'escape' | 'desperation' | 'mutual_ko';

/**
 * @description Enhanced battle log entry with structured data and queryable meta information.
 */
export type BattleLogEntry = {
  id: string; // Unique event identifier
  turn: number;
  actor: string;
  type: LogEventType;
  action: string;
  target?: string;
  result: string;
  narrative?: string;
  damage?: number;
  abilityType?: string;
  timestamp: number;
  meta?: {
    crit?: boolean; // Was this a critical hit?
    critMultiplier?: number; // Damage multiplier for crit
    combo?: number; // Combo counter
    blocked?: boolean; // Was the move blocked?
    evaded?: boolean; // Was the move evaded?
    resourceCost?: number; // Chi cost of the move
    piercing?: boolean; // Did the move pierce defense?
    heal?: boolean; // Was this a healing move?
    interrupt?: boolean; // Did this interrupt an action?
    aiRule?: string; // Which AI rule triggered this move (for explainable AI)
    isFinisher?: boolean; // Was this a finisher move?
    isDesperation?: boolean; // Was this a desperation move?
    desperationBuff?: {
      damageBonus: number;
      defensePenalty: number;
    };
    // NEW: Positioning and tactical meta
    positionChange?: {
      from: Position;
      to: Position;
      success: boolean;
    };
    chargeProgress?: number;
    chargeInterrupted?: boolean;
    environmentalFactor?: string;
    repositionSuccess?: boolean;
    punishDamage?: number;
    [key: string]: unknown; // Extensible for future features
  };
};

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
  tacticalPhase: 'positioning' | 'engagement' | 'climax' | 'stalemate';
  positionAdvantage: number; // -1 to 1, negative means player1 advantage, positive means player2
  // NEW: Real-time analytics tracking
  analytics?: {
    totalDamage: number;
    totalChiSpent: number;
    patternAdaptations: number;
    stalematePreventions: number;
    escalationEvents: number;
    punishOpportunities: number;
    criticalHits: number;
    desperationMoves: number;
    lastUpdated: number;
  };
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