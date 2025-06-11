'use strict';

// ** THE DEFINITIVE, PRONOUN-AWARE VERSION **
// The templates now explicitly request the verb form and use pronouns for natural language.

export const battleBeats = {
    opening: [
        "{initiatorName} opened the fight by {initiator_verb_ing} {initiator_object}, forcing {responderName} to immediately {responder_verb_base} in response.",
        "The battle began as {initiatorName} {initiator_verb_past} {initiator_object}, putting {responderName} on the defensive. {responderPronounS} could only {responder_verb_base} to hold {initiatorPronounO} back.",
        "Without hesitation, {initiatorName} went on the offensive, {initiator_verb_ing} {initiator_object}. {responderName} quickly countered by {responder_verb_ing}."
    ],
    advantage_attack: [
        "Sensing an opportunity, {initiatorName} pressed the advantage. {initiatorPronounS} {initiator_verb_past} {initiator_object}, leaving {responderName} scrambling.",
        "Dominating the flow, {initiatorName} relentlessly {initiator_verb_past} {initiator_object}. {responderName} was forced to use {responderPronounP} full power just to defend.",
        "With momentum on {initiatorPronounP} side, {initiatorName} {initiator_verb_past} {initiator_object}. A desperate {responderName} could only respond by {responder_verb_ing}."
    ],
    disadvantage_attack: [
        "Fighting from a disadvantage, {initiatorName} tried to {initiator_verb_base} {initiator_object}, but {responderName} easily countered, {responder_verb_ing} to shut {initiatorPronounO} down.",
        "Trying to turn the tide, {initiatorName} gambled and {initiator_verb_past} {initiator_object}. The attempt was deftly handled by {responderName}."
    ],
    terrain_interaction: [
        "Using the {locationFeature} to {initiatorPronounP} advantage, {initiatorName} {initiator_verb_past} {initiator_object}, forcing {responderName} onto the treacherous {locationTerrain}.",
        "The {locationTerrain} became a weapon for {initiatorName}. {initiatorPronounS} {initiator_verb_past} {initiator_object}, and {responderName} had to adapt quickly."
    ],
    finishing_move: [
        // This is now a dynamic template. The key placeholder is {winnerFinisherDescription}.
        "The decisive moment arrived. {winnerName} saw an opening and {winnerFinisherDescription}",
        "It all came down to one final moment. Seizing the opportunity, {winnerName} {winnerFinisherDescription}",
        "The battle reached its climax. With a final, powerful move, {winnerName} {winnerFinisherDescription}"
    ]
};
