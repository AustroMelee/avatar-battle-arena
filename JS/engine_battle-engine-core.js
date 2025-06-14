// FILE: js/engine_battle-engine-core.js
'use strict';

import { characters } from './data_characters.js';
import { locationConditions } from './location-battle-conditions.js';
import { phaseTemplates, battlePhases as phaseDefinitions } from './narrative-v2.js'; // Will be data_narrative_config.js
import { selectMove, updateAiMemory, attemptManipulation, adaptPersonality } from './engine_ai-decision.js';
import { calculateMove } from './engine_move-resolution.js';
import { updateMentalState } from './engine_mental-state.js';
import { generateTurnNarrationObjects, getFinalVictoryLine, findNarrativeQuote } from './engine_narrative-engine.js';
import { modifyMomentum } from './engine_momentum.js';
import { initializeBattlePhaseState, checkAndTransitionPhase, BATTLE_PHASES } from './engine_battle-phase.js';

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

// --- FIX: Define getRandomElement locally or import if it becomes a shared utility ---
/**
 * Selects a random element from an array.
 * @param {Array<any>} arr - The array to select from.
 * @returns {any|null} A random element from the array, or null if the array is null or empty.
 */
const getRandomElement = (arr) => arr && arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;
// --- END FIX ---

/**
 * Initializes the state for a fighter at the start of a battle.
 * @param {string} charId - The ID of the character.
 * @param {string} opponentId - The ID of the opponent character.
 * @param {boolean} emotionalMode - Whether emotional mode is enabled.
 * @returns {object} The initialized fighter state object.
 */
function initializeFighterState(charId, opponentId, emotionalMode) {
    const characterData = characters[charId];
    if (!characterData) throw new Error(`Character with ID ${charId} not found.`);
    
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
        mentalState: { level: 'stable', stress: 0, mentalStateChangedThisTurn: false },
        contextualState: {},
        collateralTolerance: characterData.collateralTolerance !== undefined ? characterData.collateralTolerance : 0.5,
        mobility: characterData.mobility !== undefined ? characterData.mobility : 0.5,
        personalityProfile: JSON.parse(JSON.stringify(personalityProfile)),
        aiMemory: {
            selfMoveEffectiveness: {}, opponentModel: { isAggressive: 0, isDefensive: 0, isTurtling: false },
            moveSuccessCooldown: {}, opponentSequenceLog: {},
            repositionCooldown: 0,
        }
    };
}

/**
 * Simulates a battle between two fighters.
 * @param {string} f1Id - Fighter 1's ID.
 * @param {string} f2Id - Fighter 2's ID.
 * @param {string} locId - Location ID.
 * @param {string} timeOfDay - 'day' or 'night'.
 * @param {boolean} [emotionalMode=false] - Whether emotional mode is enabled.
 * @returns {object} An object containing the battle log array, winner/loser IDs, draw status, final states, and environment state.
 */
export function simulateBattle(f1Id, f2Id, locId, timeOfDay, emotionalMode = false) {
    let fighter1 = initializeFighterState(f1Id, f2Id, emotionalMode);
    let fighter2 = initializeFighterState(f2Id, f1Id, emotionalMode);
    
    const conditions = { ...locationConditions[locId], id: locId, isDay: timeOfDay === 'day', isNight: timeOfDay === 'night' };
    let battleEventLog = []; 
    let interactionLog = []; 
    let initiator = (fighter1.powerTier > fighter2.powerTier) ? fighter1 : ((fighter2.powerTier > fighter1.powerTier) ? fighter2 : (Math.random() < 0.5 ? fighter1 : fighter2));
    let responder = (initiator.id === fighter1.id) ? fighter2 : fighter1;
    let battleOver = false;
    let isStalemate = false;

    let phaseState = initializeBattlePhaseState();
    fighter1.aiLog.push(...phaseState.phaseLog); 
    fighter2.aiLog.push(...phaseState.phaseLog);

    let environmentState = { damageLevel: 0, lastDamageSourceId: null, specificImpacts: new Set() };
    const locationData = locationConditions[locId];

    const initialBanter1 = findNarrativeQuote(fighter1, fighter2, 'battleStart', 'general', { currentPhaseKey: phaseState.currentPhase });
    if (initialBanter1) battleEventLog.push(...generateTurnNarrationObjects([{quote: initialBanter1, actor: fighter1}], null, fighter1, fighter2, null, environmentState, locationData, phaseState.currentPhase, true));
    
    const initialBanter2 = findNarrativeQuote(fighter2, fighter1, 'battleStart', 'general', { currentPhaseKey: phaseState.currentPhase });
    if (initialBanter2) battleEventLog.push(...generateTurnNarrationObjects([{quote: initialBanter2, actor: fighter2}], null, fighter2, fighter1, null, environmentState, locationData, phaseState.currentPhase, true));


    for (let turn = 0; turn < 6 && !battleOver; turn++) {
        const phaseChanged = checkAndTransitionPhase(phaseState, fighter1, fighter2, turn);
        if (phaseChanged) {
            fighter1.aiLog.push(phaseState.phaseLog[phaseState.phaseLog.length - 1]);
            fighter2.aiLog.push(phaseState.phaseLog[phaseState.phaseLog.length - 1]);
            const currentPhaseInfo = phaseDefinitions.find(p => p.key === phaseState.currentPhase) || phaseDefinitions[0];
            battleEventLog.push({ 
                type: 'phase_header_event',
                text: `${currentPhaseInfo.name} ${currentPhaseInfo.emoji}`,
                isPhaseHeader: true,
                html_content: phaseTemplates.header
                    .replace('{phaseDisplayName}', currentPhaseInfo.name)
                    .replace('{phaseEmoji}', currentPhaseInfo.emoji)
            });
        }
        
        let turnSpecificEventsForLog = []; 
        const battleContextFiredQuotes = new Set();
        
        const processTurnSegment = (attacker, defender) => {
            if (battleOver || isStalemate) return;
            let narrativeEventsForAction = []; 
            const oldDefenderMentalState = defender.mentalState.level;
            const oldAttackerMentalState = attacker.mentalState.level;
            attacker.mentalStateChangedThisTurn = false; 

            if (turn > 0) adaptPersonality(attacker);
            
            if (attacker.tacticalState) {
                attacker.tacticalState.duration--;
                if (attacker.tacticalState.duration <= 0) {
                    attacker.aiLog.push(`[Tactical State Expired]: ${attacker.name} is no longer ${attacker.tacticalState.name}.`);
                    attacker.tacticalState = null;
                }
            }
            if (attacker.isStunned) { 
                attacker.aiLog.push(`[Action Skipped]: ${attacker.name} is stunned and cannot act this segment.`);
                turnSpecificEventsForLog.push({
                    type: 'stun_event',
                    actorId: attacker.id,
                    characterName: attacker.name,
                    text: `${attacker.name} is stunned and unable to move!`,
                    html_content: `<p class="narrative-action char-${attacker.id}">${attacker.name} is stunned and unable to move!</p>`
                });
                attacker.isStunned = false; 
                return; 
            }
            
            const addNarrativeEvent = (quote, actorForQuote) => {
                if (quote && !battleContextFiredQuotes.has(`${actorForQuote.id}-${quote.line}`)) { 
                    narrativeEventsForAction.push({ quote, actor: actorForQuote });
                    battleContextFiredQuotes.add(`${actorForQuote.id}-${quote.line}`);
                }
            };
            
            let manipulationResult = attemptManipulation(attacker, defender);
            if (manipulationResult.success) {
                defender.tacticalState = { name: manipulationResult.effect, duration: 1, intensity: 1.2, isPositive: false };
                addNarrativeEvent(findNarrativeQuote(attacker, defender, 'onManipulation', 'asAttacker', { currentPhaseKey: phaseState.currentPhase }), attacker);
                if (manipulationResult.narration) {
                     turnSpecificEventsForLog.push({
                        type: 'manipulation_narration_event',
                        actorId: attacker.id,
                        text: manipulationResult.narration.replace(/<[^>]+>/g, ''),
                        html_content: manipulationResult.narration,
                        isDialogue: false, 
                     });
                }
            }

            const { move, aiLogEntryFromSelectMove } = selectMove(attacker, defender, conditions, turn, phaseState.currentPhase); 
            
            addNarrativeEvent(findNarrativeQuote(attacker, defender, 'onIntentSelection', aiLogEntryFromSelectMove?.intent || 'StandardExchange', { currentPhaseKey: phaseState.currentPhase }), attacker);
            
            const result = calculateMove(move, attacker, defender, conditions, interactionLog, environmentState, locId);
            
            modifyMomentum(attacker, result.momentumChange.attacker, `Move (${result.effectiveness.label}) by ${attacker.name}`);
            modifyMomentum(defender, result.momentumChange.defender, `Opponent Move (${result.effectiveness.label}) by ${attacker.name}`);

            if (result.collateralDamage > 0 && environmentState.damageLevel < 100) { 
                environmentState.damageLevel = clamp(environmentState.damageLevel + result.collateralDamage, 0, 100);
                environmentState.lastDamageSourceId = attacker.id;
                const collateralContext = { currentPhaseKey: phaseState.currentPhase };
                if (attacker.collateralTolerance < 0.3) addNarrativeEvent(findNarrativeQuote(attacker, defender, 'onCollateral', 'stressedByDamage', collateralContext), attacker);
                else if (attacker.collateralTolerance > 0.7) addNarrativeEvent(findNarrativeQuote(attacker, defender, 'onCollateral', 'thrivingInDamage', collateralContext), attacker);
                else addNarrativeEvent(findNarrativeQuote(attacker, defender, 'onCollateral', 'causingDamage', collateralContext), attacker);
                
                if (defender.collateralTolerance < 0.3) addNarrativeEvent(findNarrativeQuote(defender, attacker, 'onCollateral', 'stressedByDamage', collateralContext), defender);
                else if (defender.collateralTolerance > 0.7) addNarrativeEvent(findNarrativeQuote(defender, attacker, 'onCollateral', 'thrivingInDamage', collateralContext), defender);
                else addNarrativeEvent(findNarrativeQuote(defender, attacker, 'onCollateral', 'observingDamage', collateralContext), defender);
            }
            
            updateMentalState(defender, attacker, result, environmentState);
            updateMentalState(attacker, defender, null, environmentState); 

            if (defender.mentalState.level !== oldDefenderMentalState) {
                addNarrativeEvent(findNarrativeQuote(defender, attacker, 'onStateChange', defender.mentalState.level, { currentPhaseKey: phaseState.currentPhase }), defender);
            }
            if (attacker.mentalState.level !== oldAttackerMentalState && attacker.mentalStateChangedThisTurn) {
                addNarrativeEvent(findNarrativeQuote(attacker, defender, 'onStateChange', attacker.mentalState.level, { currentPhaseKey: phaseState.currentPhase }), attacker);
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

            if (move.moveTags?.includes('requires_opening') && result.payoff && result.consumedStateName) {
                 defender.tacticalState = null; 
                 attacker.aiLog.push(`[Tactical State Consumed]: ${attacker.name} consumed ${defender.name}'s ${result.consumedStateName} state.`);
            }
            if (result.effectiveness.label === 'Critical' && move.type !== 'Defense' && !move.isRepositionMove) defender.isStunned = true;
            
            turnSpecificEventsForLog.push(...generateTurnNarrationObjects(narrativeEventsForAction, move, attacker, defender, result, environmentState, locationData, phaseState.currentPhase));

            defender.hp = clamp(defender.hp - result.damage, 0, 100);
            attacker.energy = clamp(attacker.energy - result.energyCost, 0, 100);
            attacker.moveHistory.push({ ...move, effectiveness: result.effectiveness.label });
            attacker.lastMove = move;
            
            updateAiMemory(defender, attacker); 
            updateAiMemory(attacker, defender);

            if (defender.hp <= 0) battleOver = true;

            if (!battleOver && turn >= 3) { 
                if (fighter1.consecutiveDefensiveTurns >= 3 && fighter2.consecutiveDefensiveTurns >= 3 &&
                    Math.abs(fighter1.hp - fighter2.hp) < 15 && 
                    phaseState.currentPhase !== BATTLE_PHASES.EARLY) { 
                    isStalemate = true;
                    battleOver = true; 
                    fighter1.aiLog.push("[Stalemate Condition Met]: Prolonged defensive engagement.");
                    fighter2.aiLog.push("[Stalemate Condition Met]: Prolonged defensive engagement.");
                }
            }
        };
        
        environmentState.specificImpacts.clear(); 
        const currentLocData = locationConditions[locId];
        if (currentLocData && currentLocData.damageThresholds && environmentState.damageLevel > 0) {
            let impactTier = null;
            if (environmentState.damageLevel >= currentLocData.damageThresholds.catastrophic) impactTier = 'catastrophic';
            else if (environmentState.damageLevel >= currentLocData.damageThresholds.severe) impactTier = 'severe';
            else if (environmentState.damageLevel >= currentLocData.damageThresholds.moderate) impactTier = 'moderate';
            else if (environmentState.damageLevel >= currentLocData.damageThresholds.minor) impactTier = 'minor';

            if (impactTier && locationData.environmentalImpacts[impactTier] && locationData.environmentalImpacts[impactTier].length > 0) {
                 const randomImpact = getRandomElement(locationData.environmentalImpacts[impactTier]); // Ensure getRandomElement is available
                 if (randomImpact) environmentState.specificImpacts.add(randomImpact);
            }
        }

        processTurnSegment(initiator, responder);
        if (!battleOver && !isStalemate) processTurnSegment(responder, initiator);

        if (environmentState.damageLevel > 0 && environmentState.specificImpacts.size > 0) {
            let environmentalSummaryHtml = `<div class="environmental-summary">`;
            environmentalSummaryHtml += phaseTemplates.environmentalImpactHeader;
            let allImpactTexts = [];
            environmentState.specificImpacts.forEach(impact => {
                 const formattedImpactText = findNarrativeQuote(initiator, responder, 'onCollateral', 'general', { impactText: impact, currentPhaseKey: phaseState.currentPhase })?.line || impact;
                 environmentalSummaryHtml += `<p class="environmental-impact-text">${formattedImpactText}</p>`;
                 allImpactTexts.push(formattedImpactText);
            });
            environmentalSummaryHtml += `</div>`;
            turnSpecificEventsForLog.push({ 
                type: 'environmental_summary_event', 
                text: allImpactTexts.join(' '), 
                html_content: environmentalSummaryHtml,
                isEnvironmental: true
            });
        }
        
        battleEventLog.push(...turnSpecificEventsForLog);

        if (isStalemate) break;
        [initiator, responder] = [responder, initiator];
    }
    
    let winner = null, loser = null; 
    if (isStalemate) {
        battleEventLog.push({ type: 'stalemate_result_event', text: "The battle ends in a STALEMATE!", html_content: phaseTemplates.stalemateResult });
        fighter1.summary = "The battle reached an impasse, with neither fighter able to secure victory.";
        fighter2.summary = "The battle reached an impasse, with neither fighter able to secure victory.";
    } else if (fighter1.hp <= 0) {
        winner = fighter2; loser = fighter1;
    } else if (fighter2.hp <= 0) {
        winner = fighter1; loser = fighter2;
    } else { 
        if (fighter1.hp === fighter2.hp) { 
            isStalemate = true; 
            battleEventLog.push({ type: 'draw_result_event', text: "The battle is a DRAW!", html_content: phaseTemplates.drawResult });
            fighter1.summary = "The battle ended in a perfect draw, neither giving an inch.";
            fighter2.summary = "The battle ended in a perfect draw, neither giving an inch.";
        } else {
            winner = (fighter1.hp > fighter2.hp) ? fighter1 : fighter2;
            loser = (winner.id === fighter1.id) ? fighter2 : fighter1;
            const timeoutTextRaw = `The battle timer expires! With more health remaining, ${winner.name} is declared the victor over ${loser.name}!`;
            const timeoutTextHtml = phaseTemplates.timeOutVictory
                .replace(/{winnerName}/g, `<span class="char-${winner.id}">${winner.name}</span>`)
                .replace(/{loserName}/g, `<span class="char-${loser.id}">${loser.name}</span>`);
            battleEventLog.push({ type: 'timeout_victory_event', text: timeoutTextRaw, html_content: timeoutTextHtml });
        }
    }

    if (!isStalemate && winner && loser && loser.hp <= 0) { 
        const finalBlowTextRaw = `${winner.name} lands the finishing blow, defeating ${loser.name}!`;
        const finalBlowTextHtml = phaseTemplates.finalBlow
            .replace(/{winnerName}/g, `<span class="char-${winner.id}">${winner.name}</span>`)
            .replace(/{loserName}/g, `<span class="char-${loser.id}">${loser.name}</span>`);
        battleEventLog.push({ type: 'final_blow_event', text: finalBlowTextRaw, html_content: finalBlowTextHtml });
    }
    
    if (!isStalemate && winner) {
         winner.summary = winner.summary || `${winner.name}'s victory was sealed by their superior strategy and power.`;
        const finalWords = getFinalVictoryLine(winner, loser); 
        const conclusionTextRaw = `${winner.name} stands victorious. "${finalWords}"`;
        const conclusionTextHtml = phaseTemplates.conclusion.replace('{endingNarration}', conclusionTextRaw);
        battleEventLog.push({ type: 'conclusion_event', text: conclusionTextRaw, html_content: conclusionTextHtml });
    } else if(isStalemate || (!winner && !loser && fighter1.hp === fighter2.hp)) { 
        // This handles the case where it's a draw by timeout with equal HP, or explicit stalemate
        const conclusionTextRaw = "The battle concludes. Neither could claim outright victory.";
        battleEventLog.push({ type: 'conclusion_event', text: conclusionTextRaw, html_content: phaseTemplates.conclusion.replace('{endingNarration}', conclusionTextRaw) });
    }

    if(winner) winner.interactionLog = [...interactionLog];
    if(loser) loser.interactionLog = [...interactionLog];

    fighter1.phaseLog = [...phaseState.phaseLog];
    fighter2.phaseLog = [...phaseState.phaseLog];
    
    return { 
        log: battleEventLog, 
        winnerId: isStalemate ? null : (winner ? winner.id : null), 
        loserId: isStalemate ? null : (loser ? loser.id : null), 
        isDraw: isStalemate,
        finalState: { fighter1, fighter2 }, 
        environmentState 
    };
}