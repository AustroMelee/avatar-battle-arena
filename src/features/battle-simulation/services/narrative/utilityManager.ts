// CONTEXT: Narrative System, // FOCUS: Utility Management
import type { TriggeredNarrative, BattleContext } from './types';
import type { UsedHooksTracker } from './hookNarrativeGenerator';

/**
 * @description Creates a new used hooks tracker
 * @returns Empty used hooks tracker
 */
export function createUsedHooksTracker(): UsedHooksTracker {
  return {};
}

/**
 * @description Updates the used hooks tracker with new narratives
 * @param narratives - Narratives that were triggered
 * @param usedHooks - Current used hooks tracker
 * @returns Updated used hooks tracker
 */
export function updateUsedHooks(
  narratives: TriggeredNarrative[],
  usedHooks: UsedHooksTracker
): UsedHooksTracker {
  const updated = { ...usedHooks };
  
  for (const narrative of narratives) {
    // Mark this specific narrative as used
    updated[narrative.id] = true;
    
    // Also mark by speaker and text for deduplication
    const key = `${narrative.speaker}_${narrative.text}`;
    updated[key] = true;
  }
  
  return updated;
}

/**
 * @description Debug utility for narrative evaluation
 * @param ctx - Battle context
 * @param narratives - Triggered narratives
 */
export function debugNarrativeEvaluation(
  ctx: BattleContext,
  narratives: TriggeredNarrative[]
): void {
  console.group('Narrative Evaluation Debug');
  console.log('Battle Context:', {
    actor: ctx.actor.name,
    target: ctx.target.name,
    move: ctx.move.name,
    turn: ctx.turnIndex,
    phase: ctx.battlePhase,
    tone: ctx.narrativeTone,
    intensity: ctx.narrativeIntensity,
    focus: ctx.narrativeFocus
  });
  
  console.log('Mechanical State:', ctx.mechanics);
  
  console.log('Triggered Narratives:', narratives.map(n => ({
    speaker: n.speaker,
    text: n.text,
    mood: n.mood,
    priority: n.priority
  })));
  
  console.groupEnd();
} 