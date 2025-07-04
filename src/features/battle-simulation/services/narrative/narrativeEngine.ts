// CONTEXT: Narrative System, // FOCUS: Core Engine
import type { BattleContext, NarrativeHook, TriggeredNarrative, NarrativeSystemConfig } from './types';
import { characterNarratives } from './characterHooks';
import { narratorHooks } from './narratorHooks';

/**
 * @description Default narrative system configuration
 */
const DEFAULT_CONFIG: NarrativeSystemConfig = {
  characterHooks: characterNarratives,
  narratorHooks,
  globalHooks: [],
  enabled: true,
  maxHooksPerTurn: 3,
  priorityThreshold: 3
};

/**
 * @description Tracks which hooks have been used in this battle
 */
type UsedHooksTracker = {
  [hookId: string]: boolean;
};

/**
 * @description Generates a unique ID for a hook based on its content
 * @param hook - The narrative hook
 * @returns Unique identifier
 */
function generateHookId(hook: NarrativeHook): string {
  const text = typeof hook.text === 'function' ? hook.text({} as BattleContext) : hook.text;
  const baseText = Array.isArray(text) ? text[0] : text;
  return `${hook.speaker}_${baseText.substring(0, 20).replace(/\s+/g, '_')}`;
}

/**
 * @description Evaluates all narrative hooks and returns triggered ones (STRICT DEDUPLICATION)
 * Implements: no repeats per actor+line per battle, one per actor per turn, threshold/phase crossing only, no back-to-back repeats, one narrator per turn
 * @param ctx - Battle context
 * @param config - Narrative system configuration
 * @param usedHooks - Tracker for one-time hooks (per battle)
 * @param lastSpoken - Map of last spoken line per actor (per battle)
 * @param phaseFlags - Map of phase/threshold flags (per battle)
 * @returns Array of triggered narratives
 */
export function evaluateNarrativeHooks(
  ctx: BattleContext,
  config: NarrativeSystemConfig = DEFAULT_CONFIG,
  usedHooks: UsedHooksTracker = {},
  lastSpoken: Record<string, string> = {},
  phaseFlags: Record<string, boolean> = {}
): TriggeredNarrative[] {
  if (!config.enabled) {
    return [];
  }

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

  // 1. Filter: Only hooks whose .when(ctx) is true
  let candidates = allHooks.filter(hook => hook.when(ctx));

  // 2. Filter: No repeats per actor+line for the whole battle (unless repeatable flag is set in future)
  candidates = candidates.filter(hook => {
    const key = getKey(hook, ctx);
    return !usedHooks[key];
  });

  // 3. Filter: No back-to-back repeats for any actor
  candidates = candidates.filter(hook => {
    const key = getKey(hook, ctx);
    return lastSpoken[hook.speaker] !== key;
  });

  // 4. Filter: Threshold/phase-based lines fire only when crossed (not held)
  candidates = candidates.filter(hook => {
    if (!isThresholdHook(hook)) return true;
    const key = getKey(hook, ctx);
    if (phaseFlags[key]) return false;
    phaseFlags[key] = true;
    return true;
  });

  // 5. Group by actor, pick highest priority (or random among equals)
  const byActor: Record<string, NarrativeHook[]> = {};
  for (const hook of candidates) {
    if (!byActor[hook.speaker]) byActor[hook.speaker] = [];
    byActor[hook.speaker].push(hook);
  }
  const selected: NarrativeHook[] = [];
  for (const actor in byActor) {
    const hooks = byActor[actor];
    const maxPriority = Math.max(...hooks.map(h => h.priority || 0));
    const topHooks = hooks.filter(h => (h.priority || 0) === maxPriority);
    // If multiple, pick random
    const chosen = topHooks[Math.floor(Math.random() * topHooks.length)];
    selected.push(chosen);
  }

  // 6. Only one narrator line per turn (strict)
  const nonNarrator = selected.filter(h => h.speaker !== 'Narrator');
  const narratorHooks = selected.filter(h => h.speaker === 'Narrator');
  let narrator: NarrativeHook[] = [];
  if (narratorHooks.length > 0) {
    const maxPriority = Math.max(...narratorHooks.map(h => h.priority || 0));
    const topNarrator = narratorHooks.filter(h => (h.priority || 0) === maxPriority);
    narrator = [topNarrator[Math.floor(Math.random() * topNarrator.length)]];
  }
  const finalHooks = [...nonNarrator, ...narrator];

  // 7. Mark as used and update lastSpoken for next turn
  finalHooks.forEach(hook => {
    const key = getKey(hook, ctx);
    usedHooks[key] = true;
    lastSpoken[hook.speaker] = key;
  });

  // 8. Convert to TriggeredNarrative format
  const narratives: TriggeredNarrative[] = finalHooks.map(hook => {
    const text = hook.text(ctx);
    const finalText = Array.isArray(text)
      ? text[Math.floor(Math.random() * text.length)]
      : text;
    return {
      id: `${hook.speaker}_${finalText.substring(0, 20).replace(/\s+/g, '_')}_${ctx.turnIndex}`,
      speaker: hook.speaker,
      text: finalText,
      mood: hook.mood,
      priority: hook.priority || 0,
      timestamp: Date.now()
    };
  });

  return narratives;
}

/**
 * @description Updates the used hooks tracker with newly triggered hooks
 * @param narratives - Recently triggered narratives
 * @param usedHooks - Current used hooks tracker
 * @returns Updated used hooks tracker
 */
export function updateUsedHooks(
  narratives: TriggeredNarrative[],
  usedHooks: UsedHooksTracker
): UsedHooksTracker {
  const updated = { ...usedHooks };
  
  for (const narrative of narratives) {
    // Create a simple ID for tracking
    const hookId = `${narrative.speaker}_${narrative.text.substring(0, 20).replace(/\s+/g, '_')}`;
    updated[hookId] = true;
  }
  
  return updated;
}

/**
 * @description Creates a new narrative system configuration
 * @param overrides - Configuration overrides
 * @returns Complete configuration
 */
export function createNarrativeConfig(
  overrides: Partial<NarrativeSystemConfig> = {}
): NarrativeSystemConfig {
  return {
    ...DEFAULT_CONFIG,
    ...overrides
  };
}

/**
 * @description Resets the used hooks tracker for a new battle
 * @returns Empty used hooks tracker
 */
export function createUsedHooksTracker(): UsedHooksTracker {
  return {};
}

/**
 * @description Debug function to log narrative hook evaluation
 * @param ctx - Battle context
 * @param narratives - Triggered narratives
 * @param config - System configuration
 */
export function debugNarrativeEvaluation(
  ctx: BattleContext,
  narratives: TriggeredNarrative[],
  config: NarrativeSystemConfig
): void {
  // Only log in development builds
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    console.group('🎭 Narrative Hook Evaluation');
    console.log('Turn:', ctx.turnIndex);
    console.log('Phase:', ctx.battlePhase);
    console.log('Actor:', ctx.actor.name);
    console.log('Target:', ctx.target.name);
    console.log('Move:', ctx.move.name);
    console.log('Damage:', ctx.damage);
    console.log('Triggered Narratives:', narratives.length);
    
    narratives.forEach((narrative, index) => {
      console.log(`${index + 1}. [${narrative.speaker}] ${narrative.text} (Priority: ${narrative.priority})`);
    });
    
    console.groupEnd();
  }
} 