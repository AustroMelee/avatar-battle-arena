'use strict';

export const battleBeats = {
    opening: [
        "{initiatorName} opened the fight, {initiator_verb_ing} {initiator_object_phrase} and forcing {responderName} onto the defensive.",
        "The battle began as {initiatorName} {initiator_verb_past} {initiator_object_phrase}, forcing {responderName} to react immediately.",
        "Without hesitation, {initiatorName} went on the offensive, {initiator_verb_ing} {initiator_object_phrase}."
    ],
    advantage_attack: [
        "Sensing an opportunity, {initiatorName} pressed the advantage, {initiator_verb_ing} {initiator_object_phrase}.",
        "Dominating the flow, {initiatorName} drove {responderName} back, using {initiatorPronounP} momentum to {initiator_verb_base} {initiator_object_phrase}.",
        "With momentum on {initiatorPronounP} side, {initiatorName} unleashed another powerful attack, {initiator_verb_ing} {initiator_object_phrase}."
    ],
    disadvantage_attack: [
        // FIX: Replaced stiff templates with the more active, natural-sounding versions.
        "Trying to regain footing, {initiatorName}'s attempt to {initiator_verb_base} was deftly countered by {responderName}.",
        "{initiatorName}'s counterattack was swiftly deflected by {responderName}.",
        "An attempt by {initiatorName} to turn the tide was answered by {responderName}, who nullified the threat."
    ],
    terrain_interaction: [
        "Using the {locationFeature} to {initiatorPronounP} advantage, {initiatorName} {initiator_verb_past} {initiator_object_phrase}, forcing {responderName} onto the treacherous {locationTerrain}.",
        "The {locationTerrain} became a weapon for {initiatorName}. {initiatorPronounSCap} {initiator_verb_past} {initiator_object_phrase}, and {responderName} had to adapt quickly or be overwhelmed."
    ],
    finishing_move: [
        "{winnerFinisherDescription}",
        "{winnerFinisherDescription}",
        "{winnerFinisherDescription}"
    ]
};