// FILE: engine/engine_battle-engine-core.js
'use strict';

import { initializeFighterState, initializeBattleState } from './state_initializer.js';
import { applyCurbstompRules } from './curbstomp_handler.js';
import { evaluateTerminalState } from './terminal_state.js';
import { executeTurn } from './turn_manager.js';
import { checkAndTransitionPhase, BATTLE_PHASES } from './engine_battle-phase.js';
import { findNarrativeQuote, generateTurnNarrationObjects, getFinalVictoryLine, substituteTokens } from './engine_narrative-engine.js';
import { phaseTemplates, battlePhases as phaseDefinitions } from '../data/data_narrative_phases.js';
import { locationConditions, locationPhaseOverrides } from '../data/location-battle-conditions.js';
import { getRandomElement } from './helpers.js';

const MAX_TOTAL_TURNS = 25;

/**
 * Creates a clean, serializable snapshot of a fighter's state for the final battle log.
 * @param {object} fighter - The full fighter state object from the simulation.
 * @returns {object} A simplified, clean version of the fighter's state.
 */
const createCleanFighterState = (fighter) => {
    if (!fighter) return {};
    const cleanState = { ...fighter };
    delete cleanState.opponent; // Remove potential circular reference
    return cleanState;
};

/**
 * Simulates a complete battle between two fighters at a specific location.
 * @param {string} f1Id - The ID of the first fighter.
 * @param {string} f2Id - The ID of the second fighter.
 * @param {string} locId - The ID of the location.
 * @param {string} timeOfDay - The time of day for the battle.
 * @param {boolean} [emotionalMode=false] - Whether to run the simulation with emotional logic.
 * @returns {object} An object containing the comprehensive results of the battle.
 */
export function simulateBattle(f1Id, f2Id, locId, timeOfDay, emotionalMode = false) {
    const fighter1 = initializeFighterState(f1Id, f2Id, emotionalMode);
    const fighter2 = initializeFighterState(f2Id, f1Id, emotionalMode);

    let currentAttacker = fighter1;
    let currentDefender = fighter2;

    const currentBattleState = initializeBattleState(f1Id, f2Id, locId, timeOfDay, emotionalMode);
    fighter1.opponentId = f2Id;
    fighter2.opponentId = f1Id;

    const locationData = locationConditions[locId];
    if (!locationData) {
        throw new Error(`Invalid location ID: ${locId}`);
    }

    const conditions = {
        id: locId, timeOfDay, ...locationData,
        environmentalModifiers: locationData.environmentalModifiers || {},
        damageThresholds: locationData.damageThresholds || { minor: 20, moderate: 40, severe: 60, catastrophic: 80 }
    };

    const { environmentState } = currentBattleState;
    const battleEventLog = [];
    const charactersMarkedForDefeat = new Set();
    const phaseState = initializeBattlePhaseState();

    const locationOverrides = locationPhaseOverrides[locId] || {};
    if (typeof locationOverrides.pokingDuration === 'number' && locationOverrides.pokingDuration >= 0) {
        phaseState.pokingDuration = locationOverrides.pokingDuration;
        fighter1.aiLog.push(`[Phase Override]: Poking duration set to ${phaseState.pokingDuration} due to location ${locId}.`);
        fighter2.aiLog.push(`[Phase Override]: Poking duration set to ${phaseState.pokingDuration} due to location ${locId}.`);
    }

    let battleOver = false;
    let winnerId = null;
    let loserId = null;
    let isStalemate = false;
    let turn = 0;

    fighter1.aiLog.push(`Battle started in ${phaseState.currentPhase} Phase.`);
    fighter2.aiLog.push(`Battle started in ${phaseState.currentPhase} Phase.`);

    const initialBanter1 = findNarrativeQuote(fighter1, fighter2, 'battleStart', phaseState.currentPhase, { currentPhaseKey: phaseState.currentPhase, locationId: locId, battleState: currentBattleState });
    if (initialBanter1) {
        battleEventLog.push(...generateTurnNarrationObjects([{ quote: initialBanter1, actor: fighter1 }], null, fighter1, fighter2, null, environmentState, locationData, phaseState.currentPhase, true, null, currentBattleState));
    }
    const initialBanter2 = findNarrativeQuote(fighter2, fighter1, 'battleStart', phaseState.currentPhase, { currentPhaseKey: phaseState.currentPhase, locationId: locId, battleState: currentBattleState });
    if (initialBanter2) {
        battleEventLog.push(...generateTurnNarrationObjects([{ quote: initialBanter2, actor: fighter2 }], null, fighter2, fighter1, null, environmentState, locationData, phaseState.currentPhase, true, null, currentBattleState));
    }

    if (applyCurbstompRules(fighter1, fighter2, currentBattleState, battleEventLog, charactersMarkedForDefeat)) {
        isStalemate = true;
    }

    let terminalOutcome = evaluateTerminalState(fighter1, fighter2, isStalemate, charactersMarkedForDefeat);
    battleOver = terminalOutcome.battleOver;

    for (turn = 0; turn < MAX_TOTAL_TURNS && !battleOver; turn++) {
        currentBattleState.turn = turn;
        currentBattleState.currentPhase = phaseState.currentPhase;

        Object.assign(currentBattleState, {
            opponentLandedCriticalHit: false, opponentTaunted: false, opponentUsedLethalForce: false,
            opponentLandedSignificantHits: 0, characterReceivedCriticalHit: false, characterLandedStrongOrCriticalHitLastTurn: false
        });

        const phaseChanged = checkAndTransitionPhase(phaseState, currentAttacker, currentDefender, turn, locId);
        if (phaseChanged) {
            const lastSummaryEntry = phaseState.phaseSummaryLog[phaseState.phaseSummaryLog.length - 1];
            currentAttacker.aiLog.push(`[Phase Summary]: ${lastSummaryEntry.phase} concluded after ${lastSummaryEntry.turns} turns.`);
            currentDefender.aiLog.push(`[Phase Summary]: ${lastSummaryEntry.phase} concluded after ${lastSummaryEntry.turns} turns.`);
            
            const currentPhaseInfo = phaseDefinitions.find(p => p.key === phaseState.currentPhase);
            battleEventLog.push({
                type: 'phase_header_event',
                phaseName: currentPhaseInfo.name,
                phaseEmoji: currentPhaseInfo.emoji,
                phaseKey: phaseState.currentPhase,
                html_content: substituteTokens(phaseTemplates.header, null, null, {'{phaseDisplayName}': currentPhaseInfo.name, '{phaseEmoji}': currentPhaseInfo.emoji})
            });
        }

        const turnContext = { battleState: currentBattleState, conditions, charactersMarkedForDefeat, fighter1, fighter2, locationData, environmentState, battleEventLog };
        const isNarrativeOnlyTurn = (currentBattleState.currentPhase === BATTLE_PHASES.PRE_BANTER);

        if (!isNarrativeOnlyTurn) {
            const turnResult1 = executeTurn(currentAttacker, currentDefender, turnContext);
            battleEventLog.push(...turnResult1.turnSpecificEventsForLog);
            if (turnResult1.battleOver) { battleOver = true; break; }

            const turnResult2 = executeTurn(currentDefender, currentAttacker, turnContext);
            battleEventLog.push(...turnResult2.turnSpecificEventsForLog);
            if (turnResult2.battleOver) { battleOver = true; break; }
        }

        environmentState.specificImpacts.clear();
        if (locationData.damageThresholds && environmentState.damageLevel > 0) {
            let impactTier = null;
            if (environmentState.damageLevel >= locationData.damageThresholds.catastrophic) impactTier = 'catastrophic';
            else if (environmentState.damageLevel >= locationData.damageThresholds.severe) impactTier = 'severe';
            else if (environmentState.damageLevel >= locationData.damageThresholds.moderate) impactTier = 'moderate';
            else if (environmentState.damageLevel >= locationData.damageThresholds.minor) impactTier = 'minor';
            
            if (impactTier && locationData.environmentalImpacts[impactTier] && locationData.environmentalImpacts[impactTier].length > 0) {
                const impactKey = getRandomElement(Object.keys(locationData.environmentalImpacts[impactTier]));
                if (impactKey) {
                    environmentState.specificImpacts.add(locationData.environmentalImpacts[impactTier][impactKey]);
                }
            }
        }
        
        if (!battleOver && turn >= 2 && currentAttacker.consecutiveDefensiveTurns >= 3 && currentDefender.consecutiveDefensiveTurns >= 3) {
            isStalemate = true; battleOver = true; break;
        }

        [currentAttacker, currentDefender] = [currentDefender, currentAttacker];
    }

    terminalOutcome = evaluateTerminalState(fighter1, fighter2, isStalemate, charactersMarkedForDefeat);
    winnerId = terminalOutcome.winnerId;
    loserId = terminalOutcome.loserId;
    isStalemate = terminalOutcome.isStalemate;

    if (!terminalOutcome.battleOver && turn >= MAX_TOTAL_TURNS) {
        if (fighter1.hp === fighter2.hp) isStalemate = true;
        else {
            winnerId = fighter1.hp > fighter2.hp ? f1Id : f2Id;
            loserId = winnerId === f1Id ? f2Id : f1Id;
        }
    }

    const finalWinnerFull = winnerId ? (fighter1.id === winnerId ? fighter1 : fighter2) : null;
    const finalLoserFull = loserId ? (fighter1.id === loserId ? fighter1 : fighter2) : null;

    if (isStalemate) {
        battleEventLog.push({ type: 'stalemate_result_event', text: "The battle ends in a STALEMATE!", html_content: phaseTemplates.stalemateResult });
        fighter1.summary = "The battle reached an impasse, with neither fighter able to secure victory.";
        fighter2.summary = "The battle reached an impasse, with neither fighter able to secure victory.";
    } else if (finalWinnerFull && finalLoserFull) {
        const isKOByHp = finalLoserFull.hp <= 0;
        const isTimeoutVictory = turn >= MAX_TOTAL_TURNS && !isKOByHp;
        let victoryTextRaw, victoryTextHtml, victoryTypeEvent;

        if (isTimeoutVictory) {
            victoryTypeEvent = 'timeout_victory_event';
            victoryTextRaw = `The battle timer expires! With more health remaining, ${finalWinnerFull.name} is declared the victor over ${finalLoserFull.name}!`;
            victoryTextHtml = substituteTokens(phaseTemplates.timeOutVictory, finalWinnerFull, finalLoserFull);
        } else {
            victoryTypeEvent = 'final_blow_event';
            victoryTextRaw = `${finalWinnerFull.name} lands the finishing blow, defeating ${finalLoserFull.name}!`;
            victoryTextHtml = substituteTokens(phaseTemplates.finalBlow, finalWinnerFull, finalLoserFull);
        }

        battleEventLog.push({ type: victoryTypeEvent, text: victoryTextRaw, html_content: victoryTextHtml, isKOAction: isKOByHp });
        finalWinnerFull.summary = victoryTextRaw;
        finalLoserFull.summary = `${finalLoserFull.name} was defeated by ${finalWinnerFull.name}.`;

        const finalWords = getFinalVictoryLine(finalWinnerFull, finalLoserFull);
        const conclusionTextRaw = substituteTokens(`${finalWinnerFull.name} stands victorious. "${finalWords}"`, finalWinnerFull, finalLoserFull);
        battleEventLog.push({ type: 'conclusion_event', text: conclusionTextRaw, html_content: phaseTemplates.conclusion.replace('{endingNarration}', conclusionTextRaw) });
    }

    return {
        log: battleEventLog, winnerId, loserId, isDraw: isStalemate,
        finalState: { fighter1: createCleanFighterState(fighter1), fighter2: createCleanFighterState(fighter2) },
        environmentState
    };
}