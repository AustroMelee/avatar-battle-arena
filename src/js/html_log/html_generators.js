/**
 * @fileoverview HTML snippet generators for the HTML log builder.
 */

"use strict";

import { characters } from "../data_characters.js";
import { safeGet } from "../utils_safe_accessor.js";

/**
 * Gets the HTML for a given event.
 * @param {object} event
 * @returns {string | null}
 */
export function getEventHtml(event) {
    if (event.html_content) {
        return event.html_content;
    }
    switch (event.type) {
        case "dice_roll":
            return generateDiceRollHtml(event);
        default:
            return null;
    }
}

function generateDiceRollHtml(event) {
    const actorName = event.actorId ? safeGet(characters, `${event.actorId}.name`, event.actorId) : "";
    const actorInfo = actorName ? `(${actorName}) ` : "";
    const threshold = event.threshold ? ` vs ${event.threshold.toFixed(2)}` : "";
    const moveName = event.moveName ? ` (for ${event.moveName})` : "";
    return `<div class="log-roll">🎲 [${event.rollType}] ${actorInfo}rolled ${event.result.toFixed(2)}${threshold} → <strong>${event.outcome}</strong>${moveName}</div>`;
}

/**
 * Gets the HTML for an error message.
 * @param {string} message
 * @returns {string}
 */
export function getErrorMessage(message) {
    return `<div class="error-message">${message}</div>`;
}

/**
 * Gets the HTML for the default message when no events are present.
 * @returns {string}
 */
export function getDefaultMessage() {
    return "<div class=\"default-message\">The battle is about to begin...</div>";
} 