'use strict';

// ** REWRITTEN FOR GRAMMATICAL ACCURACY **
// The templates now explicitly request the verb form needed.

export const battleBeats = {
    opening: [
        "{initiatorName} opened the fight by {initiator_verb_ing} {initiator_object}, forcing {responderName} to immediately {responder_verb_base} {responder_object}.",
        "The battle began as {initiatorName} {initiator_verb_past} {initiator_object}, putting {responderName} on the defensive, who could only {responder_verb_base} {responder_object}.",
        "Without hesitation, {initiatorName} went on the offensive, {initiator_verb_ing} {initiator_object}. {responderName} quickly countered by {responder_verb_ing} {responder_object}."
    ],
    advantage_attack: [
        "Sensing an opportunity, {initiatorName} pressed the advantage, {initiator_verb_ing} {initiator_object} and leaving {responderName} scrambling to {responder_verb_base} {responder_object}.",
        "Dominating the flow, {initiatorName} relentlessly {initiator_verb_past} {initiator_object}. {responderName} was forced to {responder_verb_base} {responder_object}.",
        "With momentum on their side, {initiatorName} {initiator_verb_past} {initiator_object}. A desperate {responderName} could only respond by {responder_verb_ing} {responder_object}."
    ],
    disadvantage_attack: [
        "Fighting from a disadvantage, {initiatorName} tried to {initiator_verb_base} {initiator_object}, but {responderName} easily countered with a display of {responder_verb_ing} {responder_object}.",
        "Trying to turn the tide, {initiatorName} gambled and {initiator_verb_past} {initiator_object}. The attempt was deftly handled as {responderName} {responder_verb_past} {responder_object} in response."
    ],
    terrain_interaction: [
        "Using the {locationFeature} to their advantage, {initiatorName} {initiator_verb_past} {initiator_object}, forcing {responderName} to use the {locationTerrain} to {responder_verb_base} {responder_object}.",
        "The {locationTerrain} became a weapon for {initiatorName}, who {initiator_verb_past} {initiator_object}. {responderName} had to adapt quickly by {responder_verb_ing} {responder_object}."
    ],
    finishing_move: [
        "Seeing the end in sight, {winnerName} prepared the final blow. They {winner_verb_past} {winner_object}, and {loserName} could not recover.",
        "It all came down to one final moment. {winnerName} {winner_verb_past} {winner_object}, sealing the victory against {loserName}.",
        "The decisive moment arrived. With a final, powerful move, {winnerName} {winner_verb_past} {winner_object}, ending the battle and leaving {loserName} defeated."
    ]
};