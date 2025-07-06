// CONTEXT: Narrative System, // FOCUS: Template-Based Narrative Generation
import type { BattleContext, TriggeredNarrative, NarrativeSystemConfig } from './types';
import { 
  selectNarrativeTemplate, 
  generateNarrativeText, 
  generateNarratorCommentary 
} from './narrativeTemplates';
import { generateUniqueLogId } from '../ai/logQueries';

/**
 * @description Generates narratives using the new template system
 * @param ctx - Battle context
 * @param config - Narrative system configuration
 * @returns Array of triggered narratives
 */
export function generateTemplateBasedNarratives(
  ctx: BattleContext,
  config: NarrativeSystemConfig
): TriggeredNarrative[] {
  const narratives: TriggeredNarrative[] = [];
  
  // Select appropriate template based on mechanical state
  const template = selectNarrativeTemplate(ctx);
  
  if (template) {
    // Generate character narrative
    const characterText = generateNarrativeText(template, ctx, ctx.actor.name);
    if (characterText) {
      narratives.push({
        id: generateUniqueLogId('template'),
        speaker: ctx.actor.name,
        text: characterText,
        mood: determineMoodFromTone(ctx.narrativeTone) as any,
        priority: template.priority,
        timestamp: Date.now()
      });
    }
    
    // Generate narrator commentary
    const narratorText = generateNarratorCommentary(ctx);
    if (narratorText) {
      narratives.push({
        id: generateUniqueLogId('template'),
        speaker: 'Narrator',
        text: narratorText,
        mood: 'neutral' as any,
        priority: template.priority - 1, // Slightly lower priority than character
        timestamp: Date.now()
      });
    }
  }
  
  // Fallback to basic mechanical narrative if no template matches
  if (narratives.length === 0) {
    const fallbackNarrative = generateFallbackNarrative(ctx);
    if (fallbackNarrative) {
      narratives.push(fallbackNarrative);
    }
  }
  
  return narratives;
}

/**
 * @description Generates fallback narrative when no template matches
 * @param ctx - Battle context
 * @returns Fallback narrative or null
 */
export function generateFallbackNarrative(ctx: BattleContext): TriggeredNarrative | null {
  const { mechanics } = ctx;
  
  let text = '';
  let mood: string = 'neutral';
  
  if (mechanics.forcedEscalation) {
    text = `${ctx.actor.name} is forced to escalate the battle!`;
    mood = 'furious';
  } else if (mechanics.isVulnerable && mechanics.punishDamage > 0) {
    text = `${ctx.actor.name} capitalizes on ${ctx.target.name}'s vulnerability!`;
    mood = 'calculated';
  } else if (mechanics.moveRepetition >= 3) {
    text = `${ctx.actor.name}'s attacks become predictable.`;
    mood = 'desperate';
  } else if (mechanics.isHighDamage) {
    text = `${ctx.actor.name}'s attack lands with devastating force!`;
    mood = 'confident';
  } else if (mechanics.isLowDamage) {
    text = `${ctx.actor.name}'s attack lacks power.`;
    mood = 'defensive';
  } else {
    text = `${ctx.actor.name} uses ${ctx.move.name}.`;
    mood = 'neutral';
  }
  
  return {
    id: generateUniqueLogId('template'),
    speaker: ctx.actor.name,
    text,
    mood: mood as any,
    priority: 1,
    timestamp: Date.now()
  };
}

/**
 * @description Determines mood from narrative tone
 * @param tone - Narrative tone
 * @returns Corresponding mood
 */
export function determineMoodFromTone(tone: string): string {
  switch (tone) {
    case 'desperate': return 'desperate';
    case 'confident': return 'confident';
    case 'furious': return 'furious';
    case 'calculated': return 'stoic';
    case 'chaotic': return 'furious';
    case 'defensive': return 'worried';
    case 'aggressive': return 'furious';
    default: return 'neutral';
  }
} 