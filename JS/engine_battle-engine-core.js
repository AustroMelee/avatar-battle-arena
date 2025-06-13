// FILE: js/engine_battle-engine-core.js
// FILE: engine_battle-engine-core.js
'use strict';

// VERSION 10.0: Battle Phase System Integration.
// - Initializes and tracks battle phase state.
// - Calls `checkAndTransitionPhase` each turn.
// - Passes current phase to AI and Narrative engines.
// - Modifies battle log header to include phase name.
// - Handles stalemate resolution narrative.

import { characters } from './data_characters.js';
import { locationConditions } from './location-battle-conditions.js';
import { phaseTemplates, battlePhases as phaseDefinitions } from './narrative-v2.js'; // Import phaseDefinitions
import { selectMove, updateAiMemory, attemptManipulation, adaptPersonality } from './engine_ai-decision.js';
import { calculateMove } from './engine_move-resolution.js';
import { updateMentalState } from './engine_mental-state.js';
import { generateTurnNarration, getFinalVictoryLine, findNarrativeQuote } from './engine_narrative-engine.js';
import { modifyMomentum } from './engine_momentum.js';
import { initializeBattlePhaseState, checkAndTransitionPhase, BATTLE_PHASES } from './engine_battle-phase.js'; // NEW: Import phase logic

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

function initializeFighterState(charId, opponentId, emotionalMode) {
    const characterData = characters[charId];
    if (!characterData) throw new Error(`Character with ID ${charId} not found.`);
    
    // Ensure personalityProfile exists, provide default if not
    const personalityProfile = characterData.personalityProfile || {
        aggression: 0.5, patience: 0.5, riskTolerance: 0.5, opportunism: 0.5,
        creativity: 0.5, defensiveBias: 0.5, antiRepeater: 0.5, signatureMoveBias: {}
    };

    return {
        id: charId, name: characterData.name, ...JSON.parse(JSON.stringify(characterData)),
        hp: 100, energy: 100, momentum: 0, lastMove: null, lastMoveEffectiveness: null,
        isStunned: false, tacticalState: null, moveHistory: [], moveFailureHistory: [],
        consecutiveDefensiveTurns: 0, aiLog: [],
        relationalState: (emotionalMode && characterData.relationships?.[opponentId]) || null,
        mentalState: { level: 'stable', stress: 0 },
        contextualState: {},
        collateralTolerance: characterData.collateralTolerance !== undefined ? characterData.collateralTolerance : 0.5,
        mobility: characterData.mobility !== undefined ? characterData.mobility : 0.5,
        personalityProfile: JSON.parse(JSON.stringify(personalityProfile)), // Deep copy personality
        aiMemory: {
            selfMoveEffectiveness: {}, opponentModel: { isAggressive: 0, isDefensive: 0, isTurtling: false },
            moveSuccessCooldown: {}, opponentSequenceLog: {},
            repositionCooldown: 0,
        }
    };
}

export function simulateBattle(f1Id, f2Id, locId, timeOfDay, emotionalMode = false) {
    let fighter1 = initializeFighterState(f1Id, f2Id, emotionalMode);
    let fighter2 = initializeFighterState(f2Id, f1Id, emotionalMode);
    
    const conditions = { ...locationConditions[locId], id: locId, isDay: timeOfDay === 'day', isNight: timeOfDay === 'night' };
    let turnLog = [], interactionLog = [];
    let initiator = (fighter1.powerTier > fighter2.powerTier) ? fighter1 : fighter2;
    let responder = (initiator.id === fighter1.id) ? fighter2 : fighter1;
    let battleOver = false;
    let isStalemate = false; // NEW: Stalemate flag

    // NEW: Initialize battle phase state
    let phaseState = initializeBattlePhaseState();
    fighter1.aiLog.push(...phaseState.phaseLog); // Add initial phase log
    fighter2.aiLog.push(...phaseState.phaseLog);

    let environmentState = {
        damageLevel: 0, lastDamageSourceId: null, specificImpacts: new Set()
    };
    const locationData = locationConditions[locId];

    const initialBanter1 = findNarrativeQuote(fighter1, fighter2, 'battleStart', 'general', { currentPhaseKey: phaseState.currentPhase });
    const initialBanter2 = findNarrativeQuote(fighter2, fighter1, 'battleStart', 'general', { currentPhaseKey: phaseState.currentPhase });
    let initialNarration = '';
    if (initialBanter1) initialNarration += generateTurnNarration([{quote: initialBanter1, actor: fighter1}], {}, fighter1, fighter2, {}, environmentState, locationData, phaseState.currentPhase);
    if (initialBanter2) initialNarration += generateTurnNarration([{quote: initialBanter2, actor: fighter2}], {}, fighter2, fighter1, {}, environmentState, locationData, phaseState.currentPhase);
    if (initialNarration) turnLog.push(initialNarration.replace(/<div class="move-line".*?<\/div>/g, ''));

    // Battle Loop: Max 6 turns
    for (let turn = 0; turn < 6 && !battleOver; turn++) {
        // NEW: Check and transition phase AT THE START of the turn
        const phaseChanged = checkAndTransitionPhase(phaseState, fighter1, fighter2, turn);
        if (phaseChanged) {
            fighter1.aiLog.push(phaseState.phaseLog[phaseState.phaseLog.length - 1]); // Log transition
            fighter2.aiLog.push(phaseState.phaseLog[phaseState.phaseLog.length - 1]);
        }
        const currentPhaseInfo = phaseDefinitions.find(p => p.key === phaseState.currentPhase) || phaseDefinitions[0];


        let phaseContent = phaseTemplates.header
            .replace('{phaseDisplayName}', currentPhaseInfo.name)
            .replace('{phaseEmoji}', currentPhaseInfo.emoji);
        
        const battleContextFiredQuotes = new Set(); // Renamed to avoid conflict
        
        const processTurn = (attacker, defender) => {
            if (battleOver || isStalemate) return;
            let narrativeEvents = [];
            const oldDefenderMentalState = defender.mentalState.level;
            const oldAttackerMentalState = attacker.mentalState.level;

            if (turn > 0) adaptPersonality(attacker);
            
            if (attacker.tacticalState) {
                attacker.tacticalState.duration--;
                if (attacker.tacticalState.duration <= 0) {
                    attacker.aiLog.push(`[Tactical State Expired]: ${attacker.name} is no longer ${attacker.tacticalState.name}.`);
                    attacker.tacticalState = null;
                }
            }
            attacker.isStunned = false;

            const addNarrativeEvent = (quote, actor) => {
                if (quote && !battleContextFiredQuotes.has(`${actor.id}-${quote.line}`)) { // Use actor ID in key
                    narrativeEvents.push({ quote, actor });
                    battleContextFiredQuotes.add(`${actor.id}-${quote.line}`);
                }
            };
            
            let manipulationResult = attemptManipulation(attacker, defender);
            if (manipulationResult.success) {
                defender.tacticalState = { name: manipulationResult.effect, duration: 1, intensity: 1.2, isPositive: false };
                addNarrativeEvent(findNarrativeQuote(attacker, defender, 'onManipulation', 'asAttacker', { currentPhaseKey: phaseState.currentPhase }), attacker);
            }

            // Pass currentPhase to selectMove
            const { move, aiLogEntryFromSelectMove } = selectMove(attacker, defender, conditions, turn, phaseState.currentPhase); 
            if(aiLogEntryFromSelectMove) attacker.aiLog.push(aiLogEntryFromSelectMove); // Log the structured object
            else attacker.aiLog.push(`[T${turn+1}] Selected Move: ${move.name} | Intent: ${aiLogEntryFromSelectMove?.intent || 'N/A'}`);


            addNarrativeEvent(findNarrativeQuote(attacker, defender, 'onIntentSelection', aiLogEntryFromSelectMove?.intent || 'StandardExchange', { currentPhaseKey: phaseState.currentPhase }), attacker);
            
            const result = calculateMove(move, attacker, defender, conditions, interactionLog, environmentState, locId);
            
            modifyMomentum(attacker, result.momentumChange.attacker, `Move Effectiveness (${result.effectiveness.label})`);
            modifyMomentum(defender, result.momentumChange.defender, `Opponent Move Effectiveness (${result.effectiveness.label})`);

            if (result.collateralDamage > 0) {
                environmentState.damageLevel = clamp(environmentState.damageLevel + result.collateralDamage, 0, 100);
                environmentState.lastDamageSourceId = attacker.id;
                const collateralContext = { currentPhaseKey: phaseState.currentPhase };
                if (attacker.collateralTolerance < 0.3) {
                    addNarrativeEvent(findNarrativeQuote(attacker, defender, 'onCollateral', 'stressedByDamage', collateralContext), attacker);
                } else if (attacker.collateralTolerance > 0.7) {
                    addNarrativeEvent(findNarrativeQuote(attacker, defender, 'onCollateral', 'thrivingInDamage', collateralContext), attacker);
                } else {
                    addNarrativeEvent(findNarrativeQuote(attacker, defender, 'onCollateral', 'causingDamage', collateralContext), attacker);
                }
                if (defender.collateralTolerance < 0.3) {
                    addNarrativeEvent(findNarrativeQuote(defender, attacker, 'onCollateral', 'stressedByDamage', collateralContext), defender);
                } else if (defender.collateralTolerance > 0.7) {
                     addNarrativeEvent(findNarrativeQuote(defender, attacker, 'onCollateral', 'thrivingInDamage', collateralContext), defender);
                } else {
                    addNarrativeEvent(findNarrativeQuote(defender, attacker, 'onCollateral', 'observingDamage', collateralContext), defender);
                }
            }
            
            updateMentalState(defender, attacker, result, environmentState);
            updateMentalState(attacker, defender, null, environmentState);

            if (defender.mentalState.level !== oldDefenderMentalState) {
                addNarrativeEvent(findNarrativeQuote(defender, attacker, 'onStateChange', defender.mentalState.level, { currentPhaseKey: phaseState.currentPhase }), defender);
            }
            if (attacker.mentalState.level !== oldAttackerMentalState && attacker.mentalStateChangedThisTurn) { // Ensure it's a change this turn
                addNarrativeEvent(findNarrativeQuote(attacker, defender, 'onStateChange', attacker.mentalState.level, { currentPhaseKey: phaseState.currentPhase }), attacker);
                attacker.mentalStateChangedThisTurn = false; // Reset flag
            }
            
            attacker.lastMoveEffectiveness = result.effectiveness.label;
            attacker.consecutiveDefensiveTurns = (move.type === 'Utility' || move.type === 'Defense') ? attacker.consecutiveDefensiveTurns + 1 : 0;
            
            if (move.setup && result.effectiveness.label !== 'Weak' && !move.isRepositionMove) {
                defender.tacticalState = { ...move.setup, isPositive: false };
                attacker.aiLog.push(`[Tactical State Apply]: ${defender.name} is now ${defender.tacticalState.name}!`);
            }
            if (move.isRepositionMove && attacker.tacticalState) {
                const stateType = attacker.tacticalState.isPositive ? '(Self-Buff)' : '(Self-Debuff)';
                attacker.aiLog.push(`[Tactical State Apply]: ${attacker.name} is now ${attacker.tacticalState.name}! ${stateType}`);
            }

            if (move.moveTags?.includes('requires_opening') && result.payoff) defender.tacticalState = null;
            if (result.effectiveness.label === 'Critical') defender.isStunned = true;
            
            phaseContent += generateTurnNarration(narrativeEvents, move, attacker, defender, result, environmentState, locationData, phaseState.currentPhase);

            defender.hp = clamp(defender.hp - result.damage, 0, 100);
            attacker.energy = clamp(attacker.energy - result.energyCost, 0, 100);
            attacker.moveHistory.push({ ...move, effectiveness: result.effectiveness.label });
            attacker.lastMove = move;
            updateAiMemory(defender, attacker);
            updateAiMemory(attacker, defender);

            if (defender.hp <= 0) battleOver = true;

            // Stalemate Check (after each processed turn segment)
            if (!battleOver && turn >= 3) { // Only check for stalemate from mid-game onwards
                if (fighter1.consecutiveDefensiveTurns >= 3 && fighter2.consecutiveDefensiveTurns >= 3 &&
                    Math.abs(fighter1.hp - fighter2.hp) < 15 && // Health difference is small
                    phaseState.currentPhase !== BATTLE_PHASES.EARLY) { // Not in early phase
                    isStalemate = true;
                    battleOver = true; // End battle due to stalemate
                    fighter1.aiLog.push("[Stalemate Condition Met]: Prolonged defensive engagement with minimal progress.");
                    fighter2.aiLog.push("[Stalemate Condition Met]: Prolonged defensive engagement with minimal progress.");
                }
            }
        };
        
        environmentState.specificImpacts.clear(); 
        const currentLocData = locationConditions[locId];
        if (currentLocData && currentLocData.damageThresholds) {
            if (environmentState.damageLevel >= currentLocData.damageThresholds.catastrophic && locationData.environmentalImpacts.catastrophic) {
                environmentState.specificImpacts.add(locationData.environmentalImpacts.catastrophic[Math.floor(Math.random() * locationData.environmentalImpacts.catastrophic.length)]);
            } else if (environmentState.damageLevel >= currentLocData.damageThresholds.severe && locationData.environmentalImpacts.severe) {
                environmentState.specificImpacts.add(locationData.environmentalImpacts.severe[Math.floor(Math.random() * locationData.environmentalImpacts.severe.length)]);
            } else if (environmentState.damageLevel >= currentLocData.damageThresholds.moderate && locationData.environmentalImpacts.moderate) {
                environmentState.specificImpacts.add(locationData.environmentalImpacts.moderate[Math.floor(Math.random() * locationData.environmentalImpacts.moderate.length)]);
            } else if (environmentState.damageLevel >= currentLocData.damageThresholds.minor && locationData.environmentalImpacts.minor) {
                environmentState.specificImpacts.add(locationData.environmentalImpacts.minor[Math.floor(Math.random() * locationData.environmentalImpacts.minor.length)]);
            }
        }

        processTurn(initiator, responder);
        if (!battleOver && !isStalemate) processTurn(responder, initiator);


        if (environmentState.damageLevel > 0 && environmentState.specificImpacts.size > 0) {
            phaseContent += `<div class="environmental-summary">`;
            phaseContent += phaseTemplates.environmentalImpactHeader;
            environmentState.specificImpacts.forEach(impact => {
                const formattedImpact = findNarrativeQuote(initiator, responder, 'onCollateral', 'general', { impactText: impact, currentPhaseKey: phaseState.currentPhase });
                if (formattedImpact) {
                    phaseContent += `<p class="environmental-impact-text">${formattedImpact.line}</p>`;
                } else {
                    phaseContent += `<p class="environmental-impact-text">${impact}</p>`;
                }
            });
            phaseContent += `</div>`;
        }

        turnLog.push(phaseTemplates.phaseWrapper
            .replace('{phaseKey}', phaseState.currentPhase) // Use phaseKey for data attribute
            .replace('{phaseContent}', phaseContent.replace(/<div[^>]*><\/div>/g, '')));
        
        if (isStalemate) break; // Exit loop immediately if stalemate declared

        [initiator, responder] = [responder, initiator];
    }
    
    let winner, loser;
    if (isStalemate) {
        turnLog.push(phaseTemplates.stalemateResult); // Use new stalemate template
        // For stalemate, there's no traditional winner/loser for final summary, but we can still provide fighter states.
        fighter1.summary = "The battle reached an impasse, with neither fighter able to secure victory.";
        fighter2.summary = "The battle reached an impasse, with neither fighter able to secure victory.";
        winner = fighter1; // Arbitrary for return structure, `isDraw` flag is key
        loser = fighter2;
    } else if (fighter1.hp <= 0) {
        winner = fighter2;
        loser = fighter1;
    } else if (fighter2.hp <= 0) {
        winner = fighter1;
        loser = fighter2;
    } else { // Timeout
        winner = (fighter1.hp > fighter2.hp) ? fighter1 : fighter2;
        loser = (winner.id === fighter1.id) ? fighter2 : fighter1;
        if (fighter1.hp === fighter2.hp) { // True draw on timeout
            isStalemate = true; // Treat as a draw/stalemate
             turnLog.push(phaseTemplates.drawResult);
             winner = fighter1; // Arbitrary
             loser = fighter2;
        } else {
            turnLog.push(phaseTemplates.timeOutVictory.replace(/{winnerName}/g, `<span class="char-${winner.id}">${winner.name}</span>`).replace(/{loserName}/g, `<span class="char-${loser.id}">${loser.name}</span>`));
        }
    }

    if (!isStalemate && winner && loser && loser.hp <= 0) { // Only if it's not a timeout/stalemate and there's a KO
        turnLog.push(phaseTemplates.finalBlow.replace(/{winnerName}/g, `<span class="char-${winner.id}">${winner.name}</span>`).replace(/{loserName}/g, `<span class="char-${loser.id}">${loser.name}</span>`));
    }
    
    if (!isStalemate && winner) {
         winner.summary = `${winner.name}'s victory was sealed by ${winner.pronouns.p} superior strategy and power.`; // Generic summary
        const finalWords = getFinalVictoryLine(winner, loser); // loser might be null in a pure timeout draw
        turnLog.push(phaseTemplates.conclusion.replace('{endingNarration}', `${winner.name} stands victorious. "${finalWords}"`));
    } else if(!isStalemate && !winner) { // True draw by timeout with equal HP
         turnLog.push(phaseTemplates.conclusion.replace('{endingNarration}', "The battle concludes. Neither could claim victory."));
    }


    winner.interactionLog = interactionLog;
    if (loser) loser.interactionLog = interactionLog; // Loser might be undefined in a true draw

    // Add phase log to final state for debugging/analysis
    fighter1.phaseLog = phaseState.phaseLog;
    fighter2.phaseLog = phaseState.phaseLog;

    return { 
        log: turnLog.join(''), 
        winnerId: isStalemate ? null : winner.id, 
        loserId: isStalemate ? null : (loser ? loser.id : null), 
        isDraw: isStalemate || (!winner && !loser), // If stalemate or true draw
        finalState: { fighter1, fighter2 }, 
        environmentState 
    };
}