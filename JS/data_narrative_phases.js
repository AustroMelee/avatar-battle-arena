// FILE: data_narrative_phases.js
'use strict';

// Defines battle phases and their associated HTML templates.

export const battlePhases = [
    { name: "Opening Exchanges", emoji: "⚔️", key: "Early" },
    { name: "Escalating Conflict", emoji: "🔥", key: "Mid" },
    { name: "Decisive Confrontation", emoji: "💥", key: "Late" }
];

export const phaseTemplates = {
    phaseWrapper: `<div class="battle-phase" data-phase="{phaseKey}">{phaseContent}</div>`,
    header: `<h4 class="phase-header">{phaseDisplayName} {phaseEmoji}</h4>`,
    move: `
        <div class="move-line">
            <div class="move-actor">
                <span class="char-{actorId}">{actorName}</span> used <span class="move-name">{moveName}</span> ({moveEmoji})
            </div>
            <div class="move-effectiveness {effectivenessLabel}">
                {effectivenessLabel} ({effectivenessEmoji})
            </div>
        </div>
        {moveDescription}
        {collateralDamageDescription}
    `,
    finalBlow: `<div class="final-blow-header">Final Blow 💥</div><p class="final-blow">{winnerName} lands the finishing blow, defeating {loserName}!</p>`,
    timeOutVictory: `<p class="final-blow">The battle timer expires! With more health remaining, {winnerName} is declared the victor over {loserName}!</p>`,
    drawResult: `<p class="final-blow">The battle timer expires! Both fighters are equally matched, their strength and will pushed to the absolute limit. The result is a DRAW!</p>`,
    stalemateResult: `<p class="final-blow">Neither fighter can break the deadlock. The intense confrontation ends in a STALEMATE, both combatants exhausted but unbroken!</p>`,
    conclusion: `<p class="conclusion">{endingNarration}</p>`,
    environmentalImpactHeader: `<h5 class="environmental-impact-header">Environmental Impact 🌍</h5>`,
    escalationStateChangeTemplates: {
        general: `<p class="narrative-escalation char-{actorId}">{escalationFlavorText}</p>`,
        pressured: `<p class="narrative-escalation highlight-pressured char-{actorId}">{actorName} is now <strong>Pressured</strong>! {escalationFlavorText}</p>`,
        severely_incapacitated: `<p class="narrative-escalation highlight-severe char-{actorId}">{actorName} is <strong>Severely Incapacitated</strong>! {escalationFlavorText}</p>`,
        terminal_collapse: `<p class="narrative-escalation highlight-terminal char-{actorId}">{actorName} has reached <strong>Terminal Collapse</strong>! {escalationFlavorText}</p>`,
        reverted_to_normal: `<p class="narrative-escalation highlight-neutral char-{actorId}">The immediate crisis defers. {actorName} returns to a <strong>Normal</strong> combat state, but the tension remains.</p>`
    }
};