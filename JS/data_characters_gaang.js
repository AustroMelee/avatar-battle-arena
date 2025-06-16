// FILE: js/data_characters_gaang.js
'use strict';

// This file serves as the central assembler for all character data.
// It imports character objects from modular files and combines them
// into a single 'characters' object for the rest of the application.

// Assuming ESCALATION_STATES is globally available or imported where this data is consumed.
// No direct import needed here, as it's typically used by logic files (like engine_escalation.js)

export const gaangCharacters = {
    'sokka': {
        id: 'sokka', name: "Sokka", type: "Nonbender", pronouns: { s: 'he', p: 'his', o: 'him' },
        imageUrl: 'https://static.wikia.nocookie.net/avatar/images/c/cc/Sokka.png',
        victoryStyle: "Madcap", powerTier: 3,
        faction: "WaterTribe",
        personalityProfile: {
            aggression: 0.5, patience: 0.6, riskTolerance: 0.4, opportunism: 0.7,
            creativity: 0.9, defensiveBias: 0.3, antiRepeater: 0.8,
            predictability: 0.4,
            signatureMoveBias: {
                "Sword Strike": 1.0,
                "Boomerang Throw": 1.6,
                "Shield Block": 1.0,
                "Tactical Positioning": 1.1,
                "Improvised Trap": 1.5,
                "The Sokka Special": 1.3,
                "Tactical Reposition": 1.1
            }
        },
        specialTraits: { resilientToManipulation: 0.2, intelligence: 75 },
        collateralTolerance: 0.5,
        mobility: 0.6,
        curbstompRules: [
            { ruleId: "sokka_strategy_exploit", characterId: "sokka" },
            { ruleId: "sokka_vulnerability_death", characterId: "sokka" }
        ],
        personalityTriggers: {
            "meticulous_planning": "(opponent.lastMove?.isHighRisk && opponent.lastMoveEffectiveness === 'Weak') || battleState.locationTags.includes('trap_favorable')"
        },
        incapacitationScore: 0,
        escalationState: 'Normal',
        stunDuration: 0,
        escalationBehavior: { // Sokka: Opportunistic trap or desperate measure
            'Severely Incapacitated': { // Opponent is Severely Incapacitated
                signatureMoveBias: { "Improvised Trap": 1.8, "The Sokka Special": 1.6, "Boomerang Throw": 1.4 },
                offensiveBias: 1.0, // Less direct offense, more traps
                finisherBias: 1.5,
                utilityBias: 1.6, // Higher bias for traps
            },
            'Terminal Collapse': { // Opponent is in Terminal Collapse
                signatureMoveBias: { "The Sokka Special": 2.0, "Boomerang Throw": 1.7 },
                offensiveBias: 0.8,
                finisherBias: 1.8,
                utilityBias: 1.3,
            }
        },
        // REMOVED: narrative property
        techniques: [
            { name: "Sword Strike", verb: 'strike', object: 'with his meteorite sword', type: 'Offense', power: 40, element: 'physical', moveTags: ['melee_range', 'single_target', 'precise'], collateralImpact: 'none' },
            { name: "Boomerang Throw", verb: 'throw', object: 'his trusty boomerang', type: 'Offense', power: 35, element: 'physical', moveTags: ['ranged_attack', 'projectile', 'single_target', 'unpredictable'], collateralImpact: 'low' },
            { name: "Shield Block", verb: 'block', object: 'with his shield', type: 'Defense', power: 30, element: 'utility', moveTags: ['defensive_stance', 'utility_block'], collateralImpact: 'none' },
            { name: "Tactical Positioning", verb: 'reposition', object: 'for a tactical advantage', type: 'Utility', power: 20, element: 'utility', moveTags: ['utility_reposition', 'evasive'], setup: { name: 'Outmaneuvered', duration: 1, intensity: 1.1 }, collateralImpact: 'none' },
            { name: "Improvised Trap", verb: 'devise', object: 'clever trap', type: 'Utility', power: 50, requiresArticle: true, element: 'utility', moveTags: ['trap_delayed', 'utility_control', 'environmental_manipulation'], collateralImpact: 'low' },
            { name: "The Sokka Special", verb: 'spring', object: 'masterfully constructed snare trap', type: 'Finisher', power: 75, requiresArticle: true, element: 'utility', moveTags: ['trap_delayed', 'debuff_disable', 'single_target', 'requires_opening', 'highRisk'], collateralImpact: 'medium' },
            { name: "Tactical Reposition", verb: 'execute', object: 'a nimble repositioning', type: 'Utility', power: 10, element: 'physical', moveTags: ['mobility_move', 'evasive', 'reposition'], isRepositionMove: true, collateralImpact: 'none' }
        ],
        quotes: { postWin: ["Boomerang! You do always come back!"], postWin_overwhelming: ["Nailed it! I am the greatest warrior-inventor of our time!"], postWin_specific: { 'aang-airbending-only': "See? Brains beat brawn... and... wind." } },
        relationships: { 'katara': { relationshipType: 'sibling_support', stressModifier: 0.9, resilienceModifier: 1.2 } }
    },
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
        // REMOVED: narrative property
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
    },
    'katara': {
        id: 'katara', name: "Katara", type: "Bender", element: "water", pronouns: { s: 'she', p: 'her', o: 'her' },
        imageUrl: 'https://static.wikia.nocookie.net/avatar/images/7/7a/Katara_smiles_at_coronation.png',
        victoryStyle: "Fierce", powerTier: 7,
        faction: "WaterTribe",
        personalityProfile: {
            aggression: 0.6, patience: 0.7, riskTolerance: 0.5, opportunism: 0.8,
            creativity: 0.7, defensiveBias: 0.5, antiRepeater: 0.6,
            predictability: 0.5,
            signatureMoveBias: {
                "Water Whip": 1.5,
                "Ice Spears": 1.3,
                "Water Shield": 1.4,
                "Ice Prison": 1.2,
                "Tidal Wave": 1.1,
                "Bloodbending": 0.1,
                "Canteen Water Jet": 1.0,
                "Small Ice Darts": 1.0,
                "Canteen Water Shield": 1.0,
                "Slippery Puddle": 1.0,
                "Canteen Whip": 1.0,
                "Tactical Reposition": 1.0,
                "Air Moisture Whip": 1.2, // NEW for EAT
                "Condensed Mist Shield": 1.3 // NEW for EAT
            }
        },
        specialTraits: { resilientToManipulation: 0.9, isHealer: true, ethicalRestraintSwamp: true },
        collateralTolerance: 0.15,
        mobility: 0.7,
        curbstompRules: [
            { ruleId: "katara_bloodbending", characterId: "katara" },
            { ruleId: "katara_ice_prison_kill", characterId: "katara" }
        ],
        personalityTriggers: {
            "desperate_mentally_broken": "(character.hp < character.maxHp * 0.1) || (battleState.ally?.isDowned) || (character.criticalHitsTaken >= 2) || (character.mentalState.level === 'broken')"
        },
        incapacitationScore: 0,
        escalationState: 'Normal',
        stunDuration: 0,
        escalationBehavior: { // Katara: Protective and fierce, but resorts to extreme measures only if pushed
            'Severely Incapacitated': {
                signatureMoveBias: { "Tidal Wave": 1.8, "Ice Prison": 1.6, "Ice Spears": 1.4 },
                offensiveBias: 1.5, // Less shielding, more direct action
                finisherBias: 1.7, // Tidal Wave or Ice Prison to incapacitate
                utilityBias: 0.5,
            },
            'Terminal Collapse': {
                signatureMoveBias: { "Bloodbending": 0.5, "Tidal Wave": 2.2, "Ice Prison": 1.9 }, // Bloodbending still low unless desperate_mentally_broken trigger
                offensiveBias: 1.7,
                finisherBias: 2.0,
                utilityBias: 0.2,
            }
        },
        // REMOVED: narrative property
        techniquesFull: [
            { name: "Water Whip", verb: 'lash', object: 'out with a water whip', type: 'Offense', power: 45, element: 'water', moveTags: ['melee_range', 'ranged_attack_medium', 'channeled', 'single_target'], collateralImpact: 'low' },
            { name: "Ice Spears", verb: 'launch', object: 'volley of ice spears', type: 'Offense', power: 55, requiresArticle: true, element: 'ice', moveTags: ['ranged_attack', 'projectile', 'area_of_effect_small'], collateralImpact: 'low' },
            { name: "Water Shield", verb: 'raise', object: 'shield of water', type: 'Defense', power: 50, requiresArticle: true, element: 'water', moveTags: ['defensive_stance', 'utility_block', 'projectile_defense', 'construct_creation'], collateralImpact: 'none' },
            { name: "Ice Prison", verb: 'create', object: 'ice prison', type: 'Utility', power: 60, requiresArticle: true, element: 'ice', moveTags: ['utility_control', 'debuff_disable', 'construct_creation', 'single_target'], setup: { name: 'Immobilized', duration: 2, intensity: 1.4 }, collateralImpact: 'low' },
            { name: "Tidal Wave", verb: 'summon', object: 'massive tidal wave', type: 'Finisher', power: 90, requiresArticle: true, element: 'water', moveTags: ['area_of_effect_large', 'environmental_manipulation', 'channeled', 'requires_opening'], collateralImpact: 'high' },
            { name: "Bloodbending", verb: 'control', object: "her opponent's body", type: 'Finisher', power: 100, element: 'special', moveTags: ['channeled', 'debuff_disable', 'single_target', 'unblockable', 'requires_opening', 'highRisk', 'humiliation'], collateralImpact: 'none' },
            { name: "Tactical Reposition", verb: 'execute', object: 'a nimble repositioning', type: 'Utility', power: 10, element: 'water', moveTags: ['mobility_move', 'evasive', 'reposition'], isRepositionMove: true, collateralImpact: 'none' }
        ],
        techniquesCanteen: [
            { name: "Canteen Water Jet", verb: 'shoot', object: 'a jet of water from her canteen', type: 'Offense', power: 30, element: 'water', moveTags: ['ranged_attack_medium', 'single_target', 'limited_resource'], collateralImpact: 'none', isCanteenMove: true },
            { name: "Small Ice Darts", verb: 'form', object: 'small ice darts from her canteen', type: 'Offense', power: 35, element: 'ice', moveTags: ['ranged_attack', 'projectile', 'limited_resource', 'precise'], collateralImpact: 'none', isCanteenMove: true },
            { name: "Canteen Water Shield", verb: 'create', object: 'a small water shield from her canteen', type: 'Defense', power: 25, element: 'water', moveTags: ['defensive_stance', 'utility_block', 'limited_resource'], collateralImpact: 'none', isCanteenMove: true },
            { name: "Slippery Puddle", verb: 'spill', object: 'water to create a slippery puddle', type: 'Utility', power: 20, element: 'water', moveTags: ['utility_control', 'trap_delayed', 'limited_resource'], setup: { name: 'Off-Balance', duration: 1, intensity: 1.1 }, collateralImpact: 'none', isCanteenMove: true },
            { name: "Canteen Whip", verb: 'lash', object: 'out with a small water whip from her canteen', type: 'Offense', power: 25, element: 'water', moveTags: ['melee_range', 'limited_resource'], collateralImpact: 'none', isCanteenMove: true },
            { name: "Tactical Reposition", verb: 'execute', object: 'a nimble repositioning', type: 'Utility', power: 10, element: 'water', moveTags: ['mobility_move', 'evasive', 'reposition'], isRepositionMove: true, collateralImpact: 'none' }
        ],
        techniquesEasternAirTemple: [
            { name: "Air Moisture Whip", verb: 'form', object: 'a whip from condensed air moisture', type: 'Offense', power: 35, element: 'water', moveTags: ['melee_range', 'ranged_attack_medium', 'limited_resource'], collateralImpact: 'none' },
            { name: "Condensed Mist Shield", verb: 'gather', object: 'mist into a dense shield', type: 'Defense', power: 30, requiresArticle: true, element: 'water', moveTags: ['defensive_stance', 'utility_block', 'limited_resource'], collateralImpact: 'none' },
            { name: "Ground Moisture Trip", verb: 'extract', object: 'moisture to create a slippery patch', type: 'Utility', power: 25, element: 'water', moveTags: ['utility_control', 'trap_delayed', 'limited_resource'], setup: { name: 'Off-Balance', duration: 1, intensity: 1.1 }, collateralImpact: 'none', isCanteenMove: true },
            { name: "Canteen Water Jet", verb: 'shoot', object: 'a jet of water from her canteen', type: 'Offense', power: 30, element: 'water', moveTags: ['ranged_attack_medium', 'single_target', 'limited_resource'], collateralImpact: 'none', isCanteenMove: true },
            { name: "Tactical Reposition", verb: 'execute', object: 'a nimble repositioning', type: 'Utility', power: 10, element: 'water', moveTags: ['mobility_move', 'evasive', 'reposition'], isRepositionMove: true, collateralImpact: 'none' }
        ],
        quotes: { postWin: ["That's how you do it, for my family, for my tribe!"], postWin_overwhelming: ["That's what happens when you underestimate a waterbender!"], postWin_specific: { 'azula': "You're beaten. It's over." } },
        relationships: { 'zuko': { relationshipType: "tense_alliance", stressModifier: 1.0, resilienceModifier: 1.1 }, 'azula': { relationshipType: "bitter_rivalry", stressModifier: 1.5, resilienceModifier: 1.0 } }
    },
    'toph-beifong': {
        id: 'toph-beifong', name: "Toph", type: "Bender", element: "earth", pronouns: { s: 'she', p: 'her', o: 'her' },
        imageUrl: 'https://static.wikia.nocookie.net/avatar/images/4/46/Toph_Beifong.png',
        victoryStyle: "Cocky", powerTier: 7,
        faction: "EarthKingdom",
        personalityProfile: {
            aggression: 0.85, patience: 0.4, riskTolerance: 0.8, opportunism: 0.9,
            creativity: 1.0, defensiveBias: 0.2, antiRepeater: 0.8,
            predictability: 0.7,
            signatureMoveBias: {
                "Earth Wave": 1.3,
                "Rock Armor": 1.1,
                "Seismic Slam": 1.7,
                "Metal Bending": 1.5,
                "Boulder Throw": 1.2,
                "Rock Coffin": 1.4,
                "Tactical Reposition": 0.8,
                "Iceberg Punch": 1.4, // NEW for NWT
                "Frozen Earth Shield": 1.2, // NEW for NWT
                "Glacial Spike": 1.3, // NEW for NWT
                "Sand Funnel": 1.4, // NEW for Si Wong
                "Quicksand Trap": 1.5, // NEW for Si Wong
                "Glass Shard Barrage": 1.3 // NEW for Si Wong
            }
        },
        specialTraits: { resilientToManipulation: 0.5, seismicSense: true, swampImmunity: true },
        collateralTolerance: 0.6,
        mobility: 0.2,
        curbstompRules: [
            { ruleId: "toph_seismic_sense_accuracy", characterId: "toph-beifong" },
            { ruleId: "toph_metal_bending_vs_armor", characterId: "toph-beifong" }
        ],
        personalityTriggers: {
            "doubted": "(battleState.opponentTauntedBlindness) || (battleState.opponentLandedBlindHit)"
        },
        incapacitationScore: 0,
        escalationState: 'Normal',
        stunDuration: 0,
        escalationBehavior: { // Toph: Overwhelming power, enjoys showing off
            'Severely Incapacitated': {
                signatureMoveBias: { "Seismic Slam": 2.0, "Rock Coffin": 1.8, "Metal Bending": 1.7, "Earth Wave": 1.5 },
                offensiveBias: 1.8,
                finisherBias: 2.0,
                utilityBias: 0.2, // Less armor, more offense
            },
            'Terminal Collapse': {
                signatureMoveBias: { "Seismic Slam": 2.5, "Rock Coffin": 2.2 }, // Big, definitive moves
                offensiveBias: 2.2,
                finisherBias: 2.5,
                utilityBias: 0.1,
            }
        },
        // REMOVED: narrative property
        techniques: [
            { name: "Earth Wave", verb: 'send', object: 'powerful wave of earth', type: 'Offense', power: 60, element: 'earth', moveTags: ['area_of_effect', 'environmental_manipulation'], collateralImpact: 'medium' },
            { name: "Rock Armor", verb: 'don', object: 'suit of rock armor', type: 'Defense', power: 75, requiresArticle: true, element: 'earth', moveTags: ['defensive_stance', 'utility_armor', 'construct_creation', 'requires_opening'], collateralImpact: 'none' },
            { name: "Seismic Slam", verb: 'slam', object: 'her fists to the ground', type: 'Offense', power: 70, element: 'earth', moveTags: ['area_of_effect_large', 'environmental_manipulation', 'unblockable_ground'], collateralImpact: 'high' },
            { name: "Metal Bending", verb: 'bend', object: 'the metal in the environment', type: 'Offense', power: 80, element: 'metal', moveTags: ['environmental_manipulation', 'utility_control', 'versatile'], collateralImpact: 'medium' },
            { name: "Boulder Throw", verb: 'launch', object: 'volley of rock projectiles', type: 'Offense', power: 65, element: 'earth', moveTags: ['ranged_attack', 'projectile', 'area_of_effect_small'], collateralImpact: 'low' },
            { name: "Rock Coffin", verb: 'entomb', object: 'her foe in a prison of rock', type: 'Finisher', power: 95, element: 'earth', moveTags: ['debuff_disable', 'single_target', 'construct_creation', 'requires_opening'], collateralImpact: 'low' },
            { name: "Tactical Reposition", verb: 'execute', object: 'a nimble repositioning', type: 'Utility', power: 10, element: 'earth', moveTags: ['mobility_move', 'evasive', 'reposition'], isRepositionMove: true, collateralImpact: 'none' }
        ],
        techniquesNorthernWaterTribe: [ // NEW MOVESET for Northern Water Tribe
            { name: "Iceberg Punch", verb: 'punch', object: 'a chunk of ice towards', type: 'Offense', power: 55, element: 'ice', moveTags: ['melee_range', 'ranged_attack_medium', 'single_target', 'environmental_manipulation'], collateralImpact: 'low' },
            { name: "Frozen Earth Shield", verb: 'raise', object: 'a shield of compacted ice and frozen earth', type: 'Defense', power: 65, requiresArticle: true, element: 'earth', moveTags: ['defensive_stance', 'utility_block', 'construct_creation'], collateralImpact: 'none' },
            { name: "Glacial Spike", verb: 'erupt with', object: 'a sharp glacial spike from the ground', type: 'Offense', power: 70, requiresArticle: true, element: 'ice', moveTags: ['melee_range', 'ranged_attack_medium', 'single_target', 'unblockable_ground', 'environmental_manipulation'], collateralImpact: 'medium' },
            { name: "Ice Bridge Creation", verb: 'create', object: 'a temporary ice bridge or platform', type: 'Utility', power: 40, requiresArticle: true, element: 'ice', moveTags: ['utility_reposition', 'environmental_manipulation'], collateralImpact: 'none' },
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
        quotes: { postWin: ["Told you I was the best. The greatest earthbender in the world!"], postWin_overwhelming: ["HA! That's what happens when you fight the greatest earthbender in the world!"], postWin_specific: { 'bumi': "Looks like I'm still the champ, Bumi!" } },
        relationships: {}
    },
    'zuko': {
        id: 'zuko', name: "Zuko", type: "Bender", element: "fire", pronouns: { s: 'he', p: 'his', o: 'him' },
        imageUrl: 'https://static.wikia.nocookie.net/avatar/images/4/4b/Zuko.png',
        victoryStyle: "Determined", powerTier: 6,
        faction: "FireNation",
        personalityProfile: {
            aggression: 0.75, patience: 0.6, riskTolerance: 0.6, opportunism: 0.8,
            creativity: 0.5, defensiveBias: 0.4, antiRepeater: 0.5,
            predictability: 0.6,
            signatureMoveBias: {
                "Fire Daggers": 1.1,
                "Flame Sword": 1.5,
                "Fire Shield": 1.0,
                "Dragon's Breath": 1.3,
                "Fire Whip": 1.2,
                "Redemption's Fury": 1.4,
                "Lightning Redirection": 0.1, // Reactive, not actively chosen
                "Tactical Reposition": 1.0
            }
        },
        specialTraits: { resilientToManipulation: 0.1, canRedirectLightning: true },
        collateralTolerance: 0.25,
        mobility: 0.65,
        curbstompRules: [
            { ruleId: "zuko_scar_intimidation", characterId: "zuko" },
            { ruleId: "zuko_dual_dao_kill", characterId: "zuko" }
        ],
        personalityTriggers: {
            "honor_violated": "(battleState.opponentCheated) || (battleState.allyDisarmedUnfairly)"
        },
        incapacitationScore: 0,
        escalationState: 'Normal',
        stunDuration: 0,
        escalationBehavior: { // Zuko: Driven by honor, more direct but less purely "kill" focused than Azula
            'Severely Incapacitated': {
                signatureMoveBias: { "Redemption's Fury": 1.9, "Dragon's Breath": 1.7, "Flame Sword": 1.5 },
                offensiveBias: 1.6,
                finisherBias: 1.8,
                utilityBias: 0.3,
            },
            'Terminal Collapse': {
                signatureMoveBias: { "Redemption's Fury": 2.4, "Dragon's Breath": 2.0 },
                offensiveBias: 1.9,
                finisherBias: 2.2,
                utilityBias: 0.1,
            }
        },
        // REMOVED: narrative property
        techniques: [
            { name: "Fire Daggers", verb: 'throw', object: 'volley of fire daggers', type: 'Offense', power: 45, element: 'fire', moveTags: ['ranged_attack', 'projectile', 'area_of_effect_small'], collateralImpact: 'low' },
            { name: "Flame Sword", verb: 'ignite', object: 'his dual dao swords', type: 'Offense', power: 55, element: 'fire', moveTags: ['melee_range', 'channeled', 'precise'], collateralImpact: 'none' },
            { name: "Fire Shield", verb: 'create', object: 'swirling fire shield', type: 'Defense', power: 50, requiresArticle: true, element: 'fire', moveTags: ['defensive_stance', 'utility_block', 'projectile_defense'], collateralImpact: 'none' },
            { name: "Dragon's Breath", verb: 'unleash', object: 'sustained stream of fire', type: 'Offense', power: 70, requiresArticle: true, element: 'fire', moveTags: ['ranged_attack', 'area_of_effect', 'channeled'], collateralImpact: 'medium' },
            { name: "Fire Whip", verb: 'lash', object: 'out with a whip of fire', type: 'Offense', power: 60, element: 'fire', moveTags: ['melee_range', 'ranged_attack_medium', 'channeled', 'single_target'], collateralImpact: 'low' },
            { name: "Redemption's Fury", verb: 'overwhelm', object: 'his opponent with a flurry of attacks', type: 'Finisher', power: 85, element: 'fire', moveTags: ['melee_range', 'area_of_effect_small', 'versatile', 'requires_opening'], collateralImpact: 'medium' },
            { name: "Lightning Redirection", verb: 'redirect', object: 'the incoming lightning', type: 'ReactiveDefense', power: 0, element: 'lightning', description: "Zuko can attempt to redirect incoming lightning attacks.", moveTags: ['reactive', 'lightning_redirection', 'single_target_defense'], collateralImpact: 'low' },
            { name: "Tactical Reposition", verb: 'execute', object: 'a nimble repositioning', type: 'Utility', power: 10, element: 'fire', moveTags: ['mobility_move', 'evasive', 'reposition'], isRepositionMove: true, collateralImpact: 'none' }
        ],
        quotes: { postWin: ["I fought for my own path. And I won."], postWin_overwhelming: ["My fire burns hotter because I fight for something real!"], postWin_specific: { 'azula': "It's over, Azula. I've found my own strength." } },
        relationships: { 'azula': { relationshipType: "sibling_rivalry_inferior", stressModifier: 2.0, resilienceModifier: 0.8 }, 'ozai-not-comet-enhanced': { relationshipType: "parental_defiance", stressModifier: 1.8, resilienceModifier: 1.2 }, 'iroh': { relationshipType: "mentor_respect", stressModifier: 0.5, resilienceModifier: 1.5 } }
    }
};