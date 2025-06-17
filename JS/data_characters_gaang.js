// FILE: js/data_characters_gaang.js
'use strict';

// This file serves as the central assembler for all character data.
// It imports character objects from modular files and combines them
// into a single 'characters' object for the rest of the application.

// Assuming ESCALATION_STATES is globally available or imported where this data is consumed.
// No direct import needed here, as it's typically used by logic files (like engine_escalation.js)

export const gaangCharacters = {
    'aang-airbending-only': {
        id: 'aang-airbending-only', name: "Aang (Airbending only)", type: "Bender", element: "air", pronouns: { s: 'he', p: 'his', o: 'him' },
        imageUrl: 'https://static.wikia.nocookie.net/avatar/images/a/ae/Aang_at_Jasmine_Dragon.png',
        victoryStyle: "Pacifist", powerTier: 9,
        faction: "AirNomad",
        personalityProfile: {
            aggression: 0.2, patience: 0.9, riskTolerance: 0.2, opportunism: 0.7,
            creativity: 0.8, defensiveBias: 0.6, antiRepeater: 0.9,
            predictability: 0.2,
            signatureMoveBias: {
                "Air Scooter": 1.8,
                "Air Blast": 1.0,
                "Wind Shield": 1.4,
                "Tornado Whirl": 1.3,
                "Gust Push": 0.9,
                "Sweeping Gust": 1.1,
                "Tactical Reposition": 1.5
            }
        },
        specialTraits: { resilientToManipulation: 0.6, isAvatar: true, ethicalRestraintSwamp: true },
        collateralTolerance: 0.05,
        mobility: 1.0,
        curbstompRules: [
            { ruleId: "aang_avatar_state_air", characterId: "aang-airbending-only" },
            { ruleId: "aang_air_scooter_evasion", characterId: "aang-airbending-only" }
        ],
        personalityTriggers: {
            "mortal_danger": "(character.hp < character.maxHp * 0.2) || (battleState.ally?.hp < battleState.ally?.maxHp * 0.05)"
        },
        incapacitationScore: 0,
        escalationState: 'Normal',
        stunDuration: 0,
        escalationBehavior: { // Aang: Evasive and disabling, less directly aggressive finishers
            'Severely Incapacitated': {
                signatureMoveBias: { "Tornado Whirl": 1.7, "Air Scooter": 1.5, "Wind Shield": 1.3 },
                offensiveBias: 0.7, // Prefers utility/control
                finisherBias: 1.2, // "Sweeping Gust" is more about control
                utilityBias: 1.8,
            },
            'Terminal Collapse': {
                signatureMoveBias: { "Tornado Whirl": 2.0, "Sweeping Gust": 1.5 },
                offensiveBias: 0.5,
                finisherBias: 1.4,
                utilityBias: 1.5,
            }
        },
        techniques: [
            { name: "Air Scooter", verb: 'ride', object: 'his air scooter', type: 'Utility', power: 20, element: 'air', moveTags: ['utility_reposition', 'evasive', 'channeled'], setup: { name: 'Off-Balance', duration: 1, intensity: 1.15 }, collateralImpact: 'none' },
            { name: "Air Blast", verb: 'unleash', object: 'focused blast of air', type: 'Offense', power: 40, requiresArticle: true, element: 'air', moveTags: ['ranged_attack', 'area_of_effect_small', 'pushback'], collateralImpact: 'low' },
            { name: "Wind Shield", verb: 'form', object: 'swirling shield of wind', type: 'Defense', power: 50, requiresArticle: true, element: 'air', moveTags: ['defensive_stance', 'utility_block', 'projectile_defense'], collateralImpact: 'none' },
            { name: "Tornado Whirl", verb: 'create', object: 'disorienting tornado', type: 'Offense', power: 65, requiresArticle: true, element: 'air', moveTags: ['area_of_effect', 'channeled', 'utility_control'], collateralImpact: 'medium' },
            { name: "Gust Push", verb: 'push', object: 'with a sudden gust of wind', type: 'Offense', power: 30, element: 'air', moveTags: ['ranged_attack', 'single_target', 'pushback'], collateralImpact: 'none' },
            { name: "Sweeping Gust", verb: 'sweep', object: 'his foe off their feet', type: 'Finisher', power: 80, element: 'air', moveTags: ['area_of_effect', 'debuff_disable', 'pushback', 'requires_opening'], collateralImpact: 'low' },
            { name: "Tactical Reposition", verb: 'execute', object: 'a nimble repositioning', type: 'Utility', power: 10, element: 'air', moveTags: ['mobility_move', 'evasive', 'reposition'], isRepositionMove: true, collateralImpact: 'none' }
        ],
        quotes: { postWin: ["Phew! Nobody got hurt, right? Mostly."], postWin_overwhelming: ["Whoa, that was a lot of air! Are you okay?"], postWin_specific: { 'ozai-not-comet-enhanced': "It's over. This world doesn't need any more destruction." } },
        relationships: { 'ozai-not-comet-enhanced': { relationshipType: "fated_adversary", stressModifier: 1.4, resilienceModifier: 1.3 }, 'azula': { relationshipType: "nonlethal_pacifism", stressModifier: 1.2, resilienceModifier: 1.2 } }
    }
};