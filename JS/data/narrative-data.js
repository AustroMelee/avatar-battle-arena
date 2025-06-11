'use strict';

// This file contains the templates for building the play-by-play narrative.

export const battleBeats = {
    // The very first exchange of the fight
    opening: [
        "{initiatorName} opened the fight, {actionPhrase}, forcing {responderName} to immediately {responsePhrase}.",
        "The battle began as {initiatorName} {actionPhrase}, putting {responderName} on the defensive, who could only {responsePhrase}.",
        "Without hesitation, {initiatorName} went on the offensive with {actionPhrase}. {responderName} quickly {responsePhrase} to counter."
    ],
    // When the character with the advantage presses their attack
    advantage_attack: [
        "Sensing an opportunity, {initiatorName} pressed the advantage, {actionPhrase}, leaving {responderName} scrambling to {responsePhrase}.",
        "Dominating the flow of the battle, {initiatorName} relentlessly {actionPhrase}. {responderName} was forced to {responsePhrase}.",
        "With momentum on their side, {initiatorName} {actionPhrase}. A desperate {responderName} could only {responsePhrase} in return."
    ],
    // When the character with the disadvantage tries to fight back
    disadvantage_attack: [
        "Fighting from behind, {initiatorName} looked for an opening and {actionPhrase}, but {responderName} easily {responsePhrase}.",
        "Trying to turn the tide, {initiatorName} gambled with {actionPhrase}. The attempt was deftly handled as {responderName} {responsePhrase}.",
        "Despite being on the back foot, {initiatorName} {actionPhrase}. {responderName}, unfazed, simply {responsePhrase}."
    ],
    // A moment where the environment is used
    terrain_interaction: [
        "Using the {locationFeature} to their advantage, {initiatorName} {actionPhrase}, forcing {responderName} to use the {locationTerrain} to {responsePhrase}.",
        "The {locationTerrain} became a weapon for {initiatorName}, who {actionPhrase}. {responderName} had to adapt quickly and {responsePhrase}."
    ],
    // The final move of the battle
    finishing_move: [
        "Seeing the end in sight, {winnerName} prepared the final blow. They {actionPhrase}, and {loserName} could not recover.",
        "It all came down to one final moment. {winnerName} {actionPhrase}, sealing the victory against {loserName}.",
        "The decisive moment arrived. With a final, powerful move, {winnerName} {actionPhrase}, ending the battle and leaving {loserName} defeated."
    ]
};