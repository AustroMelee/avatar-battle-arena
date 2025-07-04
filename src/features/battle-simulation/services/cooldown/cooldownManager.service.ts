// CONTEXT: BattleSimulation, // FOCUS: CooldownManagement
import type { Ability } from '@/common/types';
import type {
  AbilityCooldownState,
  CharacterCooldownState,
  InitializeCooldownParams,
  CheckAbilityAvailabilityParams,
  AbilityAvailabilityResult,
  UseAbilityParams,
  ResetCooldownsParams
} from '../../types/cooldown.types';

/**
 * @description Maximum number of turns for any cooldown to prevent infinite cooldowns.
 */
const MAX_COOLDOWN_TURNS = 50;

/**
 * @description Maximum number of uses for any ability to prevent infinite uses.
 */
const MAX_USES_PER_BATTLE = 10;

/**
 * @description Initializes cooldown state for a character's abilities.
 * @param {InitializeCooldownParams} params - Parameters for initialization.
 * @returns {CharacterCooldownState} The initialized cooldown state.
 * @throws {TypeError} When abilities array is empty or startingTurn is negative.
 */
export function initializeCooldownState(params: InitializeCooldownParams): CharacterCooldownState {
  const { abilities, startingTurn } = params;

  if (!Array.isArray(abilities) || abilities.length === 0) {
    throw new TypeError('Abilities array must be non-empty');
  }

  if (typeof startingTurn !== 'number' || startingTurn < 0) {
    throw new TypeError('Starting turn must be a non-negative number');
  }

  const abilityStates: Record<string, AbilityCooldownState> = {};

  for (const ability of abilities) {
    if (!ability.name || typeof ability.name !== 'string') {
      throw new TypeError(`Invalid ability name: ${ability.name}`);
    }

    const cooldown = ability.cooldown ?? 0;
    const maxUses = ability.maxUses;

    if (cooldown < 0 || cooldown > MAX_COOLDOWN_TURNS) {
      throw new TypeError(`Invalid cooldown value: ${cooldown}. Must be between 0 and ${MAX_COOLDOWN_TURNS}`);
    }

    if (maxUses !== undefined && (maxUses < 1 || maxUses > MAX_USES_PER_BATTLE)) {
      throw new TypeError(`Invalid maxUses value: ${maxUses}. Must be between 1 and ${MAX_USES_PER_BATTLE}`);
    }

    abilityStates[ability.name] = {
      lastUsedTurn: -1,
      usesRemaining: maxUses,
      isOnCooldown: false,
      cooldownTurnsRemaining: 0
    };
  }

  return {
    abilityStates,
    currentTurn: startingTurn
  };
}

/**
 * @description Checks if an ability is available for use.
 * @param {CheckAbilityAvailabilityParams} params - Parameters for availability check.
 * @returns {AbilityAvailabilityResult} Detailed availability information.
 * @throws {TypeError} When parameters are invalid.
 */
export function checkAbilityAvailability(params: CheckAbilityAvailabilityParams): AbilityAvailabilityResult {
  const { ability, cooldownState, currentTurn, availableChi, battlePhase = 'normal' } = params;

  if (!ability || typeof ability.name !== 'string') {
    throw new TypeError('Invalid ability provided');
  }

  if (typeof currentTurn !== 'number' || currentTurn < 0) {
    throw new TypeError('Current turn must be a non-negative number');
  }

  if (typeof availableChi !== 'number' || availableChi < 0) {
    throw new TypeError('Available chi must be a non-negative number');
  }

  // Check chi cost
  const chiCost = ability.chiCost ?? 0;
  if (availableChi < chiCost) {
    return {
      isAvailable: false,
      reason: 'insufficient_chi',
      cooldownTurnsRemaining: cooldownState.cooldownTurnsRemaining,
      usesRemaining: cooldownState.usesRemaining,
      isDesperationMove: isDesperationMove(ability)
    };
  }

  // Check cooldown - FIXED: Use strict off-by-one logic
  if (cooldownState.lastUsedTurn !== -1 && currentTurn <= cooldownState.lastUsedTurn + (ability.cooldown ?? 0)) {
    const cooldownTurnsRemaining = (cooldownState.lastUsedTurn + (ability.cooldown ?? 0)) - currentTurn + 1;
    return {
      isAvailable: false,
      reason: 'on_cooldown',
      cooldownTurnsRemaining: Math.max(0, cooldownTurnsRemaining),
      usesRemaining: cooldownState.usesRemaining,
      isDesperationMove: isDesperationMove(ability)
    };
  }

  // Check uses remaining
  if (cooldownState.usesRemaining !== undefined && cooldownState.usesRemaining <= 0) {
    return {
      isAvailable: false,
      reason: 'no_uses_remaining',
      cooldownTurnsRemaining: cooldownState.cooldownTurnsRemaining,
      usesRemaining: cooldownState.usesRemaining,
      isDesperationMove: isDesperationMove(ability)
    };
  }

  // Check battle phase restrictions
  if (battlePhase === 'stalemate' && !ability.tags?.includes('basic')) {
    return {
      isAvailable: false,
      reason: 'battle_phase_restriction',
      cooldownTurnsRemaining: 0,
      usesRemaining: cooldownState.usesRemaining,
      isDesperationMove: isDesperationMove(ability)
    };
  }

  if (battlePhase === 'climax' && !ability.tags?.includes('climax')) {
    return {
      isAvailable: false,
      reason: 'battle_phase_restriction',
      cooldownTurnsRemaining: 0,
      usesRemaining: cooldownState.usesRemaining,
      isDesperationMove: isDesperationMove(ability)
    };
  }

  // Check unlock conditions (desperation moves)
  const isDesperation = isDesperationMove(ability);
  const requiredHealthThreshold = ability.unlockCondition?.threshold;

  return {
    isAvailable: true,
    cooldownTurnsRemaining: 0,
    usesRemaining: cooldownState.usesRemaining,
    isDesperationMove: isDesperation,
    requiredHealthThreshold
  };
}

/**
 * @description Updates cooldown state when an ability is used.
 * @param {UseAbilityParams} params - Parameters for using an ability.
 * @param {AbilityCooldownState} currentState - Current cooldown state for the ability.
 * @returns {AbilityCooldownState} Updated cooldown state.
 * @throws {TypeError} When parameters are invalid.
 */
export function updateAbilityCooldownState(
  params: UseAbilityParams,
  currentState: AbilityCooldownState
): AbilityCooldownState {
  const { ability, currentTurn, currentHealthPercentage } = params;

  if (!ability || typeof ability.name !== 'string') {
    throw new TypeError('Invalid ability provided');
  }

  if (typeof currentTurn !== 'number' || currentTurn < 0) {
    throw new TypeError('Current turn must be a non-negative number');
  }

  if (typeof currentHealthPercentage !== 'number' || currentHealthPercentage < 0 || currentHealthPercentage > 100) {
    throw new TypeError('Current health percentage must be between 0 and 100');
  }

  // Check if desperation move can be used
  if (isDesperationMove(ability)) {
    const requiredThreshold = ability.unlockCondition?.threshold ?? 0;
    if (currentHealthPercentage > requiredThreshold) {
      throw new TypeError(`Desperation move ${ability.name} requires health below ${requiredThreshold}%`);
    }
  }

  const cooldown = ability.cooldown ?? 0;
  const maxUses = ability.maxUses;

  // Calculate new uses remaining
  const newUsesRemaining = maxUses !== undefined && currentState.usesRemaining !== undefined
    ? Math.max(0, currentState.usesRemaining - 1)
    : currentState.usesRemaining;

  // Calculate cooldown turns remaining - FIXED: Proper calculation
  const cooldownTurnsRemaining = cooldown > 0 ? cooldown : 0;

  return {
    lastUsedTurn: currentTurn,
    usesRemaining: newUsesRemaining,
    isOnCooldown: cooldownTurnsRemaining > 0,
    cooldownTurnsRemaining
  };
}

/**
 * @description Advances the cooldown state by one turn.
 * @param {CharacterCooldownState} state - Current cooldown state.
 * @returns {CharacterCooldownState} Updated cooldown state.
 * @throws {TypeError} When state is invalid.
 */
export function advanceCooldownTurn(
  state: CharacterCooldownState,
  abilities: Ability[]
): CharacterCooldownState {
  if (!state || typeof state.currentTurn !== 'number') {
    throw new TypeError('Invalid cooldown state provided');
  }

  if (!Array.isArray(abilities) || abilities.length === 0) {
    throw new TypeError('Abilities array must be provided');
  }

  const newTurn = state.currentTurn + 1;
  const updatedAbilityStates: Record<string, AbilityCooldownState> = {};

  for (const [abilityName, abilityState] of Object.entries(state.abilityStates)) {
    if (!abilityState || typeof abilityState.lastUsedTurn !== 'number') {
      throw new TypeError(`Invalid ability state for ${abilityName}`);
    }

    // FIXED: Get cooldown from ability definition
    const ability = abilities.find(a => a.name === abilityName);
    const cooldown = ability?.cooldown ?? 0;
    
    // Calculate if still on cooldown based on strict logic
    const isOnCooldown = abilityState.lastUsedTurn !== -1 && newTurn <= abilityState.lastUsedTurn + cooldown;
    const cooldownTurnsRemaining = isOnCooldown 
      ? Math.max(0, (abilityState.lastUsedTurn + cooldown) - newTurn + 1)
      : 0;

    updatedAbilityStates[abilityName] = {
      ...abilityState,
      isOnCooldown,
      cooldownTurnsRemaining
    };
  }

  return {
    abilityStates: updatedAbilityStates,
    currentTurn: newTurn
  };
}

/**
 * @description Resets all cooldown states for a new battle.
 * @param {ResetCooldownsParams} params - Parameters for resetting cooldowns.
 * @returns {CharacterCooldownState} Reset cooldown state.
 * @throws {TypeError} When parameters are invalid.
 */
export function resetCooldowns(
  params: ResetCooldownsParams
): CharacterCooldownState {
  const { abilities, startingTurn } = params;

  if (!Array.isArray(abilities) || abilities.length === 0) {
    throw new TypeError('Abilities array must be non-empty');
  }

  if (typeof startingTurn !== 'number' || startingTurn < 0) {
    throw new TypeError('Starting turn must be a non-negative number');
  }

  return initializeCooldownState({ abilities, startingTurn });
}

/**
 * @description Gets the cooldown state for a specific ability.
 * @param {CharacterCooldownState} state - Current cooldown state.
 * @param {string} abilityName - Name of the ability.
 * @returns {AbilityCooldownState | null} The cooldown state or null if not found.
 * @throws {TypeError} When parameters are invalid.
 */
export function getAbilityCooldownState(
  state: CharacterCooldownState,
  abilityName: string
): AbilityCooldownState | null {
  if (!state || !state.abilityStates) {
    throw new TypeError('Invalid cooldown state provided');
  }

  if (typeof abilityName !== 'string' || abilityName.trim() === '') {
    throw new TypeError('Ability name must be a non-empty string');
  }

  return state.abilityStates[abilityName] ?? null;
}

/**
 * @description Checks if an ability is a desperation move.
 * @param {Ability} ability - The ability to check.
 * @returns {boolean} True if the ability is a desperation move.
 */
function isDesperationMove(ability: Ability): boolean {
  return ability.unlockCondition?.type === 'health' && 
         typeof ability.unlockCondition.threshold === 'number';
}

/**
 * @description Validates that a cooldown state is properly structured.
 * @param {CharacterCooldownState} state - The state to validate.
 * @returns {boolean} True if the state is valid.
 * @throws {TypeError} When state is invalid.
 */
export function validateCooldownState(state: CharacterCooldownState): boolean {
  if (!state || typeof state !== 'object') {
    throw new TypeError('Cooldown state must be an object');
  }

  if (typeof state.currentTurn !== 'number' || state.currentTurn < 0) {
    throw new TypeError('Current turn must be a non-negative number');
  }

  if (!state.abilityStates || typeof state.abilityStates !== 'object') {
    throw new TypeError('Ability states must be an object');
  }

  for (const [abilityName, abilityState] of Object.entries(state.abilityStates)) {
    if (!abilityState || typeof abilityState !== 'object') {
      throw new TypeError(`Invalid ability state for ${abilityName}`);
    }

    if (typeof abilityState.lastUsedTurn !== 'number' || abilityState.lastUsedTurn < -1) {
      throw new TypeError(`Invalid lastUsedTurn for ${abilityName}`);
    }

    if (abilityState.usesRemaining !== undefined && 
        (typeof abilityState.usesRemaining !== 'number' || abilityState.usesRemaining < 0)) {
      throw new TypeError(`Invalid usesRemaining for ${abilityName}`);
    }

    if (typeof abilityState.isOnCooldown !== 'boolean') {
      throw new TypeError(`Invalid isOnCooldown for ${abilityName}`);
    }

    if (typeof abilityState.cooldownTurnsRemaining !== 'number' || abilityState.cooldownTurnsRemaining < 0) {
      throw new TypeError(`Invalid cooldownTurnsRemaining for ${abilityName}`);
    }
  }

  return true;
} 