'use strict';

import { characters } from './characters.js';
import { locations, terrainTags } from './locations.js';
import { battlePhases, effectivenessLevels, phaseTemplates, postBattleVictoryPhrases, introductoryPhrases, verbSynonyms, impactPhrases, intensityPhrases, tempoPhrases } from './narrative-v2.js';

// --- Helper Functions ---
const getRandomElement = (arr, fallback = null) => {
    if (!arr || arr.length === 0) return fallback;
    return arr[Math.floor(Math.random() * arr.length)];
};
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
const toLowerCaseFirst = (s) => {
    if (typeof s !== 'string' || s.length === 0) return '';
    return s.charAt(0).toLowerCase() + s.slice(1);
}

// --- GRAMMAR SUBSYSTEM ---
function conjugateVerb(verb) {
    if (!verb) return '';
    const verbParts = verb.split(' ');
    const mainVerb = verbParts.shift();
    const remainder = verbParts.join(' ');

    let conjugated;
    if (mainVerb.endsWith('y') && !['a', 'e', 'i', 'o', 'u'].includes(mainVerb.slice(-2, -1))) {
        conjugated = mainVerb.slice(0, -1) + 'ies';
    } else if (mainVerb.endsWith('s') || mainVerb.endsWith('sh') || mainVerb.endsWith('ch') || mainVerb.endsWith('x') || mainVerb.endsWith('z') || mainVerb.endsWith('o')) {
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


// --- Victory Narration Logic ---
function getVictoryQuote(character, victoryData) {
    if (!character || !character.quotes) return "Victory is mine.";
    const { type, opponentId } = victoryData;
    const quotes = character.quotes;

    const quotePool = [];
    if (opponentId && quotes.postWin_specific && quotes.postWin_specific[opponentId]) {
        quotePool.push(quotes.postWin_specific[opponentId]);
    }
    if (quotes[`postWin_${type}`]) {
        quotePool.push(quotes[`postWin_${type}`]);
    } else if (quotes.postWin) {
        quotePool.push(quotes.postWin);
    }
    
    if (quotes.postWin_overwhelming) quotePool.push(quotes.postWin_overwhelming);
    if (quotes.postWin_clever) quotePool.push(quotes.postWin_clever);
    if (quotes.postWin_reflective) quotePool.push(quotes.postWin_reflective);

    let selectedQuote = getRandomElement(quotePool.flat());
    return selectedQuote || "The battle is won.";
}

function getToneAlignedVictoryEnding(winnerId, loserId, winProb) {
    const winnerChar = characters[winnerId];
    const loserChar = characters[loserId];

    const templateData = {
        WinnerName: `<span class="char-${winnerId}">${winnerChar.name}</span>`,
        LoserName: `<span class="char-${loserId}">${loserChar.name}</span>`,
        WinnerPronounS: winnerChar.pronouns.s,
        WinnerPronounO: winnerChar.pronouns.o,
        WinnerPronounP: winnerChar.pronouns.p,
        LoserPronounS: loserChar.pronouns.s,
        LoserPronounO: loserChar.pronouns.o,
        LoserPronounP: loserChar.pronouns.p,
    };
    
    const quoteData = { 
        type: winProb >= 90 ? 'stomp' : (winProb >= 75 ? 'dominant' : 'narrow'), 
        opponentId: loserId,
    };
    const finalQuote = getVictoryQuote(winnerChar, quoteData);
    templateData.WinnerQuote = finalQuote;
    
    const archetypePhrases = postBattleVictoryPhrases[winnerChar.victoryStyle] || postBattleVictoryPhrases.default;
    let populatedEnding = archetypePhrases[Math.floor(Math.random() * archetypePhrases.length)]
        .replace(/{(\w+)}/g, (match, key) => templateData[key] || match);
    
    if (!populatedEnding.includes(finalQuote)) {
        populatedEnding += ` "${finalQuote}"`;
    }

    return populatedEnding;
}


// --- Battle State Initialization ---
function initializeFighterState(charId) {
    const character = characters[charId];
    return {
        id: charId,
        name: character.name,
        ...JSON.parse(JSON.stringify(character)),
        hp: 100,
        energy: 100,
        status: [],
        lastMove: null,
    };
}

// --- Core Simulation Logic ---
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
        const phase = battlePhases[turn];
        
        battleLog.push(phaseTemplates.header.replace('{phaseName}', phase.name).replace('{phaseEmoji}', phase.emoji));

        if (phase.name === "Finishing Move") {
            battleLog.push(`<p class="move-description">The battle reaches its peak! Both fighters gather their remaining strength for a final, decisive exchange.</p>`);
        }

        const initiatorMove = selectMove(initiator, phase.name, responder);
        const responderMove = selectMove(responder, phase.name, initiator);

        const initiatorResult = calculateMove(initiatorMove, initiator, responder, locTags);
        const responderResult = calculateMove(responderMove, responder, initiator, locTags);
        
        responder.hp -= initiatorResult.damage;
        initiator.energy -= Math.round((initiatorMove.power || 0) * 0.5);
        initiator.lastMove = initiatorMove;

        if (responder.hp > 0) {
            initiator.hp -= responderResult.damage;
            responder.energy -= Math.round((responderMove.power || 0) * 0.5);
            responder.lastMove = responderMove;
        }

        fighter1.hp = clamp(fighter1.hp, 0, 100);
        fighter2.hp = clamp(fighter2.hp, 0, 100);
        fighter1.energy = clamp(fighter1.energy, 0, 100);
        fighter2.energy = clamp(fighter2.energy, 0, 100);

        battleLog.push(narrateMove(initiator, responder, initiatorMove, initiatorResult));
        if (responder.hp > 0) {
             battleLog.push(narrateMove(responder, initiator, responderMove, responderResult));
        }

        [initiator, responder] = [responder, initiator];
        turn++;
    }

    const winner = (fighter1.hp > fighter2.hp) ? fighter1 : fighter2;
    const loser = (winner.id === fighter1.id) ? fighter2 : fighter1;
    
    battleLog.push(phaseTemplates.finalBlow
        .replace(/{winnerName}/g, `<span class="char-${winner.id}">${winner.name}</span>`)
        .replace(/{loserName}/g, `<span class="char-${loser.id}">${loser.name}</span>`)
    );
    
    const winProb = (winner.hp / (winner.hp + loser.hp + 0.01)) * 100;
    const finalEnding = getToneAlignedVictoryEnding(winner.id, loser.id, winProb);
    battleLog.push(phaseTemplates.conclusion.replace('{endingNarration}', finalEnding));

    return {
        log: battleLog.join(''),
        winnerId: winner.id,
        loserId: loser.id,
        finalState: { fighter1, fighter2 }
    };
}


// --- Move AI & Calculation ---
function selectMove(actor, phaseName, target) {
    let suitableMoves = actor.techniques;
    if (!suitableMoves || suitableMoves.length === 0) {
        return { name: "Struggle", verb: 'struggle', object: 'to act', type: 'Utility', power: 10, emoji: '❓', requiresArticle: false };
    }

    if (phaseName === "Finishing Move" && actor.hp > target.hp && actor.energy > 40) {
        const finishers = suitableMoves.filter(m => m.type === 'Finisher');
        if (finishers.length > 0) return getRandomElement(finishers);
    }
    if (actor.hp < 40 && actor.energy > 20) {
        const defenses = suitableMoves.filter(m => m.type === 'Defense' || m.type === 'Utility');
        if (defenses.length > 0) return getRandomElement(defenses);
    }
    const offenses = suitableMoves.filter(m => m.type === 'Offense');
    if (offenses.length > 0) return getRandomElement(offenses);

    return getRandomElement(suitableMoves);
}

function calculateMove(move, attacker, defender, locTags) {
    let basePower = move.power || 30;
    let multiplier = 1.0;

    if (attacker.strengths?.some(s => locTags.includes(s))) multiplier += 0.25;
    if (attacker.weaknesses?.some(w => locTags.includes(w))) multiplier -= 0.25;

    const defenderMoveType = defender.lastMove?.type;
    if (move.type === 'Offense' && defenderMoveType === 'Utility') multiplier += 0.15;
    if (move.type === 'Utility' && defenderMoveType === 'Defense') multiplier += 0.15;
    if (move.type === 'Defense' && defenderMoveType === 'Offense') {
        basePower *= 0.5;
    }
    
    multiplier += (Math.random() - 0.5) * 0.2;

    const totalEffectiveness = basePower * multiplier;
    
    let level;
    if (totalEffectiveness < basePower * 0.7) level = effectivenessLevels.WEAK;
    else if (totalEffectiveness > basePower * 1.3) level = effectivenessLevels.CRITICAL;
    else if (totalEffectiveness > basePower * 1.1) level = effectivenessLevels.STRONG;
    else level = effectivenessLevels.NORMAL;

    const damage = move.type.includes('Offense') ? Math.round(totalEffectiveness / 3) : 0;

    return {
        effectiveness: level,
        damage: clamp(damage, 0, 50)
    };
}

// --- Narrative Generation (FINAL) ---
function narrateMove(actor, target, move, result) {
    const actorSpan = `<span class="char-${actor.id}">${actor.name}</span>`;
    const targetSpan = `<span class="char-${target.id}">${target.name}</span>`;

    // 1. Handle special case for proactive defensive moves
    if ((move.type === 'Defense' || move.type === 'Utility') && (!target.lastMove || target.lastMove.type !== 'Offense')) {
        const description = getRandomElement(impactPhrases.PROACTIVE_DEFENSE).replace(/{actorName}/g, actorSpan);
        const energyCost = Math.round((move.power || 0) * 0.5);
        return phaseTemplates.move.replace('{actorId}', actor.id).replace('{actorName}', actor.name).replace('{moveName}', move.name).replace('{moveEmoji}', move.emoji || '✨').replace('{energyCost}', energyCost).replace('{effectivenessLabel}', "Set-up").replace('{effectivenessEmoji}', '🛡️').replace('{moveDescription}', description);
    }
     // Handle special case for reactive defensive moves
    if ((move.type === 'Defense' || move.type === 'Utility') && (target.lastMove && target.lastMove.type === 'Offense')) {
        const description = `Reacting quickly, ${actorSpan} uses the ${move.name} to intercept ${targetSpan}'s assault. ${getRandomElement(impactPhrases.REACTIVE_DEFENSE)}`;
        const energyCost = Math.round((move.power || 0) * 0.5);
        return phaseTemplates.move.replace('{actorId}', actor.id).replace('{actorName}', actor.name).replace('{moveName}', move.name).replace('{moveEmoji}', move.emoji || '✨').replace('{energyCost}', energyCost).replace('{effectivenessLabel}', "Counter").replace('{effectivenessEmoji}', '🛡️').replace('{moveDescription}', description);
    }

    // 2. Select verb and conjugate it for offensive moves
    const synonymList = verbSynonyms[move.verb] || [move.verb];
    const selectedVerb = getRandomElement(synonymList);
    const conjugatedVerb = conjugateVerb(selectedVerb);
    const objectPhrase = assembleObjectPhrase(move);
    
    // 3. Select a contextual intro phrase
    let introContext;
    if (actor.hp < 35 && actor.energy < 40) introContext = 'DESPERATE';
    else if (actor.hp > 80 && actor.hp > target.hp) introContext = 'CONFIDENT';
    else if (target.lastMove) introContext = 'REACTIVE';
    else introContext = 'AGGRESSIVE';
    
    const introPool = introductoryPhrases[introContext];
    const introType = Math.random() > 0.4 ? 'leading' : 'standalone';
    let intro = getRandomElement(introPool[introType]);

    // 4. Build the main action sentence
    let fullAction;
    const intensity = getRandomElement(intensityPhrases);
    let verbPhrase = `${conjugatedVerb} ${objectPhrase}`;
    if (!objectPhrase) verbPhrase = `executes the ${move.name}`;

    if (introType === 'leading') {
        let actionSegment = `${verbPhrase} ${intensity}.`;
        fullAction = `${intro.replace('{actorName}', actorSpan)} ${actionSegment}`;
    } else {
        const pronounCap = actor.pronouns.s.charAt(0).toUpperCase() + actor.pronouns.s.slice(1);
        let actionSentence = `${pronounCap} ${verbPhrase}.`;
        fullAction = `${intro} ${toLowerCaseFirst(actionSentence)}`;
    }
    
    // 5. Build the impact phrase
    let impactSentence = "";
    const impactTemplates = impactPhrases[result.effectiveness.label];
    if (impactTemplates) {
        impactSentence = getRandomElement(impactTemplates).replace(/{targetName}/g, targetSpan);
    }
    
    // 6. Combine and return the full narrative
    const description = `${fullAction} ${impactSentence}`;
    const energyCost = Math.round((move.power || 0) * 0.5);

    return phaseTemplates.move
        .replace(/{actorId}/g, actor.id)
        .replace(/{actorName}/g, actor.name)
        .replace(/{moveName}/g, move.name)
        .replace(/{moveEmoji}/g, move.emoji || '✨')
        .replace(/{energyCost}/g, energyCost)
        .replace(/{effectivenessLabel}/g, result.effectiveness.label)
        .replace(/{effectivenessEmoji}/g, result.effectiveness.emoji)
        .replace(/{moveDescription}/g, description);
}