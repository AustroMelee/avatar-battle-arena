// CONTEXT: Narrative System, // FOCUS: Template-Based Narrative Generation
import type { BattleContext, TriggeredNarrative, CharacterMood } from './types';
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
  // config: NarrativeSystemConfig
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
        mood: determineMoodFromTone(ctx.narrativeTone) as CharacterMood,
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
        mood: undefined,
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

// Basic Strike flavor pools
const BASIC_STRIKE_GENERAL = [
  'A swift jab aimed for the opponent\'s center.',
  'A sharp kick slices through the dust between them.',
  'A sudden elbow catches the air, searching for an opening.',
  'A quick feint, then a low strike that tests defenses.',
  'A burst of movement—simple, direct, relentless.',
  'A lunging attack, more muscle than art.',
  'A spinning sweep, delivered with practiced precision.'
];
const BASIC_STRIKE_AANG = [
  'A blast of wind-charged motion, light but insistent.',
  'A staff jab, air swirling at its tip.',
  'A gliding step—Aang\'s footwork turns defense into sudden offense.',
  'A gust-driven palm strike, dancing just past Azula\'s guard.',
  'A circular sweep of the staff, harnessing the room\'s air to push Azula back.',
  'A playful feint turns into a real threat—air bends around Aang\'s heel.'
];
const BASIC_STRIKE_AZULA = [
  'A crackling backhand, blue flames flickering at her knuckles.',
  'A precise heel kick, sparks scattering where her foot lands.',
  'A whip-fast elbow, fire licking the air behind the blow.',
  'A contemptuous snap of the wrist, flame following her motion.',
  'A thrusting strike, her movements razor-sharp, coldly efficient.',
  'A low sweep, heat radiating from every inch of Azula\'s motion.'
];

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
  } else if (ctx.move && ctx.move.name === 'Basic Strike') {
    // Use themed pool for Aang, Azula, or general
    let pool = BASIC_STRIKE_GENERAL;
    if (ctx.actor.name === 'Aang') pool = BASIC_STRIKE_AANG;
    else if (ctx.actor.name === 'Azula') pool = BASIC_STRIKE_AZULA;
    text = pool[Math.floor(Math.random() * pool.length)];
    mood = 'neutral';
  } else {
    // Remove mechanical fallback like 'uses Basic Strike' or 'is forced to escalate the battle!'
    text = '';
    mood = 'neutral';
  }
  // If text is empty, return null to omit the log entry
  if (!text.trim()) return null;
  
  return {
    id: generateUniqueLogId('template'),
    speaker: ctx.actor.name,
    text,
    mood: mood as CharacterMood,
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