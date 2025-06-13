// FILE: engine/battle-engine-core.js
'use strict';

// VERSION 6: Final integration with the OMEGA Narrative Engine.

import { characters } from '../data/characters.js';
import { locationConditions } from '../location-battle-conditions.js';
import { battlePhases, phaseTemplates } from '../narrative-v2.js';
import { selectMove, updateAiMemory, attemptManipulation, adaptPersonality } from './ai-decision.js';
import { calculateMove } from './move-resolution.js';
import { updateMentalState } from './mental-state.js';
import { narrateMove } from './narration.js';
import { triggerNarrativeEvent } from './narrative-engine.js';
import { getToneAlignedVictoryEnding, generateOutcomeSummary } from './narration.js';

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

function initializeFighterState(charId, opponentId, emotionalMode) {
    const characterData = characters[charId];
    if (!characterData) throw new Error(`Character with ID ${charId} not found.`);
    
    return { 
        id: charId, name: characterData.name, ...JSON.parse(JSON.stringify(characterData)), 
        hp: 100, energy: 100, momentum: 0, lastMove: null, lastMoveEffectiveness: null,
        isStunned: false, tacticalState: null, movesUsed: [], phraseHistory: {}, moveHistory: [], moveFailureHistory: [],
        consecutiveDefensiveTurns: 0, aiLog: [],
        relationalState: (emotionalMode && characterData.relationships?.[opponentId]) || null,
        mentalState: { level: 'stable', stress: 0 }, mentalStateChangedThisTurn: false,
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
    let battleOver = false;

    // Battle Start Narrative
    turnLog.push(triggerNarrativeEvent(fighter1, 'battleStart', 'general', { target: fighter2 }));
    turnLog.push(triggerNarrativeEvent(fighter2, 'battleStart', 'general', { target: fighter1 }));

    for (let turn = 0; turn < 6 && !battleOver; turn++) {
        [fighter1, fighter2].forEach(f => {
            f.mentalStateChangedThisTurn = false;
            Object.keys(f.aiMemory.moveSuccessCooldown).forEach(moveName => {
                f.aiMemory.moveSuccessCooldown[moveName]--;
                if (f.aiMemory.moveSuccessCooldown[moveName] <= 0) delete f.aiMemory.moveSuccessCooldown[moveName];
            });
            if (f.tacticalState) {
                f.tacticalState.duration--;
                if (f.tacticalState.duration <= 0) {
                    f.tacticalState = null;
                    interactionLog.push(`${f.name} recovered.`);
                }
            }
            if (turn > 1) adaptPersonality(f);
        });
        
        const phaseName = battlePhases[turn]?.name || "Final Exchange";
        let phaseContent = phaseTemplates.header.replace('{phaseName}', phaseName).replace('{phaseEmoji}', '⚔️');
        
        const processTurn = (attacker, defender) => {
            if (battleOver) return;
            const oldAttackerMentalState = attacker.mentalState.level;
            const oldDefenderMentalState = defender.mentalState.level;

            attacker.isStunned = false; 
            
            let manipulationResult = attemptManipulation(attacker, defender);
            if (manipulationResult.success) {
                defender.tacticalState = { name: manipulationResult.effect, duration: 1, intensity: 1.2 };
                phaseContent += manipulationResult.narration;
                phaseContent += triggerNarrativeEvent(defender, 'manipulation', 'asVictim', { attacker: attacker });
                interactionLog.push(`${attacker.name} manipulated ${defender.name}, leaving them ${manipulationResult.effect}.`);
            }

            updateMentalState(attacker, defender, null);
            const { move, aiLogEntry } = selectMove(attacker, defender, conditions, turn);
            attacker.aiLog.push(`[T${turn+1}] ${JSON.stringify(aiLogEntry, null, 2)}`);
            phaseContent += triggerNarrativeEvent(attacker, 'intent', aiLogEntry.intent, { target: defender });
            if(aiLogEntry.prediction.confidence > 0.5 && aiLogEntry.prediction.move) {
                 phaseContent += triggerNarrativeEvent(attacker, 'prediction', 'correct', { move: aiLogEntry.prediction.move, target: defender });
            }

            const result = calculateMove(move, attacker, defender, conditions, interactionLog);
            
            updateMentalState(defender, attacker, result);
            if (defender.mentalState.level !== oldDefenderMentalState) phaseContent += triggerNarrativeEvent(defender, 'mentalState', defender.mentalState.level);
            if (attacker.mentalState.level !== oldAttackerMentalState) phaseContent += triggerNarrativeEvent(attacker, 'mentalState', attacker.mentalState.level);
            
            attacker.momentum = updateMomentum(attacker.momentum, result.effectiveness.label);
            attacker.lastMoveEffectiveness = result.effectiveness.label;
            
            phaseContent += triggerNarrativeEvent(attacker, 'moveEffectiveness', result.effectiveness.label);
            
            attacker.consecutiveDefensiveTurns = (move.type === 'Utility' || move.type === 'Defense') ? attacker.consecutiveDefensiveTurns + 1 : 0;
            
            if (move.setup && result.effectiveness.label !== 'Weak') defender.tacticalState = { ...move.setup };
            if (move.moveTags?.includes('requires_opening') && result.payoff) defender.tacticalState = null;
            
            if (result.effectiveness.label === 'Critical') defender.isStunned = true;
            if (result.wasPunished) {
                attacker.moveFailureHistory.push(move.name);
                attacker.mentalState.stress += 25;
            }
            
            phaseContent += narrateMove(attacker, defender, move, result);
            defender.hp = clamp(defender.hp - result.damage, 0, 100);
            attacker.energy = clamp(attacker.energy - result.energyCost, 0, 100);
            
            attacker.moveHistory.push(move);
            attacker.lastMove = move;
            
            updateAiMemory(defender, attacker);

            if (defender.hp <= 0) battleOver = true;
        };
        
        processTurn(initiator, responder);
        if (!battleOver) processTurn(responder, initiator);

        turnLog.push(phaseTemplates.phaseWrapper.replace('{phaseName}', phaseName).replace('{phaseContent}', phaseContent.replace(/<p[^>]*><\/p>/g, '')));
        [initiator, responder] = [responder, initiator];
    }
    
    const finalInteractionLog = [...new Set(interactionLog)];
    fighter1.interactionLog = finalInteractionLog;
    fighter2.interactionLog = finalInteractionLog;

    if (fighter1.hp > 0 && fighter2.hp > 0 && Math.abs(fighter1.hp - fighter2.hp) < 5) {
         turnLog.push(phaseTemplates.drawResult);
         turnLog.push(phaseTemplates.conclusion.replace('{endingNarration}', "Both warriors fought to their absolute limit, but neither could secure the final blow. They stand exhausted, a testament to each other's strength."));
         return { log: turnLog.join(''), isDraw: true, finalState: { fighter1, fighter2 } };
    }

    const winner = (fighter1.hp <= 0) ? fighter2 : ((fighter2.hp <= 0) ? fighter1 : (fighter1.hp > fighter2.hp ? fighter1 : fighter2));
    const loser = (winner.id === fighter1.id) ? fighter2 : fighter1;
    winner.summary = generateOutcomeSummary(winner);
    
    if (loser.hp > 0) turnLog.push(phaseTemplates.timeOutVictory.replace(/{winnerName}/g, `<span class="char-${winner.id}">${winner.name}</span>`).replace(/{loserName}/g, `<span class="char-${loser.id}">${loser.name}</span>`));
    else turnLog.push(phaseTemplates.finalBlow.replace(/{winnerName}/g, `<span class="char-${winner.id}">${winner.name}</span>`).replace(/{loserName}/g, `<span class="char-${loser.id}">${loser.name}</span>`));
    
    const finalEnding = getToneAlignedVictoryEnding(winner.id, loser.id, { isCloseCall: winner.hp < 35, opponentId: loser.id, isDominant: winner.hp > 70 });
    turnLog.push(phaseTemplates.conclusion.replace('{endingNarration}', finalEnding));

    return { log: turnLog.join(''), winnerId: winner.id, loserId: loser.id, finalState: { fighter1, fighter2 } };
}