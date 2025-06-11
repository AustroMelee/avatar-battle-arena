'use strict';

export const battleBeats = {
    opening: [
        "{initiatorName} opened the fight, {initiator_verb_ing} {initiator_object_phrase} and forcing {responderName} onto the defensive.",
        "The battle began as {initiatorName} {initiator_verb_past} {initiator_object_phrase}, forcing {responderName} to react immediately.",
        "Without hesitation, {initiatorName} went on the offensive, {initiator_verb_ing} {initiator_object_phrase}."
    ],
    advantage_attack: [
        "Sensing an opportunity, {initiatorName} pressed the advantage, {initiator_verb_ing} {initiator_object_phrase}.",
        "Dominating the flow, {initiatorName} relentlessly {initiator_verb_past} {initiator_object_phrase}, leaving {responderName} scrambling.",
        "With momentum on {initiatorPronounP} side, {initiatorName} unleashed another attack, {initiator_verb_ing} {initiator_object_phrase}."
    ],
    disadvantage_attack: [
        // Active counter-attack template
        "Trying to regain footing, {initiatorName} gambled and {initiator_verb_past} {initiator_object_phrase}, but the attempt was deftly handled by {responderName}.",
        // Safer, more descriptive template to avoid awkward gerunds
        "Fighting from a disadvantage, {initiatorName} tried to turn the tide, but {responderName} was ready, shutting the attempt down.",
        // Another safe variant
        "An attempt by {initiatorName} to {initiator_verb_base} {initiator_object_phrase} was easily countered by {responderName}."
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