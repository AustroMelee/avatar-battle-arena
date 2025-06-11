'use strict';

import { characters } from './characters.js';
import { locations, terrainTags } from './locations.js';
import { battlePhases, effectivenessLevels, phaseTemplates, postBattleVictoryPhrases, introductoryPhrases, verbSynonyms, impactPhrases, adverbPool, narrativeStatePhrases } from './narrative-v2.js';

// --- HELPER FUNCTIONS ---
const getRandomElement = (arr, fallback = null) => (!arr || arr.length === 0) ? fallback : arr[Math.floor(Math.random() * arr.length)];
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

// --- GRAMMAR & NARRATIVE SUB-SYSTEM ---
function conjugateVerb(verb) {
    if (!verb) return '';
    const verbParts = verb.split(' ');
    const mainVerb = verbParts.shift();
    const remainder = verbParts.join(' ');
    let conjugated;
    if (mainVerb.endsWith('y') && !['a', 'e', 'i', 'o', 'u'].includes(mainVerb.slice(-2, -1))) {
        conjugated = mainVerb.slice(0, -1) + 'ies';
    } else if (/(s|sh|ch|x|z|o)$/.test(mainVerb)) {
        conjugated = mainVerb + 'es';
    } else {
        conjugated = mainVerb + 's';
    }
    return remainder ? `${conjugated} ${remainder}` : conjugated;
}

function assembleObjectPhrase(move) {
    if (!move.object) return '';
    if (move.requiresArticle) {
        const firstLetter = move.object.charAt(0).toLowerCase();
        const article = ['a', 'e', 'i', 'o', 'u'].includes(firstLetter) ? 'an' : 'a';
        return `${article} ${move.object}`;
    }
    return move.object;
}

function getVictoryQuote(character, battleContext) {
    if (!character || !character.quotes) return "Victory is mine.";
    const { opponentId } = battleContext;
    const quotes = character.quotes;
    const quotePool = [];
    if (opponentId && quotes.postWin_specific?.[opponentId]) quotePool.push(...[].concat(quotes.postWin_specific[opponentId]));
    if (battleContext.isDominant && quotes.postWin_overwhelming) quotePool.push(...[].concat(quotes.postWin_overwhelming));
    if (battleContext.isCloseCall && quotes.postWin_reflective) quotePool.push(...[].concat(quotes.postWin_reflective));
    if (quotes.postWin) quotePool.push(...[].concat(quotes.postWin));
    return getRandomElement(quotePool) || "The battle is won.";
}

function getToneAlignedVictoryEnding(winnerId, loserId, battleContext) {
    const winnerChar = characters[winnerId];
    const loserChar = characters[loserId];
    const archetypePool = postBattleVictoryPhrases[winnerChar.victoryStyle] || postBattleVictoryPhrases.default;
    const endingTemplate = battleContext.isCloseCall ? (archetypePool.narrow || archetypePool.dominant) : archetypePool.dominant;
    
    const finalQuote = getVictoryQuote(winnerChar, battleContext);
    
    let populatedEnding = endingTemplate
        .replace(/{WinnerName}/g, `<span class="char-${winnerId}">${winnerChar.name}</span>`)
        .replace(/{LoserName}/g, `<span class="char-${loserId}">${loserChar.name}</span>`)
        .replace(/{WinnerPronounP}/g, winnerChar.pronouns.p);

    if (finalQuote && !populatedEnding.includes(finalQuote)) {
        populatedEnding += ` "${finalQuote}"`;
    }
    return populatedEnding;
}

// --- BATTLE STATE & SIMULATION ---
function initializeFighterState(charId) {
    const character = characters[charId];
    return { id: charId, name: character.name, ...JSON.parse(JSON.stringify(character)), hp: 100, energy: 100, momentum: 0, lastMove: null, movesUsed: new Set(), lastPrefix: '' };
}

export function simulateBattle(f1Id, f2Id, locId) {
    let fighter1 = initializeFighterState(f1Id);
    let fighter2 = initializeFighterState(f2Id);
    const locTags = terrainTags[locId] || [];
    let battleLog = [];
    let turn = 0;
    const maxTurns = 6;
    let initiator = (fighter1.powerTier > fighter2.powerTier) ? fighter1 : fighter2;
    let responder = (initiator.id === fighter1.id) ? fighter2 : fighter1;

    while (fighter1.hp > 0 && fighter2.hp > 0 && turn < maxTurns) {
        let phaseContent = phaseTemplates.header.replace('{phaseName}', battlePhases[turn].name).replace('{phaseEmoji}', battlePhases[turn].emoji);
        
        const initiatorMove = selectMove(initiator);
        const initiatorResult = calculateMove(initiatorMove, initiator, responder, locTags);
        phaseContent += narrateMove(initiator, responder, initiatorMove, initiatorResult);
        responder.hp -= initiatorResult.damage;
        initiator.energy -= Math.round((initiatorMove.power || 0) * 0.5);
        initiator.lastMove = initiatorMove;
        initiator.movesUsed.add(initiatorMove.name);
        
        const momentumShift = initiatorResult.damage;
        initiator.momentum += momentumShift > 0 ? 1 : -0.5;

        if (responder.hp <= 0) {
            battleLog.push(phaseTemplates.phaseWrapper.replace('{phaseName}', battlePhases[turn].name).replace('{phaseContent}', phaseContent));
            break; 
        }

        const responderMove = selectMove(responder);
        const responderResult = calculateMove(responderMove, responder, initiator, locTags);
        phaseContent += narrateMove(responder, initiator, responderMove, responderResult);
        initiator.hp -= responderResult.damage;
        responder.energy -= Math.round((responderMove.power || 0) * 0.5);
        responder.lastMove = responderMove;
        responder.movesUsed.add(responderMove.name);
        
        responder.momentum += responderResult.damage > 0 ? 1 : -0.5;
        
        if (initiator.hp <= 0) {
             battleLog.push(phaseTemplates.phaseWrapper.replace('{phaseName}', battlePhases[turn].name).replace('{phaseContent}', phaseContent));
            break;
        }

        fighter1.hp = clamp(fighter1.hp, 0, 100); fighter2.hp = clamp(fighter2.hp, 0, 100);
        fighter1.energy = clamp(fighter1.energy, 0, 100); fighter2.energy = clamp(fighter2.energy, 0, 100);
        fighter1.momentum = clamp(fighter1.momentum, -3, 3); fighter2.momentum = clamp(fighter2.momentum, -3, 3);
        
        battleLog.push(phaseTemplates.phaseWrapper.replace('{phaseName}', battlePhases[turn].name).replace('{phaseContent}', phaseContent));
        [initiator, responder] = [responder, initiator];
        turn++;
    }

    const winner = (fighter1.hp > fighter2.hp) ? fighter1 : fighter2;
    const loser = (winner.id === fighter1.id) ? fighter2 : fighter1;
    const battleContext = { isCloseCall: winner.hp < 35, isDominant: loser.hp <= 0 && winner.hp > 75, opponentId: loser.id };
    const finalEnding = getToneAlignedVictoryEnding(winner.id, loser.id, battleContext);
    
    battleLog.push(phaseTemplates.finalBlow.replace(/{winnerName}/g, `<span class="char-${winner.id}">${winner.name}</span>`).replace(/{loserName}/g, `<span class="char-${loser.id}">${loser.name}</span>`));
    battleLog.push(phaseTemplates.conclusion.replace('{endingNarration}', finalEnding));

    return { log: battleLog.join(''), winnerId: winner.id, loserId: loser.id, finalState: { fighter1, fighter2 } };
}

// --- MOVE AI & CALCULATION ---
function selectMove(actor) {
    let suitableMoves = actor.techniques.filter(m => !actor.movesUsed.has(m.name) || actor.movesUsed.size > actor.techniques.length - 2);
    if (suitableMoves.length === 0) suitableMoves = actor.techniques;
    if (actor.hp > 25 && actor.energy > 40 && suitableMoves.some(m => m.type === 'Finisher')) {
        return getRandomElement(suitableMoves.filter(m => m.type === 'Finisher'));
    }
    if (actor.hp < 40 && actor.energy > 20 && suitableMoves.some(m => m.type === 'Defense')) {
        return getRandomElement(suitableMoves.filter(m => m.type === 'Defense'));
    }
    const offenses = suitableMoves.filter(m => m.type === 'Offense');
    if (offenses.length > 0) return getRandomElement(offenses);
    return getRandomElement(actor.techniques);
}

function calculateMove(move, attacker, defender, locTags) {
    let basePower = move.power || 30;
    let multiplier = 1.0;
    if (attacker.strengths?.some(s => locTags.includes(s))) multiplier += 0.25;
    if (attacker.weaknesses?.some(w => locTags.includes(w))) multiplier -= 0.25;
    if (move.type === 'Offense' && defender.lastMove?.type === 'Utility') multiplier += 0.15;
    if (move.type === 'Defense' && defender.lastMove?.type === 'Offense') basePower *= 0.5;
    multiplier += (Math.random() - 0.5) * 0.2;
    const totalEffectiveness = basePower * multiplier;
    let level;
    if (totalEffectiveness < basePower * 0.7) level = effectivenessLevels.WEAK;
    else if (totalEffectiveness > basePower * 1.3) level = effectivenessLevels.CRITICAL;
    else if (totalEffectiveness > basePower * 1.1) level = effectivenessLevels.STRONG;
    else level = effectivenessLevels.NORMAL;
    const damage = move.type.includes('Offense') ? Math.round(totalEffectiveness / 3) : 0;
    return { effectiveness: level, damage: clamp(damage, 0, 50) };
}

// --- NARRATIVE DIRECTOR ---
function narrateMove(actor, target, move, result) {
    const actorSpan = `<span class="char-${actor.id}">${actor.name}</span>`;
    const targetSpan = `<span class="char-${target.id}">${target.name}</span>`;
    
    if (move.type === 'Defense' || move.type === 'Utility') {
        const isReactive = target.lastMove?.type === 'Offense';
        const impactTemplates = isReactive ? impactPhrases.DEFENSE.REACTIVE : impactPhrases.DEFENSE.PROACTIVE;
        const description = (isReactive ? `Reacting quickly, ${actorSpan} uses the ${move.name} to intercept ${targetSpan}'s assault. ` : `${actorSpan} takes a moment to prepare. `) + getRandomElement(impactTemplates).replace(/{actorName}/g, actorSpan);
        const label = isReactive ? "Counter" : "Set-up";
        return phaseTemplates.move.replace(/{actorId}/g, actor.id).replace(/{actorName}/g, actor.name).replace(/{moveName}/g, move.name).replace(/{moveEmoji}/g, move.emoji || '✨').replace(/{effectivenessLabel}/g, label).replace(/{effectivenessEmoji}/g, '🛡️').replace(/{moveDescription}/g, description);
    }
    
    let statePrefixPool = [];
    if (actor.energy < 30) statePrefixPool.push(...narrativeStatePhrases.energy_depletion);
    if (actor.momentum >= 2) statePrefixPool.push(...narrativeStatePhrases.momentum_gain);
    if (actor.momentum <= -2) statePrefixPool.push(...narrativeStatePhrases.momentum_loss);
    
    let statePrefix = '';
    if (statePrefixPool.length > 0) {
        const availablePrefixes = statePrefixPool.filter(p => p !== actor.lastPrefix);
        statePrefix = getRandomElement(availablePrefixes.length > 0 ? availablePrefixes : statePrefixPool);
        actor.lastPrefix = statePrefix;
    }
    
    const intro = statePrefix ? '' : getRandomElement(introductoryPhrases.NEUTRAL);
    const verb = getRandomElement(verbSynonyms[move.verb] || [move.verb]);
    const conjugatedVerb = conjugateVerb(verb);
    const objectPhrase = assembleObjectPhrase(move);
    const adverb = getRandomElement(adverbPool.offensive);

    let actionSentence = `${conjugatedVerb} ${objectPhrase} ${adverb}`;
    if (!objectPhrase) actionSentence = `executes the ${move.name} ${adverb}`;

    let fullAction = `${statePrefix || intro} ${pronounOrName(statePrefix, actorSpan, actor)} ${actionSentence}.`;

    function pronounOrName(prefix, span, actorData) {
        return prefix ? `${span}` : (Math.random() > 0.5 ? span : (actorData.pronouns.s.charAt(0).toUpperCase() + actorData.pronouns.s.slice(1)));
    }

    const moveElement = move.special || move.element || 'DEFAULT';
    const impactPool = impactPhrases[moveElement] || impactPhrases.DEFAULT;
    const effectivenessKey = result.effectiveness.label.toUpperCase();
    const impactTemplates = impactPool[effectivenessKey] || impactPhrases.DEFAULT[effectivenessKey];
    const impactSentence = getRandomElement(impactTemplates, "The move connects.").replace(/{targetName}/g, targetSpan);
    
    const description = `${fullAction} ${impactSentence}`.replace(/\s\./g, '.').replace(/\s+/g, ' ').trim();

    return phaseTemplates.move
        .replace(/{actorId}/g, actor.id).replace(/{actorName}/g, actor.name).replace(/{moveName}/g, move.name).replace(/{moveEmoji}/g, move.emoji || '✨')
        .replace(/{effectivenessLabel}/g, result.effectiveness.label).replace(/{effectivenessEmoji}/g, result.effectiveness.emoji)
        .replace(/{moveDescription}/g, description);
}