// FILE: js/engine_battle-engine-core.js
'use strict';

import { characters } from './data_characters.js';
import { locationConditions } from './location-battle-conditions.js';
import { phaseTemplates, battlePhases as phaseDefinitions } from './narrative-v2.js';
import { selectMove, updateAiMemory, attemptManipulation, adaptPersonality } from './engine_ai-decision.js';
import { calculateMove } from './engine_move-resolution.js';
import { updateMentalState } from './engine_mental-state.js';
import { generateTurnNarrationObjects, getFinalVictoryLine, findNarrativeQuote } from './engine_narrative-engine.js';
import { modifyMomentum } from './engine_momentum.js';
import { initializeBattlePhaseState, checkAndTransitionPhase, BATTLE_PHASES } from './engine_battle-phase.js';

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

function initializeFighterState(charId, opponentId, emotionalMode) {
    const characterData = characters[charId];
    if (!characterData) throw new Error(`Character with ID ${charId} not found.`);
    const personalityProfile = characterData.personalityProfile || { aggression: 0.5, patience: 0.5, riskTolerance: 0.5, opportunism: 0.5, creativity: 0.5, defensiveBias: 0.5, antiRepeater: 0.5, signatureMoveBias: {} };
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
        personalityProfile: JSON.parse(JSON.stringify(personalityProfile)),
        aiMemory: { selfMoveEffectiveness: {}, opponentModel: { isAggressive: 0, isDefensive: 0, isTurtling: false }, moveSuccessCooldown: {}, opponentSequenceLog: {}, repositionCooldown: 0, }
    };
}

export function simulateBattle(f1Id, f2Id, locId, timeOfDay, emotionalMode = false) {
    let fighter1 = initializeFighterState(f1Id, f2Id, emotionalMode);
    let fighter2 = initializeFighterState(f2Id, f1Id, emotionalMode);
    
    const conditions = { ...locationConditions[locId], id: locId, isDay: timeOfDay === 'day', isNight: timeOfDay === 'night' };
    let battleEventLog = []; 
    let interactionLog = []; 
    let initiator = (fighter1.powerTier > fighter2.powerTier) ? fighter1 : fighter2;
    let responder = (initiator.id === fighter1.id) ? fighter2 : fighter1;
    let battleOver = false;
    let isStalemate = false;

    let phaseState = initializeBattlePhaseState();
    fighter1.aiLog.push(...phaseState.phaseLog);
    fighter2.aiLog.push(...phaseState.phaseLog);

    let environmentState = { damageLevel: 0, lastDamageSourceId: null, specificImpacts: new Set() };
    const locationData = locationConditions[locId];

    const initialBanter1Objects = findNarrativeQuote(fighter1, fighter2, 'battleStart', 'general', { currentPhaseKey: phaseState.currentPhase });
    if (initialBanter1Objects) battleEventLog.push(...generateTurnNarrationObjects([{quote: initialBanter1Objects, actor: fighter1}], null, fighter1, fighter2, null, environmentState, locationData, phaseState.currentPhase, true));
    
    const initialBanter2Objects = findNarrativeQuote(fighter2, fighter1, 'battleStart', 'general', { currentPhaseKey: phaseState.currentPhase });
    if (initialBanter2Objects) battleEventLog.push(...generateTurnNarrationObjects([{quote: initialBanter2Objects, actor: fighter2}], null, fighter2, fighter1, null, environmentState, locationData, phaseState.currentPhase, true));


    for (let turn = 0; turn < 6 && !battleOver; turn++) {
        const phaseChangedThisCheck = checkAndTransitionPhase(phaseState, fighter1, fighter2, turn);
        const currentPhaseInfo = phaseDefinitions.find(p => p.key === phaseState.currentPhase) || phaseDefinitions[0];

        if (phaseChangedThisCheck) { 
            const transitionMessage = phaseState.phaseLog[phaseState.phaseLog.length - 1];
            fighter1.aiLog.push(transitionMessage);
            fighter2.aiLog.push(transitionMessage);
            battleEventLog.push({ 
                type: 'phase_header_event', 
                phaseName: currentPhaseInfo.name,
                phaseEmoji: currentPhaseInfo.emoji,
                phaseKey: phaseState.currentPhase,
                html_content: phaseTemplates.header
                    .replace('{phaseDisplayName}', currentPhaseInfo.name)
                    .replace('{phaseEmoji}', currentPhaseInfo.emoji)
            });
        }
        
        let turnSpecificEvents = []; 
        const battleContextFiredQuotes = new Set();
        
        const processTurn = (attacker, defender) => {
            if (battleOver || isStalemate) return;
            let narrativeEventsForAction = []; 
            
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
                if (quote && !battleContextFiredQuotes.has(`${actor.id}-${quote.line}`)) {
                    narrativeEventsForAction.push({ quote, actor });
                    battleContextFiredQuotes.add(`${actor.id}-${quote.line}`);
                }
            };
            let manipulationResult = attemptManipulation(attacker, defender);
            if (manipulationResult.success) {
                defender.tacticalState = { name: manipulationResult.effect, duration: 1, intensity: 1.2, isPositive: false };
                addNarrativeEvent(findNarrativeQuote(attacker, defender, 'onManipulation', 'asAttacker', { currentPhaseKey: phaseState.currentPhase }), attacker);
            }

            const { move } = selectMove(attacker, defender, conditions, turn, phaseState.currentPhase); 
            
            addNarrativeEvent(findNarrativeQuote(attacker, defender, 'onIntentSelection', attacker.aiLog[attacker.aiLog.length-1]?.intent || 'StandardExchange', { currentPhaseKey: phaseState.currentPhase }), attacker);
            
            const result = calculateMove(move, attacker, defender, conditions, interactionLog, environmentState, locId);
            modifyMomentum(attacker, result.momentumChange.attacker, `Move (${result.effectiveness.label})`);
            modifyMomentum(defender, result.momentumChange.defender, `Opponent Move (${result.effectiveness.label})`);
            
            defender.hp = clamp(defender.hp - result.damage, 0, 100); 
            attacker.energy = clamp(attacker.energy - result.energyCost, 0, 100); 

            const oldDefenderMentalState = defender.mentalState.level; 
            const oldAttackerMentalState = attacker.mentalState.level; 

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
            if (attacker.mentalState.level !== oldAttackerMentalState) { 
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

            if (move.moveTags?.includes('requires_opening') && result.payoff) defender.tacticalState = null;
            if (result.effectiveness.label === 'Critical') defender.isStunned = true;
            
            turnSpecificEvents.push(...generateTurnNarrationObjects(narrativeEventsForAction, move, attacker, defender, result, environmentState, locationData, phaseState.currentPhase));
            
            attacker.moveHistory.push({ ...move, effectiveness: result.effectiveness.label });
            attacker.lastMove = move;
            
            updateAiMemory(defender, attacker); 
            updateAiMemory(attacker, defender); 

            if (defender.hp <= 0) {
                battleOver = true; 
            }
            
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
        if (currentLocData && currentLocData.damageThresholds && currentLocData.environmentalImpacts) {
            if (environmentState.damageLevel >= currentLocData.damageThresholds.catastrophic) {
                environmentState.specificImpacts.add(currentLocData.environmentalImpacts.catastrophic[Math.floor(Math.random() * currentLocData.environmentalImpacts.catastrophic.length)]);
            } else if (environmentState.damageLevel >= currentLocData.damageThresholds.severe) {
                environmentState.specificImpacts.add(currentLocData.environmentalImpacts.severe[Math.floor(Math.random() * currentLocData.environmentalImpacts.severe.length)]);
            } else if (environmentState.damageLevel >= currentLocData.damageThresholds.moderate) {
                environmentState.specificImpacts.add(currentLocData.environmentalImpacts.moderate[Math.floor(Math.random() * currentLocData.environmentalImpacts.moderate.length)]);
            } else if (environmentState.damageLevel >= currentLocData.damageThresholds.minor) {
                environmentState.specificImpacts.add(currentLocData.environmentalImpacts.minor[Math.floor(Math.random() * currentLocData.environmentalImpacts.minor.length)]);
            }
        }
        
        processTurn(initiator, responder);
        if (!battleOver && !isStalemate) processTurn(responder, initiator);
        
        if (environmentState.damageLevel > 0 && environmentState.specificImpacts.size > 0) {
            let impactTexts = [];
            environmentState.specificImpacts.forEach(impact => {
                 const formattedImpactText = findNarrativeQuote(initiator, responder, 'onCollateral', 'general', { impactText: impact, currentPhaseKey: phaseState.currentPhase })?.line || impact;
                 impactTexts.push(formattedImpactText);
            });
            turnSpecificEvents.push({ 
                type: 'environmental_summary_event', 
                texts: impactTexts 
            });
        }
        
        battleEventLog.push(...turnSpecificEvents);

        if (isStalemate || battleOver) break; 
        [initiator, responder] = [responder, initiator];
    }
    
    let winner, loser;
    if (isStalemate) {
        battleEventLog.push({ type: 'stalemate_result_event', text: phaseTemplates.stalemateResult.replace(/<p class="final-blow">|<\/p>/g, '') });
        fighter1.summary = "The battle reached an impasse.";
        fighter2.summary = "The battle reached an impasse.";
        winner = fighter1; loser = fighter2; 
    } else if (fighter1.hp <= 0) {
        winner = fighter2; loser = fighter1;
    } else if (fighter2.hp <= 0) {
        winner = fighter1; loser = fighter2;
    } else { 
        winner = (fighter1.hp > fighter2.hp) ? fighter1 : fighter2;
        loser = (winner.id === fighter1.id) ? fighter2 : fighter1;
        if (fighter1.hp === fighter2.hp) {
            isStalemate = true;
            battleEventLog.push({ type: 'draw_result_event', text: phaseTemplates.drawResult.replace(/<p class="final-blow">|<\/p>/g, '') });
            winner = fighter1; loser = fighter2;
        } else {
            const timeoutText = phaseTemplates.timeOutVictory
                .replace(/{winnerName}/g, `<span class="char-${winner.id}">${winner.name}</span>`)
                .replace(/{loserName}/g, `<span class="char-${loser.id}">${loser.name}</span>`)
                .replace(/<p class="final-blow">|<\/p>/g, '');
            battleEventLog.push({ type: 'timeout_victory_event', text: timeoutText });
        }
    }

    // This event is now a summary and distinct from the KO text in the move.
    if (!isStalemate && winner && loser && loser.hp <= 0) {
        const finalText = `<span class="char-${winner.id}">${winner.name}</span> has defeated <span class="char-${loser.id}">${loser.name}</span>!`;
        battleEventLog.push({ type: 'battle_end_ko_event', text: finalText }); 
    }
    
    if (!isStalemate && winner) {
         winner.summary = winner.summary || `${winner.name}'s victory was sealed.`; 
        const finalWords = getFinalVictoryLine(winner, loser);
        const conclusionText = `${winner.name} stands victorious. "${finalWords}"`;
        battleEventLog.push({ type: 'conclusion_event', text: conclusionText });
    } else if(!isStalemate && !winner && fighter1.hp === fighter2.hp) { 
        battleEventLog.push({ type: 'conclusion_event', text: "The battle concludes. Neither could claim victory." });
    } else if (isStalemate) { 
        battleEventLog.push({ type: 'conclusion_event', text: "The intense confrontation ends, both combatants pushed to their limits but neither broken." });
    }

    if(winner) winner.interactionLog = interactionLog;
    if(loser) loser.interactionLog = interactionLog;

    fighter1.phaseLog = phaseState.phaseLog;
    fighter2.phaseLog = phaseState.phaseLog;
    
    return { 
        log: battleEventLog, 
        winnerId: isStalemate ? null : winner.id, 
        loserId: isStalemate ? null : (loser ? loser.id : null), 
        isDraw: isStalemate || (!winner && !loser && fighter1.hp === fighter2.hp),
        finalState: { fighter1, fighter2 }, 
        environmentState 
    };
}