'use strict';

// ** THE DEFINITIVE, PRONOUN-AWARE VERSION **
// The templates now explicitly request the verb form and use pronouns for natural language.

export const battleBeats = {
    opening: [
        "{initiatorName} opened the fight by {initiator_verb_ing} {initiator_object}, forcing {responderName} to immediately {responder_verb_base} {responder_object} in response.",
        "The battle began as {initiatorName} {initiator_verb_past} {initiator_object}, putting {responderName} on the defensive. {responderPronounS} could only {responder_verb_base} {responder_object} to hold {initiatorPronounO} back.",
        "Without hesitation, {initiatorName} went on the offensive, {initiator_verb_ing} {initiator_object}. {responderName} quickly countered by {responder_verb_ing} {responder_object}."
    ],
    advantage_attack: [
        "Sensing an opportunity, {initiatorName} pressed the advantage. {initiatorPronounS} {initiator_verb_past} {initiator_object}, leaving {responderName} scrambling to {responder_verb_base} {responder_object}.",
        "Dominating the flow, {initiatorName} relentlessly {initiator_verb_past} {initiator_object}. {responderPronounS} was forced to use {responderPronounP} full power just to {responder_verb_base} {responder_object}.",
        "With momentum on {initiatorPronounP} side, {initiatorName} {initiator_verb_past} {initiator_object}. A desperate {responderName} could only respond by {responder_verb_ing} {responder_object}."
    ],
    disadvantage_attack: [
        "Fighting from a disadvantage, {initiatorName} tried to {initiator_verb_base} {initiator_object}, but {responderName} easily countered, {responder_verb_ing} {responder_object} to shut {initiatorPronounO} down.",
        "Trying to turn the tide, {initiatorName} gambled and {initiator_verb_past} {initiator_object}. The attempt was deftly handled as {responderName} {responder_verb_past} {responder_object} in response."
    ],
    terrain_interaction: [
        "Using the {locationFeature} to {initiatorPronounP} advantage, {initiatorName} {initiator_verb_past} {initiator_object}, forcing {responderName} to use the {locationTerrain} to {responder_verb_base} {responder_object}.",
        "The {locationTerrain} became a weapon for {initiatorName}. {initiatorPronounS} {initiator_verb_past} {initiator_object}, and {responderName} had to adapt quickly by {responder_verb_ing} {responder_object}."
    ],
    finishing_move: [
        "Seeing the end in sight, {winnerName} prepared the final blow. {winnerPronounS} {winner_verb_past} {winner_object}, and {loserName} could not recover.",
        "It all came down to one final moment. {winnerName} {winner_verb_past} {winner_object}, sealing {winnerPronounP} victory against {loserName}.",
        "The decisive moment arrived. With a final, powerful move, {winnerName} {winner_verb_past} {winner_object}, ending the battle and leaving {loserName} defeated."
    ]
};