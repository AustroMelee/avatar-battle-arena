// FILE: battle_log_transformer.js
'use strict';

import { characters } from './data_characters.js';
// --- CORRECTED IMPORT PATH ---
import { phaseTemplates } from './data_narrative_phases.js';
// --- END CORRECTED IMPORT ---
import { updateAiMemory, attemptManipulation, adaptPersonality } from './engine_ai-decision.js';
import { calculateMove } from './engine_move-resolution.js';
import { updateMentalState } from './engine_mental-state.js';
import { generateTurnNarrationObjects, getFinalVictoryLine, findNarrativeQuote, generateCurbstompNarration, substituteTokens, generateEscalationNarrative, generateActionDescriptionObject } from './engine_narrative-engine.js';
import { modifyMomentum } from './engine_momentum.js';
import { initializeBattlePhaseState, checkAndTransitionPhase, BATTLE_PHASES } from './engine_battle-phase.js';
import { universalMechanics } from './data_mechanics_universal.js';
import { locationCurbstompRules } from './data_mechanics_locations.js';
import { characterCurbstompRules } from './data_mechanics_characters.js';
import { calculateIncapacitationScore, determineEscalationState, ESCALATION_STATES } from './engine_escalation.js';
import { checkReactiveDefense } from './engine_reactive-defense.js';

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

        if (event.type !== 'battle_end_ko_event' && event.type !== 'curbstomp_event') {
             lastEventWasKOAction = false;
        }

        let textContent = typeof event.text === 'string' ? event.text : '';

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
            case 'manipulation_narration_event':
                animationQueue.push({
                    actorId: event.actorId,
                    characterName: event.actorId ? (characters[event.actorId]?.name || event.actorId) : 'Environment',
                    text: textContent,
                    isEnvironmental: event.type === 'collateral_damage_event',
                    isDialogue: event.type === 'manipulation_narration_event',
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
            case 'curbstomp_event':
                animationQueue.push({
                    text: textContent,
                    impactLevel: event.isEscape ? 'medium' : 'critical',
                    isMajorEvent: event.isMajorEvent !== undefined ? event.isMajorEvent : !event.isEscape,
                    pauseAfter: event.pauseAfter || (event.isEscape ? 1500 : 2500),
                });
                 if (event.isMajorEvent !== undefined && event.isMajorEvent && !event.isEscape) {
                    lastEventWasKOAction = true;
                }
                break;
            // --- NEW: Escalation Change Event for Animation Queue ---
            case 'escalation_change_event':
                let impact = 'medium';
                if (event.newState === ESCALATION_STATES.SEVERELY_INCAPACITATED) impact = 'high';
                if (event.newState === ESCALATION_STATES.TERMINAL_COLLAPSE) impact = 'critical';
                if (event.newState === ESCALATION_STATES.NORMAL && event.oldState !== ESCALATION_STATES.NORMAL) impact = 'low'; // Reverting

                animationQueue.push({
                    actorId: event.actorId,
                    characterName: event.characterName || (event.actorId ? (characters[event.actorId]?.name || event.actorId) : 'Fighter'),
                    text: textContent, // The full text including flavor
                    isEscalationEvent: true, // Custom flag for styling if needed
                    impactLevel: impact,
                    pauseAfter: event.pauseAfter || 1300,
                });
                break;
            // --- END NEW ---
            case 'stun_event': // Added to handle stun messages
                animationQueue.push({
                    actorId: event.actorId,
                    characterName: event.characterName,
                    text: textContent,
                    isStatusEvent: true, // A general flag for status changes
                    impactLevel: 'medium',
                    pauseAfter: event.pauseAfter || 800,
                });
                break;
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
             // If html_content is directly provided (like for escalation or curbstomp), use it
            if (isPhaseDivOpen) {
                htmlLog = htmlLog.slice(0, -6); // Remove closing </div>
                htmlLog += htmlContentForEvent + `</div>`; // Add new content and re-close
            } else {
                htmlLog += htmlContentForEvent; // Add directly if not in a phase
            }
        } else if (textContent) {
            // Fallback for events that might only have `text` and not pre-formatted `html_content`
            let contentToAppend = "";
            switch (event.type) {
                case 'battle_end_ko_event':
                    contentToAppend = `<div class="final-blow-header">Final Blow 💥</div><p class="final-blow">${textContent}</p>`;
                    break;
                case 'curbstomp_event': // Should ideally use html_content from generateCurbstompNarration
                    const curbstompClass = event.isEscape ? "highlight-escape" : (event.isMajorEvent ? "highlight-major" : "highlight-neutral");
                    contentToAppend = `<div class="curbstomp-event-header">Curbstomp! 🌪️</div><p class="narrative-curbstomp ${curbstompClass}">${textContent}</p>`;
                    break;
                // --- NEW: Escalation Change Event for HTML Log (should use html_content if available) ---
                case 'escalation_change_event': // This case should ideally not be hit if html_content is always provided
                    let escalationClass = 'highlight-neutral';
                    if (event.newState === ESCALATION_STATES.PRESSURED) escalationClass = 'highlight-pressured';
                    else if (event.newState === ESCALATION_STATES.SEVERELY_INCAPACITATED) escalationClass = 'highlight-severe';
                    else if (event.newState === ESCALATION_STATES.TERMINAL_COLLAPSE) escalationClass = 'highlight-terminal';
                    contentToAppend = `<p class="narrative-escalation char-${event.actorId || 'unknown'}">${textContent}</p>`;
                    break;
                // --- END NEW ---
                case 'stun_event': // Added to handle stun messages
                    contentToAppend = `<p class="narrative-action char-${event.actorId || 'unknown'}">${textContent}</p>`;
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