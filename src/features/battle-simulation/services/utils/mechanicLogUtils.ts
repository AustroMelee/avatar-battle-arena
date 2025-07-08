import type { BattleLogEntry, LogDetails } from '../../types';
import { generateUniqueLogId } from '../ai/logQueries';

/**
 * Options for creating a standardized mechanic log entry.
 * @deprecated This function is confusing and mixes concerns. Use logStory and logTechnical directly.
 */
export interface MechanicLogOptions {
  turn: number;
  actor: string;
  mechanic: string;
  effect: string;
  reason?: string;
  target?: string;
  details?: LogDetails;
}

// let mechanicLogCounter = 0;

/**
 * Creates a standardized log entry for a battle mechanic event.
 * @deprecated This function returns a mixed-concern object. Use logStory and logTechnical to generate separate, clean log entries.
 */
export function createMechanicLogEntry({
  turn,
  actor,
  mechanic,
  effect,
  reason,
  target,
  details,
}: MechanicLogOptions): { narrative: string; technical: BattleLogEntry } {
  // Narrative: pure prose, no technical info
  const narrative = effect;
  
  // Technical log: all details
  const technical: BattleLogEntry = {
    id: generateUniqueLogId('mechanic'),
    turn,
    actor,
    type: 'INFO',
    action: mechanic,
    result: reason ? `${effect} (${reason})` : effect, // Keep result for technical log display
    target,
    narrative: '', // Technical logs should NOT have narrative content
    timestamp: Date.now(),
    details: { ...details, mechanic, reason },
  };
  return { narrative, technical };
}

/**
 * Creates a player-facing narrative log entry (type: 'NARRATIVE').
 * Ensures the narrative and result fields contain only clean, immersive prose.
 */
export function logStory({ turn, actor, narrative, target }: { turn: number; actor: string; narrative: string; target?: string }): BattleLogEntry | null {
  if (typeof turn !== 'number' || !actor) {
    // Final guard: Do not create log if turn or actor is missing
    return null;
  }
  return {
    id: generateUniqueLogId('narrative'),
    turn,
    actor,
    type: 'NARRATIVE',
    action: 'Story',
    result: narrative,
    target,
    narrative: narrative,
    timestamp: Date.now(),
    details: {},
  };
}

/**
 * Creates a technical/developer log entry (type: 'INFO').
 * Ensures all mechanical data is stored in `details` and `result`, with no narrative pollution.
 */
export function logTechnical({ turn, actor, action, result, reason, target, details }: { turn: number; actor: string; action: string; result: string; reason?: string; target?: string; details?: LogDetails }): BattleLogEntry | null {
  if (typeof turn !== 'number' || !actor) {
    // Final guard: Do not create log if turn or actor is missing
    return null;
  }
  return {
    id: generateUniqueLogId('technical'),
    turn,
    actor,
    type: 'INFO',
    action,
    result,
    target,
    narrative: '',
    timestamp: Date.now(),
    details: { ...details, mechanic: action, reason },
  };
} 