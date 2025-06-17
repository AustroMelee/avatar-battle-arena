// FILE: battle_log_transformer.js
'use strict';

// Version 2.0: Stripped-down version for Aang vs. Azula
// - Removed all unnecessary imports and switch cases for unused characters/events.

import { characters } from './data_characters.js';
import { phaseTemplates } from './data_narrative_phases.js';
import { ESCALATION_STATES } from './engine_escalation.js';

/**
 * Determines the visual impact level for an animation based on the move's effectiveness.
 * @param {string} effectivenessLabel - The effectiveness of the move (e.g., 'Critical').
 * @param {string} moveType - The type of the move (e.g., 'Finisher').
 * @returns {string} The impact level ('low', 'medium', 'high', 'critical').
 */
function determineImpactLevel(effectivenessLabel, moveType) {
    const label = (effectivenessLabel || '').toLowerCase();
    switch (label) {
        case 'critical': return 'critical';
        case 'strong': return 'high';
        case 'normal': return (moveType === 'Finisher') ? 'high' : 'medium';
        case 'weak': return 'low';
        default: return 'low';
    }
}

/**
 * Transforms a structured log of battle events into a queue for the animated text engine.
 * @param {Array<object>} structuredLogEvents - The raw event log from the battle simulation.
 * @returns {Array<object>} A queue of simplified objects for the animation engine.
 */
export function transformEventsToAnimationQueue(structuredLogEvents) {
    const animationQueue = [];
    if (!structuredLogEvents || !Array.isArray(structuredLogEvents)) {
        return animationQueue;
    }

    let lastEventWasKOAction = false;

    structuredLogEvents.forEach(event => {
        if (!event || !event.type) return;

        // Prevent conclusion from appearing twice if it follows a KO
        if (lastEventWasKOAction && event.type === 'conclusion_event') return;

        lastEventWasKOAction = (event.type === 'final_blow_event' || (event.type === 'curbstomp_event' && event.isMajorEvent && !event.isEscape));

        let textContent = event.text || '';
        let animationEvent = {
            text: textContent,
            pauseAfter: event.pauseAfter || 500 // Default pause
        };

        switch (event.type) {
            case 'phase_header_event':
                animationEvent.text = `${event.phaseName || 'New Phase'} ${event.phaseEmoji || '⚔️'}`;
                animationEvent.isPhaseHeader = true;
                animationEvent.pauseAfter = 1200;
                break;
            case 'dialogue_event':
            case 'internal_thought_event':
                animationEvent.actorId = event.actorId;
                animationEvent.characterName = event.characterName;
                animationEvent.isDialogue = true;
                animationEvent.dialogueType = event.dialogueType;
                animationEvent.pauseAfter = textContent.length > 50 ? 1000 : 600;
                break;
            case 'move_action_event':
                animationEvent.isMoveAction = true;
                animationEvent.impactLevel = determineImpactLevel(event.effectiveness, event.moveType);
                animationEvent.moveData = { name: event.moveName, type: event.moveType, effectiveness: event.effectiveness };
                animationEvent.pauseAfter = 1000;
                break;
            case 'escalation_change_event':
                animationEvent.isStatusEvent = true;
                animationEvent.impactLevel = 'high';
                animationEvent.pauseAfter = 1300;
                break;
            case 'curbstomp_event':
            case 'final_blow_event':
            case 'conclusion_event':
                animationEvent.impactLevel = 'critical';
                animationEvent.isMajorEvent = true;
                animationEvent.pauseAfter = 2500;
                break;
            case 'stalemate_result_event':
                animationEvent.impactLevel = 'high';
                animationEvent.isMajorEvent = true;
                animationEvent.pauseAfter = 2000;
                break;
            default:
                // For any other simple narrative events
                animationEvent.impactLevel = 'low';
                break;
        }

        animationQueue.push(animationEvent);
    });

    return animationQueue;
}


/**
 * Transforms a structured log of battle events into a single HTML string for display.
 * @param {Array<object>} structuredLogEvents - The raw event log from the battle simulation.
 * @returns {string} A single string of HTML representing the complete battle log.
 */
export function transformEventsToHtmlLog(structuredLogEvents) {
    if (!structuredLogEvents || !Array.isArray(structuredLogEvents)) {
        return "<p>Error: Battle log data is corrupted or unavailable.</p>";
    }

    let htmlLog = "";
    let isPhaseDivOpen = false;

    const appendToLog = (content) => {
        if (isPhaseDivOpen) {
            // Insert before the closing '</div>' tag of the current phase
            const closingTagIndex = htmlLog.lastIndexOf('</div>');
            if (closingTagIndex !== -1) {
                htmlLog = htmlLog.substring(0, closingTagIndex) + content + '</div>';
            } else {
                htmlLog += content; // Fallback
            }
        } else {
            htmlLog += content;
        }
    };

    structuredLogEvents.forEach(event => {
        if (!event || !event.type) return;

        let eventHtml = event.html_content; // Removed fallback to generic <p>
        let turnNumberHtml = (event.turnNumber !== undefined && event.type !== 'turn_marker') ? `<div class="log-turn-number">Turn ${event.turnNumber + 1}</div>` : '';

        if (event.type === 'phase_header_event') {
            if (isPhaseDivOpen) htmlLog += `</div>`; // Close previous phase
            const phaseHeaderHtml = event.html_content.replace('{phaseKey}', event.phaseKey || 'unknown');
            htmlLog += phaseHeaderHtml;
            isPhaseDivOpen = true;
        } else {
            // All events should now have html_content generated at their source.
            // If an event type does not, it's a bug that needs to be addressed at the source.
            // This ensures no 'Unknown event.' ever appears.
            if (!eventHtml) {
                console.warn(`Event of type '${event.type}' is missing html_content. Event:`, event);
                return; // Skip rendering this event if no content
            }

            switch (event.type) {
                case 'turn_marker':
                    // Turn marker already handled by currentTurnNumber above, but if it has html_content, use it.
                    // This event type primarily serves to provide the turn number context.
                    if (event.html_content) { appendToLog(event.html_content); }
                    break;
                case 'move_action_event':
                case 'collateral_damage_event':
                case 'environmental_impact_event':
                case 'environmental_summary_event':
                case 'dialogue_event':
                case 'internal_thought_event':
                case 'stun_event':
                case 'energy_recovery_event':
                case 'manipulation_narration_event':
                case 'action_failure_event':
                case 'escalation_change_event':
                case 'curbstomp_event':
                case 'final_blow_event':
                case 'stalemate_result_event':
                case 'conclusion_event':
                case 'status_change_event': // Added this to explicitly handle general status changes
                    appendToLog(turnNumberHtml + eventHtml);
                    break;
                case 'dice_roll':
                    // Dice rolls will be handled separately. For now, ensure they don't appear as "Unknown Event"
                    // They should still appear in the raw log, but not necessarily in the main narrative flow.
                    // For now, I'm modifying the existing dice roll output to be more distinct.
                    appendToLog(`<div class="log-roll">🎲 [${event.rollType}] ${event.actorId ? `(${characters[event.actorId]?.name || event.actorId}) ` : ''}rolled ${event.result.toFixed(2)} ${event.threshold ? `vs ${event.threshold.toFixed(2)}` : ''} → <strong>${event.outcome}</strong>${event.moveName ? ` (for ${event.moveName})` : ''}</div>`);
                    break;
                default:
                    // This 'default' should ideally never be hit if all event types are handled.
                    // If it is, it indicates a new, unhandled event type.
                    console.warn(`Unhandled event type in transformEventsToHtmlLog (no explicit case): ${event.type}`, event);
                    appendToLog(turnNumberHtml + eventHtml); // Fallback to ensure it's still displayed
                    break;
            }
        }
    });

    if (isPhaseDivOpen) {
        htmlLog += `</div>`; // Ensure the last phase div is always closed
    }

    return htmlLog || "<p>The battle unfolds...</p>";
}