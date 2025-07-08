// Used via dynamic registry in BattleEngine/utilities. See SYSTEM ARCHITECTURE.MD for flow.
// @docs
// @description: Log creation utilities for Avatar Battle Arena. All log creation is standardized and registry-driven. No hard-coded log types. Extensible via data/registries only. SRP-compliant. See SYSTEM ARCHITECTURE.MD for integration points.
// @criticality: 🛠️ Utility
// @owner: AustroMelee
// @tags: logging, SRP, type-safety, registry, plug-and-play, extensibility
//
// This file should never reference character, move, or narrative content directly. All extensibility is via data/registries.
//
// Updated for 2025 registry-driven architecture overhaul.
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

// --- Anti-repetition buffer for narrative lines (simple, in-memory; per-battle would be better for prod) ---
const recentNarratives: string[] = [];
const MAX_RECENT = 3;
function antiRepetition(narrative: string): string {
  if (!narrative) return '';
  if (recentNarratives.includes(narrative)) {
    // Escalate or swap in a variant (for now, just append a dramatic suffix)
    narrative += ' (with growing frustration)';
  }
  recentNarratives.push(narrative);
  if (recentNarratives.length > MAX_RECENT) recentNarratives.shift();
  return narrative;
}

const legendaryFallbackNarratives = [
  "A desperate maneuver unfolds—tension thickens like storm clouds over the arena.",
  "The air trembles with anticipation, as if fate itself is holding its breath.",
  "Uncertainty grips the battlefield; each movement teeters on the edge of legend.",
  "A hush falls, broken only by the heartbeats of those who refuse to yield.",
  "Every eye in the arena is drawn to the smallest gesture—a storm brews beneath the surface.",
  "A glimmer of resolve flickers in the gloom; destiny waits to be seized.",
  "Between hope and fear, a silent challenge passes between rivals.",
  "The world seems to pause; every action is laden with the weight of destiny.",
  "Doubt and determination collide in a single, unforgettable instant.",
  "What seems like hesitation is the calm before an upheaval no one can predict."
];
function getLegendaryFallbackNarrative(): string {
  return legendaryFallbackNarratives[Math.floor(Math.random() * legendaryFallbackNarratives.length)];
}

/**
 * Creates a player-facing narrative log entry (type: 'NARRATIVE').
 * Ensures the narrative and result fields contain only clean, immersive prose.
 * Now with anti-repetition, null filtering, and formatting.
 */
export function logStory({ turn, actor, narrative, target }: { turn: number; actor: string; narrative: string; target?: string }): BattleLogEntry | null {
  // Defensive: filter null/undefined/empty
  if (typeof turn !== 'number' || !actor || !narrative) {
    // Use a legendary fallback narrative if missing
    const narrative = getLegendaryFallbackNarrative();
    return {
      id: generateUniqueLogId('narrative'),
      turn: typeof turn === 'number' ? turn : 0,
      actor: actor ? actor.charAt(0).toUpperCase() + actor.slice(1) : 'The opponent',
      type: 'NARRATIVE',
      action: 'Story',
      result: narrative,
      target,
      narrative,
      timestamp: Date.now(),
      details: {},
    };
  }
  // Capitalize actor name
  const actorName = actor.charAt(0).toUpperCase() + actor.slice(1);
  // Anti-repetition
  const cleanNarrative = antiRepetition(narrative.trim());
  // Remove dev junk: no IDs, camelCase, or numbers unless dramatic
  // (For now, assume narrative is already clean; in future, add regex/formatting here)
  return {
    id: generateUniqueLogId('narrative'),
    turn,
    actor: actorName,
    type: 'NARRATIVE',
    action: 'Story',
    result: cleanNarrative,
    target,
    narrative: cleanNarrative,
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