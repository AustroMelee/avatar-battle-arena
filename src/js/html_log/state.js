/**
 * @fileoverview State management for the HTML log builder.
 */

"use strict";

/**
 * Resets the builder's state to its initial values.
 * @returns {object} The initial state.
 */
export function resetBuilder() {
    return {
        htmlLog: "",
        currentTurnDivOpen: false,
        currentPhaseDivOpen: false,
        currentTurn: -1,
    };
}

/**
 * Closes the current turn div if it's open.
 * @param {import('./builder.js').HtmlLogBuilder} builder
 */
export function closeCurrentTurnDiv(builder) {
    if (builder.currentTurnDivOpen) {
        builder.htmlLog += "</section>";
        builder.currentTurnDivOpen = false;
    }
}

/**
 * Ensures that a turn group is open before adding an event.
 * @param {import('./builder.js').HtmlLogBuilder} builder
 * @param {object} event
 */
export function ensureTurnGroupOpen(builder, event) {
    if (!builder.currentTurnDivOpen) {
        const turn = event.turn ?? builder.currentTurn;
        builder.htmlLog += `<section class="turn-group"><h3 id="turn-header-${turn}">Turn ${turn + 1}</h3>`;
        builder.currentTurnDivOpen = true;
    }
}

/**
 * Finalizes the HTML log by closing any open tags.
 * @param {import('./builder.js').HtmlLogBuilder} builder
 * @returns {string} The complete HTML log.
 */
export function finalizeBuilder(builder) {
    closeCurrentTurnDiv(builder);
    if (builder.currentPhaseDivOpen) {
        builder.htmlLog += "</section>";
    }
    return builder.htmlLog;
} 