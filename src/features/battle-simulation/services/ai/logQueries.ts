// CONTEXT: AI, // FOCUS: LogAnalysis
import { BattleLogEntry, LogEventType, BattleCharacter } from '../../types';

/**
 * @description Utility to generate unique event IDs.
 * @returns {string} A unique event identifier.
 */
export function createEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * @description Get recent log entries for a specific player within a turn range.
 * @param {BattleLogEntry[]} log - The battle log entries.
 * @param {string} playerId - The player ID to filter for.
 * @param {number} turnsBack - How many turns back to look (default: 3).
 * @returns {BattleLogEntry[]} Filtered log entries.
 */
export function getRecentPlayerActions(
  log: BattleLogEntry[], 
  playerId: string, 
  turnsBack: number = 3
): BattleLogEntry[] {
  const currentTurn = log.length > 0 ? Math.max(...log.map(e => e.turn)) : 0;
  const minTurn = Math.max(1, currentTurn - turnsBack);
  
  return log.filter(entry => 
    entry.actor === playerId && entry.turn >= minTurn
  );
}

/**
 * @description Check if a player's last move was a specific ability.
 * @param {BattleLogEntry[]} log - The battle log entries.
 * @param {string} playerId - The player ID to check.
 * @param {string} moveName - The move name to check for.
 * @returns {boolean} True if the last move matches.
 */
export function wasLastMove(
  log: BattleLogEntry[], 
  playerId: string, 
  moveName: string
): boolean {
  const playerActions = log.filter(entry => entry.actor === playerId);
  if (playerActions.length === 0) return false;
  
  const lastAction = playerActions[playerActions.length - 1];
  return lastAction.action === moveName;
}

/**
 * @description Check if a player's last move was a defensive/shield ability.
 * @param {BattleLogEntry[]} log - The battle log entries.
 * @param {string} playerId - The player ID to check.
 * @returns {boolean} True if the last move was defensive.
 */
export function wasLastMoveShield(log: BattleLogEntry[], playerId: string): boolean {
  const defensiveMoves = ['Air Shield', 'Fire Shield', 'Water Shield', 'Earth Shield'];
  return defensiveMoves.some(move => wasLastMove(log, playerId, move));
}

/**
 * @description Get the total damage taken by a player in recent turns.
 * @param {BattleLogEntry[]} log - The battle log entries.
 * @param {string} playerId - The player ID to check.
 * @param {number} turnsBack - How many turns back to look (default: 2).
 * @returns {number} Total damage taken.
 */
export function recentDamageTaken(
  log: BattleLogEntry[], 
  playerId: string, 
  turnsBack: number = 2
): number {
  const currentTurn = log.length > 0 ? Math.max(...log.map(e => e.turn)) : 0;
  const minTurn = Math.max(1, currentTurn - turnsBack);
  
  return log
    .filter(entry => 
      entry.type === 'MOVE' && 
      entry.target === playerId && 
      entry.turn >= minTurn &&
      entry.damage !== undefined
    )
    .reduce((total, entry) => total + (entry.damage || 0), 0);
}

/**
 * @description Count how many times a specific move was used in recent turns.
 * @param {BattleLogEntry[]} log - The battle log entries.
 * @param {string} playerId - The player ID to check.
 * @param {string} moveName - The move name to count.
 * @param {number} turnsBack - How many turns back to look (default: 3).
 * @returns {number} Count of move usage.
 */
export function moveCountInLastN(
  log: BattleLogEntry[], 
  playerId: string, 
  moveName: string, 
  turnsBack: number = 3
): number {
  const currentTurn = log.length > 0 ? Math.max(...log.map(e => e.turn)) : 0;
  const minTurn = Math.max(1, currentTurn - turnsBack);
  
  return log.filter(entry => 
    entry.actor === playerId && 
    entry.action === moveName && 
    entry.turn >= minTurn
  ).length;
}

/**
 * @description Check if a player has been hit by critical attacks recently.
 * @param {BattleLogEntry[]} log - The battle log entries.
 * @param {string} playerId - The player ID to check.
 * @param {number} turnsBack - How many turns back to look (default: 2).
 * @returns {boolean} True if hit by critical attacks recently.
 */
export function wasRecentlyCriticallyHit(
  log: BattleLogEntry[], 
  playerId: string, 
  turnsBack: number = 2
): boolean {
  const currentTurn = log.length > 0 ? Math.max(...log.map(e => e.turn)) : 0;
  const minTurn = Math.max(1, currentTurn - turnsBack);
  
  return log.some(entry => 
    entry.type === 'MOVE' && 
    entry.target === playerId && 
    entry.turn >= minTurn &&
    entry.meta?.crit === true
  );
}

/**
 * @description Check if a player has been using the same move repeatedly.
 * @param {BattleLogEntry[]} log - The battle log entries.
 * @param {string} playerId - The player ID to check.
 * @param {number} minRepeats - Minimum number of repeats to consider "spamming" (default: 2).
 * @param {number} turnsBack - How many turns back to look (default: 3).
 * @returns {string | null} The move being spammed, or null if no spam detected.
 */
export function isSpammingMove(
  log: BattleLogEntry[], 
  playerId: string, 
  minRepeats: number = 2, 
  turnsBack: number = 3
): string | null {
  const recentActions = getRecentPlayerActions(log, playerId, turnsBack);
  const moveCounts: Record<string, number> = {};
  
  recentActions.forEach(entry => {
    moveCounts[entry.action] = (moveCounts[entry.action] || 0) + 1;
  });
  
  for (const [move, count] of Object.entries(moveCounts)) {
    if (count >= minRepeats) {
      return move;
    }
  }
  
  return null;
}

/**
 * @description Check if a player is low on resources (chi).
 * @param {BattleCharacter} character - The character state to check.
 * @param {number} threshold - The threshold percentage for "low" resources (default: 0.3).
 * @returns {boolean} True if resources are low.
 */
export function isLowOnResources(
  character: BattleCharacter, 
  threshold: number = 0.3
): boolean {
  const maxChi = character.resources.chi + (character.resources.chi * 0.5); // Estimate max
  return character.resources.chi / maxChi < threshold;
}

/**
 * @description Get the most recent event of a specific type for a player.
 * @param {BattleLogEntry[]} log - The battle log entries.
 * @param {string} playerId - The player ID to check.
 * @param {LogEventType} eventType - The type of event to look for.
 * @returns {BattleLogEntry | null} The most recent event, or null if none found.
 */
export function getLastEventOfType(
  log: BattleLogEntry[], 
  playerId: string, 
  eventType: LogEventType
): BattleLogEntry | null {
  const playerEvents = log.filter(entry => 
    entry.actor === playerId && entry.type === eventType
  );
  
  return playerEvents.length > 0 ? playerEvents[playerEvents.length - 1] : null;
}

/**
 * @description Check if a player has been blocked or evaded recently.
 * @param {BattleLogEntry[]} log - The battle log entries.
 * @param {string} playerId - The player ID to check.
 * @param {number} turnsBack - How many turns back to look (default: 2).
 * @returns {boolean} True if moves were blocked/evaded recently.
 */
export function wasRecentlyBlockedOrEvaded(
  log: BattleLogEntry[], 
  playerId: string, 
  turnsBack: number = 2
): boolean {
  const currentTurn = log.length > 0 ? Math.max(...log.map(e => e.turn)) : 0;
  const minTurn = Math.max(1, currentTurn - turnsBack);
  
  return log.some(entry => 
    entry.actor === playerId && 
    entry.turn >= minTurn &&
    (entry.meta?.blocked === true || entry.meta?.evaded === true)
  );
}

/**
 * @description Get the current combo count for a player.
 * @param {BattleLogEntry[]} log - The battle log entries.
 * @param {string} playerId - The player ID to check.
 * @returns {number} The current combo count.
 */
export function getCurrentCombo(log: BattleLogEntry[], playerId: string): number {
  const playerActions = log.filter(entry => entry.actor === playerId);
  if (playerActions.length === 0) return 0;
  
  const lastAction = playerActions[playerActions.length - 1];
  return lastAction.meta?.combo || 0;
} 