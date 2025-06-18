// FILE: data_narrative_introductions.js
"use strict";

// Defines introductory phrases and adverbs for narrative generation.

export const narrativeStatePhrases = {
    energy_depletion: ["Nearing exhaustion,", "Digging deep for energy,", "Visibly tiring,", "Summoning {actor.p} last reserves,", "Struggling to stand,", "Gasping for breath,", "Pushing through the pain,", "Running on fumes,", "Their movements becoming sluggish,"],
    momentum_gain: ["Building on the prior momentum,", "Pressing the advantage,", "Sensing weakness,", "With {opponent.p} on the back foot,", "Channeling their focus,", "With unshakable resolve,", "Seizing control of the fight,", "Finding a rhythm,", "Dominating the exchange,"],
    momentum_loss: ["Desperate to turn the tide,", "Trying to regain composure,", "Forced onto the defensive,", "Struggling to find an answer,", "In a daring gambit,", "In a bold maneuver,", "Scrambling for a response,", "Knocked off balance,", "Struggling to keep up,"]
};

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
    Generic: [
        "With calculated precision,", "Calmly, and with focus,", "Finding a perfect opening,", "Effortlessly,",
        "With an air of supreme confidence,", "Taking the offensive,", "Without hesitation,", "With a quick movement,"
    ],
    EscalationFinisher: [
        "Sensing the end is near for {opponentName},",
        "Moving in for the final blow against the weakened {opponentName},",
        "With {opponentName} on the ropes and clearly overwhelmed,",
        "{actorName} is determined to finish it now!",
        "Unleashing all remaining power for the decisive strike against {opponentName},"
    ]
};

export const adverbPool = {
    offensive: [
        "with relentless precision", "in a swift blur", "with unyielding force", "with deadly accuracy",
        "with ferocious intensity", "in a calculated strike", "with overwhelming power", "with unerring focus",
        "with devastating speed", "in a relentless assault", "with pinpoint accuracy", "in a fierce onslaught",
        "with blazing speed", "in a masterful flourish", "with unshakable resolve", "with decisive force",
        "with methodical grace", "in a sudden burst of power", "without a moment of hesitation", "in a perfectly timed maneuver",
        "with brutal efficiency", "in a show of absolute dominance", "with terrifying speed"
    ],
    defensive: ["with calculated timing", "in a deft maneuver", "with steady resolve", "in a display of flawless technique", "with impeccable form"],
};