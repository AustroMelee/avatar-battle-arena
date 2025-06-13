// FILE: engine/battle-engine-core.js
'use strict';

// VERSION 9.1: HOTFIX.
// Removed the dead local `findNarrativeQuote` function.
// Now imports the single source of truth from the narrative engine.

import { characters } from '../data/characters.js';
import { locationConditions } from '../location-battle-conditions.js';
import { battlePhases, phaseTemplates } from '../narrative-v2.js';
import { selectMove, updateAiMemory, attemptManipulation, adaptPersonality } from './ai-decision.js';
import { calculateMove } from './move-resolution.js';
import { updateMentalState } from './mental-state.js';
// === MODIFICATION START: `findNarrativeQuote` is now imported. ===
import { generateTurnNarration, getFinalVictoryLine, findNarrativeQuote } from './narrative-engine.js';
// === MODIFICATION END ===

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

// === MODIFICATION START: Dead function removed. ===
// The local `findNarrativeQuote` function that was here has been deleted.
// === MODIFICATION END ===

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
    let turnLog = [];
    let initiator = (fighter1.powerTier > fighter2.powerTier) ? fighter1 : fighter2;
    let responder = (initiator.id === fighter1.id) ? fighter2 : fighter1;
    let battleOver = false;

    // Initial battle start banter
    const initialBanter1 = findNarrativeQuote(fighter1, fighter2, 'battleStart', 'general');
    const initialBanter2 = findNarrativeQuote(fighter2, fighter1, 'battleStart', 'general');
    let initialNarration = '';
    if (initialBanter1) initialNarration += generateTurnNarration([{quote: initialBanter1, actor: fighter1}], {}, fighter1, fighter2, {});
    if (initialBanter2) initialNarration += generateTurnNarration([{quote: initialBanter2, actor: fighter2}], {}, fighter2, fighter1, {});
    if (initialNarration) turnLog.push(initialNarration.replace(/<div class="move-line".*?<\/div>/g, '')); // Strip empty move lines
    
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
                const manipQuote = findNarrativeQuote(attacker, defender, 'onManipulation', 'asAttacker');
                if (manipQuote) narrativeEvents.push({ quote: manipQuote, actor: attacker });
            }

            const { move, aiLogEntry } = selectMove(attacker, defender, conditions, turn);
            attacker.aiLog.push(`[T${turn+1}] ${JSON.stringify(aiLogEntry, null, 2)}`);
            const intentQuote = findNarrativeQuote(attacker, defender, 'onIntentSelection', aiLogEntry.intent);
            if(intentQuote) narrativeEvents.push({ quote: intentQuote, actor: attacker });
            
            const result = calculateMove(move, attacker, defender, conditions);
            
            updateMentalState(defender, attacker, result);
            if (defender.mentalState.level !== oldDefenderMentalState) {
                const stateChangeQuote = findNarrativeQuote(defender, attacker, 'onStateChange', defender.mentalState.level);
                if (stateChangeQuote) narrativeEvents.push({ quote: stateChangeQuote, actor: defender });
            }
            
            attacker.lastMoveEffectiveness = result.effectiveness.label;
            attacker.consecutiveDefensiveTurns = (move.type === 'Utility' || move.type === 'Defense') ? attacker.consecutiveDefensiveTurns + 1 : 0;
            if (move.setup && result.effectiveness.label !== 'Weak') defender.tacticalState = { ...move.setup };
            if (move.moveTags?.includes('requires_opening') && result.payoff) defender.tacticalState = null;
            if (result.effectiveness.label === 'Critical') defender.isStunned = true;
            
            // RENDER NARRATIVE & ACTION BLOCK
            phaseContent += generateTurnNarration(narrativeEvents, move, attacker, defender, result);

            // APPLY RESULTS
            defender.hp = clamp(defender.hp - result.damage, 0, 100);
            attacker.energy = clamp(attacker.energy - result.energyCost, 0, 100);
            attacker.moveHistory.push({ ...move, effectiveness: result.effectiveness.label });
            attacker.lastMove = move;
            updateAiMemory(defender, attacker);

            if (defender.hp <= 0) battleOver = true;
        };
        
        processTurn(initiator, responder);
        if (!battleOver) processTurn(responder, initiator);

        turnLog.push(phaseTemplates.phaseWrapper.replace('{phaseName}', phaseName).replace('{phaseContent}', phaseContent.replace(/<div[^>]*><\/div>/g, '')));
        [initiator, responder] = [responder, initiator];
    }
    
    // FINAL OUTCOME
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

    return { log: turnLog.join(''), winnerId: winner.id, loserId: loser.id, finalState: { fighter1, fighter2 } };
}