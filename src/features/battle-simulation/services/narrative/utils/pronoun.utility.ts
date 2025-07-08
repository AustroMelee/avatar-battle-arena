// Used via dynamic registry in Narrative system. See SYSTEM ARCHITECTURE.MD for flow.
import { PRONOUN_SETS } from '../pronouns.data';
import type { Character } from '@/common/types';

/**
 * Substitutes pronoun placeholders in a narrative template string.
 * @param template The string with placeholders (e.g., "{actor_subject} attacks {target_object}").
 * @param actor The character performing the action.
 * @param target The character being targeted.
 * @returns The formatted string with pronouns.
 */
export function substitutePronouns(template: string, actor: Character, target?: Character): string {
  let result = template;

  const actorPronouns = PRONOUN_SETS[actor.pronounId];
  if (actorPronouns) {
    result = result
      .replace(/\{actor_subject\}/g, actorPronouns.subject)
      .replace(/\{actor_object\}/g, actorPronouns.object)
      .replace(/\{actor_possessive\}/g, actorPronouns.possessive)
      .replace(/\{actor_reflexive\}/g, actorPronouns.reflexive);
  }

  if (target) {
    const targetPronouns = PRONOUN_SETS[target.pronounId];
    if (targetPronouns) {
      result = result
        .replace(/\{target_subject\}/g, targetPronouns.subject)
        .replace(/\{target_object\}/g, targetPronouns.object)
        .replace(/\{target_possessive\}/g, targetPronouns.possessive)
        .replace(/\{target_reflexive\}/g, targetPronouns.reflexive);
    }
  }

  // Also substitute names
  result = result.replace(/\{actor\}/g, actor.name);
  if (target) {
    result = result.replace(/\{target\}/g, target.name);
  }

  return result;
}
