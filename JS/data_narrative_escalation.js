// FILE: data_narrative_escalation.js
'use strict';

// Defines narrative phrases for escalation states.

export const escalationStateNarratives = {
    PRESSURED: [
        "The intensity of the fight is taking its toll on {actorName}!",
        "{actorName} is visibly struggling to keep up the pace.",
        "A grimace of effort shows on {actorName}'s face as the pressure mounts.",
        "Each exchange seems to drain {actorName} further."
    ],
    SEVERELY_INCAPACITATED: [
        "{actorName} is staggering, barely able to maintain {actor.p} guard!",
        "The onslaught has left {actorName} on the verge of collapse!",
        "It's a desperate struggle for survival now for {actorName}!",
        "One more solid hit might be all it takes to finish {actorName}."
    ],
    TERMINAL_COLLAPSE: [
        "{actorName} is on {actor.p} last legs, fighting purely on instinct!",
        "The light is fading from {actorName}'s eyes; defeat seems inevitable.",
        "Any moment now, {actorName} is going to fall!",
        "This is the end of the line for {actorName}; {actor.s} can barely stand."
    ],
    'azula': {
        PRESSURED: ["Azula's perfect facade shows the barest hint of a crack under the strain."],
        SEVERELY_INCAPACITATED: ["A flicker of genuine fear, quickly suppressed, crosses Azula's face as her control slips."],
        TERMINAL_COLLAPSE: ["Azula lets out a wild, desperate shriek, her blue fire becoming dangerously erratic!"]
    },
    'sokka': {
        PRESSURED: ["Sokka's usual stream of witty banter slows as he focuses on just staying in the fight."],
        SEVERELY_INCAPACITATED: ["'Just... a little... longer...' Sokka pants, his boomerang feeling impossibly heavy."],
        TERMINAL_COLLAPSE: ["Sokka's eyes glaze over, his brilliant plans lost in a haze of exhaustion and pain."]
    }
};