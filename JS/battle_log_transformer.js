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
                    pauseAfter: 1200, 
                });
                break;
            case 'dialogue_event':
                animationQueue.push({
                    actorId: event.actorId,
                    characterName: event.characterName,
                    text: event.text,
                    isDialogue: true, 
                    dialogueType: event.dialogueType, 
                    pauseAfter: event.text.length > 50 ? 1000 : 600, 
                });
                break;
            case 'move_action_event':
                animationQueue.push({
                    actorId: event.actorId,
                    characterName: event.characterName,
                    moveName: event.moveName,
                    moveType: event.moveType, 
                    effectivenessLabel: event.effectivenessLabel, 
                    impactLevel: determineImpactLevel(event.effectivenessLabel, event.moveType),
                    text: event.text, 
                    isMoveAction: true,
                    pauseAfter: 1000,
                });
                break;
            case 'collateral_damage_event':
                animationQueue.push({
                    actorId: event.actorId, 
                    characterName: event.actorId ? characters[event.actorId]?.name : 'Environment',
                    text: event.text,
                    isEnvironmental: true,
                    impactLevel: 'medium', 
                    pauseAfter: 700,
                });
                break;
            case 'environmental_summary_event':
                if (event.texts && event.texts.length > 0) {
                    event.texts.forEach(txt => {
                        animationQueue.push({
                            text: `🌍 Environment: ${txt}`,
                            isEnvironmental: true,
                            impactLevel: 'low', 
                            pauseAfter: 600,
                        });
                    });
                }
                break;
            // Handle final battle outcome events
            case 'final_blow_summary_event': // This is the summary, the actual KO is in the move text now
                 animationQueue.push({
                    text: event.text, // "X lands the finishing blow, defeating Y!"
                    impactLevel: 'critical', // Very high impact for this summary
                    isMoveAction: false, // Not a move, but a concluding statement
                    isDialogue: false,
                    pauseAfter: 2500,
                });
                break;
            case 'stalemate_result_event':
            case 'draw_result_event':
            case 'timeout_victory_event':
            case 'conclusion_event':
                animationQueue.push({
                    text: event.text,
                    impactLevel: 'high', 
                    isMoveAction: false, 
                    isDialogue: false,
                    pauseAfter: 2000,
                });
                break;
            default:
                console.warn(`Unknown event type for animation: ${event.type}`, event);
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
    let currentPhaseKeyForHtml = null; 
    let isPhaseDivOpen = false;

    structuredLogEvents.forEach(event => {
        if (!event || typeof event.type !== 'string') return;

        if (event.type === 'phase_header_event') {
            if (isPhaseDivOpen) { 
                htmlLog += `</div>`; // Close previous phase div
            }
            currentPhaseKeyForHtml = event.phaseKey;
            htmlLog += phaseTemplates.phaseWrapper.replace('{phaseKey}', currentPhaseKeyForHtml).replace('{phaseContent}', ''); 
            htmlLog = htmlLog.slice(0, -6); // Remove closing </div> to inject header and content
            htmlLog += event.html_content; // Add the pre-rendered header
            isPhaseDivOpen = true;
        } else if (event.html_content && typeof event.html_content === 'string') {
            // If not inside a phase div (e.g., initial banter before first phase header), don't wrap.
            // Otherwise, ensure it's part of the current phase content.
             if (!isPhaseDivOpen && !currentPhaseKeyForHtml && event.type === 'dialogue_event') { // For initial banter
                htmlLog += event.html_content;
            } else if (isPhaseDivOpen) {
                htmlLog += event.html_content;
            } else { // Fallback for events without specific html_content, if they get here
                htmlLog += `<p>${event.text || 'Narrative event occurred.'}</p>`;
            }
        } 
        // For events that might not have pre-rendered HTML but have text for instant mode
        else if (event.text && typeof event.text === 'string') {
            let contentToAppend = "";
            switch(event.type) {
                case 'final_blow_summary_event': // Use the renamed event type
                    contentToAppend = `<div class="final-blow-header">Final Blow 💥</div><p class="final-blow">${event.text}</p>`;
                    break;
                case 'stalemate_result_event':
                    contentToAppend = `<p class="final-blow">${event.text}</p>`;
                    break;
                case 'draw_result_event':
                    contentToAppend = `<p class="final-blow">${event.text}</p>`;
                    break;
                case 'timeout_victory_event':
                     contentToAppend = `<p class="final-blow">${event.text}</p>`;
                    break;
                case 'conclusion_event':
                    contentToAppend = `<p class="conclusion">${event.text}</p>`;
                    break;
                case 'environmental_summary_event': 
                    if (event.texts && event.texts.length > 0) {
                        contentToAppend += `<div class="environmental-summary">`;
                        contentToAppend += phaseTemplates.environmentalImpactHeader;
                        event.texts.forEach(txt => {
                            contentToAppend += `<p class="environmental-impact-text">${txt}</p>`;
                        });
                        contentToAppend += `</div>`;
                    }
                    break;
                default:
                    contentToAppend = `<p>${event.text}</p>`; 
                    break;
            }
            if (isPhaseDivOpen) {
                htmlLog += contentToAppend;
            } else { // If no phase div is open yet (e.g. for final summary outside a phase)
                htmlLog += contentToAppend;
            }
        }
    });

    if (isPhaseDivOpen) { // Close the last phase div if it was opened
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