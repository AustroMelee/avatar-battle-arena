import type { BattleLogEntry } from '../../types';
import { generateUniqueLogId } from '../ai/logQueries';

/**
 * Options for creating a standardized mechanic log entry.
 */
export interface MechanicLogOptions {
  turn: number;
  actor: string;
  mechanic: string;
  effect: string;
  reason?: string;
  target?: string;
  meta?: Record<string, unknown>;
}

let mechanicLogCounter = 0;

/**
 * Creates a standardized log entry for a battle mechanic event.
 * Ensures all mechanic logs are consistent and queryable.
 *
 * @example
 * createMechanicLogEntry({
 *   turn: 27,
 *   actor: 'Azula',
 *   mechanic: 'Heroic Reversal',
 *   effect: 'Azula seizes a sudden opening and turns the tables.',
 *   reason: 'Triggered by low health and momentum gap',
 * })
 */
export function createMechanicLogEntry({
  turn,
  actor,
  mechanic,
  effect,
  reason,
  target,
  meta,
}: MechanicLogOptions): BattleLogEntry {
  return {
    id: generateUniqueLogId('mechanic'),
    turn,
    actor,
    type: 'INFO', // Use 'INFO' or a custom type if you extend LogEventType
    action: mechanic,
    result: effect,
    target,
    narrative: reason
      ? `${actor}: [${mechanic}] ${effect} (${reason})`
      : `${actor}: [${mechanic}] ${effect}`,
    timestamp: Date.now(),
    meta: meta || { mechanic, reason },
  };
} 