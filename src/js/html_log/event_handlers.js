/**
 * @fileoverview Event handlers for the HTML log builder.
 */

"use strict";

import { getEventHtml } from "./html_generators.js";
import { closeCurrentTurnDiv, ensureTurnGroupOpen } from "./state.js";

/**
 * Processes a single event by delegating to the appropriate handler.
 * @param {import('./builder.js').HtmlLogBuilder} builder
 * @param {object} event
 */
export function processEvent(builder, event) {
    if (!event || typeof event.type !== "string") {
        console.warn("Invalid event:", event);
        return;
    }

    switch (event.type) {
        case "turn_marker":
            handleTurnMarker(builder, event);
            break;
        case "phase_header_event":
            handlePhaseHeader(builder, event);
            break;
        default:
            handleRegularEvent(builder, event);
            break;
    }
}

function handleTurnMarker(builder, event) {
    closeCurrentTurnDiv(builder);
    builder.currentTurn = event.turn ?? 0;
    builder.htmlLog += `<section class="turn-group" aria-labelledby="turn-header-${builder.currentTurn}"><h3 id="turn-header-${builder.currentTurn}">Turn ${builder.currentTurn + 1}</h3>`;
    builder.currentTurnDivOpen = true;
}

function handlePhaseHeader(builder, event) {
    closeCurrentTurnDiv(builder);
    if (builder.currentPhaseDivOpen) {
        builder.htmlLog += "</section>";
    }
    const phaseKey = event.phaseKey || "unknown";
    builder.htmlLog += `<section class="phase-group" data-phase-key="${phaseKey}">`;
    builder.currentPhaseDivOpen = true;
}

function handleRegularEvent(builder, event) {
    const eventHtml = getEventHtml(event);
    if (!eventHtml) {
        return;
    }
    ensureTurnGroupOpen(builder, event);
    builder.htmlLog += eventHtml;
} 