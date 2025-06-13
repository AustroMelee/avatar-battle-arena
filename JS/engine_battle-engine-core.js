'use strict';

// VERSION 9.3: OVERKILL-COMPLIANT NARRATIVE DEDUPLICATION.
// - Implements a `firedQuotes` Set to prevent the same narrative event from firing multiple times per turn.
// - Fixes repetitive dialogue from the same intent/state trigger.

import { characters } from './data_characters.js';
import { locationConditions } from './location-battle-conditions.js';
import { battlePhases, phaseTemplates } from './narrative-v2.js';
import { selectMove, updateAiMemory, attemptManipulation, adaptPersonality } from './engine_ai-decision.js';
import { calculateMove } from './engine_move-resolution.js';
import { updateMentalState } from './engine_mental-state.js';
import { generateTurnNarration, getFinalVictoryLine, findNarrativeQuote } from './engine_narrative-engine.js';

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

function initializeFighterState(charId, opponentId, emotionalMode) {
    const characterData = characters[charId];
    if (!characterData) throw new Error(`Character with ID ${charId} not found.`);
    return { 
        id: charId, name: characterData.name, ...JSON.parse(JSON.stringify(characterData)), 
        hp: 100, energy: 100, momentum: 0, lastMove: null, lastMoveEffectiveness: null,
        isStunned: false, tacticalState: null, moveHistory: [], moveFailureHistory: [],
        consecutiveDefensiveTurns: 0, aiLog: [],
        relationalState: (emotionalMode && characterData.relationships?.[opponentId]) || null,
        mentalState: { level: 'stable', stress: 0 },
        contextualState: {},
        collateralTolerance: characterData.collateralTolerance !== undefined ? characterData.collateralTolerance : 0.5, // Default collateral tolerance
        aiMemory: {
            selfMoveEffectiveness: {}, opponentModel: { isAggressive: 0, isDefensive: 0, isTurtling: false },
            moveSuccessCooldown: {}, opponentSequenceLog: {},
        }
    };
}

export function simulateBattle(f1Id, f2Id, locId, timeOfDay, emotionalMode = false) {
    let fighter1 = initializeFighterState(f1Id, f2Id, emotionalMode);
    let fighter2 = initializeFitterState(f2Id, f1Id, emotionalMode);
    
    // NEW: Pass the full location conditions object
    const conditions = { ...locationConditions[locId], isDay: timeOfDay === 'day', isNight: timeOfDay === 'night' };
    let turnLog = [], interactionLog = [];
    let initiator = (fighter1.powerTier > fighter2.powerTier) ? fighter1 : fighter2;
    let responder = (initiator.id === fighter1.id) ? fighter2 : fighter1;
    let battleOver = false;

    // NEW: Initialize environmental state
    let environmentState = {
        damageLevel: 0, // 0-100 scale, 0 = pristine, 100 = completely ravaged
        lastDamageSourceId: null, // ID of the character who caused the last significant damage
        specificImpacts: new Set() // Store active environmental descriptions
    };
    const locationData = locationConditions[locId];

    // Initial battle start banter
    const initialBanter1 = findNarrativeQuote(fighter1, fighter2, 'battleStart', 'general');
    const initialBanter2 = findNarrativeQuote(fighter2, fighter1, 'battleStart', 'general');
    let initialNarration = '';
    if (initialBanter1) initialNarration += generateTurnNarration([{quote: initialBanter1, actor: fighter1}], {}, fighter1, fighter2, {}, environmentState, locationData);
    if (initialBanter2) initialNarration += generateTurnNarration([{quote: initialBanter2, actor: fighter2}], {}, fighter2, fighter1, {}, environmentState, locationData);
    if (initialNarration) turnLog.push(initialNarration.replace(/<div class="move-line".*?<\/div>/g, ''));

    for (let turn = 0; turn < 6 && !battleOver; turn++) {
        const phaseName = battlePhases[turn]?.name || "Final Exchange";
        let phaseContent = phaseTemplates.header.replace('{phaseName}', phaseName).replace('{phaseEmoji}', '⚔️');
        const firedQuotesThisTurn = new Set();
        
        const processTurn = (attacker, defender) => {
            if (battleOver) return;
            let narrativeEvents = [];
            const oldDefenderMentalState = defender.mentalState.level;
            const oldAttackerMentalState = attacker.mentalState.level; // Track attacker's mental state for collateral changes

            if (turn > 0) adaptPersonality(attacker); // Adapt personality after first turn
            if (attacker.tacticalState) {
                attacker.tacticalState.duration--;
                if (attacker.tacticalState.duration <= 0) attacker.tacticalState = null;
            }
            attacker.isStunned = false;

            const addNarrativeEvent = (quote, actor) => {
                // Deduplicate narrative quotes for the current turn
                if (quote && !firedQuotesThisTurn.has(quote.line)) {
                    narrativeEvents.push({ quote, actor });
                    firedQuotesThisTurn.add(quote.line);
                }
            };
            
            let manipulationResult = attemptManipulation(attacker, defender);
            if (manipulationResult.success) {
                defender.tacticalState = { name: manipulationResult.effect, duration: 1, intensity: 1.2 };
                addNarrativeEvent(findNarrativeQuote(attacker, defender, 'onManipulation', 'asAttacker'), attacker);
            }

            const { move, aiLogEntry } = selectMove(attacker, defender, conditions, turn);
            attacker.aiLog.push(`[T${turn+1}] ${JSON.stringify(aiLogEntry, null, 2)}`);
            addNarrativeEvent(findNarrativeQuote(attacker, defender, 'onIntentSelection', aiLogEntry.intent), attacker);
            
            // NEW: Pass locationId and environmentState to calculateMove
            const result = calculateMove(move, attacker, defender, conditions, interactionLog, environmentState, locId);
            
            // NEW: Update environmental state
            if (result.collateralDamage > 0) {
                environmentState.damageLevel = clamp(environmentState.damageLevel + result.collateralDamage, 0, 100);
                environmentState.lastDamageSourceId = attacker.id;

                // Add collateral narrative events
                // Actor causing damage
                if (attacker.collateralTolerance < 0.3) { // Low tolerance, stressed by causing it
                    addNarrativeEvent(findNarrativeQuote(attacker, defender, 'onCollateral', 'causingDamage'), attacker);
                } else if (attacker.collateralTolerance > 0.7) { // High tolerance, thrives in it
                    addNarrativeEvent(findNarrativeQuote(attacker, defender, 'onCollateral', 'thrivingInDamage'), attacker);
                } else { // Neutral/moderate
                    addNarrativeEvent(findNarrativeQuote(attacker, defender, 'onCollateral', 'causingDamage'), attacker);
                }

                // Opponent observing damage (regardless of who caused it)
                if (defender.collateralTolerance < 0.3) { // Low tolerance, stressed by observing
                    addNarrativeEvent(findNarrativeQuote(defender, attacker, 'onCollateral', 'stressedByDamage'), defender);
                } else if (defender.collateralTolerance > 0.7) { // High tolerance, thrives
                    addNarrativeEvent(findNarrativeQuote(defender, attacker, 'onCollateral', 'thrivingInDamage'), defender);
                } else { // Neutral/moderate
                    addNarrativeEvent(findNarrativeQuote(defender, attacker, 'onCollateral', 'observingDamage'), defender);
                }
            }
            
            // NEW: Pass environmentState to updateMentalState
            updateMentalState(defender, attacker, result, environmentState);
            updateMentalState(attacker, defender, null, environmentState); // Update attacker's mental state based on environment, but not direct move result

            // Narrative for mental state changes
            if (defender.mentalState.level !== oldDefenderMentalState) {
                addNarrativeEvent(findNarrativeQuote(defender, attacker, 'onStateChange', defender.mentalState.level), defender);
            }
            if (attacker.mentalState.level !== oldAttackerMentalState) {
                addNarrativeEvent(findNarrativeQuote(attacker, defender, 'onStateChange', attacker.mentalState.level), attacker);
            }
            
            attacker.lastMoveEffectiveness = result.effectiveness.label;
            attacker.consecutiveDefensiveTurns = (move.type === 'Utility' || move.type === 'Defense') ? attacker.consecutiveDefensiveTurns + 1 : 0;
            if (move.setup && result.effectiveness.label !== 'Weak') defender.tacticalState = { ...move.setup };
            if (move.moveTags?.includes('requires_opening') && result.payoff) defender.tacticalState = null;
            if (result.effectiveness.label === 'Critical') defender.isStunned = true;
            
            // NEW: Pass environmentState and locationData to generateTurnNarration
            phaseContent += generateTurnNarration(narrativeEvents, move, attacker, defender, result, environmentState, locationData);

            defender.hp = clamp(defender.hp - result.damage, 0, 100);
            attacker.energy = clamp(attacker.energy - result.energyCost, 0, 100);
            attacker.moveHistory.push({ ...move, effectiveness: result.effectiveness.label });
            attacker.lastMove = move;
            updateAiMemory(defender, attacker);

            if (defender.hp <= 0) battleOver = true;
        };
        
        // Clear specific impacts for the turn start to prevent carrying over old impact messages unless refreshed
        environmentState.specificImpacts.clear(); 
        // Determine current environmental impact phrases based on updated damage level
        const currentLocData = locationConditions[locId];
        if (currentLocData && currentLocData.damageThresholds) {
            if (environmentState.damageLevel >= currentLocData.damageThresholds.catastrophic) {
                environmentState.specificImpacts.add(locationData.environmentalImpacts.catastrophic[Math.floor(Math.random() * locationData.environmentalImpacts.catastrophic.length)]);
            } else if (environmentState.damageLevel >= currentLocData.damageThresholds.severe) {
                environmentState.specificImpacts.add(locationData.environmentalImpacts.severe[Math.floor(Math.random() * locationData.environmentalImpacts.severe.length)]);
            } else if (environmentState.damageLevel >= currentLocData.damageThresholds.moderate) {
                environmentState.specificImpacts.add(locationData.environmentalImpacts.moderate[Math.floor(Math.random() * locationData.environmentalImpacts.moderate.length)]);
            } else if (environmentState.damageLevel >= currentLocData.damageThresholds.minor) {
                environmentState.specificImpacts.add(locationData.environmentalImpacts.minor[Math.floor(Math.random() * locationData.environmentalImpacts.minor.length)]);
            }
        }


        processTurn(initiator, responder);
        if (!battleOver) processTurn(responder, initiator);

        // Add overall environmental impact at the end of the turn phase, if significant
        if (environmentState.damageLevel > 0 && environmentState.specificImpacts.size > 0) {
            phaseContent += `<div class="environmental-summary">`;
            phaseContent += phaseTemplates.environmentalImpactHeader;
            environmentState.specificImpacts.forEach(impact => {
                phaseContent += `<p class="environmental-impact-text">${impact}</p>`;
            });
            phaseContent += `</div>`;
        }

        turnLog.push(phaseTemplates.phaseWrapper.replace('{phaseName}', phaseName).replace('{phaseContent}', phaseContent.replace(/<div[^>]*><\/div>/g, '')));
        [initiator, responder] = [responder, initiator]; // Swap initiative for next turn
    }
    
    const winner = (fighter1.hp <= 0) ? fighter2 : ((fighter2.hp <= 0) ? fighter1 : (fighter1.hp > fighter2.hp ? fighter1 : fighter2));
    const loser = (winner.id === fighter1.id) ? fighter2 : fighter1;
    winner.summary = `${winner.name}'s victory was sealed by ${winner.pronouns.p} superior strategy.`;
    
    if (loser.hp > 0) {
        turnLog.push(phaseTemplates.timeOutVictory.replace(/{winnerName}/g, `<span class="char-${winner.id}">${winner.name}</span>`).replace(/{loserName}/g, `<span class="char-${loser.id}">${loser.name}</span>`));
    } else {
        turnLog.push(phaseTemplates.finalBlow.replace(/{winnerName}/g, `<span class="char-${winner.id}">${winner.name}</span>`).replace(/{loserName}/g, `<span class="char-${loser.id}">${loser.name}</span>`));
    }
    
    const finalWords = getFinalVictoryLine(winner, loser);
    turnLog.push(phaseTemplates.conclusion.replace('{endingNarration}', `${winner.name} stands victorious. "${finalWords}"`));

    winner.interactionLog = interactionLog;
    loser.interactionLog = interactionLog;

    // Return environmentState in the final result for UI analysis
    return { log: turnLog.join(''), winnerId: winner.id, loserId: loser.id, finalState: { fighter1, fighter2 }, environmentState };
}