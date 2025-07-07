// CONTEXT: BattleSimulation, // FOCUS: CooldownTypes
import type { Move } from './move.types';

/**
 * @description Represents the cooldown state for a single ability.
 */
export type AbilityCooldownState = {
  /** @description The turn number when this ability was last used (-1 if never used). */
  lastUsedTurn: number;
  /** @description Number of uses remaining for this battle (undefined if unlimited). */
  usesRemaining: number | undefined;
  /** @description Whether this ability is currently on cooldown. */
  isOnCooldown: boolean;
  /** @description Number of turns remaining on cooldown (0 if not on cooldown). */
  cooldownTurnsRemaining: number;
};

/**
 * @description Complete cooldown state for a character's abilities.
 */
export type CharacterCooldownState = {
  /** @description Map of ability name to cooldown state. */
  abilityStates: Record<string, AbilityCooldownState>;
  /** @description Current turn number for cooldown calculations. */
  currentTurn: number;
};

/**
 * @description Parameters for initializing cooldown state.
 */
export type InitializeCooldownParams = {
  /** @description List of moves to track cooldowns for. */
  moves: Move[];
  /** @description Starting turn number (usually 0). */
  startingTurn: number;
};

/**
 * @description Parameters for checking if an ability is available.
 */
export type CheckAbilityAvailabilityParams = {
  /** @description The move to check. */
  move: Move;
  /** @description Current cooldown state for this ability. */
  cooldownState: AbilityCooldownState;
  /** @description Current turn number. */
  currentTurn: number;
  /** @description Current chi available to the character. */
  availableChi: number;
  /** @description Current battle phase (optional, defaults to 'normal'). */
  battlePhase?: BattlePhase;
};

/**
 * @description Result of checking ability availability.
 */
export type AbilityAvailabilityResult = {
  /** @description Whether the ability can be used. */
  isAvailable: boolean;
  /** @description Reason why the ability is unavailable (if applicable). */
  reason?: 'insufficient_chi' | 'on_cooldown' | 'no_uses_remaining' | 'unlock_condition_not_met' | 'battle_phase_restriction';
  /** @description Number of turns remaining on cooldown. */
  cooldownTurnsRemaining: number;
  /** @description Number of uses remaining. */
  usesRemaining: number | undefined;
  /** @description Whether this is a desperation move that requires low health. */
  isDesperationMove: boolean;
  /** @description Health threshold required for desperation moves. */
  requiredHealthThreshold?: number;
};

/**
 * @description Parameters for using an ability and updating cooldown state.
 */
export type UseAbilityParams = {
  /** @description The move being used. */
  move: Move;
  /** @description Current turn number. */
  currentTurn: number;
  /** @description Current character health percentage. */
  currentHealthPercentage: number;
};

/**
 * @description Parameters for resetting cooldown state (e.g., for new battles).
 */
export type ResetCooldownsParams = {
  /** @description List of moves to reset. */
  moves: Move[];
  /** @description New starting turn number. */
  startingTurn: number;
};

/**
 * @description Special battle states that restrict available abilities.
 */
export type BattlePhase = 'normal' | 'stalemate' | 'climax' | 'desperation';

/**
 * @description UI-specific types for displaying cooldown information.
 */
export type CooldownDisplayInfo = {
  /** @description Whether the ability button should be disabled. */
  isDisabled: boolean;
  /** @description CSS class for the ability button. */
  buttonClass: string;
  /** @description Text to display for cooldown status. */
  cooldownText?: string;
  /** @description Text to display for uses remaining. */
  usesText?: string;
  /** @description Tooltip text explaining why ability is unavailable. */
  tooltipText?: string;
  /** @description Whether to show a cooldown indicator. */
  showCooldownIndicator: boolean;
  /** @description Progress percentage for cooldown visualization (0-100). */
  cooldownProgress: number;
}; 