// FILE: data_narrative_outcomes.js
"use strict";

// Defines phrases for move outcomes (weak, normal, strong, critical) and finishing blows.

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
        ],
        REDIRECTED_SUCCESS: [
            "{actorName} catches the lightning, channeling its raw power through {actor.p} body!",
            "With incredible skill, {actorName} absorbs the lightning, redirecting its fury back at {targetName}!",
            "The lightning arcs harmlessly around {actorName} as {actor.s} sends it surging towards {targetName}, who is now stunned by the redirected blast!"
        ],
        REDIRECTED_FAIL: [
            "{actorName} struggles to control the lightning, {actor.p} body convulsing as some of its power courses through {actor.o}!",
            "The redirection attempt falters! {actorName} is struck by a portion of the lightning, staggering from the impact!",
            "Though {actorName} tries to divert it, the lightning proves too powerful, searing {actor.o} despite the effort."
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