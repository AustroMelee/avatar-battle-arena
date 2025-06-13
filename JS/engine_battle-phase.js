// FILE: js/engine_battle-phase.js
'use strict';

// ====================================================================================
//  Battle Phase Engine (v1.0)
// ====================================================================================
//  Manages battle phase progression based on dynamic combat events.
// ====================================================================================

export const BATTLE_PHASES = {
    EARLY: 'Early', // Initial probing, positioning, light exchanges
    MID: 'Mid',     // Intensified conflict, signature moves, clear strategies emerge
    LATE: 'Late'    // Desperate measures, finishers, high stakes, exhaustion
};

export function initializeBattlePhaseState() {
    return {
        currentPhase: BATTLE_PHASES.EARLY,
        turnInCurrentPhase: 0,
        phaseLog: [`Battle started in ${BATTLE_PHASES.EARLY} Phase.`]
    };
}

/**
 * Checks and potentially transitions the battle phase based on game state.
 * @param {object} phaseState - The current phase state object.
 * @param {object} fighter1 - State object for fighter 1.
 * @param {object} fighter2 - State object for fighter 2.
 * @param {number} totalTurnsElapsed - Total turns passed in the battle.
 * @returns {boolean} - True if a phase transition occurred, false otherwise.
 */
export function checkAndTransitionPhase(phaseState, fighter1, fighter2, totalTurnsElapsed) {
    const originalPhase = phaseState.currentPhase;
    phaseState.turnInCurrentPhase++;

    // --- Conditions for transitioning to MID Phase ---
    if (phaseState.currentPhase === BATTLE_PHASES.EARLY) {
        let midPhaseTriggers = 0;
        // Health-based trigger
        if (fighter1.hp <= 70 || fighter2.hp <= 70) midPhaseTriggers++;
        // Momentum-based trigger
        if (Math.abs(fighter1.momentum) >= 3 || Math.abs(fighter2.momentum) >= 3) midPhaseTriggers++;
        // Mental state trigger (either becomes stressed)
        if (fighter1.mentalState.level === 'stressed' || fighter2.mentalState.level === 'stressed') midPhaseTriggers++;
        // Turn-based soft trigger (if no other triggers by turn 2 end)
        if (totalTurnsElapsed >= 2 && midPhaseTriggers === 0) midPhaseTriggers++;
        // Use of a powerful move (e.g., finisher type, or high power utility/offense)
        if (fighter1.lastMove?.type === 'Finisher' || (fighter1.lastMove?.power && fighter1.lastMove.power >= 70)) midPhaseTriggers++;
        if (fighter2.lastMove?.type === 'Finisher' || (fighter2.lastMove?.power && fighter2.lastMove.power >= 70)) midPhaseTriggers++;


        if (midPhaseTriggers >= 1 || totalTurnsElapsed >= 3) { // At least one trigger, or by turn 3 regardless
            phaseState.currentPhase = BATTLE_PHASES.MID;
            phaseState.turnInCurrentPhase = 1; // Reset turn counter for the new phase
            phaseState.phaseLog.push(`Transitioned to ${BATTLE_PHASES.MID} Phase on turn ${totalTurnsElapsed + 1}. Triggers: ${midPhaseTriggers}`);
        }
    }

    // --- Conditions for transitioning to LATE Phase ---
    // Can only transition to LATE from MID
    if (phaseState.currentPhase === BATTLE_PHASES.MID) {
        let latePhaseTriggers = 0;
        // Health-based trigger (more severe)
        if (fighter1.hp <= 40 || fighter2.hp <= 40) latePhaseTriggers++;
        // Critical momentum
        if (Math.abs(fighter1.momentum) >= 4 || Math.abs(fighter2.momentum) >= 4) latePhaseTriggers++;
        // Mental state trigger (either becomes shaken or broken)
        if (['shaken', 'broken'].includes(fighter1.mentalState.level) || ['shaken', 'broken'].includes(fighter2.mentalState.level)) latePhaseTriggers++;
        // Sustained battle (soft trigger for late game if other conditions not met)
        if (totalTurnsElapsed >= 4 && latePhaseTriggers === 0) latePhaseTriggers++; // Ensure late phase by turn 5 at latest
        // Multiple finishers have been used
        const finisherCount = (fighter1.moveHistory.filter(m => m.type === 'Finisher').length + fighter2.moveHistory.filter(m => m.type === 'Finisher').length);
        if (finisherCount >= 1) latePhaseTriggers++;


        if (latePhaseTriggers >= 1 || totalTurnsElapsed >= 5) { // At least one trigger or by turn 5
            phaseState.currentPhase = BATTLE_PHASES.LATE;
            phaseState.turnInCurrentPhase = 1;
            phaseState.phaseLog.push(`Transitioned to ${BATTLE_PHASES.LATE} Phase on turn ${totalTurnsElapsed + 1}. Triggers: ${latePhaseTriggers}`);
        }
    }
    
    return phaseState.currentPhase !== originalPhase;
}

/**
 * Gets phase-specific multipliers for AI behavior.
 * @param {string} currentPhase - The current battle phase (e.g., BATTLE_PHASES.EARLY).
 * @returns {object} - An object containing multipliers for AI personality traits.
 */
export function getPhaseAIModifiers(currentPhase) {
    switch (currentPhase) {
        case BATTLE_PHASES.EARLY:
            return {
                aggressionMultiplier: 0.8,
                patienceMultiplier: 1.2,
                riskToleranceMultiplier: 0.7,
                defensiveBiasMultiplier: 1.1,
                creativityMultiplier: 1.0,
                opportunismMultiplier: 0.9,
            };
        case BATTLE_PHASES.MID:
            return {
                aggressionMultiplier: 1.1,
                patienceMultiplier: 0.9,
                riskToleranceMultiplier: 1.1,
                defensiveBiasMultiplier: 0.9,
                creativityMultiplier: 1.1,
                opportunismMultiplier: 1.2,
            };
        case BATTLE_PHASES.LATE:
            return {
                aggressionMultiplier: 1.3,
                patienceMultiplier: 0.6,
                riskToleranceMultiplier: 1.4,
                defensiveBiasMultiplier: 0.7,
                creativityMultiplier: 0.9, // Potentially less creative, more direct/desperate
                opportunismMultiplier: 1.3, // High opportunism for finishers
            };
        default:
            return { // Should not happen, but fallback
                aggressionMultiplier: 1.0,
                patienceMultiplier: 1.0,
                riskToleranceMultiplier: 1.0,
                defensiveBiasMultiplier: 1.0,
                creativityMultiplier: 1.0,
                opportunismMultiplier: 1.0,
            };
    }
}