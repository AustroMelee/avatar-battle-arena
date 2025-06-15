// FILE: js/engine_battle-phase.js
'use strict';

// --- UPDATED IMPORT ---
import { battlePhases as phaseDefinitions } from './data_narrative_phases.js'; // Corrected import path
// --- END UPDATED IMPORT ---

export const BATTLE_PHASES = {
    EARLY: 'Early', 
    MID: 'Mid',     
    LATE: 'Late'    
};

export function initializeBattlePhaseState() {
    return {
        currentPhase: BATTLE_PHASES.EARLY,
        turnInCurrentPhase: 0,
        phaseLog: [`Battle started in ${BATTLE_PHASES.EARLY} Phase.`]
    };
}

export function checkAndTransitionPhase(phaseState, fighter1, fighter2, totalTurnsElapsed) {
    const originalPhase = phaseState.currentPhase;
    phaseState.turnInCurrentPhase++;

    if (phaseState.currentPhase === BATTLE_PHASES.EARLY) {
        let midPhaseTriggers = 0;
        if (fighter1.hp <= 70 || fighter2.hp <= 70) midPhaseTriggers++;
        if (Math.abs(fighter1.momentum) >= 3 || Math.abs(fighter2.momentum) >= 3) midPhaseTriggers++;
        if (fighter1.mentalState.level === 'stressed' || fighter2.mentalState.level === 'stressed') midPhaseTriggers++;
        if (totalTurnsElapsed >= 2 && midPhaseTriggers === 0) midPhaseTriggers++;
        if (fighter1.lastMove?.type === 'Finisher' || (fighter1.lastMove?.power && fighter1.lastMove.power >= 70)) midPhaseTriggers++;
        if (fighter2.lastMove?.type === 'Finisher' || (fighter2.lastMove?.power && fighter2.lastMove.power >= 70)) midPhaseTriggers++;

        if (midPhaseTriggers >= 1 || totalTurnsElapsed >= 3) { 
            phaseState.currentPhase = BATTLE_PHASES.MID;
            phaseState.turnInCurrentPhase = 1; 
            phaseState.phaseLog.push(`Transitioned to ${BATTLE_PHASES.MID} Phase on turn ${totalTurnsElapsed + 1}. Triggers: ${midPhaseTriggers}.`);
            return true; 
        }
    }

    if (phaseState.currentPhase === BATTLE_PHASES.MID) {
        let latePhaseTriggers = 0;
        if (fighter1.hp <= 40 || fighter2.hp <= 40) latePhaseTriggers++;
        if (Math.abs(fighter1.momentum) >= 4 || Math.abs(fighter2.momentum) >= 4) latePhaseTriggers++;
        if (['shaken', 'broken'].includes(fighter1.mentalState.level) || ['shaken', 'broken'].includes(fighter2.mentalState.level)) latePhaseTriggers++;
        if (totalTurnsElapsed >= 4 && latePhaseTriggers === 0) latePhaseTriggers++; 
        const finisherCount = (fighter1.moveHistory.filter(m => m.type === 'Finisher').length + fighter2.moveHistory.filter(m => m.type === 'Finisher').length);
        if (finisherCount >= 1) latePhaseTriggers++;

        if (latePhaseTriggers >= 1 || totalTurnsElapsed >= 5) { 
            phaseState.currentPhase = BATTLE_PHASES.LATE;
            phaseState.turnInCurrentPhase = 1;
            phaseState.phaseLog.push(`Transitioned to ${BATTLE_PHASES.LATE} Phase on turn ${totalTurnsElapsed + 1}. Triggers: ${latePhaseTriggers}.`);
            return true; 
        }
    }
    
    return originalPhase !== phaseState.currentPhase;
}

export function getPhaseAIModifiers(currentPhase) {
    switch (currentPhase) {
        case BATTLE_PHASES.EARLY:
            return {
                aggressionMultiplier: 0.8, patienceMultiplier: 1.2, riskToleranceMultiplier: 0.7,
                defensiveBiasMultiplier: 1.1, creativityMultiplier: 1.0, opportunismMultiplier: 0.9,
            };
        case BATTLE_PHASES.MID:
            return {
                aggressionMultiplier: 1.1, patienceMultiplier: 0.9, riskToleranceMultiplier: 1.1,
                defensiveBiasMultiplier: 0.9, creativityMultiplier: 1.1, opportunismMultiplier: 1.2,
            };
        case BATTLE_PHASES.LATE:
            return {
                aggressionMultiplier: 1.3, patienceMultiplier: 0.6, riskToleranceMultiplier: 1.4,
                defensiveBiasMultiplier: 0.7, creativityMultiplier: 0.9, 
                opportunismMultiplier: 1.3, 
            };
        default:
            return { 
                aggressionMultiplier: 1.0, patienceMultiplier: 1.0, riskToleranceMultiplier: 1.0,
                defensiveBiasMultiplier: 1.0, creativityMultiplier: 1.0, opportunismMultiplier: 1.0,
            };
    }
}