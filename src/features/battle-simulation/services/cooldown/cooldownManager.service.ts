// Used via dynamic registry in BattleEngine/cooldown system. See SYSTEM ARCHITECTURE.MD for flow.
// CONTEXT: BattleSimulation, // FOCUS: CooldownManagement
import type { Move } from '../../types/move.types';
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
  const { moves, startingTurn } = params;

  if (!Array.isArray(moves) || moves.length === 0) {
    throw new TypeError('Moves array must be non-empty');
  }

  if (typeof startingTurn !== 'number' || startingTurn < 0) {
    throw new TypeError('Starting turn must be a non-negative number');
  }

  const abilityStates: Record<string, AbilityCooldownState> = {};

  for (const move of moves) {
    if (!move.name || typeof move.name !== 'string') {
      throw new TypeError(`Invalid move name: ${move.name}`);
    }

    const cooldown = move.cooldown ?? 0;
    const maxUses = move.maxUses;

    if (cooldown < 0 || cooldown > MAX_COOLDOWN_TURNS) {
      throw new TypeError(`Invalid cooldown value: ${cooldown}. Must be between 0 and ${MAX_COOLDOWN_TURNS}`);
    }

    if (maxUses !== undefined && (maxUses < 1 || maxUses > MAX_USES_PER_BATTLE)) {
      throw new TypeError(`Invalid maxUses value: ${maxUses}. Must be between 1 and ${MAX_USES_PER_BATTLE}`);
    }

    abilityStates[move.name] = {
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
  const { move, cooldownState, currentTurn, availableChi, battlePhase = 'normal' } = params;

  if (!move || typeof move.name !== 'string') {
    throw new TypeError('Invalid move provided');
  }

  if (typeof currentTurn !== 'number' || currentTurn < 0) {
    throw new TypeError('Current turn must be a non-negative number');
  }

  if (typeof availableChi !== 'number' || availableChi < 0) {
    throw new TypeError('Available chi must be a non-negative number');
  }

  // Check chi cost
  const chiCost = move.chiCost ?? 0;
  if (availableChi < chiCost) {
    return {
      isAvailable: false,
      reason: 'insufficient_chi',
      cooldownTurnsRemaining: cooldownState.cooldownTurnsRemaining,
      usesRemaining: cooldownState.usesRemaining,
      isDesperationMove: isDesperationMove(move)
    };
  }

  // Check cooldown - FIXED: Use strict off-by-one logic
  if (cooldownState.lastUsedTurn !== -1 && currentTurn <= cooldownState.lastUsedTurn + (move.cooldown ?? 0)) {
    const cooldownTurnsRemaining = (cooldownState.lastUsedTurn + (move.cooldown ?? 0)) - currentTurn + 1;
    return {
      isAvailable: false,
      reason: 'on_cooldown',
      cooldownTurnsRemaining: Math.max(0, cooldownTurnsRemaining),
      usesRemaining: cooldownState.usesRemaining,
      isDesperationMove: isDesperationMove(move)
    };
  }

  // Check uses remaining
  if (cooldownState.usesRemaining !== undefined && cooldownState.usesRemaining <= 0) {
    return {
      isAvailable: false,
      reason: 'no_uses_remaining',
      cooldownTurnsRemaining: cooldownState.cooldownTurnsRemaining,
      usesRemaining: cooldownState.usesRemaining,
      isDesperationMove: isDesperationMove(move)
    };
  }

  // Check battle phase restrictions
  if (battlePhase === 'stalemate' && !move.tags?.includes('basic')) {
    return {
      isAvailable: false,
      reason: 'battle_phase_restriction',
      cooldownTurnsRemaining: 0,
      usesRemaining: cooldownState.usesRemaining,
      isDesperationMove: isDesperationMove(move)
    };
  }

  if (battlePhase === 'climax' && !move.tags?.includes('climax')) {
    return {
      isAvailable: false,
      reason: 'battle_phase_restriction',
      cooldownTurnsRemaining: 0,
      usesRemaining: cooldownState.usesRemaining,
      isDesperationMove: isDesperationMove(move)
    };
  }

  // Check unlock conditions (desperation moves)
  const isDesperation = isDesperationMove(move);
  const requiredHealthThreshold = move.unlockCondition?.threshold;

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
  const { move, currentTurn, currentHealthPercentage } = params;

  if (!move || typeof move.name !== 'string') {
    throw new TypeError('Invalid move provided');
  }

  if (typeof currentTurn !== 'number' || currentTurn < 0) {
    throw new TypeError('Current turn must be a non-negative number');
  }

  if (typeof currentHealthPercentage !== 'number' || currentHealthPercentage < 0 || currentHealthPercentage > 100) {
    throw new TypeError('Current health percentage must be between 0 and 100');
  }

  // Check if desperation move can be used
  if (isDesperationMove(move)) {
    const requiredThreshold = move.unlockCondition?.threshold ?? 0;
    if (currentHealthPercentage > requiredThreshold) {
      throw new TypeError(`Desperation move ${move.name} requires health below ${requiredThreshold}%`);
    }
  }

  const cooldown = move.cooldown ?? 0;
  const maxUses = move.maxUses;

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
  moves: Move[]
): CharacterCooldownState {
  if (!state || typeof state.currentTurn !== 'number') {
    throw new TypeError('Invalid cooldown state provided');
  }

  if (!Array.isArray(moves) || moves.length === 0) {
    throw new TypeError('Moves array must be provided');
  }

  const newTurn = state.currentTurn + 1;
  const updatedAbilityStates: Record<string, AbilityCooldownState> = {};

  for (const move of moves) {
    if (!move || typeof move.name !== 'string') {
      throw new TypeError(`Invalid move name: ${move.name}`);
    }

    const stateForMove = state.abilityStates[move.name];
    if (!stateForMove) continue;

    // Calculate if still on cooldown based on strict logic
    const isOnCooldown = stateForMove.lastUsedTurn !== -1 && newTurn <= stateForMove.lastUsedTurn + move.cooldown;
    const cooldownTurnsRemaining = isOnCooldown 
      ? Math.max(0, (stateForMove.lastUsedTurn + move.cooldown) - newTurn + 1)
      : 0;

    updatedAbilityStates[move.name] = {
      ...stateForMove,
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
  const { moves, startingTurn } = params;

  if (!Array.isArray(moves) || moves.length === 0) {
    throw new TypeError('Moves array must be non-empty');
  }

  if (typeof startingTurn !== 'number' || startingTurn < 0) {
    throw new TypeError('Starting turn must be a non-negative number');
  }

  return initializeCooldownState({ moves, startingTurn });
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
  moveName: string
): AbilityCooldownState | null {
  if (!state || !state.abilityStates) {
    throw new TypeError('Invalid cooldown state provided');
  }

  if (typeof moveName !== 'string' || moveName.trim() === '') {
    throw new TypeError('Move name must be a non-empty string');
  }

  return state.abilityStates[moveName] ?? null;
}

/**
 * @description Checks if an ability is a desperation move.
 * @param {Move} move - The move to check.
 * @returns {boolean} True if the move is a desperation move.
 */
function isDesperationMove(move: Move): boolean {
  return !!move.unlockCondition;
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

  for (const [moveName, moveState] of Object.entries(state.abilityStates)) {
    if (!moveState || typeof moveState !== 'object') {
      throw new TypeError(`Invalid move state for ${moveName}`);
    }

    if (typeof moveState.lastUsedTurn !== 'number' || moveState.lastUsedTurn < -1) {
      throw new TypeError(`Invalid lastUsedTurn for ${moveName}`);
    }

    if (moveState.usesRemaining !== undefined && 
        (typeof moveState.usesRemaining !== 'number' || moveState.usesRemaining < 0)) {
      throw new TypeError(`Invalid usesRemaining for ${moveName}`);
    }

    if (typeof moveState.isOnCooldown !== 'boolean') {
      throw new TypeError(`Invalid isOnCooldown for ${moveName}`);
    }

    if (typeof moveState.cooldownTurnsRemaining !== 'number' || moveState.cooldownTurnsRemaining < 0) {
      throw new TypeError(`Invalid cooldownTurnsRemaining for ${moveName}`);
    }
  }

  return true;
} 