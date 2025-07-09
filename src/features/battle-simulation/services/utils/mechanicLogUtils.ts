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
import type { BattleLogEntry, LogDetails, LogEntryType, NonDialogueLogEntry } from '../../types';
import { generateUniqueLogId } from '../ai/logQueries';
import { nes } from '@/common/branding/nonEmptyString';

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
  mechanic,
  effect,
  reason,
  target,
  details,
}: Omit<MechanicLogOptions, 'actor'>): { narrative: string; technical: import('../../types').NonDialogueLogEntry } {
  // Narrative: pure prose, no technical info
  const narrative = effect;
  // Technical log: all details
  const resultString = reason && reason.length ? `${effect} (${reason})` : effect;
  const technical = {
    id: generateUniqueLogId('mechanic'),
    turn,
    actor: 'System' as const,
    type: 'mechanics' as const,
    action: mechanic,
    result: safeNes(resultString, 'No result'),
    target,
    narrative: nes('No narrative' as const), // Technical logs should NOT have narrative content
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

// --- Canonical log type mapping ---
export const mapRawType = (raw: string): LogEntryType =>
  raw === "mechanics" || raw === "TACTICAL" || raw === "CHARGE" || raw === "REPOSITION"
    ? "mechanics"
    : raw === "dialogue"
    ? "dialogue"
    : raw === "system"
    ? "system"
    : "narrative";

// --- Duplicate prevention ---
export const hashLogEntry = (e: BattleLogEntry) => `${e.type}|${e.actor}|${e.narrative}|${e.timestamp}`;
export const pushLog = (state: { entries: BattleLogEntry[]; seen: Set<string> }, entry: BattleLogEntry) => {
  const hash = hashLogEntry(entry);
  if (!state.seen.has(hash)) {
    state.entries.push(entry);
    state.seen.add(hash);
  }
};

/**
 * Asserts a condition, throws if false.
 */
function assert(condition: any, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

// --- Updated logDialogue (canonical for fighter speech) ---
export function logDialogue({ turn, actor, text, target }: { turn: number; actor: string; text: string; target?: string }): import('../../types').DialogueLogEntry | null {
  assert(Number.isFinite(turn), 'log turn missing');
  assert(typeof text === 'string' && text.trim().length > 0, 'log text empty');
  return {
    id: generateUniqueLogId('dialogue'),
    turn,
    actor: actor.charAt(0).toUpperCase() + actor.slice(1),
    type: 'dialogue',
    action: 'Dialogue',
    result: safeNes(text, 'No result'),
    target,
    narrative: safeNes(text, 'No narrative'),
    timestamp: Date.now(),
    details: {},
  };
}

/**
 * Creates a player-facing narrative log entry (type: 'narrative').
 * Ensures the narrative and result fields contain only clean, immersive prose.
 * Now with anti-repetition, null filtering, and formatting.
 * Only accepts actor if 'System' or 'Narrator'.
 */
export function logStory({ turn, actor, narrative, target }: { turn: number; actor?: 'System' | 'Narrator'; narrative: string; target?: string }): import('../../types').NonDialogueLogEntry | null {
  assert(Number.isFinite(turn), 'log turn missing');
  assert(typeof narrative === 'string' && narrative.trim().length > 0, 'log text empty');
  if (actor && actor !== 'System' && actor !== 'Narrator') throw new Error('Non-dialogue log cannot have actor other than System or Narrator');
  const cleanNarrative = antiRepetition(narrative.trim());
  return {
    id: generateUniqueLogId('narrative'),
    turn,
    actor: actor,
    type: 'narrative',
    action: 'Story',
    result: nes((cleanNarrative && cleanNarrative.length ? cleanNarrative : 'No result')),
    target,
    narrative: nes((cleanNarrative && cleanNarrative.length ? cleanNarrative : 'No narrative')),
    timestamp: Date.now(),
    details: {},
  };
}

// --- Updated logMechanics: skip empty or whitespace-only strings ---
export function logMechanics(params: { turn: number; text: string }): NonDialogueLogEntry | null {
  assert(Number.isFinite(params.turn), 'log turn missing');
  const trimmed = params.text.trim();
  if (!trimmed) return null;
  const result = nes((trimmed && trimmed.length ? trimmed : 'No result'));
  const log: NonDialogueLogEntry = {
    id: generateUniqueLogId('mechanics'),
    turn: params.turn,
    actor: 'System',
    type: 'mechanics',
    action: 'Mechanics',
    result,
    narrative: result,
    timestamp: Date.now(),
    details: {},
  };
  return log;
}

/**
 * Creates a system-level log entry (type: 'system').
 * Only accepts actor if 'System' or 'Narrator'.
 */
export function logSystem({ turn, actor, message, target }: { turn: number; actor: 'System' | 'Narrator'; message: string; target?: string }): import('../../types').NonDialogueLogEntry {
  assert(Number.isFinite(turn), 'log turn missing');
  assert(typeof message === 'string' && message.trim().length > 0, 'log text empty');
  if (actor !== 'System' && actor !== 'Narrator') throw new Error('Non-dialogue log cannot have actor other than System or Narrator');
  return {
    id: generateUniqueLogId('system'),
    turn,
    actor: actor,
    type: 'system',
    action: 'System',
    result: nes((message && message.length ? message : 'No result')),
    target,
    narrative: nes((message && message.length ? message : 'No narrative')),
    timestamp: Date.now(),
    details: {},
  };
} 

/**
 * maybeLogSystem: Only emits a system log if the message is non-empty/meaningful.
 * Returns null for empty/whitespace input. See SYSTEM ARCHITECTURE.MD 10.5.
 */
export function maybeLogSystem(turn: number, message?: string): NonDialogueLogEntry | null {
  const trimmed = message?.trim();
  if (!trimmed) return null;
  return logSystem({
    turn,
    actor: 'System',
    message: trimmed
  });
}

/**
 * Infers the log type for legacy log entries that may not have a type field.
 */
export function inferLogType(log: any): LogEntryType {
  if (log.type) return log.type;
  if (typeof log.text === 'string' && /^(["“”])/.test(log.text)) return 'dialogue';
  if (typeof log.text === 'string' && (log.text.includes('successfully') || log.text.includes('fails'))) return 'mechanics';
  if (typeof log.text === 'string' && (log.text.startsWith('The ') || /^\w+ stands/.test(log.text))) return 'narrative';
  return 'mechanics'; // default fallback
} 

function safeNes(val: string, fallback: string): ReturnType<typeof nes> {
  const v = val && val.length ? val : fallback;
  // Runtime guarantee: v is non-empty
  return nes(v as any);
} 