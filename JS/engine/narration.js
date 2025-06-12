// FILE: engine/narration.js
'use strict';

// This is the "Storyteller" module. It is responsible for generating all
// human-readable text from battle events, including move descriptions,
// flavor text, victory summaries, and final quotes.

// --- IMPORTS (PATHS CORRECTED) ---
import { characters } from '../data/characters.js';
//- OLD PATH: ../js/narrative-v2.js
//+ NEW PATH: ../narrative-v2.js
import { phaseTemplates, impactPhrases, postBattleVictoryPhrases } from '../narrative-v2.js';
//- OLD PATH: ../js/narrative-flavor.js
//+ NEW PATH: ../narrative-flavor.js
import { emotionalFlavor, tacticalFlavor } from '../narrative-flavor.js';

// --- HELPER FUNCTIONS ---
const getRandomElement = (arr, fallback = null) => arr?.[Math.floor(Math.random() * arr.length)] || fallback;
const isReactive = (defender) => defender.lastMove?.type === 'Offense';

function conjugateVerb(verb) {
    if (!verb) return '';
    const verbParts = verb.split(' ');
    const mainVerb = verbParts.shift();
    const remainder = verbParts.join(' ');
    if (mainVerb.endsWith('s')) return verb;
    if (mainVerb.endsWith('y') && !['a', 'e', 'i', 'o', 'u'].includes(mainVerb.slice(-2, -1))) return mainVerb.slice(0, -1) + 'ies' + (remainder ? ' ' + remainder : '');
    if (/(s|sh|ch|x|z|o)$/.test(mainVerb)) return verb + 'es';
    return verb + 's';
}

function assembleObjectPhrase(move) {
    if (!move.object) return move.name;
    if (move.requiresArticle) {
        const firstLetter = move.object.charAt(0).toLowerCase();
        const article = ['a', 'e', 'i', 'o', 'u'].includes(firstLetter) ? 'an' : 'a';
        return `${article} ${move.object}`;
    }
    return move.object;
}

function getVictoryQuote(character, battleContext) {
    const quotes = character.quotes;
    if (!quotes) return null;
    const { opponentId, isDominant, isCloseCall } = battleContext;
    if (opponentId && quotes.postWin_specific?.[opponentId]) return getRandomElement([].concat(quotes.postWin_specific[opponentId]));
    if (isDominant && quotes.postWin_overwhelming) return getRandomElement([].concat(quotes.postWin_overwhelming));
    if (isCloseCall && quotes.postWin_reflective) return getRandomElement([].concat(quotes.postWin_reflective));
    return getRandomElement([].concat(quotes.postWin));
}

// --- EXPORTED NARRATION FUNCTIONS ---
export function narrateMove(actor, target, move, result) {
    const actorSpan = `<span class="char-${actor.id}">${actor.name}</span>`;
    const targetSpan = `<span class="char-${target.id}">${target.name}</span>`;
    let tacticalPrefix = '';
    let tacticalSuffix = '';

    if(result.payoff && result.consumedStateName) {
        const flavorPool = tacticalFlavor.consume[result.consumedStateName] || tacticalFlavor.consume.generic;
        tacticalPrefix = getRandomElement([].concat(flavorPool)).replace(/{targetName}/g, targetSpan) + ' ';
    } 
    else if (move.setup && result.effectiveness.label !== 'Weak') {
        const flavorPool = tacticalFlavor.apply[move.setup.name] || tacticalFlavor.apply.generic;
        tacticalSuffix = ' ' + getRandomElement([].concat(flavorPool)).replace(/{actorName}/g, actorSpan).replace(/{targetName}/g, targetSpan).replace(/{element}/g, move.element);
    } 
    else if (target.tacticalState) {
        const flavorPool = tacticalFlavor.has_state[target.tacticalState.name] || tacticalFlavor.has_state.generic;
        tacticalPrefix = getRandomElement([].concat(flavorPool)).replace(/{targetName}/g, targetSpan) + ' ';
    }
    
    let emotionalPrefix = '';
    if (actor.mentalStateChangedThisTurn) {
        const pool = emotionalFlavor[actor.id]?.[actor.mentalState.level] || emotionalFlavor.generic?.[actor.mentalState.level];
        if (pool) emotionalPrefix = getRandomElement(pool).replace(/{actorName}/g, actor.name).replace(/{possessive}/g, actor.pronouns.p) + ' ';
    }
    
    if (move.type === 'Defense' || move.type === 'Utility') {
        const reactive = isReactive(target);
        let impactSentence = getRandomElement(reactive ? impactPhrases.DEFENSE.REACTIVE : impactPhrases.DEFENSE.PROACTIVE).replace(/{actorName}/g, actorSpan).replace(/{possessive}/g, actor.pronouns.p);
        const desc = `${emotionalPrefix}${tacticalPrefix}${actorSpan} uses the ${move.name}. ${impactSentence}${tacticalSuffix}`;
        return phaseTemplates.move.replace(/{actorId}/g, actor.id).replace(/{actorName}/g, actor.name).replace(/{moveName}/g, move.name).replace(/{moveEmoji}/g, '🛡️').replace(/{effectivenessLabel}/g, reactive ? "Counter" : "Set-up").replace(/{effectivenessEmoji}/g, '🛡️').replace(/{moveDescription}/g, desc.replace(/\s+/g, ' ').trim());
    }
    const impactSentence = getRandomElement(impactPhrases.DEFAULT[result.effectiveness.label.toUpperCase()]).replace(/{targetName}/g, targetSpan);
    const fullDesc = `${emotionalPrefix}${tacticalPrefix}${actorSpan} ${conjugateVerb(move.verb || 'executes')} ${assembleObjectPhrase(move)}. ${impactSentence}${tacticalSuffix}`;
    return phaseTemplates.move.replace(/{actorId}/g, actor.id).replace(/{actorName}/g, actor.name).replace(/{moveName}/g, move.name).replace(/{moveEmoji}/g, '⚔️').replace(/{effectivenessLabel}/g, result.effectiveness.label).replace(/{effectivenessEmoji}/g, result.effectiveness.emoji).replace(/{moveDescription}/g, fullDesc.replace(/\s+/g, ' ').trim());
}

export function generateOutcomeSummary(winner) {
    const moveTypes = winner.moveHistory.map(m => m.type);
    const mostUsedType = ['Finisher', 'Offense', 'Defense', 'Utility'].map(type => ({ type, count: moveTypes.filter(t => t === type).length })).sort((a,b) => b.count - a.count)[0]?.type || 'versatile';
    const summaryMap = { 'Finisher': 'decisive finishing moves', 'Offense': 'relentless offense', 'Defense': 'impenetrable defense', 'Utility': 'clever tactical maneuvers', 'versatile': 'sheer versatility' };
    return `${winner.name}'s victory was sealed by ${winner.pronouns.p} ${summaryMap[mostUsedType]}.`;
}

export function getToneAlignedVictoryEnding(winnerId, loserId, battleContext) {
    const winnerChar = characters[winnerId];
    const loserChar = characters[loserId];
    const archetypePool = postBattleVictoryPhrases[winnerChar.victoryStyle] || postBattleVictoryPhrases.default;
    const endingTemplate = battleContext.isCloseCall ? (archetypePool.narrow || archetypePool.dominant) : archetypePool.dominant;
    let populatedEnding = endingTemplate.replace(/{WinnerName}/g, `<span class="char-${winnerId}">${winnerChar.name}</span>`).replace(/{LoserName}/g, `<span class="char-${loserId}">${loserChar.name}</span>`).replace(/{WinnerPronounP}/g, winnerChar.pronouns.p);
    const finalQuote = getVictoryQuote(winnerChar, battleContext);
    if (finalQuote) populatedEnding += ` "${finalQuote}"`;
    return populatedEnding;
}