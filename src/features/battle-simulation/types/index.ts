// CONTEXT: BattleSimulation, // FOCUS: Types
import { Character, Location } from '@/common/types';

/**
 * @description Represents a positive status effect on a character.
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
  lastMove?: string;
  moveHistory: string[];
  resources: {
    chi: number;
  };
  activeBuffs: Buff[];
  activeDebuffs: Debuff[];
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
    activeBuffs: Buff[];
    activeDebuffs: Debuff[];
    resources: {
      chi: number;
    };
  };
  enemy: {
    health: number;
    defense: number;
    personality: string;
    name: string;
    lastMove?: string;
    moveHistory: string[];
    activeBuffs: Buff[];
    activeDebuffs: Debuff[];
  };
  round: number;
  cooldowns: Record<string, number>; // Legacy field - can be removed after migration
};

/**
 * @description Represents an AI's considered action with scoring.
 */
export type ConsideredAction = {
  move: string;
  score: number;
  reason: string;
  abilityId: string;
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
};

/**
 * @description Enhanced battle log entry with structured data.
 */
export type BattleLogEntry = {
  turn: number;
  actor: string;
  action: string;
  target?: string;
  result: string;
  narrative?: string;
  damage?: number;
  abilityType?: string;
  timestamp: number;
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