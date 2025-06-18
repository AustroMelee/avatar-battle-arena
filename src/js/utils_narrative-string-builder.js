"use strict";

import { getRandomElementSeeded, seededRandom } from "./utils_seeded_random.js";
import { USE_DETERMINISTIC_RANDOM } from "./config_game.js";
import { executeFilterChain } from "./narrative/narrative_filter_registry.js";
import { EFFECTIVENESS_FLAVORS, ENVIRONMENTAL_NARRATIVES } from "./data_effectiveness-flavors.js";

// Centralized Tag/Context Registry (Fixed: now supports rich metadata)
const NARRATIVE_TAGS = {
    CRIT: "crit",
    MISS: "miss",
    HUMOR: "humor",
    METAPHOR: "metaphor",
    FINISHER: "finisher",
    COMEBACK: "comeback",
    DESPERATE: "desperate",
    EARLY_PHASE: "early_phase",
    MID_PHASE: "mid_phase",
    LATE_PHASE: "late_phase",
    AGGRESSIVE: "aggressive",
    DEFENSIVE: "defensive",
    SKILL: "skill",
    CONTROL: "control",
    AOE: "aoe",
    EVASIVE: "evasive",
    REPOSITION: "reposition",
    DECEPTIVE: "deceptive",
    TENSION: "tension",
    FAIL: "fail",
    DARK: "dark",
    STRONG_HIT: "strong_hit",
    BENDING_FLOURISH: "bending_flourish",
    ENVIRONMENT_INTERACTION: "environment_interaction",
    // Environmental tags (can be dynamically added based on location data)
    ICY: "icy",
    WATERY: "watery",
    DENSE: "dense",
    OPEN: "open",
    VERTICAL: "vertical",
    CRAMPED: "cramped",
    HAS_COVER: "has_cover",
    SACRED: "sacred"
};

// Rich narrative tag definitions for buildDescription method
const NARRATIVE_TAG_DEFINITIONS = [
    { name: "crit", description: "A critical strike that finds the perfect opening." },
    { name: "miss", description: "An attack that fails to connect." },
    { name: "humor", description: "A moment of levity in the heat of battle." },
    { name: "metaphor", description: "A poetic description of the action." },
    { name: "finisher", description: "A decisive blow meant to end the fight." },
    { name: "comeback", description: "A desperate attempt to turn the tide." },
    { name: "desperate", description: "An action born of desperation." },
    // Add more as needed
];

/**
 * @class NarrativeStringBuilder (Refactored v2.0)
 * @description A refactored narrative string builder using Chain of Responsibility and data-driven patterns.
 * Key improvements:
 * - Replaced giant _getFilteredVariants method with Chain of Responsibility pattern
 * - Made effectiveness flavors and environmental narratives data-driven
 * - Fixed NARRATIVE_TAGS data structure bug
 * - Improved placeholder replacement system
 * - Enhanced modularity and testability
 */
export class NarrativeStringBuilder {
    constructor(actor, target, move, effectivenessLevels, environment, turnContext, debugMode = false) {
        this.actor = actor; // Full actor object for personality, id, name
        this.target = target; // Full target object for name, etc.
        this.move = move;
        this.effectivenessLevels = effectivenessLevels;
        this.environment = environment; // Object with environment details (e.g., { id: 'glacier', tags: ['cold', 'icy'] })
        this.turnContext = turnContext; // Object with turn details (e.g., { isCrit: true, isMiss: false, lowHp: true, phase: 'LATE' })
        this.debugMode = debugMode; // Debugging toggle

        if (this.debugMode) {
            console.log("[NarrativeBuilder] Initialized with:", {
                actor: this.actor?.name,
                target: this.target?.name,
                move: this.move?.name,
                environment: this.environment?.id,
                turnContext: this.turnContext
            });
        }
    }

    addArticle(word) {
        if (!word) return "";
        // Simple English rule for 'a'/'an'
        const vowels = ["a", "e", "i", "o", "u"];
        if (vowels.includes(word.toLowerCase()[0])) {
            return `an ${word}`;
        } else {
            return `a ${word}`;
        }
    }

    _replacePlaceholders(text) {
        // Data-driven placeholder replacement
        const placeholders = {
            // Actor placeholders
            actorName: this.actor?.name || "The Fighter",
            actorPronounS: this.actor?.pronouns?.s || "he",
            actorPronounO: this.actor?.pronouns?.o || "him",
            actorId: this.actor?.id || "unknown-actor",
            actorElement: this.actor?.element || "energy",
            
            // Target placeholders
            targetName: this.target?.name || "The Opponent",
            targetPronounS: this.target?.pronouns?.s || "he",
            targetPronounO: this.target?.pronouns?.o || "him",
            targetId: this.target?.id || "unknown-target",
            
            // Environment placeholders
            environmentName: this.environment?.name || "the surroundings",
            envKeyword: getRandomElementSeeded(this.environment?.tags || ["area"]) || "the area",
            
            // Move placeholders
            moveName: this.move?.name || "a move",
            moveElement: this.move?.element || "neutral"
        };
        
        // Replace all placeholders in a single pass
        let processedText = text;
        for (const [key, value] of Object.entries(placeholders)) {
            const regex = new RegExp(`\\$\\{${key}\\}`, "g");
            processedText = processedText.replace(regex, value);
        }
        
        return processedText;
    }

    _getFilteredVariants() {
        const allVariants = this.move.actionVariants || [];
        
        // Build context object for the filter chain
        const context = {
            actor: this.actor,
            target: this.target,
            move: this.move,
            environment: this.environment,
            turnContext: this.turnContext,
            NARRATIVE_TAGS
        };
        
        // Execute the Chain of Responsibility pattern
        const result = executeFilterChain(allVariants, context);
        
        if (this.debugMode) {
            console.log("[NarrativeBuilder] Filtered Variants Candidate Count:", result.candidates.length);
            console.log("[NarrativeBuilder] Reasons for selection pool:", result.reasons.join("; "));
        }
        
        return result;
    }

    buildActionDescription(effectiveness, effectivenessFlavor, effectivenessColor) {
        let baseActionText;
        let htmlSentence;
        const { candidates: candidateVariants, reasons: selectionReasons } = this._getFilteredVariants();

        if (candidateVariants.length > 0) {
            const selectedVariant = getRandomElementSeeded(candidateVariants);
            baseActionText = this._replacePlaceholders(selectedVariant.text);
            // Generate HTML with appropriate styling for character and move
            htmlSentence = `<p class="narrative-action char-${this.actor.id}">${baseActionText}</p>`;
            if (this.debugMode) {
                console.log("[NarrativeBuilder] Selected Variant:", selectedVariant);
            }
        } else if (this.move) {
            // Fallback for when no specific action variant is found
            baseActionText = `${this.actor.name} uses ${this.addArticle(this.move.name)}.`;
            htmlSentence = `<p class="narrative-action char-${this.actor.id}">${baseActionText}</p>`;
            if (this.debugMode) {
                console.log("[NarrativeBuilder] Fallback to move name as no suitable variants were found.");
            }
        } else {
            baseActionText = "An unknown action unfolds.";
            htmlSentence = `<p class="narrative-action">${baseActionText}</p>`;
            if (this.debugMode) {
                console.log("[NarrativeBuilder] No move data, using generic action text.");
            }
        }

        // Apply effectiveness flavor to both text and HTML versions
        const finalActionText = this._applyEffectivenessFlavor(baseActionText, effectiveness, effectivenessFlavor, effectivenessColor);
        // The HTML already includes the character class, just need to integrate the flavor
        const finalHtmlSentence = this._applyEffectivenessFlavor(htmlSentence, effectiveness, effectivenessFlavor, effectivenessColor);

        // Capitalize the first letter of the sentence
        return { actionSentence: finalActionText.charAt(0).toUpperCase() + finalActionText.slice(1), htmlSentence: finalHtmlSentence };
    }

    _applyEffectivenessFlavor(text, effectiveness, effectivenessFlavor, effectivenessColor) {
        if (!effectiveness) return text;

        let flavorText = "";
        if (effectivenessFlavor) {
            flavorText = effectivenessFlavor;
        } else {
            // Data-driven approach: look up flavor text from EFFECTIVENESS_FLAVORS
            const flavorOptions = EFFECTIVENESS_FLAVORS[effectiveness];
            if (flavorOptions && flavorOptions.length > 0) {
                flavorText = getRandomElementSeeded(flavorOptions);
            } else {
                flavorText = ""; // No specific flavor for this effectiveness type
            }
        }

        // Prepend color span if color is provided
        if (effectivenessColor) {
            return `<span style="color:${effectivenessColor};">${flavorText}</span>${text}`;
        }

        return flavorText + text;
    }

    buildEnvironmentalNarrative(eventType, details) {
        let narrative = "";
        
        // Data-driven approach: look up narrative template from ENVIRONMENTAL_NARRATIVES
        const narrativeData = ENVIRONMENTAL_NARRATIVES[eventType] || ENVIRONMENTAL_NARRATIVES["default"];
        
        switch (eventType) {
            case "activation":
                narrative = narrativeData.base(this.environment.name);
                if (details?.impacts?.length > 0) {
                    narrative += narrativeData.withImpacts(details.impacts);
                }
                break;
            case "damage": {
                const damagedEntities = details.entities.map(e => e.name).join(" and ");
                const damageFlavor = getRandomElementSeeded(narrativeData.flavors);
                narrative = damageFlavor(damagedEntities) + narrativeData.suffix(details.damageAmount);
                break;
            }
            case "change": {
                const changeFlavor = getRandomElementSeeded(narrativeData.flavors);
                narrative = changeFlavor(this.environment.name) + narrativeData.suffix(details.newState);
                break;
            }
            default:
                narrative = narrativeData.base();
        }
        return this._replacePlaceholders(narrative);
    }

    buildQuoteEvent(quoteText, speaker) {
        // Quotes are direct and don't use complex narrative logic, but still use placeholders.
        let formattedQuote = `"${quoteText}"`;
        if (speaker) {
            formattedQuote += ` - ${speaker}`; // Assuming speaker is a name string, not object
        }
        return this._replacePlaceholders(formattedQuote);
    }

    buildDescription(tags, context = {}) {
        const relevantTags = Array.isArray(tags) ? tags : [tags];
        const candidates = NARRATIVE_TAG_DEFINITIONS.filter(tag => relevantTags.includes(tag.name));

        if (candidates.length === 0) {
            return "A general event occurred.";
        }

        const selectedDescription = getRandomElementSeeded(candidates).description;
        return this._replacePlaceholders(selectedDescription);
    }
}