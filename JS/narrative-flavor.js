// FILE: js/narrative-flavor.js
'use strict';

// ====================================================================================
//  Narrative Flavor Library (RML v1.0)
// ====================================================================================
//  Provides dynamic, emotional flavor text injected into the battle narration
//  based on a character's emotional state and relationship to their opponent.
// ====================================================================================

export const emotionalFlavor = {
    // Generic state changes for any character
    generic: {
        breakdown: [
            "A flicker of panic flashes in {actorName}'s eyes.",
            "{actorName}'s confident stance begins to crumble.",
            "The pressure seems to be getting to {actorName}, whose movements become erratic.",
            "Frustration boils over, and {actorName}'s technique becomes sloppy and desperate."
        ],
        desperation: [
            "With nothing left to lose, {actorName} prepares for a reckless gamble.",
            "Cornered and battered, {actorName} summons {possessive} last reserves for a desperate push.",
            "There's no more room for strategy; only a desperate, all-out attack will do."
        ]
    },

    // Character-specific flavor text
    'azula': {
        breakdown: [
            "A single hair falls out of place, and Azula's perfect composure cracks, replaced by a snarl.",
            "'{targetName}, you've always been a disappointment!' she shrieks, her attack laced with fury rather than precision.",
            "A memory of her mother's words seems to haunt her, and her blue flames flicker with instability.",
            "'I... I must be perfect!' {actorName} mutters, her movements becoming dangerously unpredictable."
        ],
        taunt: {
            'zuko': "You've always been weak, Zuzu. Pathetic.",
            'katara': "Is that all the power the little peasant can muster?",
            'aang-airbending-only': "Still playing games, Avatar? I'll put an end to them.",
            'toph-beifong': "Your dirty tricks are no match for perfection, little girl."
        }
    },
    'zuko': {
        breakdown: [
            "His father's mocking laughter echoes in his mind, and {actorName} lashes out with uncontrolled rage.",
            "'I have to restore my honor!' he yells, his attacks becoming wild and predictable.",
            "The scar on his face seems to burn as he falters, torn between two paths."
        ],
        desperation: [
            "He thinks of his uncle's teachings, steadying himself for one last, focused effort.",
            "'This is for my nation! For myself!' {actorName} roars, channeling all his pain into the attack."
        ]
    },
    'aang-airbending-only': {
        reluctance: [
            "Aang hesitates, his face etched with worry. 'I don't want to hurt you, {targetName}!'",
            "He pulls back at the last second, turning a powerful strike into a defensive maneuver.",
            "'There has to be another way!' he pleads, using his airbending to create distance, not to harm."
        ]
    },
    'iroh': {
        mercy: [
            "Iroh sighs, a look of profound sadness on his face. 'It is time to stop this foolishness, child.'",
            "He sees the pain in {targetName}'s eyes and holds back, turning his attack into a gentle push.",
            "He sips from an imaginary teacup. 'Have you considered that this conflict is... ill-advised?' he asks, deflecting the blow."
        ],
        taunt: {
            'azula': "My dear niece, you have so much to learn about true power.",
            'ozai-not-comet-enhanced': "You have forgotten the most important lesson, brother. Power is not the only path."
        }
    },
    'katara': {
        desperation: [
            "Her mother's necklace glows softly as {actorName} thinks of her lost family, her waterbending becoming sharp and cold as ice.",
            "'I won't let you win! For the Southern Water Tribe!' she cries, her control over water becoming immense and terrifying."
        ]
    },
    'toph-beifong': {
        taunt: {
            'aang-airbending-only': "Come on, Twinkle-toes! Are you gonna dance around all day or actually fight?",
            'katara': "Try getting your feet wet now, Sugar Queen!",
            'azula': "All that hot air and you still can't touch me."
        }
    }
};