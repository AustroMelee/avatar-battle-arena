'use strict';

import { getRandomElementSeeded, seededRandom } from './utils_seeded_random.js';
import { USE_DETERMINISTIC_RANDOM } from './config_game.js';

// Centralized Tag/Context Registry
const NARRATIVE_TAGS = {
    CRIT: 'crit',
    MISS: 'miss',
    HUMOR: 'humor',
    METAPHOR: 'metaphor',
    FINISHER: 'finisher',
    COMEBACK: 'comeback',
    DESPERATE: 'desperate',
    EARLY_PHASE: 'early_phase',
    MID_PHASE: 'mid_phase',
    LATE_PHASE: 'late_phase',
    AGGRESSIVE: 'aggressive',
    DEFENSIVE: 'defensive',
    SKILL: 'skill',
    CONTROL: 'control',
    AOE: 'aoe',
    EVASIVE: 'evasive',
    REPOSITION: 'reposition',
    DECEPTIVE: 'deceptive',
    TENSION: 'tension',
    FAIL: 'fail',
    DARK: 'dark',
    STRONG_HIT: 'strong_hit',
    BENDING_FLOURISH: 'bending_flourish',
    ENVIRONMENT_INTERACTION: 'environment_interaction',
    // Environmental tags (can be dynamically added based on location data)
    ICY: 'icy',
    WATERY: 'watery',
    DENSE: 'dense',
    OPEN: 'open',
    VERTICAL: 'vertical',
    CRAMPED: 'cramped',
    HAS_COVER: 'has_cover',
    SACRED: 'sacred'
};

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
        if (!word) return '';
        // Simple English rule for 'a'/'an'
        const vowels = ['a', 'e', 'i', 'o', 'u'];
        if (vowels.includes(word.toLowerCase()[0])) {
            return `an ${word}`;
        } else {
            return `a ${word}`;
        }
    }

    _replacePlaceholders(text) {
        let processedText = text;
        if (this.actor) {
            processedText = processedText.replace(/\${actorName}/g, this.actor.name || 'The Fighter');
            processedText = processedText.replace(/\${actorPronounS}/g, this.actor.pronouns?.s || 'he');
            processedText = processedText.replace(/\${actorPronounO}/g, this.actor.pronouns?.o || 'him');
            processedText = processedText.replace(/\${actorId}/g, this.actor.id || 'unknown-actor');
            processedText = processedText.replace(/\${actorElement}/g, this.actor.element || 'energy');
        }
        if (this.target) {
            processedText = processedText.replace(/\${targetName}/g, this.target.name || 'The Opponent');
            processedText = processedText.replace(/\${targetPronounS}/g, this.target.pronouns?.s || 'he');
            processedText = processedText.replace(/\${targetPronounO}/g, this.target.pronouns?.o || 'him');
            processedText = processedText.replace(/\${targetId}/g, this.target.id || 'unknown-target');
        }
        if (this.environment) {
            processedText = processedText.replace(/\${environmentName}/g, this.environment.name || 'the surroundings');
            processedText = processedText.replace(/\${envKeyword}/g, getRandomElementSeeded(this.environment.tags || ['area']) || 'the area');
        }
        if (this.move) {
            processedText = processedText.replace(/\${moveName}/g, this.move.name || 'a move');
            processedText = processedText.replace(/\${moveElement}/g, this.move.element || 'neutral');
        }
        return processedText;
    }

    _getFilteredVariants() {
        const allVariants = this.move.actionVariants || [];
        const reasons = [];

        // Fail-Fast Check
        if (!Array.isArray(allVariants) || (allVariants.length > 0 && typeof allVariants[0]?.text !== 'string')) {
            throw new Error("Malformed actionVariants structure for move: " + (this.move.name || 'Unknown Move') + ". Expected array of objects with 'text' property.");
        }

        let primeCandidates = [];

        // --- Phase 1: Strict Context Tags (Crit, Miss, Humor, etc.) --- 
        // Prioritize these tags first for direct matches
        const strictContextTags = [];
        if (this.turnContext?.isCrit) strictContextTags.push(NARRATIVE_TAGS.CRIT);
        if (this.turnContext?.isMiss) strictContextTags.push(NARRATIVE_TAGS.MISS);
        if (this.turnContext?.humorTrigger) strictContextTags.push(NARRATIVE_TAGS.HUMOR);
        if (this.turnContext?.lowHp) strictContextTags.push(NARRATIVE_TAGS.DESPERATE);

        if (strictContextTags.length > 0) {
            const strictMatches = allVariants.filter(v =>
                v.tags && strictContextTags.every(tag => v.tags.includes(tag))
            );
            if (strictMatches.length > 0) {
                primeCandidates = strictMatches;
                reasons.push(`Strict context match: ${strictContextTags.join(', ')}`);
            }
        }

        // --- Phase 2: Broader Context (Personality, Environment, Phase) --- 
        // If no strict matches, or to layer on top of strict matches, broaden the criteria.
        if (primeCandidates.length === 0) {
            primeCandidates = allVariants.filter(v => {
                // Personality triggers
                if (v.personalityTriggers && this.actor?.personalityProfile) {
                    for (const trait in v.personalityTriggers) {
                        if (this.actor.personalityProfile[trait] >= v.personalityTriggers[trait]) {
                            reasons.push(`Personality: ${trait} > ${v.personalityTriggers[trait]}`);
                            return true;
                        }
                    }
                }

                // Environmental tags
                if (v.environmentTags && this.environment?.tags) {
                    const commonTags = v.environmentTags.filter(tag => this.environment.tags.includes(tag));
                    if (commonTags.length > 0) {
                        reasons.push(`Environment: ${commonTags.join(', ')}`);
                        return true;
                    }
                }

                // Phase-based tags
                if (v.tags && this.turnContext?.phase) {
                    if (v.tags.includes(this.turnContext.phase.toLowerCase())) {
                        reasons.push(`Phase: ${this.turnContext.phase}`);
                        return true;
                    }
                }

                // General tags (e.g., finisher, comeback, aggressive, defensive, metaphor)
                if (v.tags) {
                    if (v.tags.includes(NARRATIVE_TAGS.FINISHER) && this.turnContext?.isFinisherAttempt) { reasons.push('Finisher Intent'); return true; }
                    if (v.tags.includes(NARRATIVE_TAGS.COMEBACK) && this.turnContext?.isComebackSituation) { reasons.push('Comeback Situation'); return true; }
                    if (v.tags.includes(NARRATIVE_TAGS.METAPHOR) && (USE_DETERMINISTIC_RANDOM ? seededRandom() : Math.random()) < 0.2) { reasons.push('Random Metaphor Boost'); return true; } // Chance for metaphor
                }

                return false; // Does not match any broad criteria
            });
        }

        // Fallback to variants that don't have specific tags or conditions
        if (primeCandidates.length === 0) {
            primeCandidates = allVariants.filter(v => !v.tags || v.tags.length === 0);
            if (primeCandidates.length > 0) { reasons.push("Fallback: Generic (no specific tags)"); }
        }

        // Final fallback: if nothing matched, use any available variant, even if it has tags that weren't selected for.
        if (primeCandidates.length === 0 && allVariants.length > 0) {
            primeCandidates = allVariants;
            reasons.push("Ultimate Fallback: Using any available variant.");
        } else if (primeCandidates.length === 0 && allVariants.length === 0) {
            // This case should ideally be caught by the fail-fast if move.actionVariants is truly empty.
            reasons.push("No variants available, falling back to move name.");
        }

        if (this.debugMode) {
            console.log("[NarrativeBuilder] Filtered Variants Candidate Count:", primeCandidates.length);
            console.log("[NarrativeBuilder] Reasons for selection pool:", reasons.join("; "));
        }

        return { candidates: primeCandidates, reasons };
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
            switch (effectiveness) {
                case 'super-effective':
                    flavorText = getRandomElementSeeded([
                        "It's super effective! ",
                        "A devastating blow! ",
                        "Unleashed with full force! "
                    ]);
                    break;
                case 'not-very-effective':
                    flavorText = getRandomElementSeeded([
                        "It's not very effective... ",
                        "A glancing blow. ",
                        "Barely makes a dent. "
                    ]);
                    break;
                case 'no-effect':
                    flavorText = getRandomElementSeeded([
                        "It has no effect. ",
                        "Completely shrugged off. ",
                        "A futile effort. "
                    ]);
                    break;
                case 'critical':
                    flavorText = getRandomElementSeeded([
                        "Critical hit! ",
                        "A precise strike! ",
                        "Exploiting a weakness! "
                    ]);
                    break;
                case 'miss':
                    flavorText = getRandomElementSeeded([
                        "It misses! ",
                        "A wild swing. ",
                        "Fails to connect. "
                    ]);
                    break;
                default:
                    flavorText = ""; // No specific flavor for default effectiveness
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
        switch (eventType) {
            case 'activation':
                narrative = `The environment of ${this.environment.name || 'the battlefield'} activates, influencing the combatants.`;
                if (details?.impacts?.length > 0) {
                    const impactDescriptions = details.impacts.map(impact => {
                        return `${impact.type} (${impact.magnitude})`;
                    });
                    narrative += ` Key impacts: ${impactDescriptions.join(', ')}.`;
                }
                break;
            case 'damage':
                const damagedEntities = details.entities.map(e => e.name).join(' and ');
                const damageFlavor = getRandomElementSeeded([
                    `The environment lashes out, affecting ${damagedEntities}.`,
                    `Environmental hazards impact ${damagedEntities}.`,
                    `${damagedEntities} contend with the treacherous surroundings.`
                ]);
                narrative = `${damageFlavor} (${details.damageAmount} damage).`;
                break;
            case 'change':
                const changeFlavor = getRandomElementSeeded([
                    `The ${this.environment.name} shifts, altering the dynamics of the fight.`, `The battlefield morphs, creating new challenges.`, `The environment responds to the escalating conflict.`]);
                narrative = `${changeFlavor} New state: ${details.newState}.`;
                break;
            default:
                narrative = `Something happens with the environment.`;
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
        const candidates = NARRATIVE_TAGS.filter(tag => relevantTags.includes(tag.name)); // Assuming NARRATIVE_TAGS is an array of objects

        if (candidates.length === 0) {
            return "A general event occurred.";
        }

        const selectedDescription = getRandomElementSeeded(candidates).description;
        return this._replacePlaceholders(selectedDescription);
    }
}