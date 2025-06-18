// FILE: js/log_to_animation_queue.js
"use strict";

import { characters } from "./data_characters.js";
import { ESCALATION_STATES } from "./engine_escalation.js";
import { determineImpactLevel } from "./utils_impact_level.js";

/**
 * Transforms a structured log of battle events into a queue for the animated text engine.
 * @param {Array<object>} structuredLogEvents - The raw log from the battle simulation.
 * @returns {Array<object>} A queue of animation-ready objects.
 */
export function transformEventsToAnimationQueue(structuredLogEvents) {
    const animationQueue = [];
    if (!structuredLogEvents || !Array.isArray(structuredLogEvents)) {
        return animationQueue;
    }

    let lastEventWasKOAction = false;

    for (const event of structuredLogEvents) {
        if (!event || typeof event.type !== "string") continue;

        lastEventWasKOAction = (event.type === "battle_end_ko_event" || (event.type === "curbstomp_event" && event.isMajorEvent && !event.isEscape));

        const textContent = event.text || "";
        let animationEvent = null;

        switch (event.type) {
            case "phase_header_event":
                animationEvent = { type: "phase", text: `${event.phaseName || "New Phase"} ${event.phaseEmoji || "⚔️"}` };
                break;
            case "dialogue_event":
                animationEvent = { type: "dialogue", text: textContent, actorId: event.actorId };
                break;
            case "move_action_event":
                animationEvent = { type: "move", text: textContent, impactLevel: determineImpactLevel(event.effectivenessLabel, event.moveType), moveData: event };
                break;
            case "escalation_change_event": {
                let impact = "medium";
                if (event.newState === ESCALATION_STATES.SEVERELY_INCAPACITATED) impact = "high";
                if (event.newState === ESCALATION_STATES.TERMINAL_COLLAPSE) impact = "critical";
                animationEvent = { type: "status", text: textContent, impactLevel: impact };
                break;
            }
            case "curbstomp_event":
                animationEvent = { type: "major", text: textContent, impactLevel: event.isEscape ? "medium" : "critical" };
                break;
            case "battle_end_ko_event":
                if (!lastEventWasKOAction) {
                    animationEvent = { type: "major", text: textContent, impactLevel: "critical" };
                }
                break;
            case "conclusion_event":
                animationEvent = { type: "major", text: textContent, impactLevel: "high" };
                break;
        }

        if (animationEvent) {
            animationQueue.push({ ...animationEvent, rawEvent: event });
        }
    }
    return animationQueue;
}