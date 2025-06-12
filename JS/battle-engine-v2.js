// FILE: js/battle-engine-v2.js
'use strict';

const systemVersion = 'v16.2-AI-AntiLoop';
const legacyMode = false;

import { characters } from './characters.js';
import { locationConditions } from './location-battle-conditions.js';
import { moveInteractionMatrix, punishableMoves } from './move-interaction-matrix.js';
import { battlePhases, effectivenessLevels, phaseTemplates, postBattleVictoryPhrases, introductoryPhrases, impactPhrases, adverbPool, narrativeStatePhrases, weakMoveTransitions, finishingBlowPhrases } from './narrative-v2.js';
import { relationshipMatrix } from './relationship-matrix.js';
import { emotionalFlavor, tacticalFlavor } from './narrative-flavor.js';

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
        isStunned: false, tacticalState: null, // Replaces hasSetup
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
        [fighter1, fighter2].forEach(f => {
            f.mentalStateChangedThisTurn = false;
            // Tactical State duration countdown
            if (f.tacticalState) {
                f.tacticalState.duration--;
                if (f.tacticalState.duration <= 0) {
                    f.tacticalState = null;
                    interactionLog.push(`${f.name} recovered from their vulnerable state.`);
                }
            }
        });
        
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
            
            // Apply new tactical state if the move has one
            if (move.setup && result.effectiveness.label !== 'Weak') {
                defender.tacticalState = { ...move.setup };
            }
            // Consume tactical state on payoff
            if (move.moveTags?.includes('requires_opening') && result.payoff) {
                defender.tacticalState = null;
            }
            
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
    if (actor.tacticalState) stressThisTurn += 15; // Being in a vulnerable state is stressful
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
        case 'shaken': profile.patience *= 0.4; profile.opportunism *= 0.6; profile.aggression = clamp(profile.aggression + 0.2, 0, 1.2); profile.riskTolerance = clamp(profile.riskTolerance + 0.3, 0, 1.2); break;
        case 'broken': profile.patience = 0.05; profile.opportunism = 0.1; profile.aggression = clamp(profile.aggression + 0.4, 0, 1.3); profile.riskTolerance = clamp(profile.riskTolerance + 0.5, 0, 1.5); break;
    }
    return profile;
}

function selectMove(actor, defender, conditions) {
    const struggleMove = { name: "Struggle", verb: 'struggle', type: 'Offense', power: 10, element: 'physical', moveTags: [] };
    const availableMoves = getAvailableMoves(actor, conditions);
    
    const profile = getDynamicPersonality(actor);
    const energyPercent = (actor.energy / 100);
    let staminaState = energyPercent > 0.65 ? 'fresh' : (energyPercent > 0.3 ? 'winded' : 'exhausted');

    let opportunismBonus = 1.0;
    if (defender.isStunned) opportunismBonus += profile.opportunism * 1.0;
    else if (defender.momentum <= -3) opportunismBonus += profile.opportunism * 0.7;
    else if (defender.lastMoveEffectiveness === 'Weak') opportunismBonus += profile.opportunism * 0.4;
    else if (defender.tacticalState) opportunismBonus += profile.opportunism * 0.8 * defender.tacticalState.intensity;

    let weightedMoves = availableMoves.map(move => {
        let weight = 1.0;
        const energyCost = Math.round((move.power || 0) * 0.30) + 5;
        if (actor.energy < energyCost) return { move, weight: 0 };
        
        switch (move.type) {
            case 'Offense': weight *= (1 + profile.aggression * 0.5) * opportunismBonus; break;
            case 'Defense': weight *= 1 + (1 - profile.aggression) * 0.5; break;
            case 'Utility': weight *= 1 + profile.patience * 0.3; break;
            case 'Finisher': weight *= (1 + profile.riskTolerance * 0.5) * opportunismBonus; break;
        }

        // --- ANTI-LOOP & TACTICAL AI ---
        // If the defender is ALREADY vulnerable, massively de-prioritize creating another opening.
        if (defender.tacticalState && move.setup) {
            weight *= 0.05; // Attack, don't just set up again!
        }
        // If the defender is not vulnerable, STRONGLY prefer setup moves.
        else if (!defender.tacticalState && !defender.isStunned && move.setup) {
            weight *= (15.0 * move.setup.intensity);
        }

        if (staminaState === 'winded' && energyCost > 30) weight *= 0.6;
        if (staminaState === 'exhausted' && energyCost > 20) weight *= 0.3;
        if (staminaState !== 'fresh' && energyCost < 22) weight *= 1.3;

        if (actor.moveHistory.slice(-2).some(m => m.name === move.name)) weight *= 0.25;
        if (actor.moveFailureHistory.includes(move.name)) weight *= 0.1;
        
        if (move.moveTags?.includes('requires_opening')) {
            const openingExists = (defender.isStunned || defender.tacticalState);
            if(openingExists) {
                const intensity = defender.tacticalState?.intensity || 1.2;
                weight *= (25.0 * intensity);
            } else {
                 weight *= (profile.riskTolerance * 0.05);
            }
        }
        
        if (actor.mentalState.level === 'broken') {
            // A broken fighter lashes out. Heavily penalize anything that isn't raw offense.
            if (move.type === 'Utility' || move.type === 'Defense' || move.type === 'Finisher') {
                weight *= 0.01;
            }
        }

        return { move, weight };
    });

    weightedMoves.push({move: struggleMove, weight: 0.1});
    const validMoves = weightedMoves.filter(m => m.weight > 0);
    const sortedMoves = validMoves.sort((a,b) => b.weight - a.weight);
    const chosenMoveInfo = sortedMoves[0] || { move: struggleMove, weight: 0.1 };
    const chosenMove = chosenMoveInfo.move;
    
    let aiLogEntry = `Selected '${chosenMove.name}' (W: ${chosenMoveInfo.weight.toFixed(2)})|State:${actor.mentalState.level}|Stamina:${staminaState}`;
    if(defender.tacticalState) aiLogEntry += `|DEFENDER_STATE:${defender.tacticalState.name}`;
    
    return { move: chosenMove, aiLogEntry };
}

// --- NARRATIVE & COMBAT CALCULATION ---
function narrateMove(actor, target, move, result) {
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


function calculateMove(move, attacker, defender, conditions, interactionLog) {
    let basePower = move.power || 30;
    let multiplier = 1.0;
    let wasPunished = false;
    let payoff = false;
    let consumedStateName = null;

    if (move.moveTags?.includes('requires_opening')) {
        const openingExists = defender.isStunned || defender.tacticalState;
        if (openingExists) {
            if(defender.tacticalState) {
                multiplier *= defender.tacticalState.intensity;
                consumedStateName = defender.tacticalState.name;
                interactionLog.push(`${attacker.name}'s ${move.name} was amplified by ${defender.name} being ${defender.tacticalState.name}.`);
                payoff = true;
            } else if (defender.isStunned) {
                multiplier *= 1.3;
                interactionLog.push(`${attacker.name}'s ${move.name} capitalized on ${defender.name} being stunned.`);
                payoff = true;
            }
        } else if (punishableMoves[move.name]) {
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
    const energyCost = (move.name === 'Struggle') ? 0 : Math.round((move.power || 0) * 0.30) + 5;
    
    return { effectiveness: level, damage: clamp(damage, 0, 50), energyCost: clamp(energyCost, 5, 100), wasPunished, payoff, consumedStateName };
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
    if (conditions.isDay) { if (isFirebender) { multiplier *= 1.1; logReasons.push(`daylight`); } if (isWaterbender) { multiplier *= 0.9; }
    } else if (conditions.isNight) { if (isFirebender) { multiplier *= 0.9; } if (isWaterbender) { multiplier *= 1.1; logReasons.push(`nighttime`); } }
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