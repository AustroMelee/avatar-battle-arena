// FILE: js/battle_log_transformer.js
'use strict';

import { characters } from './data_characters.js'; 
import { phaseTemplates } from './narrative-v2.js';

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

export function transformEventsToAnimationQueue(structuredLogEvents) {
    const animationQueue = [];
    if (!structuredLogEvents || !Array.isArray(structuredLogEvents)) {
        console.error("Battle Log Transformer: Invalid structuredLogEvents input", structuredLogEvents);
        return animationQueue;
    }

    let lastEventWasKOAction = false;

    structuredLogEvents.forEach(event => {
        if (!event || typeof event.type !== 'string') {
            console.warn("Skipping invalid event object:", event);
            return;
        }

        // Reset flag for new events unless it's the direct follow-up summary KO event
        if (event.type !== 'battle_end_ko_event') {
             lastEventWasKOAction = false;
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
                if (event.isKOAction) {
                    lastEventWasKOAction = true;
                }
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
            
            case 'battle_end_ko_event': 
                if (!lastEventWasKOAction) { 
                    animationQueue.push({
                        text: event.text, 
                        impactLevel: 'critical', 
                        isMoveAction: false, 
                        isDialogue: false,
                        pauseAfter: 2500,
                    });
                } else {
                    // Optionally, push a very short "VICTORY!" or similar if desired,
                    // or simply let the subsequent conclusion_event handle the win text.
                    // For now, we skip if the KO was already in the move.
                }
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
                // console.warn(`Unknown event type for animation: ${event.type}`, event);
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
    // console.log("Transformed animation queue:", animationQueue);
    return animationQueue;
}

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
                htmlLog += `</div>`; 
            }
            currentPhaseKeyForHtml = event.phaseKey;
            htmlLog += phaseTemplates.phaseWrapper.replace('{phaseKey}', currentPhaseKeyForHtml).replace('{phaseContent}', event.html_content || ''); 
            isPhaseDivOpen = true; 
        } else if (event.html_content && typeof event.html_content === 'string') {
            if (isPhaseDivOpen && htmlLog.endsWith(event.html_content)) {
                // Header was already added with the wrapper
            } else if (isPhaseDivOpen) {
                htmlLog = htmlLog.slice(0, -6); 
                htmlLog += event.html_content + `</div>`; 
            } else {
                 htmlLog += event.html_content; 
            }
        } 
        else if (event.text && typeof event.text === 'string') { 
            let contentToAppend = "";
            switch(event.type) {
                case 'battle_end_ko_event': 
                    contentToAppend = `<div class="final-blow-header">Final Blow 💥</div><p class="final-blow">${event.text}</p>`;
                    break;
                case 'stalemate_result_event':
                    contentToAppend = `<p class="final-blow">${event.text}</p>`;
                    break;
                case 'draw_result_event': contentToAppend = `<p class="final-blow">${event.text}</p>`; break;
                case 'timeout_victory_event': contentToAppend = `<p class="final-blow">${event.text}</p>`; break;
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