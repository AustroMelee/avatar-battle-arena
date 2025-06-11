'use strict';

import { characters } from './characters.js';
import { locations, terrainTags } from './locations.js';
import { battlePhases, effectivenessLevels, phaseTemplates, victoryTypes, postBattleVictoryPhrases } from './narrative-v2.js';
import { adjectiveToNounMap } from './mechanics.js';

// --- Helper Functions ---
const getRandomElement = (arr, fallback = null) => {
    if (!arr || arr.length === 0) return fallback;
    return arr[Math.floor(Math.random() * arr.length)];
};
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

// --- Victory Narration Logic (Moved from obsolete battle-engine.js) ---

function normalizeTraitToNoun(traitString) {
    if (!traitString) return 'skill';
    const normalized = traitString.toLowerCase().replace(/ /g, '_');
    return adjectiveToNounMap[normalized] || traitString.replace(/_/g, ' ');
}

function getVictoryQuote(character, victoryData) {
    if (!character || !character.quotes) return "Victory is mine.";
    const { type, opponentId, resolutionTone } = victoryData;
    const quotes = character.quotes;

    let selectedQuote = "";
    const quotePool = [];

    if (opponentId && quotes.postWin_specific && quotes.postWin_specific[opponentId]) {
        quotePool.push(quotes.postWin_specific[opponentId]);
    }
    if (resolutionTone?.type === "overwhelming_power" && quotes.postWin_overwhelming) {
        quotePool.push(quotes.postWin_overwhelming);
    }
    if (resolutionTone?.type === "clever_victory" && quotes.postWin_clever) {
        quotePool.push(quotes.postWin_clever);
    }
    if (resolutionTone?.type === "emotional_yield" && quotes.postWin_reflective) {
        quotePool.push(quotes.postWin_reflective);
    }
    if (quotes[`postWin_${type}`]) {
        quotePool.push(quotes[`postWin_${type}`]);
    }
    if (quotes.postWin) {
        quotePool.push(quotes.postWin);
    }
    
    selectedQuote = getRandomElement(quotePool.flat());
    return selectedQuote || "The battle is won.";
}

function populateTemplate(template, data) {
    return template.replace(/{(\w+)}/g, (match, key) => {
        const lowerKey = key.toLowerCase();
        for (const dataKey in data) {
            if (dataKey.toLowerCase() === lowerKey) {
                return data[dataKey];
            }
        }
        return match;
    });
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
        WinnerStrength: normalizeTraitToNoun(getRandomElement(winnerChar?.strengths, "skill")),
        LoserID: loserId, 
    };
    
    const quoteData = { 
        type: winProb >= 90 ? 'stomp' : (winProb >= 75 ? 'dominant' : 'narrow'), 
        opponentId: loserId, 
        resolutionTone: { type: 'technical_win' } // Simplified for now
    };
    const finalQuote = getVictoryQuote(winnerChar, quoteData);
    templateData.WinnerQuote = finalQuote;
    
    const archetypePhrases = postBattleVictoryPhrases[winnerChar.victoryStyle] || postBattleVictoryPhrases.default;
    let populatedEnding = populateTemplate(getRandomElement(archetypePhrases), templateData);
    
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
        ...JSON.parse(JSON.stringify(character)), // Deep copy to avoid mutation
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

        const initiatorMove = selectMove(initiator, phase.name, responder);
        const responderMove = selectMove(responder, phase.name, initiator);

        const initiatorResult = calculateMove(initiatorMove, initiator, responder, locTags);
        const responderResult = calculateMove(responderMove, responder, initiator, locTags);
        
        responder.hp -= initiatorResult.damage;
        initiator.energy -= (initiatorMove.power || 0) * 0.5;
        initiator.lastMove = initiatorMove;

        if (fighter1.hp > 0 && fighter2.hp > 0) {
            initiator.hp -= responderResult.damage;
            responder.energy -= (responderMove.power || 0) * 0.5;
            responder.lastMove = responderMove;
        }

        fighter1.hp = clamp(fighter1.hp, 0, 100);
        fighter2.hp = clamp(fighter2.hp, 0, 100);
        fighter1.energy = clamp(fighter1.energy, 0, 100);
        fighter2.energy = clamp(fighter2.energy, 0, 100);

        battleLog.push(narrateMove(initiator, initiatorMove, initiatorResult));
        if (fighter2.hp > 0) {
             battleLog.push(narrateMove(responder, responderMove, responderResult));
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
    
    const winProb = (winner.hp / (winner.hp + loser.hp)) * 100;
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
        return { name: "Struggle", verb: 'struggles', object: 'to act', type: 'Utility', power: 10, emoji: '❓', requiresArticle: false };
    }

    if (phaseName === "Finishing Move" && actor.hp > target.hp) {
        const finishers = suitableMoves.filter(m => m.type === 'Finisher');
        if (finishers.length > 0) return getRandomElement(finishers);
    }
    if (actor.hp < 40) {
        const defenses = suitableMoves.filter(m => m.type === 'Defense' || m.type === 'Utility');
        if (defenses.length > 0) return getRandomElement(defenses);
    }
    const offenses = suitableMoves.filter(m => m.type === 'Offense');
    if (offenses.length > 0) return getRandomElement(offenses);

    return getRandomElement(suitableMoves); // Fallback
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

    const damage = move.type.includes('Offense') ? Math.round(totalEffectiveness / 4) : 0;

    return {
        effectiveness: level,
        damage: clamp(damage, 0, 50)
    };
}

// --- Narrative Generation ---
function narrateMove(actor, move, result) {
    const requiresArticle = move.requiresArticle;
    const firstLetter = move.object?.charAt(0).toLowerCase();
    const article = ['a', 'e', 'i', 'o', 'u'].includes(firstLetter) ? 'an' : 'a';
    const objectPhrase = move.object ? (requiresArticle ? `${article} ${move.object}` : move.object) : '';

    let description = `${actor.pronouns.s.charAt(0).toUpperCase() + actor.pronouns.s.slice(1)} ${move.verb} ${objectPhrase}.`;
    if (!move.object) {
        description = `${actor.pronouns.s.charAt(0).toUpperCase() + actor.pronouns.s.slice(1)} performed the ${move.name}.`;
    }

    return phaseTemplates.move
        .replace(/{actorId}/g, actor.id)
        .replace(/{actorName}/g, actor.name)
        .replace(/{moveName}/g, move.name)
        .replace(/{moveEmoji}/g, move.emoji || '✨')
        .replace(/{effectivenessLabel}/g, result.effectiveness.label)
        .replace(/{effectivenessEmoji}/g, result.effectiveness.emoji)
        .replace(/{moveDescription}/g, description);
}