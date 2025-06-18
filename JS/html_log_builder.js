/**
 * @fileoverview HTML Log Builder
 * @description Builder pattern implementation for constructing HTML battle logs from structured events
 * @version 1.0
 */

'use strict';

import { characters } from './data_characters.js';
import { safeGet } from './utils_safe_accessor.js';

/**
 * HTML Log Builder class that constructs battle logs incrementally
 */
export class HtmlLogBuilder {
    constructor() {
        this.htmlLog = "";
        this.currentTurnDivOpen = false;
        this.currentPhaseDivOpen = false;
        this.currentTurn = -1;
    }

    /**
     * Builds HTML log from structured events
     * @param {Array<object>} structuredLogEvents - The events to process
     * @returns {string} Complete HTML log
     */
    build(structuredLogEvents) {
        try {
            // Defensive Programming: Comprehensive input validation
            if (!structuredLogEvents) {
                console.error('[HTML Log Builder] Events parameter is null or undefined');
                return this.getErrorMessage("No battle log data provided.");
            }
            
            if (!Array.isArray(structuredLogEvents)) {
                console.error('[HTML Log Builder] Invalid events array provided, type:', typeof structuredLogEvents);
                return this.getErrorMessage("Battle log data is corrupted or unavailable.");
            }

            if (structuredLogEvents.length === 0) {
                console.warn('[HTML Log Builder] Empty events array provided');
                return this.getDefaultMessage();
            }

            console.debug(`[HTML Log Builder] Building HTML log from ${structuredLogEvents.length} events`);
            this.reset();
            
            // Process events with individual error handling
            let processedCount = 0;
            let errorCount = 0;
            
            structuredLogEvents.forEach((event, index) => {
                try {
                    if (event && typeof event === 'object') {
                        this.processEvent(event);
                        processedCount++;
                    } else {
                        console.warn(`[HTML Log Builder] Invalid event at index ${index}:`, event);
                        errorCount++;
                    }
                } catch (eventError) {
                    console.error(`[HTML Log Builder] Error processing event at index ${index}:`, eventError);
                    errorCount++;
                    // Continue processing other events
                }
            });

            console.debug(`[HTML Log Builder] Processed ${processedCount} events, ${errorCount} errors`);
            
            // Close any remaining open containers
            this.finalize();

            const result = this.htmlLog || this.getDefaultMessage();
            
            // Defensive check for HTML validity
            if (typeof result !== 'string') {
                console.error('[HTML Log Builder] Generated HTML is not a string');
                return this.getErrorMessage("Failed to generate battle log HTML.");
            }
            
            return result;
        } catch (error) {
            console.error('[HTML Log Builder] Critical error during build:', error);
            return this.getErrorMessage("Critical error occurred while building battle log.");
        }
        

    }

    /**
     * Resets the builder state
     */
    reset() {
        this.htmlLog = "";
        this.currentTurnDivOpen = false;
        this.currentPhaseDivOpen = false;
        this.currentTurn = -1;
    }

    /**
     * Processes a single event
     * @param {object} event - The event to process
     */
    processEvent(event) {
        try {
            // Defensive Programming: Validate event object
            if (!event || typeof event !== 'object') {
                console.warn('[HTML Log Builder] Invalid event object:', event);
                return;
            }

            if (!event.type || typeof event.type !== 'string') {
                console.warn('[HTML Log Builder] Event missing or invalid type property:', event);
                return;
            }

            switch (event.type) {
                case 'turn_marker':
                    this.handleTurnMarker(event);
                    break;
                case 'phase_header_event':
                    this.handlePhaseHeader(event);
                    break;
                default:
                    this.handleRegularEvent(event);
                    break;
            }
        } catch (error) {
            console.error('[HTML Log Builder] Error processing event:', error, event);
            // Continue processing - don't let one bad event break the entire log
        }
    }

    /**
     * Handles turn marker events
     * @param {object} event - Turn marker event
     */
    handleTurnMarker(event) {
        this.closeCurrentTurnDiv();
        
        this.currentTurn = safeGet(event, 'turn', 0);
        this.htmlLog += `<section class="turn-group" aria-labelledby="turn-header-${this.currentTurn}">
            <h3 class="turn-header" id="turn-header-${this.currentTurn}">Turn ${this.currentTurn + 1}</h3>`;
        this.currentTurnDivOpen = true;
    }

    /**
     * Handles phase header events
     * @param {object} event - Phase header event
     */
    handlePhaseHeader(event) {
        this.closeCurrentTurnDiv();
        
        if (this.currentPhaseDivOpen) {
            this.htmlLog += `</section>`; // Close previous phase section
        }
        
        const phaseKey = safeGet(event, 'phaseKey', 'unknown');
        const htmlContent = safeGet(event, 'html_content', '')
            .replace('{phaseKey}', phaseKey);
        
        this.htmlLog += `<section class="phase-group" data-phase-key="${phaseKey}" 
                         aria-labelledby="phase-header-${phaseKey}" role="region">
                         <h4 id="phase-header-${phaseKey}" class="sr-only">${phaseKey} Phase</h4>
                         ${htmlContent}`;
        this.currentPhaseDivOpen = true;
    }

    /**
     * Handles regular battle events
     * @param {object} event - Regular event
     */
    handleRegularEvent(event) {
        const eventHtml = this.getEventHtml(event);
        
        if (!eventHtml) {
            console.warn(`Event of type '${event.type}' is missing html_content. Event:`, event);
            return;
        }

        // Ensure a turn group is open if not a phase header
        this.ensureTurnGroupOpen(event);

        // Append the event content
        this.appendToLog(eventHtml);
    }

    /**
     * Gets HTML content for an event
     * @param {object} event - The event
     * @returns {string} HTML content
     */
    getEventHtml(event) {
        // First try to get pre-generated HTML content
        if (event.html_content) {
            return event.html_content;
        }

        // Handle special cases for events that need custom HTML generation
        switch (event.type) {
            case 'dice_roll':
                return this.generateDiceRollHtml(event);
            default:
                return null;
        }
    }

    /**
     * Generates HTML for dice roll events
     * @param {object} event - Dice roll event
     * @returns {string} HTML content
     */
    generateDiceRollHtml(event) {
        const actorName = event.actorId ? 
            safeGet(characters, `${event.actorId}.name`, event.actorId) : '';
        const actorInfo = actorName ? `(${actorName}) ` : '';
        const threshold = event.threshold ? ` vs ${event.threshold.toFixed(2)}` : '';
        const moveName = event.moveName ? ` (for ${event.moveName})` : '';
        
        return `<div class="log-roll">🎲 [${event.rollType}] ${actorInfo}rolled ${event.result.toFixed(2)}${threshold} → <strong>${event.outcome}</strong>${moveName}</div>`;
    }

    /**
     * Ensures a turn group is open for regular events
     * @param {object} event - The current event
     */
    ensureTurnGroupOpen(event) {
        if (!this.currentTurnDivOpen && event.type !== 'phase_header_event') {
            // This is a fallback for events outside explicit turn markers
            const turnNumber = safeGet(event, 'turn', this.currentTurn);
            this.htmlLog += `<section class="turn-group" aria-labelledby="turn-header-${turnNumber}">
                <h3 class="turn-header" id="turn-header-${turnNumber}">Turn ${turnNumber + 1} (Unmarked)</h3>`;
            this.currentTurnDivOpen = true;
        }
    }

    /**
     * Appends content to the appropriate container
     * @param {string} content - HTML content to append
     */
    appendToLog(content) {
        if (this.currentPhaseDivOpen) {
            // Insert before the closing '</section>' tag of the current phase
            const closingTagIndex = this.htmlLog.lastIndexOf('</section>');
            if (closingTagIndex !== -1) {
                this.htmlLog = this.htmlLog.substring(0, closingTagIndex) + content + '</section>';
            } else {
                this.htmlLog += content; // Fallback
            }
        } else {
            this.htmlLog += content;
        }
    }

    /**
     * Closes the current turn div if open
     */
    closeCurrentTurnDiv() {
        if (this.currentTurnDivOpen) {
            this.htmlLog += `</section>`; // Close .turn-group
            this.currentTurnDivOpen = false;
        }
    }

    /**
     * Finalizes the HTML log by closing any open containers
     */
    finalize() {
        this.closeCurrentTurnDiv();
        
        if (this.currentPhaseDivOpen) {
            this.htmlLog += `</section>`; // Close the last phase section
        }
    }

    /**
     * Gets error message HTML
     * @param {string} message - Error message
     * @returns {string} Error HTML
     */
    getErrorMessage(message) {
        return `<div class="error-message" role="alert" aria-live="polite">${message}</div>`;
    }

    /**
     * Gets default message HTML when no events
     * @returns {string} Default HTML
     */
    getDefaultMessage() {
        return `<div class="default-message" role="status" aria-live="polite">The battle unfolds...</div>`;
    }
}

/**
 * Factory function for creating HTML logs
 * @param {Array<object>} structuredLogEvents - Events to process
 * @returns {string} Complete HTML log
 */
export function buildHtmlLog(structuredLogEvents) {
    const builder = new HtmlLogBuilder();
    return builder.build(structuredLogEvents);
}

/**
 * Enhanced event type handlers for specific HTML generation needs
 */
export const HTML_EVENT_HANDLERS = {
    'move_action_event': (event) => event.html_content,
    'collateral_damage_event': (event) => event.html_content,
    'environmental_impact_event': (event) => event.html_content,
    'environmental_summary_event': (event) => event.html_content,
    'dialogue_event': (event) => event.html_content,
    'internal_thought_event': (event) => event.html_content,
    'stun_event': (event) => event.html_content,
    'energy_recovery_event': (event) => event.html_content,
    'manipulation_narration_event': (event) => event.html_content,
    'action_failure_event': (event) => event.html_content,
    'escalation_change_event': (event) => event.html_content,
    'curbstomp_event': (event) => event.html_content,
    'final_blow_event': (event) => event.html_content,
    'stalemate_result_event': (event) => event.html_content,
    'conclusion_event': (event) => event.html_content,
    'status_change_event': (event) => event.html_content,
    'environmental_final_summary_event': (event) => event.html_content
};

/**
 * Validates that an event has the required HTML content
 * @param {object} event - Event to validate
 * @returns {boolean} True if event has valid HTML content
 */
export function validateEventHtml(event) {
    if (!event || !event.type) {
        return false;
    }

    // Special cases that don't need html_content
    const specialTypes = ['turn_marker', 'phase_header_event', 'dice_roll'];
    if (specialTypes.includes(event.type)) {
        return true;
    }

    // Regular events must have html_content
    return Boolean(event.html_content);
}

/**
 * Batch validates multiple events
 * @param {Array<object>} events - Events to validate
 * @returns {Array<object>} Validation results with event index and status
 */
export function validateEvents(events) {
    if (!Array.isArray(events)) {
        return [{ index: -1, valid: false, error: 'Events must be an array' }];
    }

    return events.map((event, index) => ({
        index,
        valid: validateEventHtml(event),
        event: event,
        error: validateEventHtml(event) ? null : `Event type '${event?.type || 'unknown'}' missing required html_content`
    }));
} 