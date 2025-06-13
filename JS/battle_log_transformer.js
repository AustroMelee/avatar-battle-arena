// FILE: js/battle_log_transformer.js
'use strict';

import { characters } from './data_characters.js'; // To get character names if needed

/**
 * Transforms the battle engine's structured event array into a queue
 * of message objects suitable for the animated_text_engine.
 * @param {Array<object>} structuredEvents - The raw event array from the battle engine.
 * @returns {Array<object>} An array of message objects for animation.
 */
export function transformEventsToAnimationQueue(structuredEvents) {
    const animationQueue = [];
    if (!structuredEvents || !Array.isArray(structuredEvents)) {
        console.error("Battle Log Transformer: Invalid structuredEvents input", structuredEvents);
        return animationQueue;
    }

    structuredEvents.forEach(event => {
        // Each 'event' could be a complex object representing a phase, a turn, or a single action.
        // This transformer needs to break these down into individual lines/messages for animation.
        // For now, we'll assume `engine_battle-engine-core.js` outputs events that are already fairly granular
        // and suitable for direct transformation or minimal processing.

        if (event.type === 'phase_header_html_blob') { // A phase header, already HTML
             animationQueue.push({
                isPhaseHeader: true,
                text: extractTextFromHtml(event.html_content) || "Phase Change", // Extract meaningful text
                pauseAfter: 1000, // Longer pause after phase headers
                // No actorId, moveType, impactLevel needed for phase headers
            });
        } else if (event.type === 'turn_narration_html_blob') { // A turn's narrative block, already HTML
            // This is tricky. We need to parse this HTML blob or get more structured data from engine.
            // For now, let's assume it's a single block of text for simplicity.
            // A better approach: engine_narrative-engine should produce structured turn events.
            
            // Simplistic approach: split by <p> tags or newlines if present
            const lines = splitHtmlBlobToLines(event.html_content);
            lines.forEach(lineData => {
                animationQueue.push({
                    text: lineData.text,
                    actorId: lineData.actorId || event.actorId, // Prefer line-specific actorId if parsed
                    characterName: lineData.actorId ? characters[lineData.actorId]?.name : (event.actorId ? characters[event.actorId]?.name : ''),
                    moveType: lineData.moveType || event.moveType,
                    moveName: lineData.moveName || event.moveName,
                    effectivenessLabel: lineData.effectivenessLabel || event.effectivenessLabel,
                    impactLevel: determineImpactLevel(lineData.effectivenessLabel || event.effectivenessLabel, lineData.moveType || event.moveType),
                    pauseAfter: lineData.isMoveAction ? 1000 : 500, // Longer pause for main move actions
                    isMoveAction: lineData.isMoveAction,
                    isDialogue: lineData.isDialogue,
                    isEnvironmental: lineData.isEnvironmental,
                });
            });

        } else if (event.type === 'final_blow_html_blob' || event.type === 'conclusion_html_blob' || event.type === 'stalemate_result_html_blob' || event.type === 'draw_result_html_blob' || event.type === 'timeout_victory_html_blob') {
             animationQueue.push({
                text: extractTextFromHtml(event.html_content) || "Battle End",
                impactLevel: 'high', // Battle end is high impact
                pauseAfter: 2000,
                isMoveAction: true, // Treat as an important action
            });
        }
        // Add more specific event type handling as the engine output evolves.
        // For example:
        // else if (event.type === 'dialogue') {
        //     animationQueue.push({
        //         actorId: event.actorId,
        //         characterName: characters[event.actorId]?.name,
        //         text: event.text,
        //         isDialogue: true,
        //         pauseAfter: event.pauseAfter || 700
        //     });
        // } else if (event.type === 'move_action') {
        //     animationQueue.push({
        //         actorId: event.actorId,
        //         characterName: characters[event.actorId]?.name,
        //         moveType: event.moveData.element || event.moveData.type, // or derive from move.type
        //         moveName: event.moveData.name,
        //         effectivenessLabel: event.result.effectiveness.label,
        //         impactLevel: determineImpactLevel(event.result.effectiveness.label, event.moveData.type),
        //         text: event.narrativeText, // This would be the descriptive part
        //         isMoveAction: true,
        //         pauseAfter: event.pauseAfter || 1000
        //     });
        // } // etc.
        
    });
    console.log("Transformed animation queue:", animationQueue);
    return animationQueue;
}

/**
 * Transforms the battle engine's structured event array into a full HTML log string
 * for the "Instant Simulation" mode.
 * @param {Array<object>} structuredEvents - The raw event array from the battle engine.
 * @returns {string} A single HTML string representing the entire battle log.
 */
export function transformEventsToHtmlLog(structuredEvents) {
    if (!structuredEvents || !Array.isArray(structuredEvents)) {
        console.error("Battle Log Transformer: Invalid structuredEvents input for HTML log", structuredEvents);
        return "<p>Error: Battle log data is corrupted.</p>";
    }
    // This function will essentially reconstruct the old way the log was built.
    // It will iterate through the structuredEvents and append the pre-formatted HTML parts.
    // This assumes engine_battle-engine-core.js passes through HTML blobs in the event objects.
    let htmlLog = "";
    structuredEvents.forEach(event => {
        if (event.html_content && typeof event.html_content === 'string') {
            htmlLog += event.html_content;
        }
        // If events are more structured (not just HTML blobs), this part would need
        // to call narrative engine functions to format them into HTML here.
        // For now, we assume the `structuredEvents` passed to this for "instant" mode
        // will contain `html_content` fields that are the direct HTML segments.
    });
    return htmlLog || "<p>The battle unfolds...</p>"; // Fallback if empty
}


/**
 * Placeholder: Extracts meaningful text from an HTML blob.
 * A more robust parser would be needed for complex HTML.
 * @param {string} htmlString - The HTML content.
 * @returns {string} Extracted text.
 */
function extractTextFromHtml(htmlString) {
    if (!htmlString) return "";
    try {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString;
        // Prioritize specific elements if known, otherwise, join all text
        const moveNameEl = tempDiv.querySelector('.move-name');
        const winnerNameEl = tempDiv.querySelector('.winner-name');
        const finalBlowEl = tempDiv.querySelector('.final-blow'); // For one-liners
        const conclusionEl = tempDiv.querySelector('.conclusion'); // For one-liners

        if (finalBlowEl) return finalBlowEl.textContent.trim();
        if (conclusionEl) return conclusionEl.textContent.trim();
        if (winnerNameEl && moveNameEl) return `${winnerNameEl.textContent.trim()} used ${moveNameEl.textContent.trim()}`;
        if (winnerNameEl) return winnerNameEl.textContent.trim(); // For winner announcements
        
        return tempDiv.textContent.replace(/\s+/g, ' ').trim() || "Narrative Event";
    } catch (e) {
        console.warn("Could not parse HTML for text extraction:", htmlString, e);
        return "Narrative Event"; // Fallback
    }
}

/**
 * Placeholder: Attempts to parse an HTML blob from engine_narrative-engine into distinct lines for animation.
 * This is a SIMPLISTIC parser. A real implementation might need more robust HTML parsing
 * or ideally, the engine should provide more structured data than full HTML blobs.
 * @param {string} htmlBlob - The HTML string for a turn's narration.
 * @returns {Array<object>} Array of objects like { text, actorId, moveType, impactLevel, isMoveAction, isDialogue }
 */
function splitHtmlBlobToLines(htmlBlob) {
    if (!htmlBlob) return [{ text: "...", impactLevel: 'low', isMoveAction: false }];

    const lines = [];
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlBlob;

    // Attempt to find distinct narrative blocks and move lines
    tempDiv.querySelectorAll('.narrative-block p, .move-line, .move-description, .collateral-damage-description, .environmental-summary p').forEach(el => {
        let text = el.textContent.replace(/\s+/g, ' ').trim();
        if (!text) return;

        let actorId = null;
        let moveType = null;
        let moveName = null;
        let effectivenessLabel = null;
        let isMoveAction = el.classList.contains('move-line') || el.classList.contains('move-description');
        let isDialogue = el.classList.contains('narrative-spoken') || el.classList.contains('narrative-internal');
        let isEnvironmental = el.classList.contains('collateral-damage-description') || el.classList.contains('environmental-summary');

        if (isMoveAction) {
            const actorEl = el.querySelector('.move-actor .char-*'); // General class for actor
            if (actorEl) {
                 // Extract ID from class like "char-sokka"
                const classList = Array.from(actorEl.classList);
                const charClass = classList.find(c => c.startsWith('char-'));
                if (charClass) actorId = charClass.substring(5);
            }
            const moveNameEl = el.querySelector('.move-name');
            if (moveNameEl) moveName = moveNameEl.textContent.trim();

            const effectivenessEl = el.querySelector('.move-effectiveness');
            if (effectivenessEl) effectivenessLabel = effectivenessEl.textContent.trim().split(' ')[0]; // "Strong (🔥)" -> "Strong"

            // Try to infer moveType from character data if possible, or use a generic one
             if (actorId && moveName && characters[actorId]) {
                const moveData = characters[actorId].techniques.find(t => t.name === moveName);
                if (moveData) moveType = moveData.element || moveData.type;
            }
        } else if (isDialogue) {
            // For dialogue, the actor is usually clear from context or specific class
            const dialogueActorEl = el.closest('.narrative-block')?.querySelector('.char-*') || el.querySelector('.char-*');
             if (dialogueActorEl) {
                const classList = Array.from(dialogueActorEl.classList);
                const charClass = classList.find(c => c.startsWith('char-'));
                if (charClass) actorId = charClass.substring(5);
            }
        }
        
        lines.push({
            text: text,
            actorId: actorId,
            moveType: moveType,
            moveName: moveName,
            effectivenessLabel: effectivenessLabel,
            impactLevel: determineImpactLevel(effectivenessLabel, moveType),
            isMoveAction: isMoveAction,
            isDialogue: isDialogue,
            isEnvironmental: isEnvironmental
        });
    });
    
    if (lines.length === 0 && htmlBlob.trim() !== "") { // Fallback for unparsed blobs
        lines.push({ text: extractTextFromHtml(htmlBlob) || "...", impactLevel: 'low', isMoveAction: false });
    }
    
    return lines.length > 0 ? lines : [{ text: "...", impactLevel: 'low', isMoveAction: false }];
}


/**
 * Determines an impact level string based on move effectiveness and type.
 * @param {string} effectivenessLabel - e.g., "Strong", "Weak".
 * @param {string} moveType - e.g., "Offense", "Finisher".
 * @returns {string} 'low', 'medium', 'high', 'critical'.
 */
function determineImpactLevel(effectivenessLabel, moveType) {
    if (!effectivenessLabel) return 'low';
    switch (effectivenessLabel.toLowerCase()) {
        case 'critical': return 'critical';
        case 'strong': return 'high';
        case 'normal': return moveType === 'Finisher' ? 'high' : 'medium';
        case 'weak': return 'low';
        default: return 'low';
    }
}