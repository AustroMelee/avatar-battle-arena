'use strict';

// ** THE DEFINITIVE, PRONOUN-AWARE VERSION **
// The templates now explicitly request the verb form and use pronouns for natural language.

export const battleBeats = {
    opening: [
        "{initiatorName} opened the fight by {initiator_verb_ing} a {initiator_object}, forcing {responderName} onto the defensive.",
        "The battle began as {initiatorName} {initiator_verb_past} a {initiator_object}, and {responderName} was forced to react, immediately {responder_verb_ing} to hold {initiatorPronounO} back.",
        "Without hesitation, {initiatorName} went on the offensive with a powerful {initiator_object}. {responderPronounSCap} countered by {responder_verb_ing} {responderPronounP} own {responder_object}."
    ],
    advantage_attack: [
        "Sensing an opportunity, {initiatorName} pressed the advantage. {initiatorPronounSCap} {initiator_verb_past} another {initiator_object}, leaving {responderName} scrambling to defend.",
        "Dominating the flow, {initiatorName} relentlessly {initiator_verb_past} a {initiator_object}. {responderName} was forced to use {responderPronounP} full power just to stay in the fight.",
        "With momentum on {initiatorPronounP} side, {initiatorName} unleashed another attack, {initiator_verb_ing} a {initiator_object}. A desperate {responderName} could only respond by {responder_verb_ing}."
    ],
    disadvantage_attack: [
        "Fighting from a disadvantage, {initiatorName} tried to turn the tide with a clever {initiator_object}, but {responderName} easily countered, {responder_verb_ing} to shut the attempt down.",
        "Trying to regain footing, {initiatorName} gambled and {initiator_verb_past} a {initiator_object}, but the attempt was deftly handled by {responderName}."
    ],
    terrain_interaction: [
        "Using the {locationFeature} to {initiatorPronounP} advantage, {initiatorName} {initiator_verb_past} a {initiator_object}, forcing {responderName} onto the treacherous {locationTerrain}.",
        "The {locationTerrain} became a weapon for {initiatorName}. {initiatorPronounSCap} {initiator_verb_past} a {initiator_object}, and {responderName} had to adapt quickly or be overwhelmed."
    ],
    finishing_move: [
        "{winnerFinisherDescription}",
        "{winnerFinisherDescription}",
        "{winnerFinisherDescription}"
    ]
};