/**
 * @fileoverview String Substitution for Narrative Templates
 * @description Handles token replacement in narrative templates with character data and context.
 * @version 1.0
 */

'use strict';

/**
 * Substitutes placeholder tokens in a template string with dynamic data.
 * @param {string} template - The string containing tokens (e.g., "{actorName} attacks.").
 * @param {object} primaryActor - The primary character for context (e.g., attacker).
 * @param {object} secondaryActor - The secondary character for context (e.g., defender).
 * @param {object} [additionalContext={}] - An object with extra data for substitution.
 * @returns {string} The template with tokens replaced by values.
 */
export function substituteTokens(template, primaryActor, secondaryActor, additionalContext = {}) {
    if (typeof template !== 'string' || !template) {
        console.warn('substituteTokens received an invalid template:', template);
        return '';
    }

    const safeActor = primaryActor || {};
    const safeOpponent = secondaryActor || {};

    const safeActorPronouns = safeActor.pronouns || { s: 'they', p: 'their', o: 'them' };
    const safeOpponentPronouns = safeOpponent.pronouns || { s: 'they', p: 'their', o: 'them' };

    const winnerPronouns = (additionalContext.WinnerName === safeActor.name) ? safeActorPronouns : safeOpponentPronouns;
    const loserPronouns = (additionalContext.LoserName === safeActor.name) ? safeActorPronouns : safeOpponentPronouns;

    const replacements = {
        '{actorName}': additionalContext.attackerName || safeActor.name || 'A fighter',
        '{opponentName}': additionalContext.targetName || safeOpponent.name || 'their opponent',
        '{targetName}': additionalContext.targetName || safeOpponent.name || 'their opponent',
        '{attackerName}': additionalContext.attackerName || safeActor.name || 'A fighter',
        '{WinnerName}': additionalContext.WinnerName || 'The victor',
        '{LoserName}': additionalContext.LoserName || 'The fallen',
        '{characterName}': additionalContext.characterName || safeActor.name || 'A fighter',
        '{actor.s}': safeActorPronouns.s,
        '{actor.p}': safeActorPronouns.p,
        '{actor.o}': safeActorPronouns.o,
        '{opponent.s}': safeOpponentPronouns.s,
        '{opponent.p}': safeOpponentPronouns.p,
        '{opponent.o}': safeOpponentPronouns.o,
        '{WinnerPronounS}': winnerPronouns.s,
        '{WinnerPronounP}': winnerPronouns.p,
        '{WinnerPronounO}': winnerPronouns.o,
        '{LoserPronounS}': loserPronouns.s,
        '{LoserPronounP}': loserPronouns.p,
        '{LoserPronounO}': loserPronouns.o,
        '{possessive}': safeActorPronouns.p,
        ...additionalContext
    };

    let text = template;
    for (const [token, value] of Object.entries(replacements)) {
        if (value !== undefined && value !== null) {
            // Capitalize if it's the start of the string
            text = text.replace(new RegExp(token.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), String(value));
        }
    }
    return text.charAt(0).toUpperCase() + text.slice(1);
} 