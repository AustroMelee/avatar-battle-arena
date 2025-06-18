/**
 * @fileoverview Victory Narrative Generator
 * @description Handles final victory lines and battle conclusion narratives.
 * @version 1.0
 */

"use strict";

import { getRandomElementSeeded } from "../utils_seeded_random.js";
import { substituteTokens } from "./stringSubstitution.js";

const postBattleVictoryPhrases = {
    default: {
        dominant: ["{WinnerName} has defeated {LoserName}!"],
        narrow: ["{WinnerName} has narrowly defeated {LoserName}!"]
    }
};

/**
 * Generates the final victory line for the battle's conclusion.
 * @param {object} winner - The winning character object.
 * @param {object} loser - The losing character object.
 * @returns {string} The final victory narration.
 */
export function getFinalVictoryLine(winner, loser) {
    if (!winner || !loser) {
        console.error("getFinalVictoryLine called with invalid winner or loser.");
        return "The battle is over.";
    }

    const winnerStyle = winner.victoryStyle || "default";
    const phraseCategory = (winner.hp / winner.maxHp > 0.75) ? "dominant" : "narrow";

    const phrasePool = postBattleVictoryPhrases[winnerStyle]?.[phraseCategory] || postBattleVictoryPhrases.default[phraseCategory];
    const phraseTemplate = getRandomElementSeeded(phrasePool);

    return substituteTokens(phraseTemplate, winner, loser, { WinnerName: winner.name, LoserName: loser.name });
} 