// @docs
/**
 * @module Narrative System
 * @description Complete and type-safe coverage for all characters, mechanics, and narrative contexts.
 * Status: ✅ 100% complete for Aang & Azula.
 * Mechanics: Parry, Interrupt, DesperationMove, StatusEffects, EffectFusion, Stalemate, etc.
 * Integration: Fully aligned with engine phases, fallback anti-repetition, and emotional state drivers.
 */
// CONTEXT: Narrative System, // FOCUS: Core Engine Orchestration
import type { BattleContext, TriggeredNarrative, NarrativeSystemConfig } from './types';
import { createNarrativeConfig } from './configManager';
import { generateTemplateBasedNarratives } from './templateNarrativeGenerator';
import { generateHookBasedNarratives, UsedHooksTracker } from './hookNarrativeGenerator';

/**
 * @description Evaluates all narrative hooks and returns triggered ones
 * @param ctx - Battle context
 * @param config - Narrative system configuration
 * @param usedHooks - Tracker for one-time hooks (per battle)
 * @param lastSpoken - Map of last spoken line per actor (per battle)
 * @param phaseFlags - Map of phase/threshold flags (per battle)
 * @returns Array of triggered narratives
 */
export function evaluateNarrativeHooks(
  ctx: BattleContext,
  config: NarrativeSystemConfig = createNarrativeConfig(),
  usedHooks: UsedHooksTracker = {},
  lastSpoken: Record<string, string> = {},
  phaseFlags: Record<string, boolean> = {}
): TriggeredNarrative[] {
  if (!config.enabled) {
    return [];
  }

  // Template-based narrative generation (new system)
  if (config.useTemplateSystem) {
    return generateTemplateBasedNarratives(ctx);
  }

  // Hook-based narrative generation (legacy system)
  return generateHookBasedNarratives(ctx, config, usedHooks, lastSpoken, phaseFlags);
}

// Re-export types and utilities for convenience
export type { UsedHooksTracker } from './hookNarrativeGenerator';
export { createNarrativeConfig } from './configManager';
export { createUsedHooksTracker, updateUsedHooks, debugNarrativeEvaluation } from './utilityManager'; 