// FILE: js/battle_log_transformer.js
'use strict';

import { characters } from './data_characters.js'; 
import { phaseTemplates } from './narrative-v2.js';


/**
 * Transforms the battle engine's structured event array into a queue
 * of message objects suitable for the animated_text_engine.
 * @param {Array<object>} structuredLogEvents - The raw event array from the battle engine.
 * @returns {Array<object>} An array of message objects for animation.
 */
export function transformEventsToAnimationQueue(structuredLogEvents) {
    const animationQueue = [];
    if (!structuredLogEvents || !Array.isArray(structuredLogEvents)) {
        console.error("Battle Log Transformer: Invalid structuredLogEvents input", structuredLogEvents);
        return animationQueue;
    }

    structuredLogEvents.forEach(event => {
        if (!event || typeof event.type !== 'string') {
            console.warn("Skipping invalid event object:", event);
            return;
        }

        switch (event.type) {
            case 'phase_header_event':
                animationQueue.push({
                    isPhaseHeader: true,
                    text: `${event.phaseName || 'New Phase'} ${event.phaseEmoji || '⚔️'}`,
                    pauseAfter: 1200, // Longer pause for phase headers
                });
                break;
            case 'dialogue_event':
                animationQueue.push({
                    actorId: event.actorId,
                    characterName: event.characterName,
                    text: event.text,
                    isDialogue: true, // For specific styling or handling
                    dialogueType: event.dialogueType, // 'spoken', 'internal', 'action'
                    pauseAfter: event.text.length > 50 ? 1000 : 600, // Pause based on text length
                });
                break;
            case 'move_action_event':
                animationQueue.push({
                    actorId: event.actorId,
                    characterName: event.characterName,
                    moveName: event.moveName,
                    moveType: event.moveType, // Used for emoji
                    effectivenessLabel: event.effectivenessLabel, // For emoji and impact
                    impactLevel: determineImpactLevel(event.effectivenessLabel, event.moveType),
                    text: event.text, // The main narrative description of the move
                    isMoveAction: true,
                    pauseAfter: 1000,
                });
                break;
            case 'collateral_damage_event':
                animationQueue.push({
                    actorId: event.actorId, // Person who caused the collateral
                    characterName: event.actorId ? characters[event.actorId]?.name : 'Environment',
                    text: event.text,
                    isEnvironmental: true,
                    impactLevel: 'medium', // Collateral usually has a noticeable impact
                    pauseAfter: 700,
                });
                break;
            case 'environmental_summary_event':
                if (event.texts && event.texts.length > 0) {
                    event.texts.forEach(txt => {
                        animationQueue.push({
                            text: `🌍 Environment: ${txt}`,
                            isEnvironmental: true,
                            impactLevel: 'low', // Summary items are less "active"
                            pauseAfter: 600,
                        });
                    });
                }
                break;
            // Handle final battle outcome events
            case 'final_blow_event':
            case 'stalemate_result_event':
            case 'draw_result_event':
            case 'timeout_victory_event':
            case 'conclusion_event':
                animationQueue.push({
                    text: event.text,
                    impactLevel: 'high', // Battle end events are high impact
                    isMoveAction: true, // Treat as an important concluding action
                    pauseAfter: 2000,
                });
                break;
            default:
                console.warn(`Unknown event type for animation: ${event.type}`, event);
                // Push a generic text event if it has text
                if (event.text && typeof event.text === 'string') {
                    animationQueue.push({
                        text: event.text,
                        impactLevel: 'low',
                        pauseAfter: 500
                    });
                }
                break;
        }
    });
    console.log("Transformed animation queue:", animationQueue);
    return animationQueue;
}

/**
 * Transforms the battle engine's structured event array into a full HTML log string
 * for the "Instant Simulation" mode.
 * @param {Array<object>} structuredLogEvents - The raw event array from the battle engine.
 * @returns {string} A single HTML string representing the entire battle log.
 */
export function transformEventsToHtmlLog(structuredLogEvents) {
    if (!structuredLogEvents || !Array.isArray(structuredLogEvents)) {
        console.error("Battle Log Transformer: Invalid structuredLogEvents input for HTML log", structuredLogEvents);
        return "<p>Error: Battle log data is corrupted.</p>";
    }
    
    let htmlLog = "";
    let currentPhaseKey = null; // To wrap turns in phase divs

    structuredLogEvents.forEach(event => {
        if (!event || typeof event.type !== 'string') return;

        // Phase handling for HTML structure
        if (event.type === 'phase_header_event') {
            if (currentPhaseKey) { // Close previous phase div
                htmlLog += `</div>`; 
            }
            currentPhaseKey = event.phaseKey;
            htmlLog += phaseTemplates.phaseWrapper.replace('{phaseKey}', currentPhaseKey).replace('{phaseContent}', ''); // Open new phase div, content added below
            // Add the phase header itself
            htmlLog = htmlLog.slice(0, -6) + phaseTemplates.header // Remove closing </div> to inject header
                .replace('{phaseDisplayName}', event.phaseName)
                .replace('{phaseEmoji}', event.phaseEmoji) + `</div>`; // Add header and then close the wrapper (it will be reopened)
            
            // Re-open the phase content div part (this is a bit hacky due to template structure)
            const phaseWrapperOpening = phaseTemplates.phaseWrapper.replace('{phaseKey}', currentPhaseKey);
            const contentMarker = '{phaseContent}';
            htmlLog = htmlLog.slice(0, htmlLog.lastIndexOf('</div>')) + phaseWrapperOpening.substring(phaseWrapperOpening.indexOf(contentMarker) + contentMarker.length);
        }

        // Append pre-rendered HTML content if available
        if (event.html_content && typeof event.html_content === 'string') {
            htmlLog += event.html_content;
        } 
        // For events that might not have pre-rendered HTML (like simpler outcome events)
        else if (event.text && typeof event.text === 'string') {
            switch(event.type) {
                case 'final_blow_event':
                    htmlLog += `<div class="final-blow-header">Final Blow 💥</div><p class="final-blow">${event.text}</p>`;
                    break;
                case 'stalemate_result_event':
                    htmlLog += `<p class="final-blow">${event.text}</p>`; // Uses same class for now
                    break;
                case 'draw_result_event':
                    htmlLog += `<p class="final-blow">${event.text}</p>`;
                    break;
                case 'timeout_victory_event':
                     htmlLog += `<p class="final-blow">${event.text}</p>`;
                    break;
                case 'conclusion_event':
                    htmlLog += `<p class="conclusion">${event.text}</p>`;
                    break;
                case 'environmental_summary_event': // This one is special
                    if (event.texts && event.texts.length > 0) {
                        htmlLog += `<div class="environmental-summary">`;
                        htmlLog += phaseTemplates.environmentalImpactHeader;
                        event.texts.forEach(txt => {
                            htmlLog += `<p class="environmental-impact-text">${txt}</p>`;
                        });
                        htmlLog += `</div>`;
                    }
                    break;
                default:
                     // Generic text handling if no specific HTML rendering rule and no html_content
                    htmlLog += `<p>${event.text}</p>`; 
                    break;
            }
        }
    });

    if (currentPhaseKey) { // Close the last phase div
        htmlLog += `</div>`;
    }
    
    return htmlLog || "<p>The battle unfolds...</p>"; 
}


function determineImpactLevel(effectivenessLabel, moveType) {
    if (!effectivenessLabel) return 'low';
    switch (effectivenessLabel.toLowerCase()) {
        case 'critical': return 'critical';
        case 'strong': return 'high';
        case 'normal': return moveType === 'Finisher' ? 'high' : 'medium';
        case 'weak': return 'low';
        default: return 'low';
    }
}