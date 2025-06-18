/**
 * @fileoverview Curbstomp Narrative Generator
 * @description Handles narrative for overwhelming victories and one-sided battles.
 * @version 1.0
 */

"use strict";

import { getRandomElementSeeded } from "../utils_seeded_random.js";
import { generateLogEvent } from "../utils_log_event.js";

/**
 * Generates curbstomp narration for overwhelming victories.
 * @param {Object} winner - The winning character
 * @param {Object} loser - The losing character
 * @param {Object} battleState - Current battle state
 * @returns {Object} Curbstomp narrative event
 */
export function generateCurbstompNarration(winner, loser, battleState) {
    const curbstompPhrases = [
        `${winner.name} completely overwhelms ${loser.name}!`,
        `${loser.name} is utterly outmatched by ${winner.name}'s superior power!`,
        `The battle is decided - ${winner.name} dominates ${loser.name} with ease!`,
        `${winner.name} makes it look effortless as ${loser.name} falls before their might!`
    ];
    
    const selectedPhrase = getRandomElementSeeded(curbstompPhrases);
    
    return generateLogEvent(battleState, {
        type: "curbstomp_narration_event",
        actorId: winner.id,
        characterName: winner.name,
        text: selectedPhrase,
        html_content: `<p class="curbstomp-narration char-${winner.id}">${selectedPhrase}</p>`,
        isMajorEvent: true
    });
} 