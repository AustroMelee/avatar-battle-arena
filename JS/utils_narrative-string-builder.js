'use strict';

export class NarrativeStringBuilder {
    constructor(actorId, actorName, moveVerb, moveObject, effectivenessLevels) {
        this.actorId = actorId;
        this.actorName = actorName;
        this.moveVerb = moveVerb;
        this.moveObject = moveObject;
        this.effectivenessLevels = effectivenessLevels;
    }

    buildActionDescription(effectiveness, effectivenessFlavor, effectivenessColor) {
        // 1️⃣ Raw data assembly (pure data stage): Effectiveness phrase
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

        // Base text for action and HTML
        const actionBaseText = `${this.actorName} ${this.moveVerb} ${this.moveObject}`;
        const htmlBaseText = `${this.actorName} ${this.moveVerb} ${this.moveObject}`;

        // 2️⃣ Base sentence assembly (no HTML yet):
        let actionSentence = `${actionBaseText}${effectivenessPhraseText ? `, ${effectivenessPhraseText}` : ''}.`;

        // 3️⃣ HTML wrapping stage (safe & clean):
        let htmlSentence = `<p class="narrative-action char-${this.actorId}">${htmlBaseText}${effectivenessPhraseHtml ? `, <span class="${effectivenessColor}">${effectivenessPhraseHtml}</span>` : ''}.</p>`;

        return { actionSentence, htmlSentence };
    }
} 