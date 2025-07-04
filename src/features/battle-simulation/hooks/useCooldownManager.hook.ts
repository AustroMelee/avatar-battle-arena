// CONTEXT: BattleSimulation, // FOCUS: CooldownHook
import { useState, useCallback, useMemo } from 'react';
import type { Ability } from '@/common/types';
import type {
  CharacterCooldownState,
  AbilityCooldownState,
  AbilityAvailabilityResult,
  CooldownDisplayInfo,
  BattlePhase
} from '../types/cooldown.types';
import {
  initializeCooldownState,
  checkAbilityAvailability,
  updateAbilityCooldownState,
  advanceCooldownTurn,
  resetCooldowns,
  getAbilityCooldownState,
  validateCooldownState
} from '../services/cooldown/cooldownManager.service';

/**
 * @description Parameters for initializing the cooldown manager hook.
 */
export type UseCooldownManagerParams = {
  /** @description List of abilities to track cooldowns for. */
  abilities: Ability[];
  /** @description Starting turn number (usually 0). */
  startingTurn?: number;
  /** @description Current chi available to the character. */
  availableChi: number;
  /** @description Current health percentage of the character. */
  currentHealthPercentage: number;
  /** @description Current battle phase (optional, defaults to 'normal'). */
  battlePhase?: BattlePhase;
};

/**
 * @description Return type for the cooldown manager hook.
 */
export type UseCooldownManagerReturn = {
  /** @description Current cooldown state. */
  cooldownState: CharacterCooldownState;
  /** @description Check if an ability is available for use. */
  isAbilityAvailable: (ability: Ability) => AbilityAvailabilityResult;
  /** @description Use an ability and update cooldown state. */
  useAbility: (ability: Ability) => void;
  /** @description Advance to the next turn. */
  advanceTurn: () => void;
  /** @description Reset all cooldowns for a new battle. */
  resetCooldowns: (newStartingTurn?: number) => void;
  /** @description Get display information for an ability. */
  getDisplayInfo: (ability: Ability) => CooldownDisplayInfo;
  /** @description Get cooldown state for a specific ability. */
  getAbilityCooldownState: (abilityName: string) => AbilityCooldownState | null;
  /** @description Current turn number. */
  currentTurn: number;
  /** @description Validate the current cooldown state. */
  validateState: () => boolean;
};

/**
 * @description React hook for managing ability cooldowns in battle.
 * Provides comprehensive cooldown management with strict TypeScript typing.
 * @param {UseCooldownManagerParams} params - Parameters for initializing the hook.
 * @returns {UseCooldownManagerReturn} Cooldown management functions and state.
 * @throws {TypeError} When parameters are invalid.
 */
export function useCooldownManager(params: UseCooldownManagerParams): UseCooldownManagerReturn {
  const { abilities, startingTurn = 0, availableChi, currentHealthPercentage, battlePhase = 'normal' } = params;

  // Validate input parameters
  if (!Array.isArray(abilities) || abilities.length === 0) {
    throw new TypeError('Abilities array must be non-empty');
  }

  if (typeof startingTurn !== 'number' || startingTurn < 0) {
    throw new TypeError('Starting turn must be a non-negative number');
  }

  if (typeof availableChi !== 'number' || availableChi < 0) {
    throw new TypeError('Available chi must be a non-negative number');
  }

  if (typeof currentHealthPercentage !== 'number' || currentHealthPercentage < 0 || currentHealthPercentage > 100) {
    throw new TypeError('Current health percentage must be between 0 and 100');
  }

  // Initialize cooldown state
  const [cooldownState, setCooldownState] = useState<CharacterCooldownState>(() => 
    initializeCooldownState({ abilities, startingTurn })
  );

  // Memoized current turn for performance
  const currentTurn = useMemo(() => cooldownState.currentTurn, [cooldownState.currentTurn]);

  /**
   * @description Check if an ability is available for use.
   * @param {Ability} ability - The ability to check.
   * @returns {AbilityAvailabilityResult} Detailed availability information.
   */
  const isAbilityAvailable = useCallback((ability: Ability): AbilityAvailabilityResult => {
    const abilityState = getAbilityCooldownState(cooldownState, ability.name);
    
    if (!abilityState) {
      throw new TypeError(`Ability ${ability.name} not found in cooldown state`);
    }

    return checkAbilityAvailability({
      ability,
      cooldownState: abilityState,
      currentTurn: cooldownState.currentTurn,
      availableChi,
      battlePhase
    });
  }, [cooldownState, availableChi, battlePhase]);

  /**
   * @description Use an ability and update cooldown state.
   * @param {Ability} ability - The ability to use.
   */
  const useAbilityCallback = useCallback((ability: Ability): void => {
    const abilityState = getAbilityCooldownState(cooldownState, ability.name);
    
    if (!abilityState) {
      throw new TypeError(`Ability ${ability.name} not found in cooldown state`);
    }

    const updatedAbilityState = updateAbilityCooldownState(
      {
        ability,
        currentTurn: cooldownState.currentTurn,
        currentHealthPercentage
      },
      abilityState
    );

    setCooldownState(prevState => ({
      ...prevState,
      abilityStates: {
        ...prevState.abilityStates,
        [ability.name]: updatedAbilityState
      }
    }));
  }, [cooldownState, currentHealthPercentage]);

  /**
   * @description Advance to the next turn.
   */
  const advanceTurn = useCallback((): void => {
    setCooldownState(prevState => advanceCooldownTurn(prevState, abilities));
  }, [abilities]);

  /**
   * @description Reset all cooldowns for a new battle.
   * @param {number} newStartingTurn - New starting turn number (optional).
   */
  const resetCooldownsCallback = useCallback((newStartingTurn?: number): void => {
    const turn = newStartingTurn ?? 0;
    
    if (typeof turn !== 'number' || turn < 0) {
      throw new TypeError('New starting turn must be a non-negative number');
    }

    setCooldownState(() => 
      resetCooldowns({ abilities, startingTurn: turn })
    );
  }, [abilities]);

  /**
   * @description Get cooldown state for a specific ability.
   * @param {string} abilityName - Name of the ability.
   * @returns {AbilityCooldownState | null} The cooldown state or null if not found.
   */
  const getAbilityCooldownStateCallback = useCallback((abilityName: string): AbilityCooldownState | null => {
    return getAbilityCooldownState(cooldownState, abilityName);
  }, [cooldownState]);

  /**
   * @description Get display information for an ability.
   * @param {Ability} ability - The ability to get display info for.
   * @returns {CooldownDisplayInfo} Display information for the ability.
   */
  const getDisplayInfo = useCallback((ability: Ability): CooldownDisplayInfo => {
    const availability = isAbilityAvailable(ability);
    const abilityState = getAbilityCooldownState(cooldownState, ability.name);
    
    if (!abilityState) {
      throw new TypeError(`Ability ${ability.name} not found in cooldown state`);
    }

    const isDisabled = !availability.isAvailable;
    const cooldownTurns = availability.cooldownTurnsRemaining;
    const usesRemaining = availability.usesRemaining;
    const chiCost = ability.chiCost ?? 0;

    // Determine button class based on availability
    let buttonClass = 'ability-button';
    if (isDisabled) {
      buttonClass += ' ability-disabled';
      if (availability.reason === 'on_cooldown') {
        buttonClass += ' ability-cooldown';
      } else if (availability.reason === 'insufficient_chi') {
        buttonClass += ' ability-no-chi';
      } else if (availability.reason === 'no_uses_remaining') {
        buttonClass += ' ability-no-uses';
      }
    } else {
      buttonClass += ' ability-available';
      if (availability.isDesperationMove) {
        buttonClass += ' ability-desperation';
      }
    }

    // Generate cooldown text
    let cooldownText: string | undefined;
    if (cooldownTurns > 0) {
      cooldownText = `${cooldownTurns} turn${cooldownTurns > 1 ? 's' : ''}`;
    }

    // Generate uses text
    let usesText: string | undefined;
    if (usesRemaining !== undefined) {
      usesText = `${usesRemaining} left`;
    }

    // Generate tooltip text
    let tooltipText: string | undefined;
    if (isDisabled) {
      switch (availability.reason) {
        case 'insufficient_chi':
          tooltipText = `Requires ${chiCost} chi (${availableChi} available)`;
          break;
        case 'on_cooldown':
          tooltipText = `On cooldown for ${cooldownTurns} more turn${cooldownTurns > 1 ? 's' : ''}`;
          break;
        case 'no_uses_remaining':
          tooltipText = 'No uses remaining this battle';
          break;
        case 'unlock_condition_not_met':
          tooltipText = `Requires health below ${availability.requiredHealthThreshold}%`;
          break;
        case 'battle_phase_restriction':
          tooltipText = `Not available in current battle phase`;
          break;
      }
    } else {
      tooltipText = `${ability.description} (${chiCost} chi)`;
    }

    // Calculate cooldown progress for visualization
    const maxCooldown = ability.cooldown ?? 0;
    const cooldownProgress = maxCooldown > 0 
      ? Math.max(0, Math.min(100, ((maxCooldown - cooldownTurns) / maxCooldown) * 100))
      : 100;

    return {
      isDisabled,
      buttonClass,
      cooldownText,
      usesText,
      tooltipText,
      showCooldownIndicator: cooldownTurns > 0,
      cooldownProgress
    };
  }, [cooldownState, availableChi, isAbilityAvailable]);

  /**
   * @description Validate the current cooldown state.
   * @returns {boolean} True if the state is valid.
   */
  const validateState = useCallback((): boolean => {
    try {
      return validateCooldownState(cooldownState);
    } catch (error) {
      console.error('Cooldown state validation failed:', error);
      return false;
    }
  }, [cooldownState]);

  return {
    cooldownState,
    isAbilityAvailable,
    useAbility: useAbilityCallback,
    advanceTurn,
    resetCooldowns: resetCooldownsCallback,
    getDisplayInfo,
    getAbilityCooldownState: getAbilityCooldownStateCallback,
    currentTurn,
    validateState
  };
} 