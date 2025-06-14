// FILE: js/battle_log_transformer.js
'use strict';

// Version 1.1: Null-Safety Pass

import { characters } from './data_characters.js';
import { phaseTemplates } from './narrative-v2.js'; // Assuming this is correctly structured

function determineImpactLevel(effectivenessLabel, moveType) {
    if (!effectivenessLabel || typeof effectivenessLabel !== 'string') return 'low'; // Default if label is missing
    switch (effectivenessLabel.toLowerCase()) {
        case 'critical': return 'critical';
        case 'strong': return 'high';
        case 'normal': return (moveType === 'Finisher' || moveType === 'finisher') ? 'high' : 'medium'; // Ensure case insensitivity for moveType
        case 'weak': return 'low';
        default: return 'low';
    }
}

export function transformEventsToAnimationQueue(structuredLogEvents) {
    const animationQueue = [];
    if (!structuredLogEvents || !Array.isArray(structuredLogEvents)) {
        // console.error("Battle Log Transformer (transformEventsToAnimationQueue): Invalid structuredLogEvents input", structuredLogEvents);
        return animationQueue; // Return empty queue
    }

    let lastEventWasKOAction = false;

    structuredLogEvents.forEach(event => {
        if (!event || typeof event.type !== 'string') {
            // console.warn("Battle Log Transformer: Skipping invalid event object in animation queue:", event);
            return; // Skip invalid event
        }

        if (event.type !== 'battle_end_ko_event') {
             lastEventWasKOAction = false;
        }

        let textContent = typeof event.text === 'string' ? event.text : ''; // Ensure text is always a string

        switch (event.type) {
            case 'phase_header_event':
                animationQueue.push({
                    isPhaseHeader: true,
                    text: `${event.phaseName || 'New Phase'} ${event.phaseEmoji || '⚔️'}`,
                    pauseAfter: event.pauseAfter || 1200,
                });
                break;
            case 'dialogue_event':
                animationQueue.push({
                    actorId: event.actorId, // May be null for narrator
                    characterName: event.characterName || (event.actorId ? (characters[event.actorId]?.name || event.actorId) : 'Narrator'),
                    text: textContent,
                    isDialogue: true,
                    dialogueType: event.dialogueType || 'general', // Default dialogueType
                    pauseAfter: event.pauseAfter !== undefined ? event.pauseAfter : (textContent.length > 50 ? 1000 : 600),
                });
                break;
            case 'move_action_event':
                animationQueue.push({
                    actorId: event.actorId,
                    characterName: event.characterName || (event.actorId ? (characters[event.actorId]?.name || event.actorId) : 'Attacker'),
                    moveName: event.moveName || 'Unknown Move',
                    moveType: event.moveType || 'unknown',
                    effectivenessLabel: event.effectivenessLabel || 'Normal',
                    impactLevel: determineImpactLevel(event.effectivenessLabel, event.moveType),
                    text: textContent,
                    isMoveAction: true,
                    pauseAfter: event.pauseAfter || 1000,
                });
                if (event.isKOAction) { // Check if this specific move was a KO
                    lastEventWasKOAction = true;
                }
                break;
            case 'collateral_damage_event':
                animationQueue.push({
                    actorId: event.actorId, // Might be null if environment acts on its own
                    characterName: event.actorId ? (characters[event.actorId]?.name || event.actorId) : 'Environment',
                    text: textContent,
                    isEnvironmental: true,
                    impactLevel: event.impactLevel || 'medium', // Default impact for collateral
                    pauseAfter: event.pauseAfter || 700,
                });
                break;
            case 'environmental_summary_event':
                if (event.texts && Array.isArray(event.texts) && event.texts.length > 0) {
                    event.texts.forEach(txt => {
                        if (typeof txt === 'string') { // Ensure each text is a string
                            animationQueue.push({
                                text: `🌍 Environment: ${txt}`,
                                isEnvironmental: true,
                                impactLevel: 'low',
                                pauseAfter: event.pauseAfterPerItem || 600, // Allow per-item pause customization
                            });
                        }
                    });
                }
                break;

            case 'battle_end_ko_event':
                if (!lastEventWasKOAction) { // Only add if KO wasn't part of the move description
                    animationQueue.push({
                        text: textContent,
                        impactLevel: 'critical', // High impact for battle end
                        pauseAfter: event.pauseAfter || 2500,
                    });
                }
                break;

            case 'stalemate_result_event':
            case 'draw_result_event':
            case 'timeout_victory_event':
            case 'conclusion_event':
                animationQueue.push({
                    text: textContent,
                    impactLevel: 'high',
                    pauseAfter: event.pauseAfter || 2000,
                });
                break;
            default:
                // For unknown event types, if they have text, add them as general informational lines
                if (textContent) {
                    animationQueue.push({
                        text: textContent,
                        impactLevel: 'low', // Low impact for unknown events
                        pauseAfter: event.pauseAfter || 500,
                    });
                } else {
                    // console.warn(`Battle Log Transformer: Unknown event type for animation with no text: ${event.type}`, event);
                }
                break;
        }
    });
    return animationQueue;
}

export function transformEventsToHtmlLog(structuredLogEvents) {
    if (!structuredLogEvents || !Array.isArray(structuredLogEvents)) {
        // console.error("Battle Log Transformer (transformEventsToHtmlLog): Invalid structuredLogEvents input", structuredLogEvents);
        return "<p>Error: Battle log data is corrupted or unavailable.</p>";
    }

    let htmlLog = "";
    let currentPhaseKeyForHtml = null;
    let isPhaseDivOpen = false;

    structuredLogEvents.forEach(event => {
        if (!event || typeof event.type !== 'string') {
            // console.warn("Battle Log Transformer: Skipping invalid event object for HTML log:", event);
            return;
        }

        let textContent = typeof event.text === 'string' ? event.text : ''; // Ensure text is a string
        let htmlContentForEvent = event.html_content && typeof event.html_content === 'string' ? event.html_content : '';

        if (event.type === 'phase_header_event') {
            if (isPhaseDivOpen) {
                htmlLog += `</div>`; // Close previous phase div
            }
            currentPhaseKeyForHtml = event.phaseKey || 'unknown-phase';
            // Use html_content if provided (which already includes header template), otherwise build it
            const phaseHeaderHtml = htmlContentForEvent ||
                (phaseTemplates.header || '')
                    .replace('{phaseDisplayName}', event.phaseName || 'New Phase')
                    .replace('{phaseEmoji}', event.phaseEmoji || '⚔️');

            htmlLog += (phaseTemplates.phaseWrapper || '<div>{phaseContent}</div>')
                .replace('{phaseKey}', currentPhaseKeyForHtml)
                .replace('{phaseContent}', phaseHeaderHtml);
            isPhaseDivOpen = true;

        } else if (htmlContentForEvent) { // For events that provide pre-formatted HTML (like move_action_event)
            if (isPhaseDivOpen) {
                htmlLog = htmlLog.slice(0, -6); // Remove closing </div> of phaseWrapper
                htmlLog += htmlContentForEvent + `</div>`; // Add event's HTML and re-close
            } else {
                htmlLog += htmlContentForEvent; // Append directly if not in a phase
            }
        } else if (textContent) { // For text-only events, wrap them
            let contentToAppend = "";
            switch (event.type) {
                case 'battle_end_ko_event':
                    contentToAppend = `<div class="final-blow-header">Final Blow 💥</div><p class="final-blow">${textContent}</p>`;
                    break;
                case 'stalemate_result_event':
                case 'draw_result_event':
                case 'timeout_victory_event':
                    contentToAppend = `<p class="final-blow">${textContent}</p>`;
                    break;
                case 'conclusion_event':
                    contentToAppend = `<p class="conclusion">${textContent}</p>`;
                    break;
                case 'environmental_summary_event':
                    if (event.texts && Array.isArray(event.texts) && event.texts.length > 0) {
                        contentToAppend += `<div class="environmental-summary">`;
                        contentToAppend += (phaseTemplates.environmentalImpactHeader || '<h5>Environmental Impact 🌍</h5>');
                        event.texts.forEach(txt => {
                            if (typeof txt === 'string') { // Ensure text is string
                                contentToAppend += `<p class="environmental-impact-text">${txt}</p>`;
                            }
                        });
                        contentToAppend += `</div>`;
                    }
                    break;
                default: // For dialogue_event, collateral_damage_event (if no html_content), etc.
                    let pClass = "log-generic";
                    if (event.isDialogue) pClass = "log-dialogue";
                    if (event.isEnvironmental) pClass = "log-environmental";
                    contentToAppend = `<p class="${pClass}">${textContent}</p>`;
                    break;
            }

            if (isPhaseDivOpen) {
                htmlLog = htmlLog.slice(0, -6); // Remove closing </div>
                htmlLog += contentToAppend + `</div>`; // Add content and re-close
            } else {
                htmlLog += contentToAppend;
            }
        }
    });

    if (isPhaseDivOpen && !htmlLog.endsWith(`</div>`)) { // Ensure the last phase div is closed
        htmlLog += `</div>`;
    }

    return htmlLog || "<p>The battle unfolds...</p>"; // Fallback if log is empty
}