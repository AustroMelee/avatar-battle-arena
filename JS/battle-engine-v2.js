// FILE: battle-engine-v2.js
'use strict';

const systemVersion = 'v9.2-C+-DayNight-Overkill-Pass';
const legacyMode = false; // Set to true to disable matrix logic for debugging

import { characters } from './characters.js';
import { locationConditions } from './location-battle-conditions.js';
import { moveInteractionMatrix, punishableMoves } from './move-interaction-matrix.js';
import { battlePhases, effectivenessLevels, phaseTemplates, postBattleVictoryPhrases, introductoryPhrases, impactPhrases, adverbPool, narrativeStatePhrases, weakMoveTransitions, finishingBlowPhrases } from './narrative-v2.js';

// --- HELPER FUNCTIONS ---
const getRandomElement = (arr, fallback = null) => {
    if (!arr || arr.length === 0) return fallback;
    const recentHistory = arr.slice(-3);
    const available = arr.filter(item => !recentHistory.includes(item));
    return (available.length > 0) ? available[Math.floor(Math.random() * available.length)] : arr[Math.floor(Math.random() * arr.length)];
};
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

function getWeightedRandom(items) {
    if (!items || items.length === 0) return null;
    const totalWeight = items.reduce((sum, item) => sum + (item.weight || 1), 0);
    if (totalWeight <= 0) {
        return null;
    }

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
function initializeFighterState(charId) {
    const character = characters[charId];
    return { 
        id: charId, name: character.name, ...JSON.parse(JSON.stringify(character)), 
        hp: 100, energy: 100, momentum: 0, lastMove: null, lastMoveEffectiveness: null,
        isStunned: false, hasSetup: false, loggedEnvEffects: new Set(),
        movesUsed: [], phraseHistory: {}, moveHistory: [],
        moveFailureHistory: [], // A+ Feature: AI Memory
        consecutiveDefensiveTurns: 0, // Stall detection
        aiLog: [], // For logging AI decisions
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

export function simulateBattle(f1Id, f2Id, locId, timeOfDay) {
    let fighter1 = initializeFighterState(f1Id);
    let fighter2 = initializeFighterState(f2Id);
    
    // Create combined battle conditions
    const conditions = { ...locationConditions[locId] };
    if (timeOfDay) {
        conditions.isDay = (timeOfDay === 'day');
        conditions.isNight = (timeOfDay === 'night');
    } else { // Backward compatibility default
        conditions.isDay = true;
        conditions.isNight = false;
    }

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
            
            attacker.isStunned = false; 

            const { move, aiLogEntry } = selectMove(attacker, defender, conditions);
            attacker.aiLog.push(`[T${turn+1}] ${aiLogEntry}`);

            const result = calculateMove(move, attacker, defender, conditions, interactionLog);
            
            attacker.momentum = updateMomentum(attacker.momentum, result.effectiveness.label);
            attacker.lastMoveEffectiveness = result.effectiveness.label;
            
            const isDefensiveMove = move.type === 'Utility' || (move.type === 'Defense');
            if (isDefensiveMove) {
                attacker.consecutiveDefensiveTurns++;
                if(!isReactive(defender)) attacker.hasSetup = true;
            } else {
                attacker.consecutiveDefensiveTurns = 0;
                attacker.hasSetup = false;
            }
            
            if (result.effectiveness.label === 'Critical') defender.isStunned = true;
            if (result.wasPunished) { 
                attacker.moveFailureHistory.push(move.name);
                if (attacker.moveFailureHistory.length > 2) attacker.moveFailureHistory.shift(); 
            }
            
            phaseContent += narrateMove(attacker, defender, move, result);
            defender.hp = clamp(defender.hp - result.damage, 0, 100);
            attacker.energy = clamp(attacker.energy - result.energyCost, 0, 100);
            attacker.lastMove = move;

            if (!Array.isArray(attacker.movesUsed)) attacker.movesUsed = [];
            if (!Array.isArray(attacker.moveHistory)) attacker.moveHistory = [];
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
    
    if (interactionLog.length === 0) {
        interactionLog.push('No significant environmental or move-interaction modifiers were in play.');
    }
    winner.interactionLog = [...new Set(interactionLog)];
    const summary = generateOutcomeSummary(winner, loser);
    winner.summary = summary;
    
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
function getAvailableMoves(actor, conditions) {
    const struggleMove = { name: "Struggle", verb: 'struggle', type: 'Offense', power: 10, element: 'physical', moveTags: [], usageRequirements: {}, environmentBonuses: {}, environmentPenalties: {} };
    if (!actor.techniques || actor.techniques.length === 0) return [struggleMove];

    const available = actor.techniques.filter(move => {
        if (!move.usageRequirements) return true;
        for (const [key, requiredValue] of Object.entries(move.usageRequirements || {})) {
            if (conditions[key] !== requiredValue) {
                return false;
            }
        }
        return true;
    });
    
    return available.length > 0 ? available : [struggleMove];
}


function selectMove(actor, defender, conditions) {
    const availableMoves = getAvailableMoves(actor, conditions);
    const struggleMove = { name: "Struggle", verb: 'struggle', type: 'Offense', power: 10, element: 'physical', moveTags: [] };
    if (!availableMoves || availableMoves.length === 0) return { move: struggleMove, aiLogEntry: "No moves available, selected Struggle." };

    const recentMoves = actor.movesUsed.slice(-3);
    const { aggression, patience, riskTolerance, opportunism } = actor.personalityProfile;

    // --- DYNAMIC AI MODIFIERS ---
    const isDesperate = actor.hp < 30 || actor.momentum <= -3;
    const hasMomentum = actor.momentum >= 3;
    const isStalling = actor.consecutiveDefensiveTurns >= 2;
    const dynamicRisk = isDesperate ? clamp(riskTolerance * 1.5, 0, 1.0) : riskTolerance;
    const dynamicAggression = hasMomentum ? clamp(aggression * 1.2, 0, 1.0) : aggression;

    // --- TIERED OPPORTUNISM ---
    let opportunismBonus = 1.0;
    let openingReason = 'None';
    if (defender.isStunned) {
        opportunismBonus += opportunism * 1.0;
        openingReason = 'Stun';
    } else if (defender.momentum <= -3) {
        opportunismBonus += opportunism * 0.7;
        openingReason = 'Momentum';
    } else if (defender.lastMoveEffectiveness === 'Weak') {
        opportunismBonus += opportunism * 0.4;
        openingReason = 'Weakness';
    }

    const weightedMoves = availableMoves.map(move => {
        let weight = 1.0;
        let reasons = [];

        // Base Personality Weighting
        switch (move.type) {
            case 'Offense': weight *= (1.0 + (dynamicAggression * 0.5)) * opportunismBonus; reasons.push('A'); break;
            case 'Defense': weight *= 1.0 + ((1 - dynamicAggression) * 0.5); reasons.push('d'); break;
            case 'Utility': weight *= 1.0 + (patience * 0.3); reasons.push('p'); break;
            case 'Finisher': weight *= (1.0 + (dynamicRisk * 0.5)) * opportunismBonus; reasons.push('R'); break;
        }

        // Penalty for recently used moves
        if (recentMoves.includes(move.name)) weight *= 0.2;
        // Penalty for recently failed punishable moves
        if (actor.moveFailureHistory && actor.moveFailureHistory.includes(move.name)) weight *= 0.1;

        // Stall Prevention
        if (isStalling && (move.type === 'Defense' || move.type === 'Utility')) {
            weight *= 0.5;
            reasons.push('StallPrev');
        }
        
        // Punishable Move Logic
        if (move.moveTags.includes('requires_opening')) {
            const openingExists = (defender.isStunned || defender.momentum <= -3 || defender.lastMoveEffectiveness === 'Weak' || actor.hasSetup);
            if (openingExists) {
                weight *= 20.0; // Huge bonus if opening is present
                reasons.push('Open+');
            } else {
                weight *= (dynamicRisk * 0.1); // Risky characters might still try
                reasons.push('Risk-');
            }
        }
        
        // Energy Check
        if (actor.energy < (move.power || 0) * 0.5) weight = 0;

        return { move, weight, reasons };
    });

    const chosenMoveInfo = weightedMoves.sort((a,b) => b.weight - a.weight)[0];
    const chosenMove = chosenMoveInfo.move;

    let aiLogEntry = `Selected '${chosenMove.name}' (W: ${chosenMoveInfo.weight.toFixed(2)}). Factors: [${chosenMoveInfo.reasons.join(', ')}]`;
    if (opportunismBonus > 1.0) aiLogEntry += ` | Opp: ${openingReason}`;
    if (isDesperate) aiLogEntry += ` | Desperate!`;
    
    return { move: chosenMove, aiLogEntry };
}

function calculateMove(move, attacker, defender, conditions, interactionLog) {
    let basePower = move.power || 30;
    let multiplier = 1.0;
    let effectReasons = [];
    let wasPunished = false;
    
    // --- PUNISHMENT MECHANICS ---
    if (!legacyMode && move.moveTags.includes('requires_opening')) {
        const punishmentRule = punishableMoves[move.name];
        if (punishmentRule) {
            let openingFound = false;
            if (punishmentRule.openingConditions.includes('defender_is_stunned') && defender.isStunned) openingFound = true;
            if (punishmentRule.openingConditions.includes('defender_momentum_negative') && defender.momentum <= -3) openingFound = true;
            if (punishmentRule.openingConditions.includes('defender_last_move_weak') && defender.lastMoveEffectiveness === 'Weak') openingFound = true;
            if (punishmentRule.openingConditions.includes('attacker_has_setup') && attacker.hasSetup) openingFound = true;

            if (!openingFound) {
                multiplier *= punishmentRule.penalty;
                effectReasons.push("was punished due to a lack of opening");
                wasPunished = true;
            }
        }
    }
    
    // --- DATA-DRIVEN ENVIRONMENTAL MODIFIERS ---
    const { multiplier: envMultiplier, logReasons: envReasons, primaryFactor } = applyEnvironmentalModifiers(move, attacker, conditions);
    multiplier *= envMultiplier;
    effectReasons.push(...envReasons);

    // --- MOVE INTERACTION MATRIX ---
    if (!legacyMode && defender.lastMove) {
        const attackerMoveName = move.name;
        const defenderMoveName = defender.lastMove.name;
        
        const attackerInteractions = moveInteractionMatrix[attackerMoveName];
        if (attackerInteractions && attackerInteractions.counters?.[defenderMoveName]) {
            multiplier *= attackerInteractions.counters[defenderMoveName];
            effectReasons.push(`countered ${defender.name}'s ${defenderMoveName}`);
        }
        const defenderInteractions = moveInteractionMatrix[defenderMoveName];
        if (defenderInteractions && defenderInteractions.counters?.[attackerMoveName]) {
            multiplier *= (1 / defenderInteractions.counters[attackerMoveName]);
            effectReasons.push(`was countered by ${defender.name}'s ${defenderMoveName}`);
        }
    }
    
    if (effectReasons.length > 0) {
        interactionLog.push(`${attacker.name}'s ${move.name} ${effectReasons.join(', ')}.`);
    }

    const totalEffectiveness = basePower * multiplier;
    
    let level;
    let energyMultiplier = 1.0;
    if (totalEffectiveness < basePower * 0.7) { level = effectivenessLevels.WEAK; energyMultiplier = 1.2; } 
    else if (totalEffectiveness > basePower * 1.5) { level = effectivenessLevels.CRITICAL; energyMultiplier = 0.8; } 
    else if (totalEffectiveness > basePower * 1.1) { level = effectivenessLevels.STRONG; energyMultiplier = 0.95; } 
    else { level = effectivenessLevels.NORMAL; }
    
    const damage = move.type.includes('Offense') || move.type.includes('Finisher') ? Math.round(totalEffectiveness / 3) : 0;
    const energyCost = Math.round(((move.power || 0) * 0.5) * energyMultiplier);

    return { effectiveness: level, damage: clamp(damage, 0, 50), energyCost: clamp(energyCost, 5, 100), wasPunished, primaryEnvFactor: primaryFactor };
}

function applyEnvironmentalModifiers(move, attacker, conditions) {
    let multiplier = 1.0;
    let logReasons = { affinity: new Set(), move: new Set() };
    let primaryFactor = { type: null, strength: 0 };

    // 1. Character-level environmental affinity
    if (attacker.environmentalAffinity) {
        for (const [key, affinityModifier] of Object.entries(attacker.environmentalAffinity)) {
            if (conditions[key]) {
                multiplier *= affinityModifier;
                const reason = affinityModifier > 1 ? `empowered by the ${key} terrain` : `weakened by the ${key} terrain`;
                logReasons.affinity.add(reason);
                if (Math.abs(1 - affinityModifier) > primaryFactor.strength) {
                    primaryFactor = { type: reason, strength: Math.abs(1 - affinityModifier) };
                }
            }
        }
    }
    
    // 2. Time of Day Affinity
    const isFirebender = attacker.techniques.some(t => t.element === 'fire' || t.element === 'lightning');
    const isWaterbender = attacker.techniques.some(t => t.element === 'water' || t.element === 'ice');
    if (conditions.isDay) {
        if (isFirebender) { multiplier *= 1.1; logReasons.affinity.add(`empowered by daylight (Affinity)`); }
        if (isWaterbender) { multiplier *= 0.9; logReasons.affinity.add(`weakened by daylight (Affinity)`); }
    } else if (conditions.isNight) {
        if (isFirebender) { multiplier *= 0.9; logReasons.affinity.add(`weakened by nighttime (Affinity)`); }
        if (isWaterbender) { multiplier *= 1.1; logReasons.affinity.add(`empowered by nighttime (Affinity)`); }
    }


    // 3. Move-specific environmental bonuses/penalties
    for (const [key, bonus] of Object.entries(move.environmentBonuses || {})) {
        if (conditions[key]) {
            multiplier *= bonus;
            const reason = `empowered by the ${key} environment`;
            logReasons.move.add(reason);
            if (Math.abs(1 - bonus) > primaryFactor.strength) {
                primaryFactor = { type: reason, strength: Math.abs(1 - bonus) };
            }
        }
    }
    for (const [key, penalty] of Object.entries(move.environmentPenalties || {})) {
        if (conditions[key]) {
            multiplier *= penalty;
            const reason = `weakened by the ${key} environment`;
            logReasons.move.add(reason);
            if (Math.abs(1 - penalty) > primaryFactor.strength) {
                primaryFactor = { type: reason, strength: Math.abs(1 - penalty) };
            }
        }
    }

    const finalLogReasons = [];
    logReasons.affinity.forEach(r => finalLogReasons.push(`${r}`));
    logReasons.move.forEach(r => finalLogReasons.push(`${r}`));

    return { multiplier, logReasons: finalLogReasons, primaryFactor: primaryFactor.type };
}

const isReactive = (defender) => defender.lastMove?.type === 'Offense';

function getSmartRandomPhrase(actor, poolKey, pool) {
    if (!actor.phraseHistory[poolKey]) actor.phraseHistory[poolKey] = [];
    let history = actor.phraseHistory[poolKey];
    const available = pool.filter(phrase => !history.includes(phrase));
    let chosenPhrase = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : pool[Math.floor(Math.random() * pool.length)];
    if (available.length === 0) history.length = 0;
    history.push(chosenPhrase);
    if (history.length > 5) history.shift();
    return chosenPhrase;
}

function updateMomentum(currentMomentum, effectivenessLabel) {
    let change = 0;
    if (effectivenessLabel === 'Critical') change = 3;
    else if (effectivenessLabel === 'Strong') change = 2;
    else if (effectivenessLabel === 'Normal') change = 1;
    else if (effectivenessLabel === 'Weak') change = -2;
    else if (effectivenessLabel === 'Counter') change = 2; // A+ Feature: Enhanced momentum
    return clamp(currentMomentum + change, -5, 5);
}

function narrateMove(actor, target, move, result) {
    const actorSpan = `<span class="char-${actor.id}">${actor.name}</span>`;
    const targetSpan = `<span class="char-${target.id}">${target.name}</span>`;
    
    // Defensive/Utility moves have their own narration path
    if (move.type === 'Defense' || move.type === 'Utility') {
        const reactive = isReactive(target);
        const impactTemplates = reactive ? impactPhrases.DEFENSE.REACTIVE : impactPhrases.DEFENSE.PROACTIVE;
        const prefixPool = reactive 
            ? ["Reacting quickly,", "Seizing the moment,", "With swift reflexes,", "Countering instantly,", "Parrying with finesse,"] 
            : ["Preparing carefully,", "Taking a moment to strategize,", "Steadying {possessive} stance,", "In a daring gambit,"];
        let prefix = getSmartRandomPhrase(actor, 'prefix', prefixPool).replace(/{possessive}/g, actor.pronouns.p);
        let impactSentence = getSmartRandomPhrase(actor, 'defenseImpact', impactTemplates)
            .replace(/{actorName}/g, actorSpan).replace(/{possessive}/g, actor.pronouns.p);
        const description = `${prefix} ${actorSpan} uses the ${move.name}. ${impactSentence}`;
        const label = reactive ? "Counter" : "Set-up";
        return phaseTemplates.move.replace(/{actorId}/g, actor.id).replace(/{actorName}/g, actor.name).replace(/{moveName}/g, move.name).replace(/{moveEmoji}/g, move.emoji || '✨').replace(/{effectivenessLabel}/g, label).replace(/{effectivenessEmoji}/g, '🛡️').replace(/{moveDescription}/g, description);
    }
    
    let statePrefixPool = [];
    if (actor.energy < 30) statePrefixPool.push(...narrativeStatePhrases.energy_depletion);
    if (actor.momentum >= 3) statePrefixPool.push(...narrativeStatePhrases.momentum_gain);
    if (actor.momentum <= -3) statePrefixPool.push(...narrativeStatePhrases.momentum_loss);
    
    // A+ Feature: Narrative Flavor Scaling
    let envFlavor = '';
    if (result.primaryEnvFactor && Math.random() > 0.5) {
        if (result.primaryEnvFactor.includes('empowered')) {
            envFlavor = `${actorSpan} seems to draw strength from the surroundings. `;
        } else if (result.primaryEnvFactor.includes('weakened')) {
            envFlavor = `The environment seems to hinder ${actorSpan}'s movements. `;
        }
    }

    let statePrefix = statePrefixPool.length > 0 && Math.random() > 0.3 ? getSmartRandomPhrase(actor, 'statePrefix', statePrefixPool) : '';
    const intro = statePrefix ? '' : getSmartRandomPhrase(actor, 'intro', introductoryPhrases);
    const verb = move.verb || 'executes';
    const conjugatedVerb = conjugateVerb(verb);
    const objectPhrase = assembleObjectPhrase(move);
    const adverb = getSmartRandomPhrase(actor, 'adverb', adverbPool.offensive);

    function pronounOrName(prefix, span, actorData) {
        const pronoun = actorData.pronouns.s;
        if (!prefix) return Math.random() > 0.5 ? span : (pronoun.charAt(0).toUpperCase() + pronoun.slice(1));
        return Math.random() > 0.5 ? span : pronoun;
    }
    
    let prefixText = (statePrefix || intro).replace(/{possessive}/g, actor.pronouns.p);
    let fullAction = `${envFlavor}${prefixText} ${pronounOrName(prefixText, actorSpan, actor)} ${conjugatedVerb} ${objectPhrase} ${adverb}.`;

    let impactSentence;
    if (target.hp - result.damage <= 0 && result.damage > 0) {
        impactSentence = getRandomElement(finishingBlowPhrases).replace(/{targetName}/g, targetSpan);
    } else {
        const impactPool = impactPhrases.DEFAULT[result.effectiveness.label.toUpperCase()];
        impactSentence = getSmartRandomPhrase(actor, 'attackImpact', impactPool).replace(/{targetName}/g, targetSpan);
    }

    if (result.effectiveness.label === 'WEAK') {
        impactSentence += ' ' + getSmartRandomPhrase(actor, 'weakTransition', weakMoveTransitions)
            .replace(/{targetName}/g, targetSpan).replace(/{actorName}/g, actorSpan).replace(/{possessive}/g, actor.pronouns.p);
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
    if (winner.momentum - loser.momentum >= 5) { // Adjusted threshold for stronger momentum feel
        summary += ` ${winner.pronouns.p.charAt(0).toUpperCase() + winner.pronouns.p.slice(1)} commanding momentum overwhelmed ${loser.name}.`;
    }
    return summary;
}