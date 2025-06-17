'use strict';

export class NarrativeStringBuilder {
    constructor(actorId, actorName, move, effectivenessLevels) {
        this.actorId = actorId;
        this.actorName = actorName;
        this.move = move;
        this.effectivenessLevels = effectivenessLevels;
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

    buildActionDescription(effectiveness, effectivenessFlavor, effectivenessColor) {
        // 1️⃣ Raw data assembly (pure data stage): Action description and Effectiveness phrase
        let baseActionText;
        if (this.move.actionVariants && this.move.actionVariants.length > 0) {
            baseActionText = getRandomElement(this.move.actionVariants); // Use action variants
        } else {
            baseActionText = this.move.name; // Fallback to move name
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
        const actionPhrase = `${this.actorName} ${this.move.isVerbPhrase ? baseActionText : 'executes ' + baseActionText}`;

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
        let htmlSentence = `<p class="narrative-action char-${this.actorId}">${actionPhrase}${effectivenessPhraseHtml ? `, <span class="${effectivenessColor}">${effectivenessPhraseHtml}</span>` : ''}.</p>`;

        return { actionSentence, htmlSentence };
    }
} 