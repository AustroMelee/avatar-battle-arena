// @file logQueries.ts
// @description Provides log analysis utilities for AI, including unique log ID generation, recent action queries, and event analysis for tactical and narrative logic.
// @criticality 🧠 AI Log Analysis (Medium) | Depends on: types
// @owner AustroMelee
// @lastUpdated 2025-07-07
// @related types
//
// All exports are documented below.
// CONTEXT: AI, // FOCUS: LogAnalysis
import { BattleLogEntry, LogEventType, BattleCharacter } from '../../types';

// --- SINGLETON LOG ID GENERATOR ---
/**
 * @description Factory for a bulletproof unique log ID generator with a private counter.
 * @function createIdGenerator
 * @returns {(prefix?: string) => string} Unique log ID generator function.
 * @owner AustroMelee
 * @lastUpdated 2025-07-07
 */
const createIdGenerator = () => {
  let counter = 0;
  return (prefix: string = 'log') => `${prefix}-${Date.now()}-${counter++}-${Math.random().toString(36).slice(2, 9)}`;
};

/**
 * @description The one and only log ID generator for the entire app.
 * @exports generateUniqueLogId
 * @owner AustroMelee
 * @lastUpdated 2025-07-07
 */
export const generateUniqueLogId = createIdGenerator();

/**
 * @description Get recent log entries for a specific player within a turn range.
 * @function getRecentPlayerActions
 * @param {BattleLogEntry[]} log - The battle log entries.
 * @param {string} playerId - The player ID to filter for.
 * @param {number} turnsBack - How many turns back to look (default: 3).
 * @returns {BattleLogEntry[]} Filtered log entries.
 * @owner AustroMelee
 * @lastUpdated 2025-07-07
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
 * @function wasLastMove
 * @param {BattleLogEntry[]} log - The battle log entries.
 * @param {string} playerId - The player ID to check.
 * @param {string} moveName - The move name to check for.
 * @returns {boolean} True if the last move matches.
 * @owner AustroMelee
 * @lastUpdated 2025-07-07
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
 * @function wasLastMoveShield
 * @param {BattleLogEntry[]} log - The battle log entries.
 * @param {string} playerId - The player ID to check.
 * @returns {boolean} True if the last move was defensive.
 * @owner AustroMelee
 * @lastUpdated 2025-07-07
 */
export function wasLastMoveShield(log: BattleLogEntry[], playerId: string): boolean {
  const defensiveMoves = ['Air Shield', 'Fire Shield', 'Water Shield', 'Earth Shield'];
  return defensiveMoves.some(move => wasLastMove(log, playerId, move));
}

/**
 * @description Get the total damage taken by a player in recent turns.
 * @function recentDamageTaken
 * @param {BattleLogEntry[]} log - The battle log entries.
 * @param {string} playerId - The player ID to check.
 * @param {number} turnsBack - How many turns back to look (default: 2).
 * @returns {number} Total damage taken.
 * @owner AustroMelee
 * @lastUpdated 2025-07-07
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
      entry.details?.damage !== undefined
    )
    .reduce((total, entry) => total + (entry.details?.damage || 0), 0);
}

/**
 * @description Count how many times a specific move was used in recent turns.
 * @function moveCountInLastN
 * @param {BattleLogEntry[]} log - The battle log entries.
 * @param {string} playerId - The player ID to check.
 * @param {string} moveName - The move name to count.
 * @param {number} turnsBack - How many turns back to look (default: 3).
 * @returns {number} Count of move usage.
 * @owner AustroMelee
 * @lastUpdated 2025-07-07
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
 * @function wasRecentlyCriticallyHit
 * @param {BattleLogEntry[]} log - The battle log entries.
 * @param {string} playerId - The player ID to check.
 * @param {number} turnsBack - How many turns back to look (default: 2).
 * @returns {boolean} True if hit by critical attacks recently.
 * @owner AustroMelee
 * @lastUpdated 2025-07-07
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
    entry.details?.meta?.crit === true
  );
}

/**
 * @description Check if a player has been using the same move repeatedly.
 * @function isSpammingMove
 * @param {BattleLogEntry[]} log - The battle log entries.
 * @param {string} playerId - The player ID to check.
 * @param {number} minRepeats - Minimum number of repeats to consider "spamming" (default: 2).
 * @param {number} turnsBack - How many turns back to look (default: 3).
 * @returns {string | null} The move being spammed, or null if no spam detected.
 * @owner AustroMelee
 * @lastUpdated 2025-07-07
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
 * @function isLowOnResources
 * @param {BattleCharacter} character - The character state to check.
 * @param {number} threshold - The threshold percentage for "low" resources (default: 0.3).
 * @returns {boolean} True if resources are low.
 * @owner AustroMelee
 * @lastUpdated 2025-07-07
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
 * @function getLastEventOfType
 * @param {BattleLogEntry[]} log - The battle log entries.
 * @param {string} playerId - The player ID to check.
 * @param {LogEventType} eventType - The type of event to look for.
 * @returns {BattleLogEntry | null} The most recent event, or null if none found.
 * @owner AustroMelee
 * @lastUpdated 2025-07-07
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
    (entry.details?.meta?.blocked === true || entry.details?.meta?.evaded === true)
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
  return lastAction.details?.meta?.combo || 0;
}

export function createEventId(): string {
  return generateUniqueLogId();
} 