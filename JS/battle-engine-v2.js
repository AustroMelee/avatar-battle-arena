// FILE: battle-engine-v2.js
'use strict';

const systemVersion = 'v3B-Overhaul-Patch-1';
const legacyMode = false; // Set to true to disable the move matrix for debugging

import { characters } from './characters.js';
import { locationConditions } from './location-battle-conditions.js';
import { moveInteractionMatrix } from './move-interaction-matrix.js';
import { battlePhases, effectivenessLevels, phaseTemplates, postBattleVictoryPhrases, introductoryPhrases, impactPhrases, adverbPool, narrativeStatePhrases, weakMoveTransitions, finishingBlowPhrases } from './narrative-v2.js';

// --- HELPER FUNCTIONS ---
const getRandomElement = (arr, fallback = null) => (!arr || arr.length === 0) ? fallback : arr[Math.floor(Math.random() * arr.length)];
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

function getWeightedRandom(items) {
    if (!items || items.length === 0) return null;
    const totalWeight = items.reduce((sum, item) => sum + (item.weight || 1), 0);
    if (totalWeight <= 0) return getRandomElement(items.map(i => i.move));

    let random = Math.random() * totalWeight;
    for (const item of items) {
        random -= (item.weight || 1);
        if (random <= 0) return item.move;
    }
    return items[items.length - 1].move;
}

// --- GRAMMAR & NARRATIVE SUB-SYSTEM ---
function conjugateVerb(verb) {
    if (!verb) return '';
    const verbParts = verb.split(' ');
    const mainVerb = verbParts.shift();
    const remainder = verbParts.join(' ');
    let conjugated;
    if (mainVerb === 'launch') return 'launches';
    if (mainVerb === 'lash') return 'lashes';
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

// --- BATTLE STATE & SIMULATION ---
function getContextualMoveset(char, locId) {
    const conditions = locationConditions[locId];
    if (char.canteenMoves && (conditions.isSandy || conditions.isHot) && !conditions.waterRich) {
        return char.canteenMoves;
    }
    return char.techniques;
}

function initializeFighterState(charId, locId) {
    const character = characters[charId];
    const contextualMoveset = getContextualMoveset(character, locId);
    return { 
        id: charId, name: character.name, ...JSON.parse(JSON.stringify(character)), 
        hp: 100, energy: 100, momentum: 0, lastMove: null, 
        movesUsed: [], phraseHistory: [], lastPrefixes: [], moveHistory: [],
        techniques: contextualMoveset
    };
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
    
    let populatedEnding = endingTemplate
        .replace(/{WinnerName}/g, `<span class="char-${winnerId}">${winnerChar.name}</span>`)
        .replace(/{LoserName}/g, `<span class="char-${loserId}">${loserChar.name}</span>`)
        .replace(/{WinnerPronounP}/g, winnerChar.pronouns.p);

    const finalQuote = getVictoryQuote(winnerChar, battleContext);
    if (finalQuote && !populatedEnding.includes(finalQuote)) {
        populatedEnding += ` "${finalQuote}"`;
    }
    return populatedEnding;
}

export function simulateBattle(f1Id, f2Id, locId) {
    let fighter1 = initializeFighterState(f1Id, locId);
    let fighter2 = initializeFighterState(f2Id, locId);
    const conditions = locationConditions[locId];
    let turnLog = [];
    let interactionLog = [];
    let initiator = (fighter1.powerTier > fighter2.powerTier) ? fighter1 : fighter2;
    let responder = (initiator.id === fighter1.id) ? fighter2 : fighter1;
    const maxTurns = 6;
    let battleOver = false;

    for (let turn = 0; turn < maxTurns && !battleOver; turn++) {
        const isFinishingPhase = (turn === maxTurns - 1 && (fighter1.hp > 0 && fighter2.hp > 0));
        const phaseName = isFinishingPhase ? "Finishing Move" : battlePhases[turn].name;
        const phaseEmoji = isFinishingPhase ? "🏁" : battlePhases[turn].emoji;
        let phaseContent = phaseTemplates.header.replace('{phaseName}', phaseName).replace('{phaseEmoji}', phaseEmoji);
        
        const processTurn = (attacker, defender) => {
            if (battleOver) return;
            const move = selectMove(attacker, turn, maxTurns);
            const result = calculateMove(move, attacker, defender, conditions, interactionLog);
            
            attacker.momentum = updateMomentum(attacker.momentum, result.effectiveness.label);
            if (result.damage > 10) defender.momentum = 0;
            
            phaseContent += narrateMove(attacker, defender, move, result);
            defender.hp = clamp(defender.hp - result.damage, 0, 100);
            attacker.energy = clamp(attacker.energy - result.energyCost, 0, 100);
            attacker.lastMove = move;
            attacker.movesUsed.push(move.name);
            attacker.moveHistory.push(move);
            if (defender.hp <= 0) battleOver = true;
        };
        
        processTurn(initiator, responder);
        if (!battleOver) processTurn(responder, initiator);

        turnLog.push(phaseTemplates.phaseWrapper.replace('{phaseName}', phaseName).replace('{phaseContent}', phaseContent));
        [initiator, responder] = [responder, initiator];
    }

    const winner = (fighter1.hp > fighter2.hp) ? fighter1 : fighter2;
    const loser = (winner.id === fighter1.id) ? fighter2 : fighter1;
    
    // Outcome Analysis
    if (interactionLog.length === 0) {
        interactionLog.push('No significant environmental or move-interaction modifiers were in play.');
    }
    winner.interactionLog = interactionLog;
    const summary = generateOutcomeSummary(winner, loser);
    winner.summary = summary;
    
    // Final Narration
    if (loser.hp > 0) {
        turnLog.push(phaseTemplates.timeOutVictory.replace(/{winnerName}/g, `<span class="char-${winner.id}">${winner.name}</span>`).replace(/{loserName}/g, `<span class="char-${loser.id}">${loser.name}</span>`));
    } else {
        turnLog.push(phaseTemplates.finalBlow.replace(/{winnerName}/g, `<span class="char-${winner.id}">${winner.name}</span>`).replace(/{loserName}/g, `<span class="char-${loser.id}">${loser.name}</span>`));
    }
    const battleContext = { isCloseCall: winner.hp < 35, isDominant: loser.hp <= 0 && winner.hp > 75, opponentId: loser.id };
    const finalEnding = getToneAlignedVictoryEnding(winner.id, loser.id, battleContext);
    turnLog.push(phaseTemplates.conclusion.replace('{endingNarration}', finalEnding));

    return { log: turnLog.join(''), winnerId: winner.id, loserId: loser.id, finalState: { fighter1, fighter2 } };
}

// --- MOVE AI & CALCULATION ---
function selectMove(actor, turn, maxTurns) {
    let suitableMoves = actor.techniques;
    if (suitableMoves.length === 0) return { name: "Struggle", verb: 'struggle', type: 'Offense', power: 10, element: 'physical', moveTags:[] };
    
    if (actor.movesUsed.length >= suitableMoves.length - 1) actor.movesUsed = [];
    
    const recentMoves = actor.movesUsed.slice(-3);
    let weightedMoves = suitableMoves.map(m => ({ move: m, weight: recentMoves.includes(m.name) ? 0.2 : 1 }));
    
    const finishers = weightedMoves.filter(m => m.move.type === 'Finisher');
    if (actor.personalityProfile.riskTolerance > 0.7 && actor.energy > 40) {
        if (finishers.length > 0) return getWeightedRandom(finishers);
    }
    
    const offenses = weightedMoves.filter(m => m.move.type === 'Offense');
    if (Math.random() < actor.personalityProfile.aggression && offenses.length > 0) {
        return getWeightedRandom(offenses);
    }
    
    return getWeightedRandom(weightedMoves);
}

function calculateMove(move, attacker, defender, conditions, interactionLog) {
    let basePower = move.power || 30;
    let multiplier = 1.0;
    let logReasons = [];
    
    // Environmental Modifiers
    if (move.element === 'water' || move.element === 'ice') {
        if (conditions.isSandy || conditions.isHot) {
            multiplier *= 0.25; // Massive debuff
            logReasons.push("was weakened by the arid terrain");
        }
        if (conditions.waterRich || conditions.iceRich) {
            multiplier *= 1.3;
            logReasons.push("was empowered by the abundant water/ice");
        }
    }
    if (move.element === 'earth' && conditions.earthRich) {
        multiplier *= 1.3;
        logReasons.push("was empowered by the rich earth");
    }
    if (move.element === 'fire' && conditions.isHot) {
        multiplier *= 1.25;
        logReasons.push("was empowered by the intense heat");
    }
    
    // Move Interaction Matrix
    if (!legacyMode && moveInteractionMatrix[move.name]) {
        const moveInteractions = moveInteractionMatrix[move.name];
        if (defender.lastMove && moveInteractions.counters?.[defender.lastMove.name]) {
            const counterBonus = moveInteractions.counters[defender.lastMove.name];
            multiplier *= counterBonus;
            logReasons.push(`countered ${defender.name}'s ${defender.lastMove.name}`);
        }
    }
    
    // Add to main log if any reasons were found
    if (logReasons.length > 0) {
        interactionLog.push(`${attacker.name}'s ${move.name} ${logReasons.join(' and ')}.`);
    }

    const totalEffectiveness = basePower * multiplier;
    
    let level;
    let energyMultiplier = 1.0;
    if (totalEffectiveness < basePower * 0.7) {
        level = effectivenessLevels.WEAK;
        energyMultiplier = 1.2; // Wasted effort costs more energy
    } else if (totalEffectiveness > basePower * 1.3) {
        level = effectivenessLevels.CRITICAL;
        energyMultiplier = 0.9; // Efficient strike costs less
    } else if (totalEffectiveness > basePower * 1.1) {
        level = effectivenessLevels.STRONG;
        energyMultiplier = 0.95;
    } else {
        level = effectivenessLevels.NORMAL;
    }
    
    const damage = move.type.includes('Offense') ? Math.round(totalEffectiveness / 3) : 0;
    const energyCost = Math.round(((move.power || 0) * 0.5) * energyMultiplier);

    return { 
        effectiveness: level, 
        damage: clamp(damage, 0, 50),
        energyCost: clamp(energyCost, 5, 100)
    };
}

// --- NARRATIVE & OUTCOME ---
function updateMomentum(currentMomentum, effectivenessLabel) {
    let change = 0;
    if (effectivenessLabel === 'Strong' || effectivenessLabel === 'Critical') change = 2;
    else if (effectivenessLabel === 'Normal') change = 1;
    else if (effectivenessLabel === 'Weak') change = -1;
    else if (effectivenessLabel === 'Counter') change = 1;
    return clamp(currentMomentum + change, -5, 5);
}

function narrateMove(actor, target, move, result) {
    const actorSpan = `<span class="char-${actor.id}">${actor.name}</span>`;
    const targetSpan = `<span class="char-${target.id}">${target.name}</span>`;
    
    if (move.type === 'Defense' || move.type === 'Utility') {
        const isReactive = target.lastMove?.type === 'Offense';
        const impactTemplates = isReactive ? impactPhrases.DEFENSE.REACTIVE : impactPhrases.DEFENSE.PROACTIVE;
        const prefixPool = isReactive 
            ? ["Reacting quickly,", "Seizing the moment,", "With swift reflexes,", "Countering instantly,", "Parrying with finesse,"] 
            : ["Preparing carefully,", "Taking a moment to strategize,", "Steadying {possessive} stance,", "In a daring gambit,"];
        
        let prefix = getRandomElement(prefixPool.filter(p => !actor.lastPrefixes.includes(p))) || getRandomElement(prefixPool);
        prefix = prefix.replace(/{possessive}/g, actor.pronouns.p);
        actor.lastPrefixes.push(prefix);
        if (actor.lastPrefixes.length > 5) actor.lastPrefixes.shift();
        
        let impactSentence = getRandomElement(impactTemplates)
            .replace(/{actorName}/g, actorSpan)
            .replace(/{possessive}/g, actor.pronouns.p);
        const description = `${prefix} ${actorSpan} uses the ${move.name}. ${impactSentence}`;

        const label = isReactive ? "Counter" : "Set-up";
        return phaseTemplates.move.replace(/{actorId}/g, actor.id).replace(/{actorName}/g, actor.name).replace(/{moveName}/g, move.name).replace(/{moveEmoji}/g, move.emoji || '✨').replace(/{effectivenessLabel}/g, label).replace(/{effectivenessEmoji}/g, '🛡️').replace(/{moveDescription}/g, description);
    }
    
    let statePrefixPool = [];
    if (actor.energy < 30) statePrefixPool.push(...narrativeStatePhrases.energy_depletion);
    if (actor.momentum >= 3) statePrefixPool.push(...narrativeStatePhrases.momentum_gain);
    if (actor.momentum <= -3) statePrefixPool.push(...narrativeStatePhrases.momentum_loss);
    
    let statePrefix = '';
    if (statePrefixPool.length > 0) {
        const availablePrefixes = statePrefixPool.filter(p => !actor.lastPrefixes.includes(p));
        statePrefix = getRandomElement(availablePrefixes.length > 0 ? availablePrefixes : statePrefixPool);
        actor.lastPrefixes.push(statePrefix);
        if (actor.lastPrefixes.length > 5) actor.lastPrefixes.shift();
    }
    
    const intro = statePrefix ? '' : getRandomElement(introductoryPhrases);
    const verb = move.verb || 'executes';
    const conjugatedVerb = conjugateVerb(verb);
    const objectPhrase = assembleObjectPhrase(move);
    const adverb = move.type === 'Offense' ? getRandomElement(adverbPool.offensive) : '';

    function pronounOrName(prefix, span, actorData) {
        const pronoun = actorData.pronouns.s;
        if (!prefix) return Math.random() > 0.5 ? span : (pronoun.charAt(0).toUpperCase() + pronoun.slice(1));
        return Math.random() > 0.5 ? span : pronoun;
    }
    
    let prefixText = (statePrefix || intro).replace(/{possessive}/g, actor.pronouns.p);
    let fullAction = `${prefixText} ${pronounOrName(prefixText, actorSpan, actor)} ${conjugatedVerb} ${objectPhrase} ${adverb}.`;

    let impactSentence;
    if (target.hp - result.damage <= 0 && result.damage > 0) {
        impactSentence = getRandomElement(finishingBlowPhrases).replace(/{targetName}/g, targetSpan);
    } else {
        const impactPool = impactPhrases.DEFAULT[result.effectiveness.label.toUpperCase()];
        const availableImpacts = impactPool.filter(p => !actor.phraseHistory.includes(p));
        impactSentence = getRandomElement(availableImpacts.length > 5 ? availableImpacts : impactPool, "The move connects.").replace(/{targetName}/g, targetSpan);
        actor.phraseHistory.push(impactSentence);
        if (actor.phraseHistory.length > 10) actor.phraseHistory.shift();
    }

    if (result.effectiveness.label === 'WEAK') {
        impactSentence += ' ' + getRandomElement(weakMoveTransitions)
            .replace(/{targetName}/g, targetSpan)
            .replace(/{actorName}/g, actorSpan)
            .replace(/{possessive}/g, actor.pronouns.p);
    }
    
    const description = `${fullAction} ${impactSentence}`.replace(/\s\./g, '.').replace(/\s+/g, ' ').trim();

    return phaseTemplates.move
        .replace(/{actorId}/g, actor.id).replace(/{actorName}/g, actor.name).replace(/{moveName}/g, move.name).replace(/{moveEmoji}/g, move.emoji || '✨')
        .replace(/{effectivenessLabel}/g, result.effectiveness.label).replace(/{effectivenessEmoji}/g, result.effectiveness.emoji)
        .replace(/{moveDescription}/g, description);
}

function generateOutcomeSummary(winner, loser) {
    const moveTypes = winner.moveHistory.map(m => m.type);
    const mostUsedType = ['Finisher', 'Offense', 'Defense', 'Utility'].map(type => ({ type, count: moveTypes.filter(t => t === type).length })).sort((a, b) => b.count - a.count)[0]?.type || 'versatile';
    
    const summaryMap = {
        'Finisher': `decisive finishing moves`, 'Offense': `relentless offense`,
        'Defense': `impenetrable defense`, 'Utility': `clever tactical maneuvers`, 'versatile': `sheer versatility`
    };
    
    let summary = `${winner.name}'s victory was sealed by ${winner.pronouns.p} ${summaryMap[mostUsedType]}.`;
    if (winner.momentum - loser.momentum >= 3) {
        summary += ` ${winner.pronouns.p.charAt(0).toUpperCase() + winner.pronouns.p.slice(1)} commanding momentum overwhelmed ${loser.name}.`;
    }
    return summary;
}