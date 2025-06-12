// FILE: narrative-v2.js
'use strict';

// ====================================================================================
//  Narrative Engine Library (v3 - Brute Force Expansion)
// ====================================================================================
//  This library provides all text-based content for battle narration.
//  All pools have been significantly expanded to maximize narrative variety and
//  prevent repetition, even in prolonged or repeated battles.
// ====================================================================================

export const battlePhases = [
    { name: "Opening Clash", emoji: "⚔️" },
    { name: "Momentum Shift", emoji: "🔄" },
    { name: "Counterplay", emoji: "🔃" },
    { name: "Terrain Interaction", emoji: "🌍" },
    { name: "Climactic Exchange", emoji: "💥" },
    { name: "Finishing Move", emoji: "🏁" }
];

export const effectivenessLevels = {
    WEAK: { label: "Weak", emoji: "💤" },
    NORMAL: { label: "Normal", emoji: "⚔️" },
    STRONG: { label: "Strong", emoji: "🔥" },
    CRITICAL: { label: "Critical", emoji: "💥" }
};

export const phaseTemplates = {
    phaseWrapper: `<div class="battle-phase" data-phase="{phaseName}">{phaseContent}</div>`,
    header: `<h4 class="phase-header">{phaseName} {phaseEmoji}</h4>`,
    move: `
        <div class="move-line">
            <div class="move-actor">
                <span class="char-{actorId}">{actorName}</span> used <span class="move-name">{moveName}</span> ({moveEmoji})
            </div>
            <div class="move-effectiveness {effectivenessLabel}">
                {effectivenessLabel} ({effectivenessEmoji})
            </div>
        </div>
        <p class="move-description">{moveDescription}</p>
    `,
    finalBlow: `<div class="final-blow-header">Final Blow 💥</div><p class="final-blow">{winnerName} lands the finishing blow, defeating {loserName}!</p>`,
    timeOutVictory: `<p class="final-blow">The battle timer expires! With more health remaining, {winnerName} is declared the victor over {loserName}!</p>`,
    conclusion: `<p class="conclusion">{endingNarration}</p>`
};

export const narrativeStatePhrases = {
    energy_depletion: ["Nearing exhaustion,", "Digging deep for energy,", "Visibly tiring,", "Summoning {possessive} last reserves,", "Struggling to stand,", "Gasping for breath,", "Pushing through the pain,", "Running on fumes,", "Their movements becoming sluggish,"],
    momentum_gain: ["Building on the prior momentum,", "Pressing the advantage,", "Sensing weakness,", "With {possessive} opponent on the back foot,", "Channeling their focus,", "With unshakable resolve,", "Seizing control of the fight,", "Finding a rhythm,", "Dominating the exchange,"],
    momentum_loss: ["Desperate to turn the tide,", "Trying to regain composure,", "Forced onto the defensive,", "Struggling to find an answer,", "In a daring gambit,", "In a bold maneuver,", "Scrambling for a response,", "Knocked off balance,", "Struggling to keep up,"]
};

export const introductoryPhrases = [
    "With calculated precision,", "Calmly, and with focus,", "Finding a perfect opening,", "Effortlessly,", 
    "With an air of supreme confidence,", "Taking the offensive,", "With a ferocious cry,", "Deciding to end this quickly,",
    "Lunging forward,", "Responding in kind,", "Seizing the opportunity,", "Countering the last move,", "Not missing a beat,",
    "Pivoting smoothly,", "Without hesitation,", "With a quick movement,", "Looking for an opening,", "Switching tactics,",
    "Testing the opponent's defenses,", "With calculated poise,", "Channeling inner strength,", "With steely determination,",
    "Anticipating the attack,", "Exploiting a momentary gap,", "With a sudden burst of energy,", "Closing the distance,",
    "Creating an opportunity,", "In a flash of inspiration,", "Trusting their instincts,", "With a battle-hardened glare,"
];

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
    "and the opportunity is wasted.", "but {targetName} easily shrugs it off.", "exposing {possessive} flank.",
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
            "The armor forms perfectly, ready for the next assault.", "A formidable barrier now surrounds {actorName}, daring the opponent to attack.", "{actorName} prepares {possessive} defense, anticipating the next move.",
            "A solid defense is established, challenging any approach.", "The strategic position makes {actorName} a difficult target.", "The field is reshaped to {actorName}'s advantage.",
            "{actorName} creates an obstacle, controlling the battlefield.", "The defensive posture is flawless.", "The battlefield shifts to favor {actorName}.", "{actorName} takes a commanding defensive position.",
            "A tactical maneuver shifts the battlefield's layout.", "The area is fortified, giving {actorName} a distinct advantage."
        ]
    }
};

export const postBattleVictoryPhrases = {
    default: {
        dominant: "{WinnerName} stood victorious over {LoserName}, the battle concluded.",
        narrow: "{WinnerName} stood breathing heavily, the hard-fought victory against {LoserName} finally secured."
    },
    // Bender Archetypes
    Ruthless: { // Azula
        dominant: "{WinnerName}'s blue flames flickered, leaving no doubt about {WinnerPronounP} cold, efficient triumph over {LoserName}.",
        narrow: "Even in a close-fought battle, {WinnerName}'s ruthless precision was the deciding factor against {LoserName}."
    },
    Supreme: { // Ozai
        dominant: "{WinnerName} stood radiating immense power, {WinnerPronounP} victory a declaration of {WinnerPronounP} absolute dominion over {LoserName}.",
        narrow: "Though the battle was intense, {WinnerName}'s superior power ultimately crushed {LoserName}'s hopes."
    },
    Fierce: { // Katara
        dominant: "{WinnerName}'s eyes burned with intensity. {WinnerPronounP} victory over {LoserName} was a testament to {WinnerPronounP} fierce spirit.",
        narrow: "Pushed to the brink, {WinnerName}'s fierce determination proved to be the key in overcoming {LoserName}."
    },
    Cocky: { // Toph
        dominant: "{WinnerName} brushed a fleck of dust from {WinnerPronounP} shoulder with a smirk, {WinnerPronounP} victory over {LoserName} a foregone conclusion.",
        narrow: "'That was almost a challenge,' {WinnerName} quipped, despite the close call against {LoserName}."
    },
    Madcap: { // Sokka, Bumi
        dominant: "{WinnerName} celebrated with a flourish, {WinnerPronounP} victory over {LoserName} a mix of genius and goofiness.",
        narrow: "Against all odds, {WinnerName}'s unconventional tactics secured a narrow victory over {LoserName}."
    },
    Determined: { // Zuko
        dominant: "{WinnerName} radiated quiet power, {WinnerPronounP} victory over {LoserName} a hard-earned step on {WinnerPronounP} path.",
        narrow: "Breathing heavily, {WinnerName} stood over {LoserName}. The fight was close, but {WinnerPronounP} resolve never wavered."
    },
    Wise_Reluctant: { // Jeong Jeong
        dominant: "A somber expression crossed {WinnerName}'s face. {WinnerPronounP} victory over {LoserName} was a necessary, but regrettable, display of power.",
        narrow: "{WinnerName} looked upon the defeated {LoserName}, the cost of the hard-fought victory weighing heavily on {WinnerPronounP} mind."
    },
    Disciplined: { // Pakku
        dominant: "{WinnerName} gave a curt nod. The victory over {LoserName} was a simple matter of superior technique and discipline.",
        narrow: "Though tested by {LoserName}, {WinnerName}'s flawless form and rigid discipline ultimately carried the day."
    },
    Pacifist: { // Aang
        dominant: "{WinnerName} landed softly, a concerned look on {WinnerPronounP} face despite having decisively defeated {LoserName}.",
        narrow: "With a sigh of relief, {WinnerName} secured the victory over {LoserName}, thankful the conflict hadn't escalated further."
    },
    // Non-Bender Archetypes
    Deadpan: { // Mai
        dominant: "{WinnerName} merely blinked, {WinnerPronounP} victory as precise and unemotional as {WinnerPronounP} throws against {LoserName}.",
        narrow: "With an unflappable expression, {WinnerName} confirmed the end of the duel with {LoserName}."
    },
    Playful: { // Ty Lee
        dominant: "With a cheerful giggle, {WinnerName} cartwheeled away from the defeated {LoserName}, {WinnerPronounP} work clearly done.",
        narrow: "'Ooh, you almost had me!' {WinnerName} chirped, though {WinnerPronounP} narrow victory over {LoserName} suggested a genuine struggle."
    }
};