/**
 * @fileoverview Avatar Battle Arena - Character-Based Narrative Filters
 * @description Character-focused filtering strategies (personality, situational) for narrative variant selection.
 * These filters prioritize variants based on character traits and special battle situations.
 * @version 1.0
 */

"use strict";

import { seededRandom } from "../utils_seeded_random.js";
import { USE_DETERMINISTIC_RANDOM } from "../config_game.js";

/**
 * Filter for personality-based matches.
 * Matches variants that trigger on character personality traits.
 */
export function personalityFilter(variants, context, reasons) {
    const { actor } = context;
    
    const matches = variants.filter(v => {
        if (v.personalityTriggers && actor?.personalityProfile) {
            for (const trait in v.personalityTriggers) {
                if (actor.personalityProfile[trait] >= v.personalityTriggers[trait]) {
                    reasons.push(`Personality: ${trait} > ${v.personalityTriggers[trait]}`);
                    return true;
                }
            }
        }
        return false;
    });
    
    return matches.length > 0 ? matches : null;
}

/**
 * Filter for special situational matches.
 * Handles finisher attempts, comeback situations, and random metaphors.
 */
export function situationalFilter(variants, context, reasons) {
    const { turnContext, NARRATIVE_TAGS } = context;
    
    const matches = variants.filter(v => {
        if (v.tags) {
            if (v.tags.includes(NARRATIVE_TAGS.FINISHER) && turnContext?.isFinisherAttempt) {
                reasons.push("Finisher Intent");
                return true;
            }
            if (v.tags.includes(NARRATIVE_TAGS.COMEBACK) && turnContext?.isComebackSituation) {
                reasons.push("Comeback Situation");
                return true;
            }
            if (v.tags.includes(NARRATIVE_TAGS.METAPHOR) && (USE_DETERMINISTIC_RANDOM ? seededRandom() : Math.random()) < 0.2) {
                reasons.push("Random Metaphor Boost");
                return true;
            }
        }
        return false;
    });
    
    return matches.length > 0 ? matches : null;
} 