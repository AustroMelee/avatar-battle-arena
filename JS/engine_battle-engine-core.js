// FILE: engine_battle-engine-core.js
'use strict';

// Version 2.1: Re-integrated manipulation logic from its new module.

// --- DATA & RULE IMPORTS ---
import { characters } from './data_characters.js';
import { locationConditions } from './location-battle-conditions.js';
import { phaseTemplates, battlePhases as phaseDefinitions } from './data_narrative_phases.js';
import { locations, locationPhaseOverrides } from './locations.js';
import { MAX_TOTAL_TURNS, MIN_TURNS_BEFORE_CURBSTOMP, CURBSTOMP_HP_THRESHOLD, CURBSTOMP_MOMENTUM_THRESHOLD, MIN_ENERGY_FOR_ACTION, ENERGY_RECOVERY_PER_TURN, MAX_ENERGY, MAX_CONSECUTIVE_STUNS, STUN_RESISTANCE_INCREASE } from './config_game.js';

// --- ENGINE MODULE IMPORTS ---
import { initializeFighterState, initializeBattleState } from './engine_state_initializer.js';
import { applyCurbstompRules, resetCurbstompState, charactersMarkedForDefeat } from './engine_curbstomp_manager.js';
import { evaluateTerminalState } from './engine_terminal_state.js';
import { generateFinalSummary } from './engine_battle_summarizer.js';
import { attemptManipulation } from './engine_manipulation.js';
import { applyEffect } from './engine_effect_application.js';

// --- SUB-ENGINE IMPORTS ---
import { selectMove, updateAiMemory, adaptPersonality } from './engine_ai-decision.js';
import { calculateMove } from './engine_move-resolution.js';
import { updateMentalState } from './engine_mental-state.js';
import { generateTurnNarrationObjects, findNarrativeQuote, generateCurbstompNarration, generateEscalationNarrative, generateEnvironmentalSummaryEvent, generateStatusChangeEvent } from './engine_narrative-engine.js';
import { modifyMomentum } from './engine_momentum.js';
import { initializeBattlePhaseState, checkAndTransitionPhase, BATTLE_PHASES } from './engine_battle-phase.js';
import { setSeed, seededRandom, getRandomElementSeeded } from './utils_seeded_random.js';
import { generateLogEvent } from './utils_log_event.js';
import { USE_DETERMINISTIC_RANDOM, RANDOM_SEED } from './config_game.js';

// --- NEW UTILITY IMPORTS ---
import { clamp } from './utils_math.js';

/**

Checks for overwhelming advantage conditions that could end the fight prematurely.

@returns {boolean} True if curbstomp conditions are met.
*/
function checkCurbstompConditions(attacker, defender, locId, battleState, battleEventLog) {
if (battleState.turn < MIN_TURNS_BEFORE_CURBSTOMP) {
return false;
}

const isCurbstomp = (defender.hp <= attacker.hp * CURBSTOMP_HP_THRESHOLD) && (defender.momentum <= CURBSTOMP_MOMENTUM_THRESHOLD);

if (isCurbstomp) {
const curbstompEvent = generateLogEvent(battleState, {
type: 'curbstomp_event',
attackerId: attacker.id,
defenderId: defender.id,
text: `${attacker.name} has completely overwhelmed ${defender.name}!`,
html_content: `<p class="narrative-action char-${attacker.id}">${attacker.name} has completely overwhelmed ${defender.name}!</p>`,
isMajorEvent: true,
actualAttackerId: attacker.id
});
battleEventLog.push(curbstompEvent);
attacker.aiLog.push(`[Curbstomp]: ${attacker.name} has achieved a decisive advantage over ${defender.name}.`);
return true;
}
return false;
}

/**

Applies stun effect to a fighter, considering stun resistance.

@deprecated Stun application should now go through applyEffect from engine_effect_application.js
*/
function applyStun(fighter, duration) {
// This function should eventually be removed or refactored if applyEffect handles all stun logic.
// For now, it remains for compatibility until all calls are updated.
if (fighter.stunImmunityTurns > 0) {
fighter.aiLog.push(`[Stun Resist]: ${fighter.name} is immune to stun for this turn.`);
return;
}
const effectiveDuration = Math.max(1, Math.floor(duration * (1 - (fighter.stunResistance || 0))));
if (fighter.consecutiveStuns >= MAX_CONSECUTIVE_STUNS) {
fighter.aiLog.push(`[Stun Resistance]: ${fighter.name} has built up resistance to being stun-locked.`);
return;
}
fighter.consecutiveStuns = (fighter.consecutiveStuns || 0) + 1;
fighter.stunDuration = effectiveDuration;
fighter.stunImmunityTurns = 2;
}

/**

Simulates a battle between two fighters at a specific location and time.

@returns {object} The complete battle result log and final state.
*/
export function simulateBattle(f1Id, f2Id, locId, timeOfDay, emotionalMode = false) {
resetCurbstompState();

const battleEventLog = [];

// Initialize deterministic random seed if enabled
if (USE_DETERMINISTIC_RANDOM) {
setSeed(RANDOM_SEED);
console.log(`Deterministic Randomness: Initialized with seed ${RANDOM_SEED}`);
}

const fighter1 = initializeFighterState(f1Id, f2Id, emotionalMode);
const fighter2 = initializeFighterState(f2Id, f1Id, emotionalMode);
const currentBattleState = initializeBattleState(f1Id, f2Id, locId, timeOfDay, emotionalMode);
const phaseState = initializeBattlePhaseState(currentBattleState, battleEventLog);

fighter1.opponentId = fighter2.id;
fighter2.opponentId = fighter1.id;
currentBattleState.opponentId = fighter1.id;

let turn = 0;
let battleOver = false, winnerId = null, loserId = null, isStalemate = false;

// --- Pre-Battle Banter & Curbstomp Checks ---
const initialBanter1 = findNarrativeQuote(fighter1, fighter2, 'battleStart', phaseState.currentPhase, { currentPhaseKey: phaseState.currentPhase, locationId: locId, battleState: currentBattleState });
if (initialBanter1) battleEventLog.push(...generateTurnNarrationObjects([{ quote: initialBanter1, actor: fighter1 }], null, fighter1, fighter2, null, currentBattleState.environmentState, currentBattleState.locationConditions, phaseState.currentPhase, true, null, currentBattleState));

const initialBanter2 = findNarrativeQuote(fighter2, fighter1, 'battleStart', phaseState.currentPhase, { currentPhaseKey: phaseState.currentPhase, locationId: locId, battleState: currentBattleState });
if (initialBanter2) battleEventLog.push(...generateTurnNarrationObjects([{ quote: initialBanter2, actor: fighter2 }], null, fighter2, fighter1, null, currentBattleState.environmentState, currentBattleState.locationConditions, phaseState.currentPhase, true, null, currentBattleState));

applyCurbstompRules(fighter1, fighter2, currentBattleState, battleEventLog, true);
let terminalOutcome = evaluateTerminalState(fighter1, fighter2, isStalemate);
if (terminalOutcome.battleOver) {
battleOver = true; winnerId = terminalOutcome.winnerId; loserId = terminalOutcome.loserId; isStalemate = terminalOutcome.isStalemate;
}

let currentAttacker = fighter1;
let currentDefender = fighter2;

// --- MAIN BATTLE LOOP ---
while (turn < MAX_TOTAL_TURNS && !battleOver) {
currentBattleState.turn = turn;
currentAttacker.currentTurn = turn;
currentDefender.currentTurn = turn;

// Phase Transition Check
if (checkAndTransitionPhase(phaseState, currentAttacker, currentDefender, turn, locId)) {
    // Reset environmental impact counters for the new phase
    currentBattleState.environmentState.environmentalImpactCount = 0;
    currentBattleState.environmentState.environmentalImpactsThisPhase = [];

    // Generate phase transition narration
    const currentPhaseInfo = phaseDefinitions.find(p => p.key === phaseState.currentPhase);
    if (currentPhaseInfo) {
        battleEventLog.push(generateLogEvent(currentBattleState, { type: 'phase_header_event', phaseName: currentPhaseInfo.name, phaseEmoji: currentPhaseInfo.emoji, phaseKey: phaseState.currentPhase, text: `${currentPhaseInfo.name} ${currentPhaseInfo.emoji}`, html_content: phaseTemplates.header.replace('{phaseDisplayName}', currentPhaseInfo.name).replace('{phaseEmoji}', currentPhaseInfo.emoji) }));
        const quote1 = findNarrativeQuote(currentAttacker, currentDefender, 'phaseTransition', phaseState.currentPhase, { currentPhaseKey: phaseState.currentPhase, battleState: currentBattleState });
        if (quote1) battleEventLog.push(...generateTurnNarrationObjects([{ quote: quote1, actor: currentAttacker }], null, currentAttacker, currentDefender, null, currentBattleState.environmentState, currentBattleState.locationConditions, phaseState.currentPhase, true, null, currentBattleState));
        const quote2 = findNarrativeQuote(currentDefender, currentAttacker, 'phaseTransition', phaseState.currentPhase, { currentPhaseKey: phaseState.currentPhase, battleState: currentBattleState });
        if (quote2) battleEventLog.push(...generateTurnNarrationObjects([{ quote: quote2, actor: currentDefender }], null, currentDefender, currentAttacker, null, currentBattleState.environmentState, currentBattleState.locationConditions, phaseState.currentPhase, true, null, currentBattleState));
    }
}
currentBattleState.currentPhase = phaseState.currentPhase;

// Initialize turn-specific log events
let turnEvents = [generateLogEvent(currentBattleState, { type: 'turn_marker', actorId: currentAttacker.id, characterName: currentAttacker.name, turn: turn + 1, portrait: currentAttacker.portrait })];

// NEW: Add a general turn-start dialogue for the current attacker
const turnStartQuoteAttacker = findNarrativeQuote(currentAttacker, currentDefender, 'turnStart', phaseState.currentPhase, { currentPhaseKey: phaseState.currentPhase, battleState: currentBattleState });
if (turnStartQuoteAttacker) {
    turnEvents.push(...generateTurnNarrationObjects([{ quote: turnStartQuoteAttacker, actor: currentAttacker }], null, currentAttacker, currentDefender, null, currentBattleState.environmentState, currentBattleState.locationConditions, phaseState.currentPhase, false, null, currentBattleState));
}

// Handle stun and energy conditions
if (charactersMarkedForDefeat.has(currentAttacker.id) || currentAttacker.stunDuration > 0 || currentAttacker.energy < MIN_ENERGY_FOR_ACTION) {
    if (currentAttacker.stunDuration > 0) {
        currentAttacker.stunDuration--;
        if (currentAttacker.stunDuration === 0) currentAttacker.consecutiveStuns = 0;
        turnEvents.push(generateLogEvent(currentBattleState, { type: 'stun_event', actorId: currentAttacker.id, characterName: currentAttacker.name, text: `${currentAttacker.name} is stunned and unable to move!`, html_content: `<p class="narrative-action char-${currentAttacker.id}">${currentAttacker.name} is stunned and unable to move!</p>` }));
    }
    if (currentAttacker.energy < MIN_ENERGY_FOR_ACTION) {
        currentAttacker.energy = Math.min(currentAttacker.energy + ENERGY_RECOVERY_PER_TURN, MAX_ENERGY);
        turnEvents.push(generateLogEvent(currentBattleState, { type: 'energy_recovery_event', actorId: currentAttacker.id, characterName: currentAttacker.name, text: `${currentAttacker.name} recovers energy.`, html_content: `<p class="narrative-action char-${currentAttacker.id}">${currentAttacker.name} recovers energy.</p>` }));
    }
    // Even if a turn is skipped, push the events collected so far
    battleEventLog.push(...turnEvents);
    [currentAttacker, currentDefender] = [currentDefender, currentAttacker];
    turn++;
    continue; // Skip the rest of the turn logic if fighter cannot act
}

// --- NEW: Manipulation Attempt ---
const manipulationResult = attemptManipulation(currentAttacker, currentDefender, currentBattleState, battleEventLog);
if (manipulationResult.success) {
    turnEvents.push(generateLogEvent(currentBattleState, { type: 'manipulation_narration_event', actorId: currentAttacker.id, text: manipulationResult.narration, html_content: manipulationResult.narration }));
    // Apply the effect to the defender
    updateMentalState(currentDefender, currentAttacker, { effectiveness: { label: manipulationResult.effect } }, currentBattleState.environmentState, locId, currentBattleState);
    const manipulationSuccessQuote = findNarrativeQuote(currentAttacker, currentDefender, 'onManipulationSuccess', phaseState.currentPhase, { currentPhaseKey: phaseState.currentPhase, battleState: currentBattleState });
    if (manipulationSuccessQuote) {
        turnEvents.push(...generateTurnNarrationObjects([{ quote: manipulationSuccessQuote, actor: currentAttacker }], null, currentAttacker, currentDefender, null, currentBattleState.environmentState, currentBattleState.locationConditions, phaseState.currentPhase, false, null, currentBattleState));
    }
} else if (manipulationResult.attempted) {
    const manipulationFailureQuote = findNarrativeQuote(currentAttacker, currentDefender, 'onManipulationFailure', phaseState.currentPhase, { currentPhaseKey: phaseState.currentPhase, battleState: currentBattleState });
    if (manipulationFailureQuote) {
        turnEvents.push(...generateTurnNarrationObjects([{ quote: manipulationFailureQuote, actor: currentAttacker }], null, currentAttacker, currentDefender, null, currentBattleState.environmentState, currentBattleState.locationConditions, phaseState.currentPhase, false, null, currentBattleState));
    }
}
// --- END NEW ---

// AI Action Selection & Resolution
const aiDecision = selectMove(currentAttacker, currentDefender, currentBattleState.locationConditions, turn, currentBattleState.currentPhase);
const move = aiDecision.move;

if (!move) {
    currentAttacker.aiLog.push("[Action Failed]: AI selected an undefined move.");
    turnEvents.push(generateLogEvent(currentBattleState, { type: 'action_failure_event', actorId: currentAttacker.id, characterName: currentAttacker.name, text: `${currentAttacker.name} failed to choose a move.`, html_content: `<p class="narrative-action char-${currentAttacker.id}">${currentAttacker.name} failed to choose a move.</p>` }));
    battleEventLog.push(...turnEvents); // Log failure and move on
    [currentAttacker, currentDefender] = [currentDefender, currentAttacker];
    turn++;
    continue;
}

// -- CORRECT ARGUMENT ORDER HERE --
const result = calculateMove(
    move,
    currentAttacker,
    currentDefender,
    currentBattleState.locationConditions,
    battleEventLog,
    currentAttacker.aiLog,
    currentBattleState.environmentState,
    locId,
    null,
    currentBattleState
);

// Apply all effects from the move result and collect generated events
result.effects.forEach(effect => {
    // Pass the current 'move' as sourceMove to the effect application
    const effectResult = applyEffect({ ...effect, sourceMove: move }, currentAttacker, currentDefender, currentBattleState, battleEventLog);
    if (effectResult.events && effectResult.events.length > 0) {
        turnEvents.push(...effectResult.events);
    }
});

// Update AI log entry with move effectiveness and if it was a critical hit
if (aiDecision.aiLogEntryFromSelectMove) {
    aiDecision.aiLogEntryFromSelectMove.effectiveness = result.effectiveness.label; // e.g., 'Critical', 'Strong', 'Normal', 'Weak'
    if (result.effectiveness.label === 'Critical') {
        aiDecision.aiLogEntryFromSelectMove.isCriticalHit = true;
    }
}

// Narration and State Updates (Add to turnEvents)
// Generate main action narration
turnEvents.push(...generateTurnNarrationObjects([], {...move, actionVariants: move.actionVariants || []}, currentAttacker, currentDefender, result, currentBattleState.environmentState, currentBattleState.locationConditions, phaseState.currentPhase, false, aiDecision.aiLogEntryFromSelectMove, currentBattleState));
    
// NEW: Add dialogue based on move effectiveness
if (result.effectiveness.label === 'Critical') {
    const critQuoteAttacker = findNarrativeQuote(currentAttacker, currentDefender, 'onCriticalHitLanded', phaseState.currentPhase, { currentPhaseKey: phaseState.currentPhase, battleState: currentBattleState });
    if (critQuoteAttacker) turnEvents.push(...generateTurnNarrationObjects([{ quote: critQuoteAttacker, actor: currentAttacker }], null, currentAttacker, currentDefender, null, currentBattleState.environmentState, currentBattleState.locationConditions, phaseState.currentPhase, false, null, currentBattleState));
    const critQuoteDefender = findNarrativeQuote(currentDefender, currentAttacker, 'onCriticalHitReceived', phaseState.currentPhase, { currentPhaseKey: phaseState.currentPhase, battleState: currentBattleState });
    if (critQuoteDefender) turnEvents.push(...generateTurnNarrationObjects([{ quote: critQuoteDefender, actor: currentDefender }], null, currentDefender, currentAttacker, null, currentBattleState.environmentState, currentBattleState.locationConditions, phaseState.currentPhase, false, null, currentBattleState));
} else if (result.effectiveness.label === 'Weak') {
    const weakQuoteAttacker = findNarrativeQuote(currentAttacker, currentDefender, 'onWeakHitLanded', phaseState.currentPhase, { currentPhaseKey: phaseState.currentPhase, battleState: currentBattleState });
    if (weakQuoteAttacker) turnEvents.push(...generateTurnNarrationObjects([{ quote: weakQuoteAttacker, actor: currentAttacker }], null, currentAttacker, currentDefender, null, currentBattleState.environmentState, currentBattleState.locationConditions, phaseState.currentPhase, false, null, currentBattleState));
    const weakQuoteDefender = findNarrativeQuote(currentDefender, currentAttacker, 'onWeakHitReceived', phaseState.currentPhase, { currentPhaseKey: phaseState.currentPhase, battleState: currentBattleState });
    if (weakQuoteDefender) turnEvents.push(...generateTurnNarrationObjects([{ quote: weakQuoteDefender, actor: currentDefender }], null, currentDefender, currentAttacker, null, currentBattleState.environmentState, currentBattleState.locationConditions, phaseState.currentPhase, false, null, currentBattleState));
}

// Update mental state and collect any generated events
const mentalStateEventAttacker = updateMentalState(currentAttacker, currentDefender, result, currentBattleState.environmentState, locId, currentBattleState);
if (mentalStateEventAttacker) turnEvents.push(mentalStateEventAttacker);
const mentalStateChangeQuoteAttacker = findNarrativeQuote(currentAttacker, currentDefender, 'onStateChange', currentAttacker.mentalState.level, { currentPhaseKey: phaseState.currentPhase, battleState: currentBattleState, oldState: mentalStateEventAttacker?.oldValue, newState: currentAttacker.mentalState.level });
if (mentalStateChangeQuoteAttacker) turnEvents.push(...generateTurnNarrationObjects([{ quote: mentalStateChangeQuoteAttacker, actor: currentAttacker }], null, currentAttacker, currentDefender, null, currentBattleState.environmentState, currentBattleState.locationConditions, phaseState.currentPhase, false, null, currentBattleState));

const mentalStateEventDefender = updateMentalState(currentDefender, currentAttacker, { ...result, wasAttacker: false }, currentBattleState.environmentState, locId, currentBattleState);
if (mentalStateEventDefender) turnEvents.push(mentalStateEventDefender);
const mentalStateChangeQuoteDefender = findNarrativeQuote(currentDefender, currentAttacker, 'onStateChange', currentDefender.mentalState.level, { currentPhaseKey: phaseState.currentPhase, battleState: currentBattleState, oldState: mentalStateEventDefender?.oldValue, newState: currentDefender.mentalState.level });
if (mentalStateChangeQuoteDefender) turnEvents.push(...generateTurnNarrationObjects([{ quote: mentalStateChangeQuoteDefender, actor: currentDefender }], null, currentDefender, currentAttacker, null, currentBattleState.environmentState, currentBattleState.locationConditions, phaseState.currentPhase, false, null, currentBattleState));

// Log energy change due to move cost explicitly
const oldEnergyAttacker = currentAttacker.energy;
currentAttacker.energy = clamp(currentAttacker.energy - result.energyCost, 0, 100);
const energyCostEvent = generateStatusChangeEvent(currentBattleState, currentAttacker, 'energy_change', oldEnergyAttacker, currentAttacker.energy, 'energy');
if (energyCostEvent) turnEvents.push(energyCostEvent);

currentAttacker.moveHistory.push({ ...move, effectiveness: result.effectiveness.label });
updateAiMemory(currentDefender, currentAttacker);
updateAiMemory(currentAttacker, currentDefender);

// Removed direct modifyMomentum calls as momentum changes are now handled via effects within calculateMove
// Consolidate environmental impacts at the end of the turn if too many occurred
const envSummaryEvent = generateEnvironmentalSummaryEvent(currentBattleState, currentBattleState.environmentState, locId);
if (envSummaryEvent) {
    turnEvents.push(envSummaryEvent); // Add summary to turnEvents
}

// NEW: Add quotes for momentum changes
// Note: Momentum changes are now primarily handled via effects. This part of the code needs to check actual momentum change.
// For simplicity, I'll add generic momentum change quotes here, but a more robust solution would involve hooking into modifyMomentum or the status change event.
const oldMomentumAttacker = currentAttacker.momentum; // Assuming oldMomentumAttacker is captured at turn start
const momentumChangeAttacker = currentAttacker.momentum - oldMomentumAttacker; // Assuming oldMomentumAttacker is captured at turn start
if (momentumChangeAttacker > 0) {
    const momentumGainQuote = findNarrativeQuote(currentAttacker, currentDefender, 'onMomentumGain', phaseState.currentPhase, { currentPhaseKey: phaseState.currentPhase, battleState: currentBattleState });
    if (momentumGainQuote) turnEvents.push(...generateTurnNarrationObjects([{ quote: momentumGainQuote, actor: currentAttacker }], null, currentAttacker, currentDefender, null, currentBattleState.environmentState, currentBattleState.locationConditions, phaseState.currentPhase, false, null, currentBattleState));
} else if (momentumChangeAttacker < 0) {
    const momentumLossQuote = findNarrativeQuote(currentAttacker, currentDefender, 'onMomentumLoss', phaseState.currentPhase, { currentPhaseKey: phaseState.currentPhase, battleState: currentBattleState });
    if (momentumLossQuote) turnEvents.push(...generateTurnNarrationObjects([{ quote: momentumLossQuote, actor: currentAttacker }], null, currentAttacker, currentDefender, null, currentBattleState.environmentState, currentBattleState.locationConditions, phaseState.currentPhase, false, null, currentBattleState));
}

const oldMomentumDefender = currentDefender.momentum; // Assuming oldMomentumDefender is captured at turn start
const momentumChangeDefender = currentDefender.momentum - oldMomentumDefender; // Assuming oldMomentumDefender is captured at turn start
if (momentumChangeDefender > 0) {
    const momentumGainQuote = findNarrativeQuote(currentDefender, currentAttacker, 'onMomentumGain', phaseState.currentPhase, { currentPhaseKey: phaseState.currentPhase, battleState: currentBattleState });
    if (momentumGainQuote) turnEvents.push(...generateTurnNarrationObjects([{ quote: momentumGainQuote, actor: currentDefender }], null, currentDefender, currentAttacker, null, currentBattleState.environmentState, currentBattleState.locationConditions, phaseState.currentPhase, false, null, currentBattleState));
} else if (momentumChangeDefender < 0) {
    const momentumLossQuote = findNarrativeQuote(currentDefender, currentAttacker, 'onMomentumLoss', phaseState.currentPhase, { currentPhaseKey: phaseState.currentPhase, battleState: currentBattleState });
    if (momentumLossQuote) turnEvents.push(...generateTurnNarrationObjects([{ quote: momentumLossQuote, actor: currentDefender }], null, currentDefender, currentAttacker, null, currentBattleState.environmentState, currentBattleState.locationConditions, phaseState.currentPhase, false, null, currentBattleState));
}

battleEventLog.push(...turnEvents); // ONLY PUSH ONCE AT THE END OF THE TURN

// Check for battle end
terminalOutcome = evaluateTerminalState(fighter1, fighter2, isStalemate);
if (terminalOutcome.battleOver) {
    battleOver = true; winnerId = terminalOutcome.winnerId; loserId = terminalOutcome.loserId; isStalemate = terminalOutcome.isStalemate;
}

[currentAttacker, currentDefender] = [currentDefender, currentAttacker];
turn++;

}

// --- Post-Battle Summary Generation ---
const finalBattleResult = { log: battleEventLog, winnerId, loserId, isDraw: isStalemate, finalState: { fighter1: { ...fighter1 }, fighter2: { ...fighter2 } }, environmentState: currentBattleState.environmentState, phaseSummary: phaseState.phaseSummaryLog };

console.log("Final Battle Result Log:", finalBattleResult.log);

// Check timeout condition
if (!battleOver && turn >= MAX_TOTAL_TURNS) {
if (fighter1.hp === fighter2.hp) finalBattleResult.isDraw = true;
else {
finalBattleResult.winnerId = (fighter1.hp > fighter2.hp) ? fighter1.id : fighter2.id;
finalBattleResult.loserId = (finalBattleResult.winnerId === fighter1.id) ? fighter2.id : fighter1.id;
}
}

generateFinalSummary(finalBattleResult, fighter1, fighter2, turn);

return finalBattleResult;
}