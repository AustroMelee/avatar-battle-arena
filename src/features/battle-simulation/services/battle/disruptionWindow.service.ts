// CONTEXT: Battle, // FOCUS: DisruptionWindow
import type { BattleState, BattleCharacter } from '../../types';
import type { BattleCharacterFlags } from '../../types/index';
import { createMechanicLogEntry } from '../utils/mechanicLogUtils';

/**
 * Configuration for disruption window mechanics.
 */
export interface DisruptionWindowConfig {
  windowDuration: number; // Number of turns the window is open
  riskMultiplier: number; // Multiplier for risk/reward
  cooldown: number; // Turns before another window can open
}

export const DEFAULT_DISRUPTION_WINDOW_CONFIG: DisruptionWindowConfig = {
  windowDuration: 2,
  riskMultiplier: 2,
  cooldown: 5,
};

/**
 * State for an active disruption window.
 */
export interface DisruptionWindowState {
  isActive: boolean;
  openedTurn: number;
  initiator: string | null;
}

/**
 * Checks if a disruption window can be opened for a character.
 */
export function canOpenDisruptionWindow(
  _state: BattleState,
  character: BattleCharacter,
  _config: DisruptionWindowConfig = DEFAULT_DISRUPTION_WINDOW_CONFIG
): boolean {
  const flags = character.flags as BattleCharacterFlags;
  if (flags?.disruptionWindowCooldown !== undefined && _state.turn - (flags.disruptionWindowCooldown ?? 0) < _config.cooldown) {
    return false;
  }
  // Example: open window if stability < 20 or after a failed defense
  return character.stability < 20 && !flags?.disruptionWindowActive;
}

/**
 * Opens a disruption window for a character.
 */
export function openDisruptionWindow(
  _state: BattleState,
  character: BattleCharacter,
  _config: DisruptionWindowConfig = DEFAULT_DISRUPTION_WINDOW_CONFIG
): void {
  const flags = character.flags as BattleCharacterFlags;
  character.flags = {
    ...flags,
    disruptionWindowActive: true,
    disruptionWindowOpenedTurn: _state.turn,
    disruptionWindowCooldown: _state.turn,
  };
}

/**
 * Resolves a disruption window (apply risk/reward, close window) and returns a mechanic log entry.
 */
export function resolveDisruptionWindowWithLog(
  _state: BattleState,
  character: BattleCharacter,
  turn: number,
  success: boolean,
  _config: DisruptionWindowConfig = DEFAULT_DISRUPTION_WINDOW_CONFIG
) {
  resolveDisruptionWindow(_state, character, success, _config);
  const logEntry = createMechanicLogEntry({
    turn,
    actor: character.name,
    mechanic: 'Disruption Window Resolved',
    effect: success
      ? `${character.name} capitalized on the window!`
      : `${character.name} failed to capitalize on the window.`,
    reason: success ? 'All-in attack succeeded' : 'Opportunity missed',
    meta: { success }
  });
  return { logEntry };
}

/**
 * Resolves a disruption window (apply risk/reward, close window).
 */
export function resolveDisruptionWindow(
  _state: BattleState,
  character: BattleCharacter,
  success: boolean,
  _config: DisruptionWindowConfig = DEFAULT_DISRUPTION_WINDOW_CONFIG
): void {
  const flags = character.flags as BattleCharacterFlags;
  if (success) {
    // Apply reward: e.g., double disruption to opponent
    // (Implementation: handled in move resolution)
  } else {
    // Apply risk: e.g., self suffers double disruption
    // (Implementation: handled in move resolution)
  }
  character.flags = {
    ...flags,
    disruptionWindowActive: false,
  };
} 