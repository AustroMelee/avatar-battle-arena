'use strict';

export const battleBeats = {
    opening: [
        "{initiatorName} opened aggressively, {initiator_verb_ing} {initiator_object_phrase}.",
        "The battle began as {initiatorName} {initiator_verb_past} {initiator_object_phrase}, forcing {responderName} to react immediately.",
        "Without hesitation, {initiatorName} went on the offensive with {initiator_object_phrase}."
    ],
    advantage_attack: [
        "Sensing a momentum shift, {initiatorName} pressed the advantage, unleashing {initiator_object_phrase}.",
        "Dominating the flow, {initiatorName} calmly countered, using {initiator_object_phrase} to deny {responderName}'s approach.",
        "With momentum on {initiatorPronounP} side, {initiatorName} drove {responderName} back with another powerful attack."
    ],
    disadvantage_attack: [
        "{responderName} responded with a disciplined {responder_object_phrase}, but {initiatorName} rode the sudden updraft, evading cleanly.",
        "{initiatorName}'s counterattack was swiftly deflected by {responderName}.",
        "An attempt by {initiatorName} to turn the tide was answered by {responderName}, who neutralized the threat with a well-timed {responder_object_phrase}."
    ],
    terrain_interaction: [
        "Using the {locationFeature} to {initiatorPronounP} advantage, {initiatorName} unleashed {initiator_object_phrase}, driving {responderName} toward the treacherous {locationTerrain}.",
        "The {locationTerrain} became a weapon for {initiatorName}. {initiatorPronounSCap} {initiator_verb_past} {initiator_object_phrase}, and {responderName} had to adapt quickly or be overwhelmed."
    ],
    finishing_move: [
        "{winnerFinisherDescription}",
        "{winnerFinisherDescription}",
        "{winnerFinisherDescription}"
    ]
};