// CONTEXT: Narrative System, // FOCUS: Hook-Based Narrative Generation
import type { BattleContext, NarrativeHook, TriggeredNarrative, NarrativeSystemConfig } from './types';

/**
 * @description Tracks which hooks have been used in this battle
 */
export type UsedHooksTracker = {
  [hookId: string]: boolean;
};

/**
 * @description Generates narratives using the legacy hook system
 * @param ctx - Battle context
 * @param config - Narrative system configuration
 * @param usedHooks - Tracker for one-time hooks (per battle)
 * @param lastSpoken - Map of last spoken line per actor (per battle)
 * @param phaseFlags - Map of phase/threshold flags (per battle)
 * @returns Array of triggered narratives
 */
export function generateHookBasedNarratives(
  ctx: BattleContext,
  config: NarrativeSystemConfig,
  usedHooks: UsedHooksTracker = {},
  lastSpoken: Record<string, string> = {},
  phaseFlags: Record<string, boolean> = {}
): TriggeredNarrative[] {
  // Helper: Generate unique key for deduplication
  const getKey = (hook: NarrativeHook, ctx: BattleContext) => {
    const text = typeof hook.text === 'function' ? hook.text(ctx) : hook.text;
    const baseText = Array.isArray(text) ? text[0] : text;
    return `${hook.speaker}_${baseText}`;
  };

  // Helper: Check if this is a threshold/phase hook (by convention: add .phaseFlag to hook in future for more control)
  const isThresholdHook = (hook: NarrativeHook) => {
    // Example: chi/health/phase-based hooks (customize as needed)
    return (
      hook.text.toString().toLowerCase().includes('chi') ||
      hook.text.toString().toLowerCase().includes('health') ||
      hook.text.toString().toLowerCase().includes('phase')
    );
  };

  // Gather all candidate hooks
  const allHooks: NarrativeHook[] = [
    ...(config.characterHooks[ctx.actor.name] || []),
    ...config.narratorHooks,
    ...config.globalHooks
  ];

  // Filter and evaluate hooks
  const triggeredNarratives: TriggeredNarrative[] = [];
  const usedThisTurn = new Set<string>();

  for (const hook of allHooks) {
    // Skip if this hook has been used before (one-time hooks)
    const hookKey = getKey(hook, ctx);
    if (usedHooks[hookKey]) continue;

    // Skip if this actor has already spoken this turn
    if (usedThisTurn.has(hook.speaker)) continue;

    // Skip if this is the same line as last spoken by this actor
    const lastLine = lastSpoken[hook.speaker];
    if (lastLine && lastLine === hookKey) continue;

    // Skip threshold hooks unless we're crossing a threshold
    if (isThresholdHook(hook) && !phaseFlags[hookKey]) continue;

    // Evaluate hook condition
    if (!hook.when(ctx)) continue;

    // Generate text
    const text = hook.text(ctx);
    const finalText = Array.isArray(text) ? text[Math.floor(Math.random() * text.length)] : text;

    // Create triggered narrative
    const narrative: TriggeredNarrative = {
      id: `${hook.speaker}_${Date.now()}_${Math.random()}`,
      speaker: hook.speaker,
      text: finalText,
      mood: hook.mood,
      priority: hook.priority || 1,
      timestamp: Date.now()
    };

    triggeredNarratives.push(narrative);
    usedThisTurn.add(hook.speaker);

    // Stop if we've reached the maximum hooks per turn
    if (triggeredNarratives.length >= config.maxHooksPerTurn) break;
  }

  // Sort by priority and return
  return triggeredNarratives.sort((a, b) => b.priority - a.priority);
} 