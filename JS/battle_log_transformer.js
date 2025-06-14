// FILE: battle_log_transformer.js
'use strict';

import { characters } from './data_characters.js';
import { phaseTemplates } from './narrative-v2.js';

function determineImpactLevel(effectivenessLabel, moveType) {
    if (!effectivenessLabel || typeof effectivenessLabel !== 'string') return 'low'; 
    switch (effectivenessLabel.toLowerCase()) {
        case 'critical': return 'critical';
        case 'strong': return 'high';
        case 'normal': return (moveType === 'Finisher' || moveType === 'finisher') ? 'high' : 'medium'; 
        case 'weak': return 'low';
        default: return 'low';
    }
}

export function transformEventsToAnimationQueue(structuredLogEvents) {
    const animationQueue = [];
    if (!structuredLogEvents || !Array.isArray(structuredLogEvents)) {
        return animationQueue; 
    }

    let lastEventWasKOAction = false;

    structuredLogEvents.forEach(event => {
        if (!event || typeof event.type !== 'string') {
            return; 
        }

        // Reset KO flag if current event is not a KO event
        if (event.type !== 'battle_end_ko_event' && event.type !== 'curbstomp_event') { // Curbstomp might also be a KO
             lastEventWasKOAction = false;
        }

        let textContent = typeof event.text === 'string' ? event.text : ''; 

        switch (event.type) {
            case 'phase_header_event':
                animationQueue.push({
                    isPhaseHeader: true,
                    text: `${event.phaseName || 'New Phase'} ${event.phaseEmoji || '⚔️'}`, // Use passed name/emoji
                    pauseAfter: event.pauseAfter || 1200,
                });
                break;
            case 'dialogue_event':
                animationQueue.push({
                    actorId: event.actorId, 
                    characterName: event.characterName || (event.actorId ? (characters[event.actorId]?.name || event.actorId) : 'Narrator'),
                    text: textContent,
                    isDialogue: true,
                    dialogueType: event.dialogueType || 'general', 
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
                if (event.isKOAction) { 
                    lastEventWasKOAction = true;
                }
                break;
            case 'collateral_damage_event':
            case 'manipulation_narration_event': // Treat manipulation narration similarly to collateral
                animationQueue.push({
                    actorId: event.actorId, 
                    characterName: event.actorId ? (characters[event.actorId]?.name || event.actorId) : 'Environment',
                    text: textContent,
                    isEnvironmental: event.type === 'collateral_damage_event', // True for collateral
                    isDialogue: event.type === 'manipulation_narration_event', // True for manip narration
                    impactLevel: event.impactLevel || 'medium', 
                    pauseAfter: event.pauseAfter || 700,
                });
                break;
            case 'environmental_summary_event':
                if (event.texts && Array.isArray(event.texts) && event.texts.length > 0) {
                    event.texts.forEach(txt => {
                        if (typeof txt === 'string') { 
                            animationQueue.push({
                                text: `🌍 Environment: ${txt}`,
                                isEnvironmental: true,
                                impactLevel: 'low',
                                pauseAfter: event.pauseAfterPerItem || 600, 
                            });
                        }
                    });
                }
                break;
            // --- NEW: Curbstomp Event for Animation ---
            case 'curbstomp_event':
                animationQueue.push({
                    text: textContent,
                    impactLevel: event.isEscape ? 'medium' : 'critical', // Escapes are less critically impactful than KOs
                    isMajorEvent: event.isMajorEvent !== undefined ? event.isMajorEvent : !event.isEscape, // Mark as major if it's not an escape
                    pauseAfter: event.pauseAfter || (event.isEscape ? 1500 : 2500),
                    // Optionally, add actorId if the curbstomp is clearly attributed to one character's action
                    // actorId: event.attackerId || null, 
                    // characterName: event.attackerId ? (characters[event.attackerId]?.name || event.attackerId) : 'System',
                });
                 if (event.isMajorEvent !== undefined && event.isMajorEvent && !event.isEscape) { // If it's a decisive curbstomp
                    lastEventWasKOAction = true;
                }
                break;
            // --- END NEW ---
            case 'battle_end_ko_event':
                if (!lastEventWasKOAction) { 
                    animationQueue.push({
                        text: textContent,
                        impactLevel: 'critical', 
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
                if (textContent) {
                    animationQueue.push({
                        text: textContent,
                        impactLevel: 'low', 
                        pauseAfter: event.pauseAfter || 500,
                    });
                }
                break;
        }
    });
    return animationQueue;
}

export function transformEventsToHtmlLog(structuredLogEvents) {
    if (!structuredLogEvents || !Array.isArray(structuredLogEvents)) {
        return "<p>Error: Battle log data is corrupted or unavailable.</p>";
    }

    let htmlLog = "";
    let currentPhaseKeyForHtml = null;
    let isPhaseDivOpen = false;

    structuredLogEvents.forEach(event => {
        if (!event || typeof event.type !== 'string') {
            return;
        }

        let textContent = typeof event.text === 'string' ? event.text : ''; 
        let htmlContentForEvent = event.html_content && typeof event.html_content === 'string' ? event.html_content : '';

        if (event.type === 'phase_header_event') {
            if (isPhaseDivOpen) {
                htmlLog += `</div>`; 
            }
            currentPhaseKeyForHtml = event.phaseKey || 'unknown-phase';
            const phaseHeaderHtml = htmlContentForEvent ||
                (phaseTemplates.header || '')
                    .replace('{phaseDisplayName}', event.phaseName || 'New Phase')
                    .replace('{phaseEmoji}', event.phaseEmoji || '⚔️');

            htmlLog += (phaseTemplates.phaseWrapper || '<div>{phaseContent}</div>')
                .replace('{phaseKey}', currentPhaseKeyForHtml)
                .replace('{phaseContent}', phaseHeaderHtml);
            isPhaseDivOpen = true;

        } else if (htmlContentForEvent) { 
            if (isPhaseDivOpen) {
                htmlLog = htmlLog.slice(0, -6); 
                htmlLog += htmlContentForEvent + `</div>`; 
            } else {
                htmlLog += htmlContentForEvent; 
            }
        } else if (textContent) { 
            let contentToAppend = "";
            switch (event.type) {
                case 'battle_end_ko_event':
                    contentToAppend = `<div class="final-blow-header">Final Blow 💥</div><p class="final-blow">${textContent}</p>`;
                    break;
                // --- NEW: Curbstomp Event for HTML ---
                case 'curbstomp_event':
                    const curbstompClass = event.isEscape ? "highlight-escape" : (event.isMajorEvent ? "highlight-major" : "highlight-neutral");
                    contentToAppend = `<div class="curbstomp-event-header">Curbstomp! 🌪️</div><p class="narrative-curbstomp ${curbstompClass}">${textContent}</p>`;
                    break;
                // --- END NEW ---
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
                            if (typeof txt === 'string') { 
                                contentToAppend += `<p class="environmental-impact-text">${txt}</p>`;
                            }
                        });
                        contentToAppend += `</div>`;
                    }
                    break;
                default: 
                    let pClass = "log-generic";
                    if (event.isDialogue) pClass = "log-dialogue";
                    if (event.isEnvironmental) pClass = "log-environmental";
                    contentToAppend = `<p class="${pClass}">${textContent}</p>`;
                    break;
            }

            if (isPhaseDivOpen) {
                htmlLog = htmlLog.slice(0, -6); 
                htmlLog += contentToAppend + `</div>`; 
            } else {
                htmlLog += contentToAppend;
            }
        }
    });

    if (isPhaseDivOpen && !htmlLog.endsWith(`</div>`)) { 
        htmlLog += `</div>`;
    }

    return htmlLog || "<p>The battle unfolds...</p>"; 
}