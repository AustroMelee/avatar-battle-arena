/**
 * @fileoverview Utility functions for the HTML log builder.
 */

"use strict";

import { HtmlLogBuilder } from "./builder.js";

/**
 * A simple factory function to create an HTML log from events.
 * @param {object[]} structuredLogEvents
 * @returns {string}
 */
export function buildHtmlLog(structuredLogEvents) {
    return new HtmlLogBuilder().build(structuredLogEvents);
}

/**
 * Validates that an event has the necessary properties to be rendered.
 * @param {object} event
 * @returns {boolean}
 */
export function validateEventHtml(event) {
    if (!event || !event.type) return false;
    const specialTypes = ["turn_marker", "phase_header_event", "dice_roll"];
    if (specialTypes.includes(event.type)) return true;
    return !!event.html_content;
}

/**
 * Validates an array of events.
 * @param {object[]} events
 * @returns {{index: number, valid: boolean, error: string | null}[]}
 */
export function validateEvents(events) {
    if (!Array.isArray(events)) {
        return [{ index: -1, valid: false, error: "Input must be an array." }];
    }
    return events.map((event, index) => {
        const isValid = validateEventHtml(event);
        return {
            index,
            valid: isValid,
            error: isValid ? null : `Event at index ${index} is invalid.`,
        };
    });
} 