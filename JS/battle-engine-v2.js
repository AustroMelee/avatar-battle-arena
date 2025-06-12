// FILE: js/battle-engine-v2.js
'use strict';

const systemVersion = 'v14.0-S++-ProactivePacing-Pass';
const legacyMode = false;

import { characters } from './characters.js';
import { locationConditions } from './location-battle-conditions.js';
import { moveInteractionMatrix, punishableMoves } from './move-interaction-matrix.js';
import { battlePhases, effectivenessLevels, phaseTemplates, postBattleVictoryPhrases, introductoryPhrases, impactPhrases, adverbPool, narrativeStatePhrases, weakMoveTransitions, finishingBlowPhrases } from './narrative-v2.js';
import { relationshipMatrix } from './relationship-matrix.js';
import { emotionalFlavor } from './narrative-flavor.js';

// --- HELPER FUNCTIONS ---
const getRandomElement = (arr, fallback = null) => arr?.[Math.floor(Math.random() * arr.length)] || fallback;
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
const isReactive = (defender) => defender.lastMove?.type === 'Offense';

// --- BATTLE STATE & SIMULATION ---
function initializeFighterState(charId, opponentId, emotionalMode) {
    const character = characters[charId];
    return { 
        id: charId, name: character.name, ...JSON.parse(JSON.stringify(character)), 
        hp: 100, energy: 100, momentum: 0, lastMove: null, lastMoveEffectiveness: null,
        isStunned: false, hasSetup: false,
        movesUsed: [], phraseHistory: {}, moveHistory: [], moveFailureHistory: [],
        consecutiveDefensiveTurns: 0, aiLog: [],
        relationalState: (emotionalMode && relationshipMatrix[charId]?.[opponentId]) || null,
        mentalState: { level: 'stable', stress: 0 },
        mentalStateChangedThisTurn: false,
    };
}

export function simulateBattle(f1Id, f2Id, locId, timeOfDay, emotionalMode = false) {
    let fighter1 = initializeFighterState(f1Id, f2Id, emotionalMode);
    let fighter2 = initializeFighterState(f2Id, f1Id, emotionalMode);
    
    const conditions = { ...locationConditions[locId], isDay: timeOfDay === 'day', isNight: timeOfDay === 'night' };
    let turnLog = [], interactionLog = [];
    let initiator = (fighter1.powerTier > fighter2.powerTier) ? fighter1 : fighter2;
    let responder = (initiator.id === fighter1.id) ? fighter2 : fighter1;

    for (let turn = 0; turn < 6 && !battleOver; turn++) {
        [fighter1, fighter2].forEach(f => f.mentalStateChangedThisTurn = false);

        const phaseName = battlePhases[turn]?.name || "Final Exchange";
        let phaseContent = phaseTemplates.header.replace('{phaseName}', phaseName).replace('{phaseEmoji}', '⚔️');
        var battleOver = false;
        
        const processTurn = (attacker, defender) => {
            if (battleOver) return;
            attacker.isStunned = false; 
            
            updateMentalState(attacker, defender, null);
            const { move, aiLogEntry } = selectMove(attacker, defender, conditions);
            attacker.aiLog.push(`[T${turn+1}] ${aiLogEntry}`);

            const result = calculateMove(move, attacker, defender, conditions, interactionLog);
            
            updateMentalState(defender, attacker, result);

            attacker.momentum = updateMomentum(attacker.momentum, result.effectiveness.label);
            attacker.lastMoveEffectiveness = result.effectiveness.label;
            
            const isDefensiveMove = move.type === 'Utility' || move.type === 'Defense';
            attacker.consecutiveDefensiveTurns = isDefensiveMove ? attacker.consecutiveDefensiveTurns + 1 : 0;
            
            if (result.effectiveness.label === 'Critical') defender.isStunned = true;
            if (result.wasPunished) {
                attacker.moveFailureHistory.push(move.name);
                attacker.mentalState.stress += 25;
            }
            
            phaseContent += narrateMove(attacker, defender, move, result);
            defender.hp = clamp(defender.hp - result.damage, 0, 100);
            attacker.energy = clamp(attacker.energy - result.energyCost, 0, 100);
            attacker.lastMove = move;
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
    winner.interactionLog = [...new Set(interactionLog)];
    winner.summary = generateOutcomeSummary(winner, loser);
    
    if (loser.hp > 0) turnLog.push(phaseTemplates.timeOutVictory.replace(/{winnerName}/g, `<span class="char-${winner.id}">${winner.name}</span>`).replace(/{loserName}/g, `<span class="char-${loser.id}">${loser.name}</span>`));
    else turnLog.push(phaseTemplates.finalBlow.replace(/{winnerName}/g, `<span class="char-${winner.id}">${winner.name}</span>`).replace(/{loserName}/g, `<span class="char-${loser.id}">${loser.name}</span>`));
    
    const finalEnding = getToneAlignedVictoryEnding(winner.id, loser.id, { isCloseCall: winner.hp < 35, opponentId: loser.id });
    turnLog.push(phaseTemplates.conclusion.replace('{endingNarration}', finalEnding));

    return { log: turnLog.join(''), winnerId: winner.id, loserId: loser.id, finalState: { fighter1, fighter2 } };
}

// --- MENTAL STATE & AI SYSTEMS ---
function updateMentalState(actor, opponent, moveResult) {
    if (actor.mentalState.level === 'broken' || !actor.relationalState) return;

    let stressThisTurn = 0;
    if (moveResult) {
        if (moveResult.effectiveness.label === 'Critical') stressThisTurn += 30;
        if (moveResult.effectiveness.label === 'Strong') stressThisTurn += 20;
        stressThisTurn += moveResult.damage / 2;
    }
    if (actor.momentum < 0) stressThisTurn += Math.abs(actor.momentum) * 2;
    
    stressThisTurn *= (actor.relationalState.stressModifier || 1.0);
    actor.mentalState.stress += stressThisTurn;

    const resilience = actor.relationalState.resilienceModifier || 1.0;
    const thresholds = { stressed: 25 * resilience, shaken: 60 * resilience, broken: 90 * resilience };

    const oldLevel = actor.mentalState.level;
    if (actor.mentalState.stress > thresholds.broken) actor.mentalState.level = 'broken';
    else if (actor.mentalState.stress > thresholds.shaken) actor.mentalState.level = 'shaken';
    else if (actor.mentalState.stress > thresholds.stressed) actor.mentalState.level = 'stressed';

    if (oldLevel !== actor.mentalState.level) {
        actor.aiLog.push(`[Mental State Change]: ${actor.name} is now ${actor.mentalState.level.toUpperCase()}. (Stress: ${actor.mentalState.stress.toFixed(0)})`);
        actor.mentalStateChangedThisTurn = true;
    }
}

function getDynamicPersonality(actor) {
    let profile = { ...actor.personalityProfile };
    if (actor.relationalState) {
        const modifiers = actor.relationalState.emotionalModifiers || {};
        profile.aggression = clamp(profile.aggression + (modifiers.aggressionBoost || 0) - (modifiers.aggressionReduction || 0), 0, 1.2);
        profile.patience = clamp(profile.patience + (modifiers.patienceBoost || 0) - (modifiers.patienceReduction || 0), 0, 1.2);
        profile.riskTolerance = clamp(profile.riskTolerance + (modifiers.riskToleranceBoost || 0) - (modifiers.riskToleranceReduction || 0), 0, 1.2);
    }
    
    switch (actor.mentalState.level) {
        case 'stressed': profile.patience *= 0.7; profile.riskTolerance = clamp(profile.riskTolerance + 0.15, 0, 1.1); break;
        case 'shaken':
            profile.patience *= 0.4;
            profile.opportunism *= 0.6;
            profile.aggression = clamp(profile.aggression + 0.2, 0, 1.2);
            profile.riskTolerance = clamp(profile.riskTolerance + 0.3, 0, 1.2);
            break;
        case 'broken':
            profile.patience = 0.05;
            profile.opportunism = 0.1;
            profile.aggression = clamp(profile.aggression + 0.4, 0, 1.3);
            profile.riskTolerance = clamp(profile.riskTolerance + 0.5, 0, 1.5);
            break;
    }
    return profile;
}

function selectMove(actor, defender, conditions) {
    const struggleMove = { name: "Struggle", verb: 'struggle', type: 'Offense', power: 10, element: 'physical', moveTags: [] };
    const availableMoves = getAvailableMoves(actor, conditions);
    
    const profile = getDynamicPersonality(actor);
    const pacingProfile = actor.pacingProfile || 'tactical';
    
    const energyPercent = (actor.energy / 100);
    let staminaState = 'fresh';
    if (energyPercent < 0.65) staminaState = 'winded';
    if (energyPercent < 0.30) staminaState = 'exhausted';

    let opportunismBonus = 1.0, openingReason = 'None';
    if (defender.isStunned) { opportunismBonus += profile.opportunism * 1.0; openingReason = 'Stun'; }
    else if (defender.momentum <= -3) { opportunismBonus += profile.opportunism * 0.7; openingReason = 'Momentum'; }
    else if (defender.lastMoveEffectiveness === 'Weak') { opportunismBonus += profile.opportunism * 0.4; openingReason = 'Weakness'; }

    let weightedMoves = availableMoves.map(move => {
        let weight = 1.0;
        const energyCost = Math.round((move.power || 0) * 0.35) + 5;

        if (actor.energy < energyCost) return { move, weight: 0 };
        
        switch (move.type) {
            case 'Offense': weight *= (1 + profile.aggression * 0.5) * opportunismBonus; break;
            case 'Defense': weight *= 1 + (1 - profile.aggression) * 0.5; break;
            case 'Utility': weight *= 1 + profile.patience * 0.3; break;
            case 'Finisher': weight *= (1 + profile.riskTolerance * 0.5) * opportunismBonus; break;
        }

        // --- PROACTIVE PACING & STAMINA LOGIC ---
        if (pacingProfile === 'tactical') {
            // Penalize expensive moves when winded/exhausted
            if (staminaState === 'winded' && energyCost > 30) weight *= 0.6;
            if (staminaState === 'exhausted' && energyCost > 20) weight *= 0.3;
            // Reward cheap, efficient moves when stamina is not full
            if (staminaState !== 'fresh' && energyCost < 22) weight *= 1.3;
        } else if (pacingProfile === 'opportunist' && openingReason === 'None') {
            // Opportunists conserve energy until an opening appears
            if (staminaState !== 'fresh' && energyCost > 25) weight *= 0.5;
            if (staminaState !== 'fresh' && energyCost < 20) weight *= 1.2;
        }
        // Berserkers (like Ozai) have no pacing logic and will always go for broke.

        if (actor.moveHistory.slice(-2).some(m => m.name === move.name)) weight *= 0.25;
        if (actor.moveFailureHistory.includes(move.name)) weight *= 0.1;
        
        if (move.moveTags.includes('requires_opening')) {
            const openingExists = (defender.isStunned || defender.momentum <= -3 || defender.lastMoveEffectiveness === 'Weak');
            weight *= openingExists ? 20.0 : (profile.riskTolerance * 0.1);
        }
        
        if (actor.mentalState.level === 'broken') {
            if (move.type === 'Finisher') weight *= 0.2;
            if (move.type === 'Utility') weight *= 0.1;
        }

        return { move, weight };
    });

    weightedMoves.push({move: struggleMove, weight: 0.1});
    
    const validMoves = weightedMoves.filter(m => m.weight > 0);
    if (!validMoves.length) return { move: struggleMove, aiLogEntry: "No valid moves, defaulting to Struggle." };

    const sortedMoves = validMoves.sort((a,b) => b.weight - a.weight);
    const chosenMoveInfo = sortedMoves[0];
    const chosenMove = chosenMoveInfo.move;
    
    let aiLogEntry = `Selected '${chosenMove.name}'`;
    if (chosenMoveInfo) aiLogEntry += ` (W: ${chosenMoveInfo.weight.toFixed(2)})`;
    aiLogEntry += `|State:${actor.mentalState.level}|Stamina:${staminaState}`;
    
    return { move: chosenMove, aiLogEntry };
}

// --- NARRATIVE & COMBAT CALCULATION ---
function narrateMove(actor, target, move, result) {
    let emotionalPrefix = '';
    if (actor.mentalStateChangedThisTurn) {
        const pool = emotionalFlavor[actor.id]?.[actor.mentalState.level] || emotionalFlavor.generic?.[actor.mentalState.level];
        if (pool) emotionalPrefix = getRandomElement(pool).replace(/{actorName}/g, actor.name).replace(/{possessive}/g, actor.pronouns.p) + ' ';
    }

    const actorSpan = `<span class="char-${actor.id}">${actor.name}</span>`;
    const targetSpan = `<span class="char-${target.id}">${target.name}</span>`;
    
    if (move.type === 'Defense' || move.type === 'Utility') {
        const reactive = isReactive(target);
        let impactSentence = getRandomElement(reactive ? impactPhrases.DEFENSE.REACTIVE : impactPhrases.DEFENSE.PROACTIVE).replace(/{actorName}/g, actorSpan);
        const desc = `${emotionalPrefix}${actorSpan} uses the ${move.name}. ${impactSentence}`;
        return phaseTemplates.move.replace(/{actorId}/g, actor.id).replace(/{actorName}/g, actor.name).replace(/{moveName}/g, move.name).replace(/{moveEmoji}/g, '🛡️').replace(/{effectivenessLabel}/g, reactive ? "Counter" : "Set-up").replace(/{effectivenessEmoji}/g, '🛡️').replace(/{moveDescription}/g, desc);
    }
    
    const impactSentence = getRandomElement(impactPhrases.DEFAULT[result.effectiveness.label.toUpperCase()]).replace(/{targetName}/g, targetSpan);
    const fullDesc = `${emotionalPrefix}${actorSpan} ${conjugateVerb(move.verb || 'executes')} ${assembleObjectPhrase(move)}. ${impactSentence}`;

    return phaseTemplates.move
        .replace(/{actorId}/g, actor.id).replace(/{actorName}/g, actor.name).replace(/{moveName}/g, move.name).replace(/{moveEmoji}/g, '⚔️')
        .replace(/{effectivenessLabel}/g, result.effectiveness.label).replace(/{effectivenessEmoji}/g, result.effectiveness.emoji)
        .replace(/{moveDescription}/g, fullDesc.replace(/\s+/g, ' ').trim());
}

function calculateMove(move, attacker, defender, conditions, interactionLog) {
    let basePower = move.power || 30;
    let multiplier = 1.0;
    let wasPunished = false;
    
    if (move.moveTags.includes('requires_opening')) {
        const openingExists = (defender.isStunned || defender.momentum <= -3 || defender.lastMoveEffectiveness === 'Weak' || attacker.hasSetup);
        if (!openingExists && punishableMoves[move.name]) {
            multiplier *= punishableMoves[move.name].penalty;
            wasPunished = true;
        }
    }
    
    const { multiplier: envMultiplier, logReasons: envReasons } = applyEnvironmentalModifiers(move, attacker, conditions);
    multiplier *= envMultiplier;
    if (envReasons.length > 0) interactionLog.push(`${attacker.name}'s ${move.name} was influenced by: ${envReasons.join(', ')}.`);

    const totalEffectiveness = basePower * multiplier;
    
    let level;
    if (totalEffectiveness < basePower * 0.7) level = effectivenessLevels.WEAK; 
    else if (totalEffectiveness > basePower * 1.5) level = effectivenessLevels.CRITICAL;
    else if (totalEffectiveness > basePower * 1.1) level = effectivenessLevels.STRONG;
    else level = effectivenessLevels.NORMAL;
    
    const damage = (move.type.includes('Offense') || move.type.includes('Finisher')) ? Math.round(totalEffectiveness / 3) : 0;
    const energyCost = (move.name === 'Struggle') ? 0 : Math.round((move.power || 0) * 0.35) + 5;

    return { effectiveness: level, damage: clamp(damage, 0, 50), energyCost: clamp(energyCost, 5, 100), wasPunished };
}

function getAvailableMoves(actor, conditions) {
    if (!actor.techniques) return [];
    return actor.techniques.filter(move => Object.entries(move.usageRequirements || {}).every(([key, val]) => conditions[key] === val));
}

function applyEnvironmentalModifiers(move, attacker, conditions) {
    let multiplier = 1.0;
    let logReasons = [];
    
    const isFirebender = attacker.techniques.some(t => t.element === 'fire' || t.element === 'lightning');
    const isWaterbender = attacker.techniques.some(t => t.element === 'water' || t.element === 'ice');
    if (conditions.isDay) {
        if (isFirebender) { multiplier *= 1.1; logReasons.push(`daylight`); }
        if (isWaterbender) { multiplier *= 0.9; }
    } else if (conditions.isNight) {
        if (isFirebender) { multiplier *= 0.9; }
        if (isWaterbender) { multiplier *= 1.1; logReasons.push(`nighttime`); }
    }
    
    return { multiplier, logReasons };
}

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

function updateMomentum(current, label) {
    const changes = { 'Critical': 3, 'Strong': 2, 'Normal': 1, 'Weak': -2, 'Counter': 2 };
    return clamp(current + (changes[label] || 0), -5, 5);
}

function getToneAlignedVictoryEnding(winnerId, loserId, battleContext) {
    const winnerChar = characters[winnerId];
    const loserChar = characters[loserId];
    const archetypePool = postBattleVictoryPhrases[winnerChar.victoryStyle] || postBattleVictoryPhrases.default;
    const endingTemplate = battleContext.isCloseCall ? (archetypePool.narrow || archetypePool.dominant) : archetypePool.dominant;
    
    let populatedEnding = endingTemplate.replace(/{WinnerName}/g, `<span class="char-${winnerId}">${winnerChar.name}</span>`).replace(/{LoserName}/g, `<span class="char-${loserId}">${loserChar.name}</span>`).replace(/{WinnerPronounP}/g, winnerChar.pronouns.p);

    const finalQuote = getVictoryQuote(winnerChar, battleContext);
    if (finalQuote) populatedEnding += ` "${finalQuote}"`;
    return populatedEnding;
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

function generateOutcomeSummary(winner, loser) {
    const moveTypes = winner.moveHistory.map(m => m.type);
    const mostUsedType = ['Finisher', 'Offense', 'Defense', 'Utility'].map(type => ({ type, count: moveTypes.filter(t => t === type).length })).sort((a,b) => b.count - a.count)[0]?.type || 'versatile';
    const summaryMap = { 'Finisher': 'decisive finishing moves', 'Offense': 'relentless offense', 'Defense': 'impenetrable defense', 'Utility': 'clever tactical maneuvers', 'versatile': 'sheer versatility' };
    return `${winner.name}'s victory was sealed by ${winner.pronouns.p} ${summaryMap[mostUsedType]}.`;
}