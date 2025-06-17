// FILE: js/engine_battle-phase.js
'use strict';

// --- UPDATED IMPORT ---
import { battlePhases as phaseDefinitions } from './data_narrative_phases.js'; // Corrected import path
import { locations } from './locations.js'; // Ensure this import is here
// --- END UPDATED IMPORT ---

export const BATTLE_PHASES = {
    PRE_BANTER: 'PreBanter',
    POKING: 'Poking',
    EARLY: 'Early', 
    MID: 'Mid',     
    LATE: 'Late'    
};

export function initializeBattlePhaseState() {
    return {
        currentPhase: BATTLE_PHASES.PRE_BANTER,
        turnInCurrentPhase: 0,
        // NEW: Randomized poking duration per battle
        pokingDuration: Math.floor(Math.random() * 3) + 1, // Randomly 1, 2, or 3 turns for Poking phase
        // NEW: For controlled phase logging UI
        phaseSummaryLog: [], // [{ phase: 'PreBanter', turns: 1 }, { phase: 'Poking', turns: 3 }]
        phaseLog: [`Battle started in ${BATTLE_PHASES.PRE_BANTER} Phase.`]
    };
}

export function checkAndTransitionPhase(phaseState, fighter1, fighter2, totalTurnsElapsed, locationId) { // Added locationId
    const originalPhase = phaseState.currentPhase;
    phaseState.turnInCurrentPhase++;

    // PRE_BANTER -> POKING Transition (Always happens after 1 narrative turn)
    if (phaseState.currentPhase === BATTLE_PHASES.PRE_BANTER) {
        if (phaseState.turnInCurrentPhase >= 1) { // After 1 narrative-only turn
            phaseState.phaseSummaryLog.push({ phase: originalPhase, turns: phaseState.turnInCurrentPhase }); // Log duration of PreBanter

            // NEW: Apply location-specific poking duration override
            const locationOverrides = locations[locationId]?.phaseOverrides;
            if (locationOverrides && locationOverrides.pokingDuration !== undefined) {
                phaseState.pokingDuration = locationOverrides.pokingDuration;
                // AI logs for this specific override are handled in battle-engine-core.js
            }
            
            phaseState.currentPhase = BATTLE_PHASES.POKING;
            phaseState.turnInCurrentPhase = 0; // Reset turn count for new phase
            phaseState.phaseLog.push(`Transitioned to ${BATTLE_PHASES.POKING} Phase on turn ${totalTurnsElapsed + 1}. Triggers: Narrative Completion.`);
            return true;
        }
    }

    // POKING -> EARLY Transition
    if (phaseState.currentPhase === BATTLE_PHASES.POKING) {
        if (phaseState.turnInCurrentPhase >= phaseState.pokingDuration) {
            phaseState.phaseSummaryLog.push({ phase: originalPhase, turns: phaseState.turnInCurrentPhase }); // Log duration of Poking
            phaseState.currentPhase = BATTLE_PHASES.EARLY;
            phaseState.turnInCurrentPhase = 0;
            phaseState.phaseLog.push(`Transitioned to ${BATTLE_PHASES.EARLY} Phase on turn ${totalTurnsElapsed + 1}. Triggers: Poking Phase Duration Met.`);
            return true;
        }
    }

    // EARLY -> MID Transition
    if (phaseState.currentPhase === BATTLE_PHASES.EARLY) {
        let midPhaseTriggers = 0;
        if (fighter1.hp <= 70 || fighter2.hp <= 70) midPhaseTriggers++;
        if (Math.abs(fighter1.momentum) >= 3 || Math.abs(fighter2.momentum) >= 3) midPhaseTriggers++;
        if (fighter1.mentalState.level === 'stressed' || fighter2.mentalState.level === 'stressed') midPhaseTriggers++;
        if (fighter1.lastMove?.type === 'Finisher' || (fighter1.lastMove?.power && fighter1.lastMove.power >= 70)) midPhaseTriggers++;
        if (fighter2.lastMove?.type === 'Finisher' || (fighter2.lastMove?.power && fighter2.lastMove.power >= 70)) midPhaseTriggers++;
        // Force progression if nothing else triggers (min 2 turns, max 5 turns in Early)
        if (phaseState.turnInCurrentPhase >= 2 && midPhaseTriggers === 0) midPhaseTriggers++; // Minimum 2 turns of combat in Early
        

        if (midPhaseTriggers >= 1 || phaseState.turnInCurrentPhase >= 5) { // Max 5 turns in Early
            phaseState.phaseSummaryLog.push({ phase: originalPhase, turns: phaseState.turnInCurrentPhase }); // Log duration of Early
            phaseState.currentPhase = BATTLE_PHASES.MID;
            phaseState.turnInCurrentPhase = 0;
            phaseState.phaseLog.push(`Transitioned to ${BATTLE_PHASES.MID} Phase on turn ${totalTurnsElapsed + 1}. Triggers: ${midPhaseTriggers} (or max turns for phase).`);
            return true;
        }
    }

    // MID -> LATE Transition
    if (phaseState.currentPhase === BATTLE_PHASES.MID) {
        let latePhaseTriggers = 0;
        if (fighter1.hp <= 40 || fighter2.hp <= 40) latePhaseTriggers++;
        if (Math.abs(fighter1.momentum) >= 4 || Math.abs(fighter2.momentum) >= 4) latePhaseTriggers++;
        if (['shaken', 'broken'].includes(fighter1.mentalState.level) || ['shaken', 'broken'].includes(fighter2.mentalState.level)) latePhaseTriggers++;
        const finisherCount = (fighter1.moveHistory.filter(m => m.type === 'Finisher').length + fighter2.moveHistory.filter(m => m.type === 'Finisher').length);
        if (finisherCount >= 1) latePhaseTriggers++;
        // Force progression if nothing else triggers (min 2 turns, max 7 turns in Mid)
        if (phaseState.turnInCurrentPhase >= 2 && latePhaseTriggers === 0) latePhaseTriggers++; 
        

        if (latePhaseTriggers >= 1 || phaseState.turnInCurrentPhase >= 7) { // Max 7 turns in Mid
            phaseState.phaseSummaryLog.push({ phase: originalPhase, turns: phaseState.turnInCurrentPhase }); // Log duration of Mid
            phaseState.currentPhase = BATTLE_PHASES.LATE;
            phaseState.turnInCurrentPhase = 0;
            phaseState.phaseLog.push(`Transitioned to ${BATTLE_PHASES.LATE} Phase on turn ${totalTurnsElapsed + 1}. Triggers: ${latePhaseTriggers} (or max turns for phase).`);
            return true;
        }
    }
    
    return originalPhase !== phaseState.currentPhase;
}

export function getPhaseAIModifiers(currentPhase) {
    switch (currentPhase) {
        case BATTLE_PHASES.PRE_BANTER:
            return { aggressionMultiplier: 0.001, patienceMultiplier: 5.0, riskToleranceMultiplier: 0.001, defensiveBiasMultiplier: 5.0, creativityMultiplier: 0.1, opportunismMultiplier: 0.001 }; // Effectively no combat moves
        case BATTLE_PHASES.POKING:
            return { aggressionMultiplier: 0.2, patienceMultiplier: 2.0, riskToleranceMultiplier: 0.3, defensiveBiasMultiplier: 2.0, creativityMultiplier: 1.5, opportunismMultiplier: 0.5 }; // Light probes
        case BATTLE_PHASES.EARLY:
            return { aggressionMultiplier: 0.9, patienceMultiplier: 1.1, riskToleranceMultiplier: 0.8, defensiveBiasMultiplier: 1.0, creativityMultiplier: 1.0, opportunismMultiplier: 1.0 }; // Slightly more aggressive, higher risk/opp
        case BATTLE_PHASES.MID:
            return { aggressionMultiplier: 1.2, patienceMultiplier: 0.9, riskToleranceMultiplier: 1.1, defensiveBiasMultiplier: 0.9, creativityMultiplier: 1.1, opportunismMultiplier: 1.2 };
        case BATTLE_PHASES.LATE:
            return { aggressionMultiplier: 1.5, patienceMultiplier: 0.5, riskToleranceMultiplier: 1.5, defensiveBiasMultiplier: 0.6, creativityMultiplier: 1.0, opportunismMultiplier: 1.5 }; // More aggressive, lower patience, high risk/opp
        default:
            return { aggressionMultiplier: 1.0, patienceMultiplier: 1.0, riskToleranceMultiplier: 1.0, defensiveBiasMultiplier: 1.0, creativityMultiplier: 1.0, opportunismMultiplier: 1.0 };
    }
}