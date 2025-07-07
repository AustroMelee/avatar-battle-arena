import type { BattleState } from '../../../types';
import type { BattleCharacter } from '../../../types';
import type { Move } from '../../../types/move.types';

/**
 * @description A condition function that evaluates whether a rule should fire
 * @param state - The current battle state
 * @param self - The AI character making the decision
 * @param opp - The opponent character
 * @returns True if the condition is met
 */
export type GameCondition = (
  state: BattleState, 
  self: BattleCharacter, 
  opp: BattleCharacter
) => boolean;

/**
 * @description A move selector function that chooses which move to use
 * @param state - The current battle state
 * @param self - The AI character making the decision
 * @param opp - The opponent character
 * @returns The chosen move or null if no move is available
 */
export type MoveSelector = (
  state: BattleState, 
  self: BattleCharacter, 
  opp: BattleCharacter
) => Move | null;

/**
 * @description A single AI rule that defines when and what move to use
 */
export interface AIRule {
  /** Human-readable name for debugging and UI */
  name: string;
  
  /** Optional priority (higher = evaluated first). Defaults to 0 */
  priority?: number;
  
  /** Condition that must be true for this rule to fire */
  when: GameCondition;
  
  /** Move selector that chooses the move when condition is met */
  then: MoveSelector;
  
  /** Optional description for debugging */
  description?: string;
}

/**
 * @description Result of AI decision making
 */
export interface AIDecision {
  /** The chosen move */
  move: Move | null;
  
  /** The rule that triggered this decision */
  rule: AIRule;
  
  /** Whether this was a fallback decision */
  isFallback: boolean;
  
  /** Debug information about the decision */
  debug: {
    ruleName: string;
    priority: number;
    conditionMet: boolean;
    availableMoves: number;
    weights?: Array<{move: string, weight: number, description: string}>;
  };
} 