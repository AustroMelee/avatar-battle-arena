// FILE: js/log_to_html.js
"use strict";

import { phaseTemplates } from "./data_narrative_phases.js";
import { ESCALATION_STATES } from "./engine_escalation.js";

/**
 * Transforms a structured log of battle events into a single HTML string for display.
 * @param {Array<object>} structuredLogEvents - The raw log from the battle simulation.
 * @returns {string} A single string of HTML representing the battle log.
 */
export function transformEventsToHtmlLog(structuredLogEvents) {
    if (!structuredLogEvents || !Array.isArray(structuredLogEvents)) {
        return "<p>Error: Battle log data is corrupted or unavailable.</p>";
    }

    let htmlLog = "";
    let isPhaseDivOpen = false;

    structuredLogEvents.forEach(event => {
        if (!event || typeof event.type !== "string") return;

        let htmlContentForEvent = event.html_content || "";
        if (!htmlContentForEvent && event.text) {
            // Fallback for events that only have text
            htmlContentForEvent = `<p class="log-generic">${event.text}</p>`;
        }

        if (event.type === "phase_header_event") {
            if (isPhaseDivOpen) htmlLog += "</div>"; // Close previous phase div
            const phaseHeaderHtml = event.html_content || (phaseTemplates.header || "")
                .replace("{phaseDisplayName}", event.phaseName || "New Phase")
                .replace("{phaseEmoji}", event.phaseEmoji || "⚔️");
            
            htmlLog += (phaseTemplates.phaseWrapper || "<div>{phaseContent}</div>")
                .replace("{phaseKey}", event.phaseKey || "unknown-phase")
                .replace("{phaseContent}", phaseHeaderHtml);
            isPhaseDivOpen = true;

        } else if (htmlContentForEvent) {
            if (isPhaseDivOpen) {
                const closingTagIndex = htmlLog.lastIndexOf("</div>");
                if (closingTagIndex !== -1) {
                    htmlLog = htmlLog.substring(0, closingTagIndex) + htmlContentForEvent + "</div>";
                } else {
                    htmlLog += htmlContentForEvent; // Append if something went wrong
                }
            } else {
                htmlLog += htmlContentForEvent;
            }
        }
    });

    if (isPhaseDivOpen) {
        htmlLog += "</div>"; // Ensure the last phase div is closed
    }

    return htmlLog || "<p>The battle unfolds...</p>";
}