// FILE: js/engine_battle-engine-core.js
'use strict';

// Version 1.1.1: Import getRandomElement, address data warnings by ensuring defaults

import { characters } from './data_characters.js';
import { locationConditions } from './location-battle-conditions.js';
import { phaseTemplates, battlePhases as phaseDefinitions } from './narrative-v2.js';
import { selectMove, updateAiMemory, attemptManipulation, adaptPersonality } from './engine_ai-decision.js';
import { calculateMove } from './engine_move-resolution.js';
import { updateMentalState } from './engine_mental-state.js';
import { generateTurnNarrationObjects, getFinalVictoryLine, findNarrativeQuote } from './engine_narrative-engine.js';
import { modifyMomentum } from './engine_momentum.js';
import { initializeBattlePhaseState, checkAndTransitionPhase, BATTLE_PHASES } from './engine_battle-phase.js';

// Define getRandomElement locally as it's a simple utility and was causing a ReferenceError.
// This avoids needing to modify engine_narrative-engine.js to export it if it wasn't already.
const getRandomElement = (arr) => {
    if (!arr || !Array.isArray(arr) || arr.length === 0) {
        return null;
    }
    return arr[Math.floor(Math.random() * arr.length)];
};

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

const DEFAULT_PERSONALITY_PROFILE = {
    aggression: 0.5, patience: 0.5, riskTolerance: 0.5, opportunism: 0.5,
    creativity: 0.5, defensiveBias: 0.5, antiRepeater: 0.5, signatureMoveBias: {},
    predictability: 0.5 // Ensured this default is present
};
const DEFAULT_AI_MEMORY = {
    selfMoveEffectiveness: {}, opponentModel: { isAggressive: 0, isDefensive: 0, isTurtling: false },
    moveSuccessCooldown: {}, opponentSequenceLog: {}, repositionCooldown: 0
};

function initializeFighterState(charId, opponentId, emotionalMode) {
    const characterData = characters[charId];
    if (!characterData) {
        return {
            id: charId, name: `Unknown Fighter (${charId})`, type: 'Unknown',
            pronouns: { s: 'they', p: 'their', o: 'them' },
            imageUrl: '', victoryStyle: "default", powerTier: 1,
            personalityProfile: { ...DEFAULT_PERSONALITY_PROFILE },
            specialTraits: {}, collateralTolerance: 0.5, mobility: 0.5, narrative: {}, techniquesFull: [], techniquesCanteen: [], techniques: [],
            hp: 1, energy: 1, momentum: 0, lastMove: null, lastMoveEffectiveness: null,
            isStunned: false, tacticalState: null, moveHistory: [], moveFailureHistory: [],
            consecutiveDefensiveTurns: 0, aiLog: [`[ERROR] Character data for ${charId} not found. Using minimal fallback.`],
            relationalState: null, mentalState: { level: 'broken', stress: 100 },
            contextualState: {}, aiMemory: { ...DEFAULT_AI_MEMORY }
        };
    }

    // Deep copy personality profile, ensuring all default keys are present if some are missing in characterData
    const personalityProfile = characterData.personalityProfile ?
        { ...DEFAULT_PERSONALITY_PROFILE, ...JSON.parse(JSON.stringify(characterData.personalityProfile)) } :
        { ...DEFAULT_PERSONALITY_PROFILE };

    const aiMemory = characterData.aiMemory ? JSON.parse(JSON.stringify(characterData.aiMemory)) : { ...DEFAULT_AI_MEMORY };

    return {
        id: charId,
        name: characterData.name || `Fighter ${charId}`,
        type: characterData.type || 'Unknown',
        pronouns: characterData.pronouns || { s: 'they', p: 'their', o: 'them' },
        imageUrl: characterData.imageUrl || '',
        victoryStyle: characterData.victoryStyle || "default",
        powerTier: typeof characterData.powerTier === 'number' ? characterData.powerTier : 3,
        
        personalityProfile: personalityProfile,
        specialTraits: characterData.specialTraits || {},
        collateralTolerance: characterData.collateralTolerance !== undefined ? characterData.collateralTolerance : 0.5,
        mobility: characterData.mobility !== undefined ? characterData.mobility : 0.5,
        narrative: characterData.narrative || {},
        techniquesFull: Array.isArray(characterData.techniquesFull) ? characterData.techniquesFull : [],
        techniquesCanteen: Array.isArray(characterData.techniquesCanteen) ? characterData.techniquesCanteen : [],
        techniques: Array.isArray(characterData.techniques) ? characterData.techniques : [],

        hp: 100,
        energy: 100,
        momentum: 0,
        lastMove: null,
        lastMoveEffectiveness: null,
        isStunned: false,
        tacticalState: null, // Correctly initialized to null
        moveHistory: [],
        moveFailureHistory: [],
        consecutiveDefensiveTurns: 0,
        aiLog: [], // Initialize as empty array
        relationalState: (emotionalMode && characterData.relationships?.[opponentId]) || null,
        mentalState: { level: 'stable', stress: 0 },
        contextualState: {},
        aiMemory: aiMemory,
    };
}

export function simulateBattle(f1Id, f2Id, locId, timeOfDay, emotionalMode = false) {
    if (!f1Id || !f2Id || !locId || typeof timeOfDay !== 'string') {
        return { 
            log: [{ type: 'error_event', text: 'Battle simulation could not start due to missing parameters.' }],
            winnerId: null, loserId: null, isDraw: true,
            finalState: { fighter1: null, fighter2: null }, environmentState: { damageLevel: 0, specificImpacts: new Set() }
        };
    }

    let fighter1 = initializeFighterState(f1Id, f2Id, emotionalMode);
    let fighter2 = initializeFighterState(f2Id, f1Id, emotionalMode);

    const currentLocConditions = locationConditions?.[locId];
    if (!currentLocConditions) {
        return {
            log: [{ type: 'error_event', text: `Battlefield data for '${locId}' is missing.` }],
            winnerId: null, loserId: null, isDraw: true,
            finalState: { fighter1, fighter2 }, environmentState: { damageLevel: 0, specificImpacts: new Set() }
        };
    }

    const conditions = { ...currentLocConditions, id: locId, isDay: timeOfDay === 'day', isNight: timeOfDay === 'night' };
    let battleEventLog = [];
    let interactionLog = []; 
    let initiator = (fighter1.powerTier > fighter2.powerTier) ? fighter1 : fighter2;
    let responder = (initiator.id === fighter1.id) ? fighter2 : fighter1;
    let battleOver = false;
    let isStalemate = false;

    let phaseState = initializeBattlePhaseState();
    (fighter1.aiLog || []).push(...(phaseState.phaseLog || [])); 
    (fighter2.aiLog || []).push(...(phaseState.phaseLog || []));

    let environmentState = { damageLevel: 0, lastDamageSourceId: null, specificImpacts: new Set() };
    // locationData is already safely fetched as currentLocConditions and spread into conditions
    const locationDataForNarrative = conditions; 

    const initialBanter1Objects = findNarrativeQuote(fighter1, fighter2, 'battleStart', 'general', { currentPhaseKey: phaseState.currentPhase });
    if (initialBanter1Objects) battleEventLog.push(...generateTurnNarrationObjects([{ quote: initialBanter1Objects, actor: fighter1 }], null, fighter1, fighter2, null, environmentState, locationDataForNarrative, phaseState.currentPhase, true));
    
    const initialBanter2Objects = findNarrativeQuote(fighter2, fighter1, 'battleStart', 'general', { currentPhaseKey: phaseState.currentPhase });
    if (initialBanter2Objects) battleEventLog.push(...generateTurnNarrationObjects([{ quote: initialBanter2Objects, actor: fighter2 }], null, fighter2, fighter1, null, environmentState, locationDataForNarrative, phaseState.currentPhase, true));


    for (let turn = 0; turn < 6 && !battleOver; turn++) { 
        const phaseChangedThisCheck = checkAndTransitionPhase(phaseState, fighter1, fighter2, turn);
        const currentPhaseKey = phaseState.currentPhase || BATTLE_PHASES.EARLY; 
        const currentPhaseInfo = phaseDefinitions.find(p => p.key === currentPhaseKey) || phaseDefinitions[0];

        if (phaseChangedThisCheck) { 
            const transitionMessage = (phaseState.phaseLog || [])[(phaseState.phaseLog || []).length - 1];
            if (transitionMessage) {
                (fighter1.aiLog || []).push(transitionMessage);
                (fighter2.aiLog || []).push(transitionMessage);
            }
            battleEventLog.push({ 
                type: 'phase_header_event', 
                phaseName: currentPhaseInfo.name || 'New Phase',
                phaseEmoji: currentPhaseInfo.emoji || '⚔️',
                phaseKey: currentPhaseKey,
                html_content: (phaseTemplates.header || '') 
                    .replace('{phaseDisplayName}', currentPhaseInfo.name || 'New Phase')
                    .replace('{phaseEmoji}', currentPhaseInfo.emoji || '⚔️')
            });
        }
        
        let turnSpecificEvents = []; 
        const battleContextFiredQuotes = new Set();
        
        const processTurn = (attacker, defender) => {
            if (battleOver || isStalemate || !attacker || !defender) return;
            let narrativeEventsForAction = []; 
            
            if (turn > 0) adaptPersonality(attacker);
            if (attacker.tacticalState) { 
                attacker.tacticalState.duration = (attacker.tacticalState.duration || 0) - 1;
                if (attacker.tacticalState.duration <= 0) {
                    (attacker.aiLog || []).push(`[Tactical State Expired]: ${attacker.name || 'Attacker'} is no longer ${attacker.tacticalState.name}.`);
                    attacker.tacticalState = null;
                }
            }
            attacker.isStunned = false;

            const addNarrativeEvent = (quote, actorForQuote) => { 
                if (quote && actorForQuote && !battleContextFiredQuotes.has(`${actorForQuote.id}-${quote.line}`)) {
                    narrativeEventsForAction.push({ quote, actor: actorForQuote });
                    battleContextFiredQuotes.add(`${actorForQuote.id}-${quote.line}`);
                }
            };
            let manipulationResult = attemptManipulation(attacker, defender);
            if (manipulationResult.success) {
                defender.tacticalState = { name: manipulationResult.effect, duration: 1, intensity: 1.2, isPositive: false };
                addNarrativeEvent(findNarrativeQuote(attacker, defender, 'onManipulation', 'asAttacker', { currentPhaseKey }), attacker);
            }

            const { move } = selectMove(attacker, defender, conditions, turn, currentPhaseKey); 
            
            const lastAiLogEntry = (attacker.aiLog && attacker.aiLog.length > 0) ? attacker.aiLog[attacker.aiLog.length - 1] : null;
            addNarrativeEvent(findNarrativeQuote(attacker, defender, 'onIntentSelection', lastAiLogEntry?.intent || 'StandardExchange', { currentPhaseKey }), attacker);
            
            const result = calculateMove(move, attacker, defender, conditions, interactionLog, environmentState, locId);
            
            const attackerMomentumChange = typeof result.momentumChange?.attacker === 'number' ? result.momentumChange.attacker : 0;
            const defenderMomentumChange = typeof result.momentumChange?.defender === 'number' ? result.momentumChange.defender : 0;
            modifyMomentum(attacker, attackerMomentumChange, `Move (${result.effectiveness?.label || 'Effect'})`);
            modifyMomentum(defender, defenderMomentumChange, `Opponent Move (${result.effectiveness?.label || 'Effect'})`);
            
            defender.hp = clamp(defender.hp - (result.damage || 0), 0, 100); 
            attacker.energy = clamp(attacker.energy - (result.energyCost || 0), 0, 100); 

            const oldDefenderMentalState = defender.mentalState?.level; 
            const oldAttackerMentalState = attacker.mentalState?.level; 

            if ((result.collateralDamage || 0) > 0) {
                environmentState.damageLevel = clamp(environmentState.damageLevel + (result.collateralDamage || 0), 0, 100);
                environmentState.lastDamageSourceId = attacker.id;
                const collateralContext = { currentPhaseKey };
                 if ((attacker.collateralTolerance || 0.5) < 0.3) addNarrativeEvent(findNarrativeQuote(attacker, defender, 'onCollateral', 'stressedByDamage', collateralContext), attacker);
                else if ((attacker.collateralTolerance || 0.5) > 0.7) addNarrativeEvent(findNarrativeQuote(attacker, defender, 'onCollateral', 'thrivingInDamage', collateralContext), attacker);
                else addNarrativeEvent(findNarrativeQuote(attacker, defender, 'onCollateral', 'causingDamage', collateralContext), attacker);
                
                if ((defender.collateralTolerance || 0.5) < 0.3) addNarrativeEvent(findNarrativeQuote(defender, attacker, 'onCollateral', 'stressedByDamage', collateralContext), defender);
                else if ((defender.collateralTolerance || 0.5) > 0.7) addNarrativeEvent(findNarrativeQuote(defender, attacker, 'onCollateral', 'thrivingInDamage', collateralContext), defender);
                else addNarrativeEvent(findNarrativeQuote(defender, attacker, 'onCollateral', 'observingDamage', collateralContext), defender);
            }
            
            updateMentalState(defender, attacker, result, environmentState);
            updateMentalState(attacker, defender, null, environmentState);

            if (defender.mentalState?.level !== oldDefenderMentalState) addNarrativeEvent(findNarrativeQuote(defender, attacker, 'onStateChange', defender.mentalState.level, { currentPhaseKey }), defender);
            if (attacker.mentalState?.level !== oldAttackerMentalState) addNarrativeEvent(findNarrativeQuote(attacker, defender, 'onStateChange', attacker.mentalState.level, { currentPhaseKey }), attacker);
            
            attacker.lastMoveEffectiveness = result.effectiveness?.label || 'Normal';
            attacker.consecutiveDefensiveTurns = (move.type === 'Utility' || move.type === 'Defense') ? (attacker.consecutiveDefensiveTurns || 0) + 1 : 0;
            
            if (move.setup && result.effectiveness?.label !== 'Weak' && !move.isRepositionMove) {
                defender.tacticalState = { ...(move.setup || {}), isPositive: false }; 
                (attacker.aiLog || []).push(`[Tactical State Apply]: ${defender.name || 'Defender'} is now ${defender.tacticalState.name}!`);
            }
            if (move.isRepositionMove && attacker.tacticalState) {
                const stateType = attacker.tacticalState.isPositive ? '(Self-Buff)' : '(Self-Debuff)';
                (attacker.aiLog || []).push(`[Tactical State Apply]: ${attacker.name || 'Attacker'} is now ${attacker.tacticalState.name}! ${stateType}`);
            }

            if (move.moveTags?.includes('requires_opening') && result.payoff) defender.tacticalState = null;
            if (result.effectiveness?.label === 'Critical') defender.isStunned = true;
            
            turnSpecificEvents.push(...generateTurnNarrationObjects(narrativeEventsForAction, move, attacker, defender, result, environmentState, locationDataForNarrative, currentPhaseKey));
            
            (attacker.moveHistory || []).push({ ...(move || {}), effectiveness: result.effectiveness?.label || 'Normal' });
            attacker.lastMove = move;
            
            updateAiMemory(defender, attacker); 
            updateAiMemory(attacker, defender); 

            if ((defender.hp || 0) <= 0) {
                battleOver = true; 
            }
            
            const f1DefTurns = fighter1.consecutiveDefensiveTurns || 0;
            const f2DefTurns = fighter2.consecutiveDefensiveTurns || 0;
            const f1Hp = fighter1.hp || 0;
            const f2Hp = fighter2.hp || 0;

            if (!battleOver && turn >= 3) { 
                if (f1DefTurns >= 3 && f2DefTurns >= 3 &&
                    Math.abs(f1Hp - f2Hp) < 15 && 
                    phaseState.currentPhase !== BATTLE_PHASES.EARLY) { 
                    isStalemate = true;
                    battleOver = true; 
                    (fighter1.aiLog || []).push("[Stalemate Condition Met]: Prolonged defensive engagement.");
                    (fighter2.aiLog || []).push("[Stalemate Condition Met]: Prolonged defensive engagement.");
                }
            }
        };
        
        environmentState.specificImpacts.clear(); 
        const currentIterationLocData = locationConditions[locId];
        if (currentIterationLocData?.damageThresholds && currentIterationLocData.environmentalImpacts) {
            const damageLevel = environmentState.damageLevel || 0;
            const thresholds = currentIterationLocData.damageThresholds;
            const impacts = currentIterationLocData.environmentalImpacts;
            
            let impactPool = [];
            if (damageLevel >= (thresholds.catastrophic || Infinity) && impacts.catastrophic) impactPool = impacts.catastrophic;
            else if (damageLevel >= (thresholds.severe || Infinity) && impacts.severe) impactPool = impacts.severe;
            else if (damageLevel >= (thresholds.moderate || Infinity) && impacts.moderate) impactPool = impacts.moderate;
            else if (damageLevel >= (thresholds.minor || 0) && impacts.minor) impactPool = impacts.minor;

            if (impactPool.length > 0) {
                // Use the locally defined getRandomElement for this file
                const impactToAdd = getRandomElement(impactPool); 
                if(impactToAdd) environmentState.specificImpacts.add(impactToAdd);
            }
        }
        
        processTurn(initiator, responder);
        if (!battleOver && !isStalemate) processTurn(responder, initiator);
        
        if (environmentState.damageLevel > 0 && environmentState.specificImpacts.size > 0) {
            let impactTexts = [];
            environmentState.specificImpacts.forEach(impact => {
                 const formattedImpactText = findNarrativeQuote(initiator, responder, 'onCollateral', 'general', { impactText: impact, currentPhaseKey })?.line || impact;
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
    
    let winner = null, loser = null; 
    if (isStalemate) {
        battleEventLog.push({ type: 'stalemate_result_event', text: (phaseTemplates.stalemateResult || "").replace(/<p class="final-blow">|<\/p>/g, '') });
        if (fighter1) fighter1.summary = "The battle reached an impasse.";
        if (fighter2) fighter2.summary = "The battle reached an impasse.";
    } else if ((fighter1?.hp || 0) <= 0) {
        winner = fighter2; loser = fighter1;
    } else if ((fighter2?.hp || 0) <= 0) {
        winner = fighter1; loser = fighter2;
    } else { 
        const f1Hp = fighter1?.hp || 0;
        const f2Hp = fighter2?.hp || 0;
        if (f1Hp === f2Hp) {
            isStalemate = true; 
            battleEventLog.push({ type: 'draw_result_event', text: (phaseTemplates.drawResult || "").replace(/<p class="final-blow">|<\/p>/g, '') });
        } else {
            winner = (f1Hp > f2Hp) ? fighter1 : fighter2;
            loser = (winner?.id === fighter1?.id) ? fighter2 : fighter1;
            const timeoutText = (phaseTemplates.timeOutVictory || "")
                .replace(/{winnerName}/g, `<span class="char-${winner?.id || 'unknown'}">${winner?.name || 'Winner'}</span>`)
                .replace(/{loserName}/g, `<span class="char-${loser?.id || 'unknown'}">${loser?.name || 'Loser'}</span>`)
                .replace(/<p class="final-blow">|<\/p>/g, '');
            battleEventLog.push({ type: 'timeout_victory_event', text: timeoutText });
        }
    }

    if (!isStalemate && winner && loser && (loser.hp || 0) <= 0) {
        const finalText = `<span class="char-${winner.id || 'unknown'}">${winner.name || 'Winner'}</span> has defeated <span class="char-${loser.id || 'unknown'}">${loser.name || 'Loser'}</span>!`;
        battleEventLog.push({ type: 'battle_end_ko_event', text: finalText }); 
    }
    
    if (!isStalemate && winner) {
         winner.summary = winner.summary || `${winner.name || 'Winner'}'s victory was sealed.`; 
        const finalWords = getFinalVictoryLine(winner, loser);
        const conclusionText = `${winner.name || 'Winner'} stands victorious. "${finalWords}"`;
        battleEventLog.push({ type: 'conclusion_event', text: conclusionText });
    } else if (isStalemate) { 
        battleEventLog.push({ type: 'conclusion_event', text: "The intense confrontation ends, both combatants pushed to their limits but neither broken." });
    } else if (!winner && fighter1?.hp === fighter2?.hp) { 
        battleEventLog.push({ type: 'conclusion_event', text: "The battle concludes. Neither could claim victory." });
    }

    if(winner) (winner.interactionLog = winner.interactionLog || []).push(...interactionLog);
    if(loser) (loser.interactionLog = loser.interactionLog || []).push(...interactionLog);

    if (fighter1) fighter1.phaseLog = phaseState.phaseLog || [];
    if (fighter2) fighter2.phaseLog = phaseState.phaseLog || [];
    
    return { 
        log: battleEventLog, 
        winnerId: winner ? winner.id : null, 
        loserId: loser ? loser.id : null, 
        isDraw: isStalemate || (!winner && !loser && fighter1?.hp === fighter2?.hp),
        finalState: { fighter1, fighter2 }, 
        environmentState 
    };
}