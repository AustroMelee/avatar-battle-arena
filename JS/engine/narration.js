// FILE: engine/narration.js
'use strict';

// This is the "Action Narrator" module. It is only responsible for describing
// the physical execution of a move. All character dialogue is now handled by narrative-engine.js.

import { characters } from '../data/characters.js';
import { phaseTemplates, impactPhrases, postBattleVictoryPhrases } from '../narrative-v2.js';

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const isReactive = (defender) => defender.lastMove?.type === 'Offense';

function conjugateVerb(verb) {
    if (!verb) return '';
    const verbParts = verb.split(' ');
    const mainVerb = verbParts.shift();
    if (mainVerb.endsWith('s')) return verb;
    const remainder = verbParts.length > 0 ? ' ' + verbParts.join(' ') : '';
    if (mainVerb.endsWith('y') && !['a', 'e', 'i', 'o', 'u'].includes(mainVerb.slice(-2, -1))) return mainVerb.slice(0, -1) + 'ies' + remainder;
    if (/(s|sh|ch|x|z|o)$/.test(mainVerb)) return verb + 'es';
    return verb + 's';
}

function assembleObjectPhrase(move) {
    if (!move.object) return move.name;
    if (move.requiresArticle) {
        const article = ['a', 'e', 'i', 'o', 'u'].includes(move.object.charAt(0).toLowerCase()) ? 'an' : 'a';
        return `${article} ${move.object}`;
    }
    return move.object;
}

function getVictoryQuote(character, context) {
    const quotes = character.quotes;
    if (!quotes) return null;
    if (context.opponentId && quotes.postWin_specific?.[context.opponentId]) return getRandomElement([].concat(quotes.postWin_specific[context.opponentId]));
    if (context.isDominant && quotes.postWin_overwhelming) return getRandomElement([].concat(quotes.postWin_overwhelming));
    if (context.isCloseCall && quotes.postWin_reflective) return getRandomElement([].concat(quotes.postWin_reflective));
    return getRandomElement([].concat(quotes.postWin));
}

export function narrateMove(actor, target, move, result) {
    const actorSpan = `<span class="char-${actor.id}">${actor.name}</span>`;
    const targetSpan = `<span class="char-${target.id}">${target.name}</span>`;
    let tacticalPrefix = '';
    let tacticalSuffix = '';

    // Tactical flavor text for setups and payoffs remains here
    if(result.payoff && result.consumedStateName) tacticalPrefix = `Capitalizing on ${targetSpan} being ${result.consumedStateName}, `;
    else if (move.setup && result.effectiveness.label !== 'Weak') tacticalSuffix = ` The move leaves ${targetSpan} ${move.setup.name}!`;

    if (move.type === 'Defense' || move.type === 'Utility') {
        const reactive = isReactive(target);
        const impactSentence = getRandomElement(reactive ? impactPhrases.DEFENSE.REACTIVE : impactPhrases.DEFENSE.PROACTIVE).replace(/{actorName}/g, actorSpan).replace(/{possessive}/g, actor.pronouns.p);
        const desc = `${tacticalPrefix}${actorSpan} uses the ${move.name}. ${impactSentence}${tacticalSuffix}`;
        return phaseTemplates.move.replace(/{actorId}/g, actor.id).replace(/{actorName}/g, actor.name).replace(/{moveName}/g, move.name).replace(/{moveEmoji}/g, '🛡️').replace(/{effectivenessLabel}/g, reactive ? "Counter" : "Set-up").replace(/{effectivenessEmoji}/g, '🛡️').replace(/{moveDescription}/g, desc.trim());
    }

    const impactSentence = getRandomElement(impactPhrases.DEFAULT[result.effectiveness.label.toUpperCase()]).replace(/{targetName}/g, targetSpan);
    const fullDesc = `${tacticalPrefix}${actorSpan} ${conjugateVerb(move.verb || 'executes')} ${assembleObjectPhrase(move)}. ${impactSentence}${tacticalSuffix}`;
    return phaseTemplates.move.replace(/{actorId}/g, actor.id).replace(/{actorName}/g, actor.name).replace(/{moveName}/g, move.name).replace(/{moveEmoji}/g, '⚔️').replace(/{effectivenessLabel}/g, result.effectiveness.label).replace(/{effectivenessEmoji}/g, result.effectiveness.emoji).replace(/{moveDescription}/g, fullDesc.trim());
}

export function generateOutcomeSummary(winner) {
    const moveTypes = winner.moveHistory.map(m => m.type);
    const mostUsedType = ['Finisher', 'Offense', 'Defense', 'Utility'].map(type => ({ type, count: moveTypes.filter(t => t === type).length })).sort((a,b) => b.count - a.count)[0]?.type || 'versatile';
    const summaryMap = { 'Finisher': 'decisive finishing moves', 'Offense': 'relentless offense', 'Defense': 'impenetrable defense', 'Utility': 'clever tactical maneuvers', 'versatile': 'sheer versatility' };
    return `${winner.name}'s victory was sealed by ${winner.pronouns.p} ${summaryMap[mostUsedType]}.`;
}

export function getToneAlignedVictoryEnding(winnerId, loserId, context) {
    const winnerChar = characters[winnerId];
    const loserChar = characters[loserId];
    const archetypePool = postBattleVictoryPhrases[winnerChar.victoryStyle] || postBattleVictoryPhrases.default;
    const endingTemplate = context.isCloseCall ? (archetypePool.narrow || archetypePool.dominant) : archetypePool.dominant;
    let populatedEnding = endingTemplate.replace(/{WinnerName}/g, `<span class="char-${winnerId}">${winnerChar.name}</span>`).replace(/{LoserName}/g, `<span class="char-${loserId}">${loserChar.name}</span>`).replace(/{WinnerPronounP}/g, winnerChar.pronouns.p);
    const finalQuote = getVictoryQuote(winnerChar, context);
    if (finalQuote) populatedEnding += ` ${getVictoryQuote(winnerChar, context)}`;
    return populatedEnding;
}