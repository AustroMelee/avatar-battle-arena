// FILE: js/narrative-v2.js
// ====================================================================================
//  Narrative Engine Library (v3.3 - Battle Phase Integration)
// ====================================================================================
//  - Updated `battlePhases` with more descriptive elements.
//  - `phaseTemplates.header` now includes phase name from `battlePhases`.
//  - Added concept of phase-specific generic phrases for narrative state.
// ====================================================================================

export const battlePhases = [
    { name: "Opening Exchanges", emoji: "⚔️", key: "Early" }, // Used for narrative files
    { name: "Escalating Conflict", emoji: "🔥", key: "Mid" },
    { name: "Decisive Confrontation", emoji: "💥", key: "Late" } // Max 3 defined phases, but engine allows fewer/more
];
// NOTE: The `key` property is for programmatic access if needed, while `name` is for display.
// The engine will handle up to 6 turns, so narrative will map to these broadly.

export const effectivenessLevels = {
    WEAK: { label: "Weak", emoji: "💤" },
    NORMAL: { label: "Normal", emoji: "⚔️" },
    STRONG: { label: "Strong", emoji: "🔥" },
    CRITICAL: { label: "Critical", emoji: "💥" }
};

export const phaseTemplates = {
    // The {phaseName} in header will now be dynamically pulled from battlePhases.
    phaseWrapper: `<div class="battle-phase" data-phase="{phaseKey}">{phaseContent}</div>`,
    header: `<h4 class="phase-header">{phaseDisplayName} {phaseEmoji}</h4>`, // {phaseDisplayName} and {phaseEmoji} will be populated
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
    // NEW: Stalemate result phrase
    stalemateResult: `<p class="final-blow">Neither fighter can break the deadlock. The intense confrontation ends in a STALEMATE, both combatants exhausted but unbroken!</p>`,
    conclusion: `<p class="conclusion">{endingNarration}</p>`,
    environmentalImpactHeader: `<h5 class="environmental-impact-header">Environmental Impact 🌍</h5>`
};

// Narrative State Phrases can be expanded with phase-specific versions
// Example: narrativeStatePhrases.momentum_gain.Early, narrativeStatePhrases.momentum_gain.Mid, etc.
// For now, these remain generic, but the structure allows for future phase-specific additions.
export const narrativeStatePhrases = {
    energy_depletion: ["Nearing exhaustion,", "Digging deep for energy,", "Visibly tiring,", "Summoning {actor.p} last reserves,", "Struggling to stand,", "Gasping for breath,", "Pushing through the pain,", "Running on fumes,", "Their movements becoming sluggish,"],
    momentum_gain: ["Building on the prior momentum,", "Pressing the advantage,", "Sensing weakness,", "With {opponent.p} on the back foot,", "Channeling their focus,", "With unshakable resolve,", "Seizing control of the fight,", "Finding a rhythm,", "Dominating the exchange,"],
    momentum_loss: ["Desperate to turn the tide,", "Trying to regain composure,", "Forced onto the defensive,", "Struggling to find an answer,", "In a daring gambit,", "In a bold maneuver,", "Scrambling for a response,", "Knocked off balance,", "Struggling to keep up,"]
};

// Introductory phrases can also be phase-specific if desired.
export const introductoryPhrases = {
    Early: [
        "Testing the opponent's defenses,", "With calculated poise,", "Looking for an opening,", "Switching tactics,",
        "With a cautious approach,", "Observing {opponentName}'s stance,"
    ],
    Mid: [
        "With a ferocious cry,", "Deciding to end this quickly,", "Lunging forward,", "Responding in kind,",
        "Seizing the opportunity,", "Countering the last move,", "Not missing a beat,", "Pivoting smoothly,",
        "With a sudden burst of energy,", "Closing the distance,", "Exploiting a momentary gap,"
    ],
    Late: [
        "With steely determination,", "Channeling inner strength,", "Trusting their instincts,", "With a battle-hardened glare,",
        "In a flash of inspiration,", "With nothing left to lose,", "In a final, desperate push,"
    ],
    Generic: [ // Fallback if phase-specific isn't defined or needed
        "With calculated precision,", "Calmly, and with focus,", "Finding a perfect opening,", "Effortlessly,",
        "With an air of supreme confidence,", "Taking the offensive,", "Without hesitation,", "With a quick movement,"
    ]
};


export const adverbPool = {
    offensive: [
        'with relentless precision', 'in a swift blur', 'with unyielding force', 'with deadly accuracy',
        'with ferocious intensity', 'in a calculated strike', 'with overwhelming power', 'with unerring focus',
        'with devastating speed', 'in a relentless assault', 'with pinpoint accuracy', 'in a fierce onslaught',
        'with blazing speed', 'in a masterful flourish', 'with unshakable resolve', 'with decisive force',
        'with methodical grace', 'in a sudden burst of power', 'without a moment of hesitation', 'in a perfectly timed maneuver',
        'with brutal efficiency', 'in a show of absolute dominance', 'with terrifying speed'
    ],
    defensive: ['with calculated timing', 'in a deft maneuver', 'with steady resolve', 'in a display of flawless technique', 'with impeccable form'],
};

export const weakMoveTransitions = [
    "leaving an opening.", "giving {targetName} a chance to recover.", "creating a chance for {targetName} to counter.",
    "but it barely makes an impact.", "exposing a critical flaw in the approach.", "allowing {targetName} to seize the initiative.",
    "leaving {targetName} completely unfazed.", "but the execution is clumsy.", "but it lacks the force to be effective.",
    "and the opportunity is wasted.", "but {targetName} easily shrugs it off.", "exposing {actor.p} flank.",
    "granting {targetName} the upper hand.", "leaving {actorName} open to retaliation.", "but it's a telling sign of fatigue."
];

export const finishingBlowPhrases = [
    "{targetName} crumbles under the decisive strike.", "{targetName} falls to the devastating blow.", "The final attack leaves {targetName} unable to continue.",
    "A perfect finishing move ends the battle decisively.", "The final, crushing blow lands, ending the fight.", "There is no getting up from a hit like that.",
    "The battle concludes with one final, overwhelming attack."
];

export const impactPhrases = {
    DEFAULT: {
        WEAK: [
            "but the attack glances off harmlessly.", "but {targetName} easily dodges it.", "but the technique lacks the power to connect meaningfully.",
            "but the strike is too slow to find its mark.", "but it's telegraphed, and {targetName} sidesteps.", "but the blow is absorbed with little effort.",
            "but it fails to penetrate {targetName}'s defense.", "but it's a weak and desperate attempt."
        ],
        NORMAL: [
            "The blow strikes {targetName} squarely.", "It forces {targetName} to brace for impact.", "A solid hit lands, and {targetName} stumbles.",
            "The attack connects, interrupting {targetName}'s rhythm.", "{targetName} reels from the precise strike.", "The move lands firmly, catching {targetName} off-guard.",
            "{targetName} struggles to recover from the hit.", "The strike catches {targetName} by surprise.", "A clean hit, forcing {targetName} back.",
            "{targetName} absorbs the blow, but it clearly hurts.", "{targetName} falters under the attack.", "The hit lands true.", "{targetName} grunts from the impact.",
            "A well-aimed strike finds its mark.", "The impact forces a gasp from {targetName}.", "It's a direct, solid connection.", "{targetName} is momentarily shaken.",
            "The blow disrupts {targetName}'s stance.", "A textbook hit.", "The attack lands as intended.", "A solid connection rocks {targetName}.", "{targetName} is forced to give ground."
        ],
        STRONG: [
            "A powerful blow sends {targetName} reeling!", "The attack smashes through {targetName}'s guard with ease.", "{targetName} staggers back, caught off-guard by the intensity.",
            "The impact is significant, leaving {targetName} momentarily stunned.", "{targetName} is rocked by the forceful strike.", "The blow overwhelms {targetName}'s defenses.",
            "A crushing impact! {targetName} struggles to stay standing.", "The fierce assault leaves {targetName} battered.", "{targetName} is thrown off balance by the powerful strike.",
            "The force of the attack is staggering.", "{targetName} buckles from the fierce blow.", "{targetName} is overwhelmed by the fierce assault.",
            "A devastating strike lands, cracking {targetName}'s defense.", "The sheer power of the move is breathtaking.", "{targetName}'s defense shatters under the force.",
            "The assault is brutal and effective.", "A heavy blow lands, leaving {targetName} dazed.", "The strike resonates with raw power.", "{targetName} cries out in pain from the forceful hit.",
            "The attack leaves a visible mark.", "An incredible display of power leaves {targetName} staggering.", "The guard is broken, and the hit connects with brutal force."
        ],
        CRITICAL: [
            "A devastating hit! {targetName} is overwhelmed completely.", "The technique is executed perfectly, leaving {targetName} staggered and vulnerable.", "An incredible strike! {targetName} is knocked to the ground.",
            "The decisive strike connects, leaving no room for recovery.", "A flawless attack! {targetName} has no answer.", "The hit is perfectly placed, causing maximum damage.", "A critical blow that changes the course of the battle."
        ]
    },
    DEFENSE: {
        REACTIVE: [
            "The defensive maneuver perfectly counters the incoming assault.", "The attack is negated completely by the well-timed defense.", "With a skillful move, the blow is parried effortlessly.",
            "{actorName} deftly neutralizes the attack.", "The assault is stopped dead in its tracks.", "The incoming blow is masterfully redirected.",
            "The attack is brushed aside with ease.", "The attempt is expertly intercepted.", "A flawless block negates all damage.", "{actorName} stands firm against the attack.",
            "The attack proves useless against {actorName}'s prepared defense.", "The assault is rendered ineffective by a brilliant defensive play."
        ],
        PROACTIVE: [
            "The armor forms perfectly, ready for the next assault.", "A formidable barrier now surrounds {actorName}, daring the opponent to attack.", "{actorName} prepares {actor.p} defense, anticipating the next move.",
            "A solid defense is established, challenging any approach.", "The strategic position makes {actorName} a difficult target.", "The field is reshaped to {actor.p} advantage.",
            "{actorName} creates an obstacle, controlling the battlefield.", "The defensive posture is flawless.", "The battlefield shifts to favor {actorName}.", "{actorName} takes a commanding defensive position.",
            "A tactical maneuver shifts the battlefield's layout.", "The area is fortified, giving {actorName} a distinct advantage."
        ]
    },
    REPOSITION: {
        WEAK: [
            "but the attempt to reposition falls short, leaving {actorName} vulnerable.",
            "but {actorName} stumbles, failing to gain the desired tactical edge.",
            "and it's a poor choice, leaving {actorName} slightly exposed.",
            "but a misstep leaves {actorName} less prepared than before."
        ],
        NORMAL: [
            "and {actorName} shifts position, gaining a slight advantage.",
            "and {actorName} finds a better angle, subtly improving their stance.",
            "resulting in a minor but effective repositioning.",
            "and {actorName} adjusts, preparing for the next exchange."
        ],
        STRONG: [
            "and {actorName} expertly maneuvers into a superior position!",
            "achieving a significant tactical advantage through skilled movement.",
            "leaving {targetName} struggling to keep up with the new angle of attack.",
            "A brilliant repositioning leaves {actorName} in prime striking range."
        ],
        CRITICAL: [
            "a flawless repositioning leaves {actorName} in an unassailable position!",
            "an incredible display of agility creates a massive tactical opening for {actorName}!",
            "leaving {targetName} completely outmaneuvered and exposed!",
            "The perfect repositioning sets up a devastating follow-up opportunity."
        ]
    }
};

export const collateralImpactPhrases = {
    NONE: [],
    LOW: [
        "A stray blast grazes the surrounding environment.",
        "The impact sends minor debris flying.",
        "A small section of the ground or a nearby structure is superficially damaged."
    ],
    MEDIUM: [
        "The area around them takes a significant hit, causing structural cracks.",
        "A part of the environment buckles under the force of the attack.",
        "The battle carves a noticeable mark into the surroundings."
    ],
    HIGH: [
        "Widespread destruction erupts as the attack unleashes its full force.",
        "The environment trembles and crumbles under the overwhelming power.",
        "A massive section of the battlefield is obliterated, changing the landscape dramatically."
    ],
    CATASTROPHIC: [
        "The attack tears through the environment, leaving a trail of utter devastation.",
        "The very fabric of the battlefield is ripped apart, a monument to unchecked power.",
        "Nothing remains standing as the raw force of the attack levels the surroundings."
    ]
};

export const postBattleVictoryPhrases = {
    default: {
        dominant: "{WinnerName} stood victorious over {LoserName}, the battle concluded.",
        narrow: "{WinnerName} stood breathing heavily, the hard-fought victory against {LoserName} finally secured."
    },
    Ruthless: {
        dominant: "{WinnerName}'s blue flames flickered, leaving no doubt about {WinnerPronounP} cold, efficient triumph over {LoserName}.",
        narrow: "Even in a close-fought battle, {WinnerName}'s ruthless precision was the deciding factor against {LoserName}."
    },
    Supreme: {
        dominant: "{WinnerName} stood radiating immense power, {WinnerPronounP} victory a declaration of {WinnerPronounP} absolute dominion over {LoserName}.",
        narrow: "Though the battle was intense, {WinnerName}'s superior power ultimately crushed {LoserName}'s hopes."
    },
    Fierce: {
        dominant: "{WinnerName}'s eyes burned with intensity. {WinnerPronounP} victory over {LoserName} was a testament to {WinnerPronounP} fierce spirit.",
        narrow: "Pushed to the brink, {WinnerName}'s fierce determination proved to be the key in overcoming {LoserName}."
    },
    Cocky: {
        dominant: "{WinnerName} brushed a fleck of dust from {WinnerPronounP} shoulder with a smirk, {WinnerPronounP} victory over {LoserName} a foregone conclusion.",
        narrow: "'That was almost a challenge,' {WinnerName} quipped, despite the close call against {LoserName}."
    },
    Madcap: {
        dominant: "{WinnerName} celebrated with a flourish, {WinnerPronounP} victory over {LoserName} a mix of genius and goofiness.",
        narrow: "Against all odds, {WinnerName}'s unconventional tactics secured a narrow victory over {LoserName}."
    },
    Determined: {
        dominant: "{WinnerName} radiated quiet power, {WinnerPronounP} victory over {LoserName} a hard-earned step on {WinnerPronounP} path.",
        narrow: "Breathing heavily, {WinnerName} stood over {LoserName}. The fight was close, but {WinnerPronounP} resolve never wavered."
    },
    Wise_Reluctant: {
        dominant: "A somber expression crossed {WinnerName}'s face. {WinnerPronounP} victory over {LoserName} was a necessary, but regrettable, display of power.",
        narrow: "{WinnerName} looked upon the defeated {LoserName}, the cost of the hard-fought victory weighing heavily on {WinnerPronounP} mind."
    },
    Disciplined: {
        dominant: "{WinnerName} gave a curt nod. The victory over {LoserName} was a simple matter of superior technique and discipline.",
        narrow: "Though tested by {LoserName}, {WinnerName}'s flawless form and rigid discipline ultimately carried the day."
    },
    Pacifist: {
        dominant: "{WinnerName} landed softly, a concerned look on {WinnerPronounP} face despite having decisively defeated {LoserName}.",
        narrow: "With a sigh of relief, {WinnerName} secured the victory over {LoserName}, thankful the conflict hadn't escalated further."
    },
    Deadpan: {
        dominant: "{WinnerName} merely blinked, {WinnerPronounP} victory as precise and unemotional as {WinnerPronounP} throws against {LoserName}.",
        narrow: "With an unflappable expression, {WinnerName} confirmed the end of the duel with {LoserName}."
    },
    Playful: {
        dominant: "With a cheerful giggle, {WinnerName} cartwheeled away from the defeated {LoserName}, {WinnerPronounP} work clearly done.",
        narrow: "'Ooh, you almost had me!' {WinnerName} chirped, though {WinnerPronounP} narrow victory over {LoserName} suggested a genuine struggle."
    }
};