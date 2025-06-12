// FILE: js/battle-engine-v2.js
'use strict';

const systemVersion = 'v10.1-S++-RML-Bugfix-Pass';
const legacyMode = false;

import { characters } from './characters.js';
import { locationConditions } from './location-battle-conditions.js';
import { moveInteractionMatrix, punishableMoves } from './move-interaction-matrix.js';
import { battlePhases, effectivenessLevels, phaseTemplates, postBattleVictoryPhrases, introductoryPhrases, impactPhrases, adverbPool, narrativeStatePhrases, weakMoveTransitions, finishingBlowPhrases } from './narrative-v2.js';
import { relationshipMatrix } from './relationship-matrix.js';
import { emotionalFlavor } from './narrative-flavor.js';

// --- HELPER FUNCTIONS (MOVED TO TOP-LEVEL SCOPE) ---
const getRandomElement = (arr, fallback = null) => {
    if (!arr || arr.length === 0) return fallback;
    return arr[Math.floor(Math.random() * arr.length)];
};
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

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
function initializeFighterState(charId, opponentId, emotionalMode) {
    const character = characters[charId];
    let state = { 
        id: charId, name: character.name, ...JSON.parse(JSON.stringify(character)), 
        hp: 100, energy: 100, momentum: 0, lastMove: null, lastMoveEffectiveness: null,
        isStunned: false, hasSetup: false,
        movesUsed: [], phraseHistory: {}, moveHistory: [], moveFailureHistory: [],
        consecutiveDefensiveTurns: 0, aiLog: [],
        // RML Properties
        relationalState: null,
        emotionalState: 'normal', // normal, desperate, breakdown, merciful
        emotionalStateChangedThisTurn: false,
    };

    if (emotionalMode && relationshipMatrix[charId] && relationshipMatrix[charId][opponentId]) {
        state.relationalState = relationshipMatrix[charId][opponentId];
    }
    
    return state;
}

export function simulateBattle(f1Id, f2Id, locId, timeOfDay, emotionalMode = false) {
    let fighter1 = initializeFighterState(f1Id, f2Id, emotionalMode);
    let fighter2 = initializeFighterState(f2Id, f1Id, emotionalMode);
    
    const conditions = { ...locationConditions[locId] };
    conditions.isDay = (timeOfDay === 'day');
    conditions.isNight = (timeOfDay === 'night');

    let turnLog = [], interactionLog = [];
    let initiator = (fighter1.powerTier > fighter2.powerTier) ? fighter1 : fighter2;
    let responder = (initiator.id === fighter1.id) ? fighter2 : fighter1;
    const maxTurns = 6;
    let battleOver = false;

    for (let turn = 0; turn < maxTurns && !battleOver; turn++) {
        fighter1.emotionalStateChangedThisTurn = false;
        fighter2.emotionalStateChangedThisTurn = false;

        const phaseName = battlePhases[turn]?.name || "Final Exchange";
        const phaseEmoji = battlePhases[turn]?.emoji || "💥";
        let phaseContent = phaseTemplates.header.replace('{phaseName}', phaseName).replace('{phaseEmoji}', phaseEmoji);
        
        const processTurn = (attacker, defender) => {
            if (battleOver) return;
            
            attacker.isStunned = false; 

            // --- RML: Emotional State Check ---
            checkEmotionalState(attacker, defender);

            const { move, aiLogEntry } = selectMove(attacker, defender, conditions);
            attacker.aiLog.push(`[T${turn+1}] ${aiLogEntry}`);

            const result = calculateMove(move, attacker, defender, conditions, interactionLog);
            
            attacker.momentum = updateMomentum(attacker.momentum, result.effectiveness.label);
            attacker.lastMoveEffectiveness = result.effectiveness.label;
            
            const isDefensiveMove = move.type === 'Utility' || (move.type === 'Defense');
            attacker.consecutiveDefensiveTurns = isDefensiveMove ? attacker.consecutiveDefensiveTurns + 1 : 0;
            attacker.hasSetup = (isDefensiveMove && !isReactive(defender));
            
            if (result.effectiveness.label === 'Critical') defender.isStunned = true;
            if (result.wasPunished) { 
                attacker.moveFailureHistory.push(move.name);
                if (attacker.moveFailureHistory.length > 3) attacker.moveFailureHistory.shift(); 
            }
            
            phaseContent += narrateMove(attacker, defender, move, result);
            defender.hp = clamp(defender.hp - result.damage, 0, 100);
            attacker.energy = clamp(attacker.energy - result.energyCost, 0, 100);
            attacker.lastMove = move;
            attacker.moveHistory.push(move);
            attacker.movesUsed.push(move.name);

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
    
    if (loser.hp > 0) {
        turnLog.push(phaseTemplates.timeOutVictory.replace(/{winnerName}/g, `<span class="char-${winner.id}">${winner.name}</span>`).replace(/{loserName}/g, `<span class="char-${loser.id}">${loser.name}</span>`));
    } else {
        turnLog.push(phaseTemplates.finalBlow.replace(/{winnerName}/g, `<span class="char-${winner.id}">${winner.name}</span>`).replace(/{loserName}/g, `<span class="char-${loser.id}">${loser.name}</span>`));
    }
    const finalEnding = getToneAlignedVictoryEnding(winner.id, loser.id, { isCloseCall: winner.hp < 35, isDominant: loser.hp <= 0 && winner.hp > 75, opponentId: loser.id });
    turnLog.push(phaseTemplates.conclusion.replace('{endingNarration}', finalEnding));

    return { log: turnLog.join(''), winnerId: winner.id, loserId: loser.id, finalState: { fighter1, fighter2 } };
}

// --- RML & AI SYSTEMS ---
function checkEmotionalState(actor, defender) {
    if (actor.emotionalState !== 'normal') return; // State is locked once changed

    let triggerReason = null;
    if (actor.relationalState?.emotionalModifiers?.breakdownTrigger && actor.hp < 40 && actor.momentum <= -2) {
        actor.emotionalState = 'breakdown';
        triggerReason = "Relational Breakdown";
    } else if (actor.hp < 25 && actor.momentum <= -3) {
        actor.emotionalState = 'desperate';
        triggerReason = "Low HP/Momentum";
    } else if (actor.relationalState?.emotionalModifiers?.mercyTrigger && defender.hp < 20) {
        actor.emotionalState = 'merciful';
        triggerReason = "Opponent HP Low";
    }

    if (triggerReason) {
        actor.aiLog.push(`[Emotional Shift]: ${actor.name} enters ${actor.emotionalState.toUpperCase()} state due to ${triggerReason}.`);
        actor.emotionalStateChangedThisTurn = true;
    }
}

function getDynamicPersonality(actor) {
    let profile = { ...actor.personalityProfile };
    const modifiers = actor.relationalState?.emotionalModifiers || {};

    // Apply relational modifiers
    profile.aggression = clamp(profile.aggression + (modifiers.aggressionBoost || 0) - (modifiers.aggressionReduction || 0), 0, 1);
    profile.patience = clamp(profile.patience + (modifiers.patienceBoost || 0) - (modifiers.patienceReduction || 0), 0, 1);
    profile.riskTolerance = clamp(profile.riskTolerance + (modifiers.riskToleranceBoost || 0) - (modifiers.riskToleranceReduction || 0), 0, 1);
    profile.opportunism = clamp(profile.opportunism + (modifiers.opportunismBoost || 0) - (modifiers.opportunismReduction || 0), 0, 1);
    
    // Apply emotional state overrides
    switch (actor.emotionalState) {
        case 'breakdown':
            profile.riskTolerance = clamp(profile.riskTolerance + 0.5, 0, 1.2);
            profile.patience *= 0.2;
            profile.aggression = clamp(profile.aggression + 0.3, 0, 1.2);
            break;
        case 'desperate':
            profile.riskTolerance = clamp(profile.riskTolerance + 0.4, 0, 1.1);
            profile.patience *= 0.5;
            break;
        case 'merciful':
            profile.aggression *= 0.3;
            profile.riskTolerance *= 0.5;
            break;
    }
    
    return profile;
}

function selectMove(actor, defender, conditions) {
    const availableMoves = getAvailableMoves(actor, conditions);
    const struggleMove = { name: "Struggle", verb: 'struggle', type: 'Offense', power: 10, element: 'physical', moveTags: [] };
    if (!availableMoves || availableMoves.length === 0) return { move: struggleMove, aiLogEntry: "No moves available, selected Struggle." };
    
    const profile = getDynamicPersonality(actor);
    
    const isDesperate = actor.hp < 30 || actor.momentum <= -3;
    const hasMomentum = actor.momentum >= 3;
    const isStalling = actor.consecutiveDefensiveTurns >= 2;
    
    profile.riskTolerance = isDesperate ? clamp(profile.riskTolerance + 0.2, 0, 1.1) : profile.riskTolerance;
    profile.aggression = hasMomentum ? clamp(profile.aggression + 0.1, 0, 1.1) : profile.aggression;

    let opportunismBonus = 1.0, openingReason = 'None';
    if (defender.isStunned) { opportunismBonus += profile.opportunism * 1.0; openingReason = 'Stun'; }
    else if (defender.momentum <= -3) { opportunismBonus += profile.opportunism * 0.7; openingReason = 'Momentum'; }
    else if (defender.lastMoveEffectiveness === 'Weak') { opportunismBonus += profile.opportunism * 0.4; openingReason = 'Weakness'; }

    const weightedMoves = availableMoves.map(move => {
        let weight = 1.0;
        let reasons = [];

        switch (move.type) {
            case 'Offense': weight *= (1.0 + (profile.aggression * 0.5)) * opportunismBonus; reasons.push('A'); break;
            case 'Defense': weight *= (1.0 + ((1 - profile.aggression) * 0.5)); reasons.push('d'); break;
            case 'Utility': weight *= (1.0 + (profile.patience * 0.3)); reasons.push('p'); break;
            case 'Finisher': weight *= (1.0 + (profile.riskTolerance * 0.5)) * opportunismBonus; reasons.push('R'); break;
        }

        if (actor.movesUsed.slice(-2).includes(move.name)) weight *= 0.2;
        if (actor.moveFailureHistory.includes(move.name)) weight *= 0.1;

        if (isStalling && (move.type === 'Defense' || move.type === 'Utility')) {
            weight *= 0.5;
            reasons.push('StallPrev');
        }
        
        if (move.moveTags.includes('requires_opening')) {
            const openingExists = (defender.isStunned || defender.momentum <= -3 || defender.lastMoveEffectiveness === 'Weak' || actor.hasSetup);
            if (openingExists) { weight *= 20.0; reasons.push('Open+'); }
            else { weight *= (profile.riskTolerance * 0.1); reasons.push('Risk-'); }
        }
        
        if (actor.energy < (move.power || 0) * 0.5) weight = 0;

        return { move, weight, reasons };
    });

    const sortedMoves = weightedMoves.filter(m => m.weight > 0).sort((a,b) => b.weight - a.weight);
    const chosenMoveInfo = sortedMoves.length > 0 ? sortedMoves[0] : null;
    const chosenMove = chosenMoveInfo ? chosenMoveInfo.move : struggleMove;

    let aiLogEntry = `Selected '${chosenMove.name}'`
    if(chosenMoveInfo) {
        aiLogEntry += ` (W: ${chosenMoveInfo.weight.toFixed(2)}). Factors: [${chosenMoveInfo.reasons.join(',')}]`;
    }
    if (opportunismBonus > 1.0) aiLogEntry += `|Opp:${openingReason}`;
    if (actor.emotionalState !== 'normal') aiLogEntry += `|State:${actor.emotionalState.toUpperCase()}`;
    
    return { move: chosenMove, aiLogEntry };
}


// --- NARRATIVE & COMBAT CALCULATION ---

function narrateMove(actor, target, move, result) {
    const actorSpan = `<span class="char-${actor.id}">${actor.name}</span>`;
    const targetSpan = `<span class="char-${target.id}">${target.name}</span>`;
    
    // --- RML: Inject Emotional Flavor Text ---
    let emotionalPrefix = '';
    if (actor.emotionalStateChangedThisTurn) {
        const flavorPool = emotionalFlavor[actor.id]?.[actor.emotionalState] || emotionalFlavor.generic[actor.emotionalState];
        if (flavorPool) {
            emotionalPrefix = getRandomElement(flavorPool)
                .replace(/{actorName}/g, actorSpan)
                .replace(/{targetName}/g, targetSpan)
                .replace(/{possessive}/g, actor.pronouns.p) + ' ';
        }
    } else if (actor.relationalState && Math.random() < 0.2) { // Chance for a random taunt if relationship exists
        const tauntPool = emotionalFlavor[actor.id]?.taunt;
        const taunt = tauntPool ? tauntPool[target.id] || tauntPool.generic : null;
        if (taunt) {
            emotionalPrefix = `${actorSpan} taunts, "<em>${taunt}</em>" `;
        }
    }

    if (move.type === 'Defense' || move.type === 'Utility') {
        const reactive = isReactive(target);
        const impactTemplates = reactive ? impactPhrases.DEFENSE.REACTIVE : impactPhrases.DEFENSE.PROACTIVE;
        let prefix = reactive ? "Reacting quickly," : "Preparing carefully,";
        let impactSentence = getRandomElement(impactTemplates).replace(/{actorName}/g, actorSpan).replace(/{possessive}/g, actor.pronouns.p);
        const description = `${emotionalPrefix}${prefix} ${actorSpan} uses the ${move.name}. ${impactSentence}`;
        const label = reactive ? "Counter" : "Set-up";
        return phaseTemplates.move.replace(/{actorId}/g, actor.id).replace(/{actorName}/g, actor.name).replace(/{moveName}/g, move.name).replace(/{moveEmoji}/g, move.emoji || '✨').replace(/{effectivenessLabel}/g, label).replace(/{effectivenessEmoji}/g, '🛡️').replace(/{moveDescription}/g, description);
    }
    
    let statePrefix = '';
    if (actor.momentum >= 3) statePrefix = getRandomElement(narrativeStatePhrases.momentum_gain);
    else if (actor.momentum <= -3) statePrefix = getRandomElement(narrativeStatePhrases.momentum_loss);
    
    const intro = statePrefix ? '' : getRandomElement(introductoryPhrases);
    const verb = conjugateVerb(move.verb || 'executes');
    const objectPhrase = assembleObjectPhrase(move);
    const adverb = getRandomElement(adverbPool.offensive);
    
    let fullAction = `${emotionalPrefix}${(statePrefix || intro).replace(/{possessive}/g, actor.pronouns.p)} ${actorSpan} ${verb} ${objectPhrase} ${adverb}.`;

    let impactSentence;
    if (target.hp - result.damage <= 0 && result.damage > 0) {
        impactSentence = getRandomElement(finishingBlowPhrases).replace(/{targetName}/g, targetSpan);
    } else {
        const impactPool = impactPhrases.DEFAULT[result.effectiveness.label.toUpperCase()];
        impactSentence = getRandomElement(impactPool).replace(/{targetName}/g, targetSpan);
    }
    
    const description = `${fullAction} ${impactSentence}`.replace(/\s\./g, '.').replace(/\s+/g, ' ').trim();

    return phaseTemplates.move
        .replace(/{actorId}/g, actor.id).replace(/{actorName}/g, actor.name).replace(/{moveName}/g, move.name).replace(/{moveEmoji}/g, move.emoji || '✨')
        .replace(/{effectivenessLabel}/g, result.effectiveness.label).replace(/{effectivenessEmoji}/g, result.effectiveness.emoji)
        .replace(/{moveDescription}/g, description);
}

function calculateMove(move, attacker, defender, conditions, interactionLog) {
    let basePower = move.power || 30;
    let multiplier = 1.0;
    let effectReasons = [];
    let wasPunished = false;
    
    if (move.moveTags.includes('requires_opening')) {
        const punishmentRule = punishableMoves[move.name];
        if (punishmentRule) {
            let openingFound = (defender.isStunned || defender.momentum <= -3 || defender.lastMoveEffectiveness === 'Weak' || attacker.hasSetup);
            if (!openingFound) {
                multiplier *= punishmentRule.penalty;
                effectReasons.push("punished due to a lack of opening");
                wasPunished = true;
            }
        }
    }
    
    const { multiplier: envMultiplier, logReasons: envReasons } = applyEnvironmentalModifiers(move, attacker, conditions);
    multiplier *= envMultiplier;
    effectReasons.push(...envReasons);

    if (defender.lastMove) {
        const attackerInteractions = moveInteractionMatrix[move.name];
        if (attackerInteractions?.counters?.[defender.lastMove.name]) {
            multiplier *= attackerInteractions.counters[defender.lastMove.name];
            effectReasons.push(`countered ${defender.name}'s ${defender.lastMove.name}`);
        }
        const defenderInteractions = moveInteractionMatrix[defender.lastMove.name];
        if (defenderInteractions?.counters?.[move.name]) {
            multiplier /= defenderInteractions.counters[move.name];
            effectReasons.push(`countered by ${defender.name}'s ${defender.lastMove.name}`);
        }
    }
    
    if (effectReasons.length > 0) {
        interactionLog.push(`${attacker.name}'s ${move.name} was ${effectReasons.join(', ')}.`);
    }

    const totalEffectiveness = basePower * multiplier;
    
    let level, energyMultiplier = 1.0;
    if (totalEffectiveness < basePower * 0.7) { level = effectivenessLevels.WEAK; energyMultiplier = 1.2; } 
    else if (totalEffectiveness > basePower * 1.5) { level = effectivenessLevels.CRITICAL; energyMultiplier = 0.8; } 
    else if (totalEffectiveness > basePower * 1.1) { level = effectivenessLevels.STRONG; energyMultiplier = 0.95; } 
    else { level = effectivenessLevels.NORMAL; }
    
    const damage = (move.type.includes('Offense') || move.type.includes('Finisher')) ? Math.round(totalEffectiveness / 3) : 0;
    const energyCost = Math.round(((move.power || 0) * 0.5) * energyMultiplier);

    return { effectiveness: level, damage: clamp(damage, 0, 50), energyCost: clamp(energyCost, 5, 100), wasPunished };
}

function getAvailableMoves(actor, conditions) {
    const struggleMove = { name: "Struggle", verb: 'struggle', type: 'Offense', power: 10, element: 'physical', moveTags: [], usageRequirements: {} };
    if (!actor.techniques) return [struggleMove];
    
    const available = actor.techniques.filter(move => {
        if (!move.usageRequirements) return true;
        return Object.entries(move.usageRequirements).every(([key, val]) => conditions[key] === val);
    });

    return available.length > 0 ? available : [struggleMove];
}

function applyEnvironmentalModifiers(move, attacker, conditions) {
    let multiplier = 1.0;
    let logReasons = new Set();
    
    if (attacker.environmentalAffinity) {
        Object.entries(attacker.environmentalAffinity).forEach(([key, mod]) => {
            if (conditions[key]) {
                multiplier *= mod;
                logReasons.add(mod > 1 ? `empowered by ${key} terrain` : `weakened by ${key} terrain`);
            }
        });
    }

    const isFirebender = attacker.techniques.some(t => t.element === 'fire' || t.element === 'lightning');
    const isWaterbender = attacker.techniques.some(t => t.element === 'water' || t.element === 'ice');
    if (conditions.isDay) {
        if (isFirebender) { multiplier *= 1.1; logReasons.add(`empowered by daylight`); }
        if (isWaterbender) { multiplier *= 0.9; logReasons.add(`weakened by daylight`); }
    } else if (conditions.isNight) {
        if (isFirebender) { multiplier *= 0.9; logReasons.add(`weakened by nighttime`); }
        if (isWaterbender) { multiplier *= 1.1; logReasons.add(`empowered by nighttime`); }
    }

    Object.entries(move.environmentBonuses || {}).forEach(([key, mod]) => {
        if(conditions[key]) { multiplier *= mod; logReasons.add(`move empowered by ${key}`); }
    });
    Object.entries(move.environmentPenalties || {}).forEach(([key, mod]) => {
        if(conditions[key]) { multiplier *= (1/mod); logReasons.add(`move weakened by ${key}`); }
    });

    return { multiplier, logReasons: Array.from(logReasons) };
}

const isReactive = (defender) => defender.lastMove?.type === 'Offense';

function updateMomentum(current, label) {
    const changes = { 'Critical': 3, 'Strong': 2, 'Normal': 1, 'Weak': -2, 'Counter': 2 };
    return clamp(current + (changes[label] || 0), -5, 5);
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

function generateOutcomeSummary(winner, loser) {
    const moveTypes = winner.moveHistory.map(m => m.type);
    const mostUsedType = ['Finisher', 'Offense', 'Defense', 'Utility'].map(type => ({ type, count: moveTypes.filter(t => t === type).length })).sort((a, b) => b.count - a.count)[0]?.type || 'versatile';
    
    const summaryMap = {
        'Finisher': `decisive finishing moves`, 'Offense': `relentless offense`,
        'Defense': `impenetrable defense`, 'Utility': `clever tactical maneuvers`, 'versatile': `sheer versatility`
    };
    
    let summary = `${winner.name}'s victory was sealed by ${winner.pronouns.p} ${summaryMap[mostUsedType]}.`;
    if (winner.momentum - loser.momentum >= 5) {
        summary += ` ${winner.pronouns.p.charAt(0).toUpperCase() + winner.pronouns.p.slice(1)} commanding momentum overwhelmed ${loser.name}.`;
    }
    return summary;
}