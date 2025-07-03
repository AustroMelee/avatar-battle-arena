// CONTEXT: BattleSimulation, // FOCUS: Types
import { Character, Location } from '@/common/types';

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
};

/**
 * @description Represents the entire state of the battle at any given moment.
 */
export type BattleState = {
  participants: [BattleCharacter, BattleCharacter];
  turn: number;
  activeParticipantIndex: 0 | 1;
  log: string[];
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