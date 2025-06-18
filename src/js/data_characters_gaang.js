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
        imageUrl: 'img/img_aang.avif',
        victoryStyle: "Pacifist", powerTier: 9,
        faction: "AirNomad",
        personalityProfile: {
            aggression: 0.2, patience: 0.9, riskTolerance: 0.2, opportunism: 0.7,
            creativity: 0.8, defensiveBias: 0.6, antiRepeater: 0.9,
            predictability: 0.2,
            signatureMoveBias: {
                "Air Scooter": 1.8,
                "Focused Air Blast": 1.0,
                "Wind Dome": 1.4,
                "Cyclone Vortex": 1.3,
                "Palm Gust": 0.9,
                "Sweeping Gale": 1.1,
                "Spiral Retreat": 1.5
            }
        },
        specialTraits: { resilientToManipulation: 0.6, isAvatar: true, ethicalRestraintSwamp: true },
        collateralTolerance: 0.05,
        mobility: 1.0,
        curbstompRules: [
            { ruleId: "aang_mobility_edge", characterId: "aang-airbending-only" }
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
            { name: "Air Scooter", verb: 'ride', object: 'his air scooter', description: "A spinning sphere of wind for fast, unpredictable movement.", type: 'Utility', power: 20, element: 'air', moveTags: ['utility', 'evasion', 'mobility_boost', 'nonlethal', 'terrain_ignore'], collateralImpact: 'none' },
            { name: "Focused Air Blast", verb: 'unleash', object: 'focused blast of air', description: "Concentrated palm burst used to knock back or stagger a single target.", type: 'Offense', power: 40, requiresArticle: true, element: 'air', moveTags: ['ranged', 'single_target', 'stagger', 'nonlethal', 'interrupt_charges'], collateralImpact: 'low' },
            { name: "Wind Dome", verb: 'form', object: 'swirling shield of wind', description: "A protective cyclone that deflects projectiles and disrupts melee approach.", type: 'Defense', power: 50, requiresArticle: true, element: 'air', moveTags: ['defensive_stance', 'projectile_reflect', 'counter_opener', 'nonlethal'], collateralImpact: 'none' },
            { name: "Cyclone Vortex", verb: 'create', object: 'disorienting tornado', description: "A large spiraling tornado that lifts and flings multiple opponents outward.", type: 'Offense', power: 65, requiresArticle: true, element: 'air', moveTags: ['area_of_effect', 'displacement', 'terrain_disrupt', 'momentum_loss'], collateralImpact: 'medium' },
            { name: "Palm Gust", verb: 'push', object: 'with a sudden gust of wind', description: "Close-range gust for breaking grapples or disengaging.", type: 'Offense', power: 30, element: 'air', moveTags: ['melee_range', 'interrupt', 'pushback', 'safe_on_use'], collateralImpact: 'none' },
            { name: "Sweeping Gale", verb: 'sweep', object: 'his foe off their feet', description: "A horizontal arc of air targeting the legs. Trip, stagger, and destabilize.", type: 'Finisher', power: 80, element: 'air', moveTags: ['aoe_sweep', 'disable', 'stagger', 'setup_combo', 'low_damage'], collateralImpact: 'low' },
            { name: "Spiral Retreat", verb: 'execute', object: 'a nimble repositioning', description: "Rotational step and wind-blast used to exit melee range or bait reaction.", type: 'Utility', power: 10, element: 'air', moveTags: ['reactive_utility', 'mobility', 'turn_escape', 'frame_safe'], isRepositionMove: true, collateralImpact: 'none' }
        ],
        quotes: { postWin: ["Phew! Nobody got hurt, right? Mostly."], postWin_overwhelming: ["Whoa, that was a lot of air! Are you okay?"], postWin_specific: { 'ozai-not-comet-enhanced': "It's over. This world doesn't need any more destruction." } },
        relationships: { 'ozai-not-comet-enhanced': { relationshipType: "fated_adversary", stressModifier: 1.4, resilienceModifier: 1.3 }, 'azula': { relationshipType: "nonlethal_pacifism", stressModifier: 1.2, resilienceModifier: 1.2 } }
    }
};