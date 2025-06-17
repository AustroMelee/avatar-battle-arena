'use strict';

import { getRandomElement } from './utils_clipboard.js'; // Assuming this utility exists or will be created

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
            processedText = processedText.replace(/\${envKeyword}/g, getRandomElement(this.environment.tags || ['area']) || 'the area');
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
                    if (v.tags.includes(NARRATIVE_TAGS.METAPHOR) && Math.random() < 0.2) { reasons.push('Random Metaphor Boost'); return true; } // Chance for metaphor
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
        const { candidates: candidateVariants, reasons: selectionReasons } = this._getFilteredVariants();

        if (candidateVariants.length > 0) {
            const selectedVariant = getRandomElement(candidateVariants);
            baseActionText = this._replacePlaceholders(selectedVariant.text);
            if (this.debugMode) {
                console.log(`[NarrativeBuilder] Selected variant: "${selectedVariant.text}" (Reasons: ${selectionReasons.join('; ')})`);
            }
        } else if (this.move.actionVariants && this.move.actionVariants.length > 0) {
            // This fallback block is technically redundant if _getFilteredVariants handles ultimate fallback correctly,
            // but it's kept for robustness in case _getFilteredVariants returns an empty array for some edge case.
            const selectedVariantText = getRandomElement(this.move.actionVariants.map(v => v.text || v));
            baseActionText = this._replacePlaceholders(selectedVariantText);
            if (this.debugMode) {
                console.log(`[NarrativeBuilder] Fallback to raw actionVariants. Selected: "${selectedVariantText}"`);
            }
        } else {
            baseActionText = this._replacePlaceholders(this.move.name);
            if (this.debugMode) {
                console.log(`[NarrativeBuilder] Fallback to move name: "${this.move.name}"`);
            }
        }

        // Apply article correction if necessary. This assumes baseActionText is a noun phrase.
        // We'll apply this more intelligently if the baseActionText starts with a noun phrase
        // which would typically require an article.
        // For now, let's assume we want to prepend an article if it doesn't already have one
        // and it looks like a phrase that needs one.
        const startsWithArticleRegex = /^(a|an|the)\\s/i;
        if (!startsWithArticleRegex.test(baseActionText) && 
            (baseActionText.includes(' ') || !baseActionText.startsWith('of') && !baseActionText.startsWith('with')) && // Heuristic: if it's a phrase or not a prepositional phrase
            !this.move.isVerbPhrase) { // New property on move to indicate if it's already a verb phrase like 'repositions for tactical advantage'
            baseActionText = this.addArticle(baseActionText);
        }

        // Construct the full action description including actor and move
        const actionPhrase = `${this.actor.name} ${this.move.isVerbPhrase ? baseActionText : 'executes ' + baseActionText}`;

        let effectivenessPhraseText = "";
        let effectivenessPhraseHtml = "";

        if (effectiveness !== 'Normal' && effectiveness !== 'Ineffective') {
            const impactText = `hitting with ${effectiveness.toLowerCase()} impact`;
            const impactHtml = `hitting with <span class="effectiveness-label">${effectiveness.toLowerCase()}</span> impact`;

            if (effectivenessFlavor) {
                effectivenessPhraseText = `${effectivenessFlavor}, ${impactText}`;
                effectivenessPhraseHtml = `${effectivenessFlavor}, ${impactHtml}`;
            } else {
                effectivenessPhraseText = impactText;
                effectivenessPhraseHtml = impactHtml;
            }
        }

        // 2️⃣ Base sentence assembly (no HTML yet):
        let actionSentence = `${actionPhrase}${effectivenessPhraseText ? `, ${effectivenessPhraseText}` : ''}.`;

        // 3️⃣ HTML wrapping stage (safe & clean):
        let htmlSentence = `<p class="narrative-action char-${this.actor.id}">${actionPhrase}${effectivenessPhraseHtml ? `, <span class="${effectivenessColor}">${effectivenessPhraseHtml}</span>` : ''}.</p>`;

        return { actionSentence, htmlSentence };
    }
} 