'use strict';

export const battleBeats = {
    opening: [
        "{initiatorName} opened the fight, {initiator_verb_ing} {initiator_object_phrase} and forcing {responderName} onto the defensive.",
        "The battle began as {initiatorName} {initiator_verb_past} {initiator_object_phrase}, forcing {responderName} to react immediately.",
        "Without hesitation, {initiatorName} went on the offensive, {initiator_verb_ing} {initiator_object_phrase}."
    ],
    advantage_attack: [
        // FIX: Replaced rigid/clashing adverbs with more flexible, descriptive phrasing.
        "Sensing an opportunity, {initiatorName} pressed the advantage, {initiator_verb_ing} {initiator_object_phrase}.",
        "Dominating the flow, {initiatorName} drove {responderName} back with {initiator_object_phrase}, leaving {responderPronounO} scrambling.",
        "With momentum on {initiatorPronounP} side, {initiatorName} unleashed another powerful attack, {initiator_verb_ing} {initiator_object_phrase}."
    ],
    disadvantage_attack: [
        // FIX: Replaced the awkward "gambled and..." template with higher-quality, more active, and grammatically safer variants.
        "Trying to regain footing, {initiatorName} gambled with a quick {initiator_object_phrase}, but {responderName} deftly countered.",
        "Fighting from a disadvantage, {initiatorName} attempted to {initiator_verb_base} {initiator_object_phrase}, but the move was easily read and shut down by {responderName}.",
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