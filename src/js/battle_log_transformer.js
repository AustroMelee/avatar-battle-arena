// FILE: battle_log_transformer.js
"use strict";

// Version 3.0: Refactored to use shared utilities and improved modularity
// - Uses centralized impact level determination
// - Cleaner event type handling with strategy pattern

import { phaseTemplates } from "./data_narrative_phases.js";
import { ESCALATION_STATES } from "./engine_escalation.js";
import { processEventForAnimation } from "./event_type_handlers.js";
import { buildHtmlLog } from "./html_log_builder.js";

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
        if (lastEventWasKOAction && event.type === "conclusion_event") return;

        lastEventWasKOAction = (event.type === "final_blow_event" || (event.type === "curbstomp_event" && event.isMajorEvent && !event.isEscape));

        // Pre-process move action events to add impact level
        if (event.type === "move_action_event") {
            // event.impactLevel = determineImpactLevel(event.effectiveness, event.moveType); // From deleted file
        }

        // Use strategy pattern to process the event
        const animationEvent = processEventForAnimation(event);
        animationQueue.push(animationEvent);
    });

    return animationQueue;
}

/**
 * Transforms a structured log of battle events into a single HTML string for display.
 * Uses the HtmlLogBuilder for clean, maintainable HTML generation.
 * @param {Array<object>} structuredLogEvents - The raw event log from the battle simulation.
 * @returns {string} A single string of HTML representing the complete battle log.
 */
export function transformEventsToHtmlLog(structuredLogEvents) {
    return buildHtmlLog(structuredLogEvents);
}