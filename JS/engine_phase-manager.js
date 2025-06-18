// FILE: engine_phase-manager.js
'use strict';

/**
 * @file Phase Manager
 * @description Handles the logic for checking and executing battle phase transitions
 * and generating the associated narrative.
 */

import { checkAndTransitionPhase } from './engine_battle-phase.js';
import { generateLogEvent } from './utils_log_event.js';
import { phaseTemplates, battlePhases as phaseDefinitions } from './data_narrative_phases.js';
import { findNarrativeQuote, generateTurnNarrationObjects } from './engine_narrative-engine.js';


export function managePhaseTransition(phaseState, attacker, defender, battleState) {
    const phaseEvents = [];

    if (checkAndTransitionPhase(phaseState, attacker, defender, battleState.turn, battleState.locationId)) {
        // Reset environmental state for the new phase
        battleState.environmentState.environmentalImpactCount = 0;
        battleState.environmentState.environmentalImpactsThisPhase = [];
        battleState.environmentState.highestImpactLevelThisPhase = 'subtle';
        battleState.environmentState.narrativeTriggeredThisPhase = false;

        const currentPhaseInfo = phaseDefinitions.find(p => p.key === phaseState.currentPhase);
        if (currentPhaseInfo) {
            // Add phase header event
            const headerTemplate = phaseTemplates.header || '<h2>{phaseDisplayName} {phaseEmoji}</h2>';
            phaseEvents.push(generateLogEvent(battleState, {
                type: 'phase_header_event',
                phaseName: currentPhaseInfo.name,
                phaseEmoji: currentPhaseInfo.emoji,
                phaseKey: phaseState.currentPhase,
                text: `${currentPhaseInfo.name} ${currentPhaseInfo.emoji || ''}`,
                html_content: headerTemplate
                    .replace('{phaseDisplayName}', currentPhaseInfo.name)
                    .replace('{phaseEmoji}', currentPhaseInfo.emoji || '')
            }));
            
            // Add transition-specific dialogue
            const quote1 = findNarrativeQuote(attacker, defender, 'phaseTransition', phaseState.currentPhase, { currentPhaseKey: phaseState.currentPhase, battleState });
            if (quote1) phaseEvents.push(...generateTurnNarrationObjects(
                [{ quote: quote1, actor: attacker }], 
                null, 
                attacker, 
                defender, 
                null, 
                battleState.environmentState, 
                battleState.locationConditions, 
                phaseState.currentPhase, 
                true, 
                null, 
                battleState
            ));

            const quote2 = findNarrativeQuote(defender, attacker, 'phaseTransition', phaseState.currentPhase, { currentPhaseKey: phaseState.currentPhase, battleState });
            if (quote2) phaseEvents.push(...generateTurnNarrationObjects(
                [{ quote: quote2, actor: defender }], 
                null, 
                defender, 
                attacker, 
                null, 
                battleState.environmentState, 
                battleState.locationConditions, 
                phaseState.currentPhase, 
                true, 
                null, 
                battleState
            ));
        }
    }
    
    return phaseEvents;
}