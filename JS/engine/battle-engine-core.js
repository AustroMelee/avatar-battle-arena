// FILE: engine/battle-engine-core.js
'use strict';

// VERSION 8: Final integration with the OMEGA Narrative Engine rendering pipeline.

import { characters } from '../data/characters.js';
import { locationConditions } from '../location-battle-conditions.js';
import { battlePhases, phaseTemplates } from '../narrative-v2.js';
import { selectMove, updateAiMemory, attemptManipulation, adaptPersonality } from './ai-decision.js';
import { calculateMove } from './move-resolution.js';
import { updateMentalState } from './mental-state.js';
import { narrateMove, generateOutcomeSummary } from './narration.js';
import { generateNarrativeEvent, renderNarrativeEvent, getFinalVictoryLine } from './narrative-engine.js';

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
        aiMemory: {
            selfMoveEffectiveness: {}, opponentModel: { isAggressive: 0, isDefensive: 0, isTurtling: false },
            moveSuccessCooldown: {}, opponentSequenceLog: {},
        }
    };
}

const updateMomentum = (current, label) => clamp(current + ({ 'Critical': 3, 'Strong': 2, 'Normal': 1, 'Weak': -2, 'Counter': 2 }[label] || 0), -5, 5);

export function simulateBattle(f1Id, f2Id, locId, timeOfDay, emotionalMode = false) {
    let fighter1 = initializeFighterState(f1Id, f2Id, emotionalMode);
    let fighter2 = initializeFighterState(f2Id, f1Id, emotionalMode);
    
    const conditions = { ...locationConditions[locId], isDay: timeOfDay === 'day', isNight: timeOfDay === 'night' };
    let turnLog = [], interactionLog = [];
    let initiator = (fighter1.powerTier > fighter2.powerTier) ? fighter1 : fighter2;
    let responder = (initiator.id === fighter1.id) ? fighter2 : fighter1;
    let battleOver = false, finalMove = null;

    let initialNarration = '';
    initialNarration += renderNarrativeEvent(generateNarrativeEvent(fighter1, 'battleStart', 'general', { target: fighter2 }));
    initialNarration += renderNarrativeEvent(generateNarrativeEvent(fighter2, 'battleStart', 'general', { target: fighter1 }));
    if(initialNarration) turnLog.push(`<div class="narrative-block">${initialNarration}</div>`);

    for (let turn = 0; turn < 6 && !battleOver; turn++) {
        const phaseName = battlePhases[turn]?.name || "Final Exchange";
        let phaseContent = phaseTemplates.header.replace('{phaseName}', phaseName).replace('{phaseEmoji}', '⚔️');
        
        const processTurn = (attacker, defender) => {
            if (battleOver) return;
            let narrativeEvents = [];
            const oldDefenderMentalState = defender.mentalState.level;

            if (turn > 1) adaptPersonality(attacker);
            if (attacker.tacticalState) {
                attacker.tacticalState.duration--;
                if (attacker.tacticalState.duration <= 0) attacker.tacticalState = null;
            }
            attacker.isStunned = false;
            
            let manipulationResult = attemptManipulation(attacker, defender);
            if (manipulationResult.success) {
                defender.tacticalState = { name: manipulationResult.effect, duration: 1, intensity: 1.2 };
                defender.contextualState.isManipulatedBy = attacker.id;
                narrativeEvents.push({ raw: manipulationResult.narration }); // Push raw HTML for this special case
                narrativeEvents.push(generateNarrativeEvent(defender, 'onManipulation', 'asVictim', { attacker: attacker }));
                interactionLog.push(`${attacker.name} manipulated ${defender.name}.`);
            }

            updateMentalState(attacker, defender, null);
            const { move, aiLogEntry } = selectMove(attacker, defender, conditions, turn);
            attacker.aiLog.push(`[T${turn+1}] ${JSON.stringify(aiLogEntry, null, 2)}`);
            narrativeEvents.push(generateNarrativeEvent(attacker, 'onIntentSelection', aiLogEntry.intent, { target: defender }));
            
            if(aiLogEntry.prediction.confidence > 0.4 && aiLogEntry.prediction.move) {
                 narrativeEvents.push(generateNarrativeEvent(attacker, 'onPrediction', 'correct', { move: aiLogEntry.prediction.move, target: defender }));
            }

            const result = calculateMove(move, attacker, defender, conditions, interactionLog);
            
            updateMentalState(defender, attacker, result);
            if (defender.mentalState.level !== oldDefenderMentalState) {
                narrativeEvents.push(generateNarrativeEvent(defender, 'onStateChange', defender.mentalState.level));
            }
            
            attacker.lastMoveEffectiveness = result.effectiveness.label;
            narrativeEvents.push(generateNarrativeEvent(attacker, 'onMoveResult', move.name, { result: result.effectiveness.label }));

            attacker.consecutiveDefensiveTurns = (move.type === 'Utility' || move.type === 'Defense') ? attacker.consecutiveDefensiveTurns + 1 : 0;
            if (move.setup && result.effectiveness.label !== 'Weak') defender.tacticalState = { ...move.setup };
            if (move.moveTags?.includes('requires_opening') && result.payoff) defender.tacticalState = null;
            if (result.effectiveness.label === 'Critical') defender.isStunned = true;
            
            // RENDER NARRATIVE BLOCK
            const narrativeBlock = narrativeEvents.filter(e => e).map(e => e.raw || renderNarrativeEvent(e)).join('');
            if(narrativeBlock) phaseContent += `<div class="narrative-block">${narrativeBlock}</div>`;
            
            // RENDER ACTION
            phaseContent += narrateMove(attacker, defender, move, result);

            // APPLY RESULTS
            defender.hp = clamp(defender.hp - result.damage, 0, 100);
            attacker.energy = clamp(attacker.energy - result.energyCost, 0, 100);
            attacker.moveHistory.push({ ...move, effectiveness: result.effectiveness.label });
            attacker.lastMove = move;
            updateAiMemory(defender, attacker);

            if (defender.hp <= 0) {
                battleOver = true;
                finalMove = move;
            }
        };
        
        processTurn(initiator, responder);
        if (!battleOver) processTurn(responder, initiator);

        turnLog.push(phaseTemplates.phaseWrapper.replace('{phaseName}', phaseName).replace('{phaseContent}', phaseContent.replace(/<div[^>]*><\/div>/g, '')));
        [initiator, responder] = [responder, initiator];
    }
    
    // FINAL OUTCOME
    const winner = (fighter1.hp <= 0) ? fighter2 : ((fighter2.hp <= 0) ? fighter1 : (fighter1.hp > fighter2.hp ? fighter1 : fighter2));
    const loser = (winner.id === fighter1.id) ? fighter2 : fighter1;
    winner.summary = generateOutcomeSummary(winner);
    
    if (loser.hp > 0) {
        turnLog.push(phaseTemplates.timeOutVictory.replace(/{winnerName}/g, `<span class="char-${winner.id}">${winner.name}</span>`).replace(/{loserName}/g, `<span class="char-${loser.id}">${loser.name}</span>`));
    } else {
        turnLog.push(phaseTemplates.finalBlow.replace(/{winnerName}/g, `<span class="char-${winner.id}">${winner.name}</span>`).replace(/{loserName}/g, `<span class="char-${loser.id}">${loser.name}</span>`));
    }
    
    const finalWords = getFinalVictoryLine(winner, loser, finalMove);
    turnLog.push(phaseTemplates.conclusion.replace('{endingNarration}', `${winner.name} stands victorious. "${finalWords}"`));

    return { log: turnLog.join(''), winnerId: winner.id, loserId: loser.id, finalState: { fighter1, fighter2 } };
}