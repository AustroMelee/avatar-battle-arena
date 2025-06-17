// FILE: js/data_characters_masters.js
'use strict';

// Aggregates Master character data.

// Assuming ESCALATION_STATES is globally available or imported where this data is consumed.
// No direct import needed here.

export const masterCharacters = {
    'bumi': {
        id: 'bumi', name: "Bumi", type: "Bender", element: "earth", pronouns: { s: 'he', p: 'his', o: 'him' },
        imageUrl: 'https://static.wikia.nocookie.net/avatar/images/e/e8/King_Bumi.png',
        victoryStyle: "Madcap", powerTier: 8,
        faction: "EarthKingdom",
        personalityProfile: {
            aggression: 0.8, patience: 0.5, riskTolerance: 0.9, opportunism: 0.7,
            creativity: 1.0, defensiveBias: 0.3, antiRepeater: 0.9,
            predictability: 0.1,
            signatureMoveBias: {
                "Rock Avalanche": 1.6,
                "Boulder Throw": 1.5,
                "Ground Spike": 1.0,
                "Terrain Reshape": 1.7,
                "Tactical Reposition": 0.5,
                "Iceberg Toss": 1.4, // NEW for NWT
                "Permafrost Prison": 1.5, // NEW for NWT
                "Glacier Control": 1.3, // NEW for NWT
                "Sand Funnel": 1.4, // NEW for Si Wong
                "Quicksand Trap": 1.5, // NEW for Si Wong
                "Glass Shard Barrage": 1.3 // NEW for Si Wong
            }
        },
        specialTraits: { resilientToManipulation: 1.0, madGenius: true, swampImmunity: true }, // UPDATED: Added swampImmunity
        collateralTolerance: 0.5,
        mobility: 0.3,
        curbstompRules: [
            { ruleId: "bumi_massive_earthbending_bury", characterId: "bumi" },
            { ruleId: "bumi_structural_collapse", characterId: "bumi" }
        ],
        personalityTriggers: {
            "underestimated": "(battleState.opponentTauntedAgeOrStrategy) || (opponent.lastMoveEffectiveness === 'Weak' && opponent.lastMove.power > 50)"
        },
        incapacitationScore: 0,
        escalationState: 'Normal',
        stunDuration: 0,
        escalationBehavior: { // Bumi: Unpredictable, enjoys overwhelming with sheer power and chaos
            'Severely Incapacitated': {
                signatureMoveBias: { "Rock Avalanche": 2.5, "Terrain Reshape": 2.0, "Boulder Throw": 1.8 },
                offensiveBias: 1.9,
                finisherBias: 2.2,
                utilityBias: 0.3, // Terrain Reshape for massive damage potential
            },
            'Terminal Collapse': {
                signatureMoveBias: { "Rock Avalanche": 3.5, "Terrain Reshape": 3.0 }, // Overwhelming terrain manipulation
                offensiveBias: 2.5,
                finisherBias: 3.0,
                utilityBias: 0.1, // Just finish it!
            }
        },
        techniques: [
            { name: "Rock Avalanche", verb: 'trigger', object: 'massive rock avalanche', type: 'Finisher', power: 95, requiresArticle: true, element: 'earth', moveTags: ['area_of_effect_large', 'environmental_manipulation', 'requires_opening', 'highRisk'], collateralImpact: 'high' },
            { name: "Boulder Throw", verb: 'hurl', object: 'giant boulder', type: 'Offense', power: 60, requiresArticle: true, element: 'earth', moveTags: ['ranged_attack', 'projectile', 'single_target'], collateralImpact: 'medium' },
            { name: "Ground Spike", verb: 'erupt with', object: 'spike of rock from the ground', type: 'Offense', power: 45, requiresArticle: true, element: 'earth', moveTags: ['melee_range', 'ranged_attack_medium', 'single_target', 'unblockable_ground'], collateralImpact: 'low' },
            { name: "Terrain Reshape", verb: 'reshape', object: 'the battlefield', type: 'Utility', power: 40, element: 'earth', moveTags: ['utility_control', 'environmental_manipulation'], collateralImpact: 'low' },
            { name: "Tactical Reposition", verb: 'execute', object: 'a nimble repositioning', type: 'Utility', power: 10, element: 'earth', moveTags: ['mobility_move', 'evasive', 'reposition'], isRepositionMove: true, collateralImpact: 'none' }
        ],
        techniquesNorthernWaterTribe: [ // NEW MOVESET for Northern Water Tribe
            { name: "Iceberg Punch", verb: 'punch', object: 'a chunk of ice towards', type: 'Offense', power: 55, element: 'ice', moveTags: ['melee_range', 'ranged_attack_medium', 'single_target', 'environmental_manipulation'], collateralImpact: 'low' },
            { name: "Permafrost Prison", verb: 'trap', object: 'her opponent in permafrost', type: 'Finisher', power: 95, element: 'ice', moveTags: ['debuff_disable', 'single_target', 'construct_creation', 'requires_opening'], collateralImpact: 'low' },
            { name: "Glacier Control", verb: 'manipulate', object: 'the surrounding glaciers', type: 'Utility', power: 60, element: 'ice', moveTags: ['environmental_manipulation', 'utility_control'], collateralImpact: 'high' },
            { name: "Frozen Ground Shockwave", verb: 'send', object: 'a shockwave through the frozen ground', type: 'Offense', power: 50, element: 'earth', moveTags: ['area_of_effect_small', 'unblockable_ground'], collateralImpact: 'low' },
            { name: "Tactical Reposition", verb: 'execute', object: 'a nimble repositioning', type: 'Utility', power: 10, element: 'physical', moveTags: ['mobility_move', 'evasive', 'reposition'], isRepositionMove: true, collateralImpact: 'none' }
        ],
        techniquesOmashu: [ // NEW MOVESET for Omashu (adapted from existing earth moves)
            { name: "Stone Spire", verb: 'erupt with', object: 'a spire of rock from the ground', type: 'Offense', power: 50, requiresArticle: true, element: 'earth', moveTags: ['melee_range', 'ranged_attack_medium', 'single_target', 'unblockable_ground'], collateralImpact: 'low' },
            { name: "Chute Collapse", verb: 'cause', object: 'a chute to collapse', type: 'Offense', power: 65, requiresArticle: true, element: 'earth', moveTags: ['area_of_effect_small', 'environmental_manipulation', 'requires_opening'], collateralImpact: 'medium' },
            { name: "Omashu Barrier", verb: 'raise', object: 'a massive Omashu stone barrier', type: 'Defense', power: 70, requiresArticle: true, element: 'earth', moveTags: ['defensive_stance', 'utility_block', 'construct_creation'], collateralImpact: 'low' },
            { name: "Boulder Barrage (Omashu)", verb: 'launch', object: 'a volley of Omashu boulders', type: 'Offense', power: 60, requiresArticle: true, element: 'earth', moveTags: ['ranged_attack', 'projectile', 'area_of_effect_small', 'environmental_manipulation'], collateralImpact: 'medium' },
            { name: "Tactical Reposition", verb: 'execute', object: 'a nimble repositioning', type: 'Utility', power: 10, element: 'earth', moveTags: ['mobility_move', 'evasive', 'reposition'], isRepositionMove: true, collateralImpact: 'none' }
        ],
        techniquesSiWongDesert: [ // NEW MOVESET for Si Wong Desert
            { name: "Sand Funnel", verb: 'create', object: 'a swirling sand funnel', type: 'Offense', power: 50, requiresArticle: true, element: 'earth', moveTags: ['area_of_effect_small', 'debuff_disable', 'environmental_manipulation'], collateralImpact: 'low' },
            { name: "Quicksand Trap", verb: 'form', object: 'a quicksand trap', type: 'Utility', power: 45, requiresArticle: true, element: 'earth', moveTags: ['trap_delayed', 'utility_control', 'environmental_manipulation'], setup: { name: 'Immobilized', duration: 2, intensity: 1.3 }, collateralImpact: 'none' },
            { name: "Glass Shard Barrage", verb: 'launch', object: 'a barrage of scorching glass shards', type: 'Offense', power: 60, requiresArticle: true, element: 'earth', moveTags: ['ranged_attack', 'projectile', 'area_of_effect_small', 'environmental_manipulation'], collateralImpact: 'medium' },
            { name: "Desert Tremor", verb: 'send', object: 'a localized tremor through the sand', type: 'Offense', power: 55, requiresArticle: true, element: 'earth', moveTags: ['area_of_effect_small', 'unblockable_ground'], collateralImpact: 'low' },
            { name: "Tactical Reposition", verb: 'execute', object: 'a nimble repositioning', type: 'Utility', power: 10, element: 'earth', moveTags: ['mobility_move', 'evasive', 'reposition'], isRepositionMove: true, collateralImpact: 'none' }
        ],
        techniquesBoilingRock: [ // NEW MOVESET for Boiling Rock
            { name: "Metal Grasp", verb: 'bend', object: 'metal to seize', type: 'Offense', power: 60, requiresArticle: true, element: 'metal', moveTags: ['melee_range', 'single_target', 'debuff_disable', 'environmental_manipulation'], collateralImpact: 'low' },
            { name: "Gondola Toss", verb: 'rip', object: 'a gondola from its cables and toss it', type: 'Offense', power: 75, requiresArticle: true, element: 'metal', moveTags: ['ranged_attack', 'projectile', 'area_of_effect_small', 'environmental_manipulation', 'highRisk'], collateralImpact: 'high' },
            { name: "Steam Vent Burst", verb: 'cause', object: 'a steam vent to erupt', type: 'Utility', power: 50, requiresArticle: true, element: 'earth', moveTags: ['area_of_effect_small', 'utility_control', 'environmental_manipulation', 'setup'], setup: { name: 'Blinded', duration: 1, intensity: 1.2 }, collateralImpact: 'medium' },
            { name: "Wire Trap", verb: 'twist', object: 'metal wires into a trap', type: 'Utility', power: 45, requiresArticle: true, element: 'metal', moveTags: ['trap_delayed', 'utility_control', 'environmental_manipulation'], setup: { name: 'Pinned', duration: 2, intensity: 1.3 }, collateralImpact: 'low' },
            { name: "Tactical Reposition", verb: 'execute', object: 'a nimble repositioning', type: 'Utility', power: 10, element: 'earth', moveTags: ['mobility_move', 'evasive', 'reposition'], isRepositionMove: true, collateralImpact: 'none' }
        ],
        relationships: {}
    },
    'pakku': {
        id: 'pakku', name: "Pakku", type: "Bender", element: "water", pronouns: { s: 'he', p: 'his', o: 'him' },
        imageUrl: 'https://static.wikia.nocookie.net/avatar/images/b/bb/Pakku_looking_smug.png',
        victoryStyle: "Disciplined", powerTier: 7,
        faction: "WaterTribe",
        personalityProfile: {
            aggression: 0.6, patience: 0.8, riskTolerance: 0.4, opportunism: 0.8,
            creativity: 0.4, defensiveBias: 0.7, antiRepeater: 0.2,
            predictability: 0.8,
            signatureMoveBias: {
                "Ice Spikes": 1.1,
                "Water Barrier": 1.4,
                "Tidal Surge": 1.3,
                "Octopus Form": 1.7,
                "Canteen Water Stream": 1.0,
                "Ice Darts": 1.0,
                "Minor Water Shield": 1.0,
                "Water Pouch Splash": 1.0,
                "Tactical Reposition": 1.0,
                "Air Moisture Lance": 1.2, // NEW for EAT
                "Gale-Enhanced Shield": 1.3 // NEW for EAT
            }
        },
        specialTraits: { resilientToManipulation: 0.8, traditionalMaster: true, ethicalRestraintSwamp: true }, // UPDATED: Added ethicalRestraintSwamp
        collateralTolerance: 0.3,
        mobility: 0.5,
        curbstompRules: [
            { ruleId: "pakku_water_mastery_curbstomp", characterId: "pakku" },
            { ruleId: "pakku_ice_daggers_kill", characterId: "pakku" }
        ],
        personalityTriggers: {
            "skill_challenged": "(battleState.opponentTauntedSkillOrTradition) || (battleState.opponentAttackedFirstAggressively)"
        },
        incapacitationScore: 0,
        escalationState: 'Normal',
        stunDuration: 0,
        escalationBehavior: { // Pakku: Stern, disciplined, will finish decisively if opponent is weak
            'Severely Incapacitated': {
                signatureMoveBias: { "Octopus Form": 2.0, "Tidal Surge": 1.8, "Ice Spikes": 1.5 },
                offensiveBias: 1.6,
                finisherBias: 1.9, // Octopus Form or powerful ice attacks
                utilityBias: 0.4, // Water Barrier if truly needed
            },
            'Terminal Collapse': {
                signatureMoveBias: { "Octopus Form": 2.5, "Tidal Surge": 2.2 }, // Overwhelming water power
                offensiveBias: 1.8,
                finisherBias: 2.3,
                utilityBias: 0.1,
            }
        },
        techniques: [
            { name: "Ice Spikes", verb: 'launch', object: 'volley of ice spikes', type: 'Offense', power: 50, requiresArticle: true, element: 'ice', moveTags: ['ranged_attack', 'projectile', 'area_of_effect_small'], collateralImpact: 'low' },
            { name: "Water Barrier", verb: 'erect', object: 'solid water barrier', type: 'Defense', power: 60, requiresArticle: true, element: 'water', moveTags: ['defensive_stance', 'utility_block', 'construct_creation', 'setup'], collateralImpact: 'none' },
            { name: "Tidal Surge", verb: 'summon', object: 'powerful tidal surge', type: 'Offense', power: 75, requiresArticle: true, element: 'water', moveTags: ['area_of_effect', 'environmental_manipulation'], collateralImpact: 'medium' },
            { name: "Octopus Form", verb: 'assume', object: 'the Octopus Form', type: 'Finisher', power: 90, element: 'water', moveTags: ['defensive_stance', 'channeled', 'versatile', 'area_of_effect_small', 'requires_opening'], collateralImpact: 'low' },
            { name: "Tactical Reposition", verb: 'execute', object: 'a nimble repositioning', type: 'Utility', power: 10, element: 'water', moveTags: ['mobility_move', 'evasive', 'reposition'], isRepositionMove: true, collateralImpact: 'none' }
        ],
        techniquesCanteen: [
            { name: "Canteen Water Stream", verb: 'unleash', object: 'a stream of water from his canteen', type: 'Offense', power: 30, element: 'water', moveTags: ['ranged_attack_medium', 'single_target', 'limited_resource'], collateralImpact: 'none', isCanteenMove: true },
            { name: "Ice Darts", verb: 'create', object: 'sharp ice darts from his canteen', type: 'Offense', power: 35, element: 'ice', moveTags: ['ranged_attack', 'projectile', 'limited_resource', 'precise'], collateralImpact: 'none', isCanteenMove: true },
            { name: "Minor Water Shield", verb: 'form', object: 'a minor water shield from his canteen', type: 'Defense', power: 25, element: 'water', moveTags: ['defensive_stance', 'utility_block', 'limited_resource'], collateralImpact: 'none', isCanteenMove: true },
            { name: "Water Pouch Splash", verb: 'splash', object: 'water from his pouch to distract', type: 'Utility', power: 20, element: 'water', moveTags: ['utility_control', 'limited_resource'], setup: { name: 'Slightly Distracted', duration: 1, intensity: 1.05 }, collateralImpact: 'none', isCanteenMove: true },
            { name: "Tactical Reposition", verb: 'execute', object: 'a nimble repositioning', type: 'Utility', power: 10, element: 'water', moveTags: ['mobility_move', 'evasive', 'reposition'], isRepositionMove: true, collateralImpact: 'none' }
        ],
        techniquesEasternAirTemple: [
            { name: "Air Moisture Lance", verb: 'form', object: 'a lance from condensed air moisture', type: 'Offense', power: 40, element: 'water', moveTags: ['ranged_attack', 'single_target', 'limited_resource'], collateralImpact: 'none' },
            { name: "Condensed Mist Shield", verb: 'gather', object: 'mist into a dense shield', type: 'Defense', power: 45, requiresArticle: true, element: 'water', moveTags: ['defensive_stance', 'utility_block', 'limited_resource'], collateralImpact: 'none' },
            { name: "Ground Moisture Trip", verb: 'extract', object: 'moisture to create a slippery patch', type: 'Utility', power: 25, element: 'water', moveTags: ['utility_control', 'trap_delayed', 'limited_resource'], setup: { name: 'Off-Balance', duration: 1, intensity: 1.1 }, collateralImpact: 'none', isCanteenMove: true },
            { name: "Canteen Water Jet", verb: 'shoot', object: 'a jet of water from his canteen', type: 'Offense', power: 30, element: 'water', moveTags: ['ranged_attack_medium', 'single_target', 'limited_resource'], collateralImpact: 'none', isCanteenMove: true },
            { name: "Tactical Reposition", verb: 'execute', object: 'a nimble repositioning', type: 'Utility', power: 10, element: 'water', moveTags: ['mobility_move', 'evasive', 'reposition'], isRepositionMove: true, collateralImpact: 'none' }
        ],
        relationships: {}
    },
    'jeong-jeong': {
        id: 'jeong-jeong', name: "Jeong Jeong", type: "Bender", element: "fire", pronouns: { s: 'he', p: 'his', o: 'him' },
        imageUrl: 'https://static.wikia.nocookie.net/avatar/images/a/a7/Jeong_Jeong_serious.png',
        victoryStyle: "Wise_Reluctant", powerTier: 6,
        faction: "FireNationExile",
        personalityProfile: {
            aggression: 0.2, patience: 0.9, riskTolerance: 0.3, opportunism: 0.5,
            creativity: 0.5, defensiveBias: 0.9, antiRepeater: 0.4,
            predictability: 0.8,
            signatureMoveBias: {
                "Controlled Inferno": 0.3,
                "Fire Wall": 1.9,
                "Flame Whips": 0.7,
                "Precision Burn": 0.6,
                "Reluctant Finale": 0.5,
                "Tactical Reposition": 1.0
            }
        },
        specialTraits: { resilientToManipulation: 1.0, fireMaster: true, ethicalRestraintSwamp: true }, // UPDATED: Added ethicalRestraintSwamp
        collateralTolerance: 0.0,
        mobility: 0.4,
        curbstompRules: [
            { ruleId: "jeongjeong_fire_whips_disable", characterId: "jeong-jeong" },
            { ruleId: "jeongjeong_desert_advantage", characterId: "jeong-jeong" }
        ],
        personalityTriggers: {
            "confident_stance": "(battleState.characterLandedStrongOrCriticalHitLastTurn) || (battleState.allyBuffedSelf)"
        },
        incapacitationScore: 0,
        escalationState: 'Normal',
        stunDuration: 0,
        escalationBehavior: { // Jeong Jeong: Prefers control and defense, less likely to aggressively finish
            'Severely Incapacitated': {
                signatureMoveBias: { "Fire Wall": 1.5, "Controlled Inferno": 1.2 }, // Still defensive, but will use larger moves
                offensiveBias: 0.8, // Reluctant offense
                finisherBias: 1.0, // "Reluctant Finale" might be used to end suffering
                utilityBias: 1.2, // Fire Wall to control
            },
            'Terminal Collapse': {
                signatureMoveBias: { "Reluctant Finale": 1.5, "Controlled Inferno": 1.3 }, // To quickly end it, minimize suffering
                offensiveBias: 0.7,
                finisherBias: 1.2,
                utilityBias: 0.8,
            }
        },
        techniques: [
            { name: "Controlled Inferno", verb: 'create', object: 'controlled inferno', type: 'Offense', power: 80, requiresArticle: true, element: 'fire', moveTags: ['area_of_effect', 'channeled'], collateralImpact: 'high' },
            { name: "Fire Wall", verb: 'raise', object: 'impenetrable wall of fire', type: 'Defense', power: 85, requiresArticle: true, element: 'fire', moveTags: ['defensive_stance', 'utility_block', 'construct_creation', 'area_of_effect_large'], setup: { name: 'Cornered', duration: 2, intensity: 1.2 }, collateralImpact: 'medium' },
            { name: "Flame Whips", verb: 'conjure', object: 'precise flame whips', type: 'Offense', power: 55, element: 'fire', moveTags: ['melee_range', 'ranged_attack_medium', 'single_target', 'precise'], collateralImpact: 'low' },
            { name: "Precision Burn", verb: 'inflict', object: 'surgical burn', type: 'Offense', power: 45, requiresArticle: true, element: 'fire', moveTags: ['ranged_attack', 'single_target', 'precise'], collateralImpact: 'none' },
            { name: "Reluctant Finale", verb: 'end', object: 'the fight with a wall of flame', type: 'Finisher', power: 90, element: 'fire', moveTags: ['area_of_effect_large', 'pushback', 'environmental_manipulation', 'requires_opening'], collateralImpact: 'medium' },
            { name: "Tactical Reposition", verb: 'execute', object: 'a nimble repositioning', type: 'Utility', power: 10, element: 'fire', moveTags: ['mobility_move', 'evasive', 'reposition'], isRepositionMove: true, collateralImpact: 'none' }
        ],
        quotes: { postWin: ["The destructive path of fire has been averted, for now."], postWin_reflective: ["The true victory lies in avoiding destruction, not causing it."] },
        relationships: {}
    },
};