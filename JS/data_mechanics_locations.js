// FILE: data_mechanics_locations.js
'use strict';

// Refined Environmental Curb Stomp Mechanics (v2) for Direct Engine Integration

export const locationCurbstompRules = {
    'si-wong-desert': [
        {
            id: "swd_azula_vs_katara",
            description: "In the desert, the sun amplifies Azula's fire while Katara is severely water-limited.",
            triggerChance: 0.95,
            appliesToPair: ["azula", "katara"],
            outcome: { type: "instant_win", winner: "azula" }
        },
        {
            id: "swd_azula_vs_aang",
            description: "Aang is at risk of heat exhaustion against a sun-powered Azula.",
            triggerChance: 0.70,
            appliesToPair: ["azula", "aang"],
            outcome: { type: "advantage", target: "azula", value: 0.7 } // 70% advantage
        },
        {
            id: "swd_toph_sand_debuff",
            description: "Toph's seismic sense is disrupted by the unstable sand.",
            triggerChance: 1.0,
            appliesToCharacter: "toph",
            outcome: { type: "debuff", property: "bendingPrecision", value: -0.40 } // -40% precision
        },
        {
            id: "swd_sokka_certain_death",
            description: "Sokka stands no chance against the desert heat and a bender.",
            triggerChance: 1.0,
            appliesToCharacter: "sokka",
            conditionLogic: (sokka, opponent) => opponent.isBender,
            outcome: { type: "instant_loss" }
        },
        {
            id: "swd_jeongjeong_powerup",
            description: "Jeong Jeong's fire mastery is amplified in arid zones.",
            triggerChance: 1.0,
            appliesToCharacter: "jeong-jeong",
            outcome: { type: "buff", property: "power", value: 0.35 }
        }
    ],
    'northern-water-tribe': [
        {
            id: "nwt_katara_vs_firebenders",
            description: "Katara has a massive advantage with infinite water against weakened firebenders.",
            triggerChance: 0.80,
            appliesToCharacter: "katara",
            conditionLogic: (katara, opponent) => opponent.element === "fire",
            outcome: { type: "instant_win" }
        },
        {
            id: "nwt_pakku_dominance",
            description: "Master Pakku is dominant against any non-waterbender in his element.",
            triggerChance: 0.90,
            appliesToCharacter: "pakku",
            conditionLogic: (pakku, opponent) => opponent.element !== "water",
            outcome: { type: "instant_win" }
        },
        {
            id: "nwt_firebender_debuff",
            description: "Firebenders are severely weakened by the cold.",
            triggerChance: 1.0,
            appliesToElement: "fire",
            outcome: { type: "debuff", property: "bendingEfficiency", value: -0.50 }
        }
    ],
    'foggy-swamp': [
        {
            id: "fs_toph_mud_debuff",
            description: "The mud and vines of the swamp disrupt Toph's seismic sense.",
            triggerChance: 1.0,
            appliesToCharacter: "toph",
            outcome: { type: "debuff", property: "bendingPrecision", value: -0.60 }
        },
        {
            id: "fs_katara_plant_buff",
            description: "Katara draws power from the immense moisture in the swamp's plant life.",
            triggerChance: 1.0,
            appliesToCharacter: "katara",
            outcome: { type: "buff", property: "bendingPower", value: 0.40 }
        },
        {
            id: "fs_visibility_debuff",
            description: "The thick fog reduces accuracy for all ranged attacks.",
            triggerChance: 1.0,
            appliesToMoveType: "ranged",
            outcome: { type: "debuff", property: "accuracy", value: -0.50 }
        }
    ],
    'boiling-rock': [
        {
            id: "br_fire_nation_buff",
            description: "Fire Nation fighters are empowered by the geothermal heat.",
            triggerChance: 1.0,
            appliesToFaction: "Fire Nation",
            outcome: { type: "buff", property: "overall", value: 0.20 }
        },
        {
            id: "br_sokka_death",
            description: "With no cover or escape, Sokka is helpless against benders here.",
            triggerChance: 1.0,
            appliesToCharacter: "sokka",
            conditionLogic: (sokka, opponent) => opponent.isBender,
            outcome: { type: "instant_loss" }
        },
        {
            id: "br_lava_hazard",
            description: "The surrounding lava is a constant threat.",
            triggerChance: 0.30,
            appliesToAll: true,
            outcome: { type: "environmental_kill" }
        }
    ],
    'eastern-air-temple': [
        {
            id: "eat_aang_buff",
            description: "Aang is spiritually and elementally connected to the temple.",
            triggerChance: 1.0,
            appliesToCharacter: "aang",
            outcome: { type: "buff", property: "bendingStrength", value: 0.60 }
        },
        {
            id: "eat_fall_hazard",
            description: "The high altitudes pose a constant fall risk.",
            triggerChance: 0.40,
            appliesToAll: true,
            outcome: { type: "environmental_kill" }
        },
        {
            id: "eat_structural_collapse_risk",
            description: "Heavy earthbending risks collapsing the ancient structures.",
            triggerChance: 1.0,
            appliesToElement: "earth",
            conditionLogic: (bender, opponent, battleState) => bender.lastMove?.power > 70, // Example trigger
            outcome: { type: "environmental_kill", probability: 0.5 } // 50% chance the bender is also caught
        }
    ],
    'omashu': [ // Covers delivery chutes implicitly
        {
            id: "omashu_bumi_dominance",
            description: "Bumi has absolute control over the city's earth.",
            triggerChance: 0.95,
            appliesToCharacter: "bumi",
            outcome: { type: "instant_win" }
        },
        {
            id: "omashu_tylee_guarantee",
            description: "The confined spaces of the delivery system guarantee a chi-block.",
            triggerChance: 1.0,
            appliesToCharacter: "ty-lee",
            outcome: { type: "instant_win" }
        },
        {
            id: "omashu_crush_hazard",
            description: "The industrial machinery of Omashu is a deadly hazard.",
            triggerChance: 0.25,
            appliesToAll: true,
            outcome: { type: "environmental_kill" }
        }
    ],
    'fire-nation-capital': [
        {
            id: "fnc_royal_power",
            description: "Ozai and Azula are at the seat of their power.",
            triggerChance: 1.0,
            appliesToCharacters: ["ozai", "azula"],
            outcome: { type: "buff", property: "power", value: 0.50 }
        },
        {
            id: "fnc_open_ground",
            description: "The open plaza provides clear lines of sight for ranged attacks.",
            triggerChance: 1.0,
            appliesToMoveType: "ranged",
            outcome: { type: "buff", property: "accuracy", value: 0.30 }
        },
        {
            id: "fnc_intimidation",
            description: "Foreign fighters suffer a morale penalty in the enemy capital.",
            triggerChance: 1.0,
            appliesToFaction: "!Fire Nation", // Using '!' to denote 'not'
            outcome: { type: "debuff", property: "morale", value: -0.20 }
        }
    ],
    'kyoshi-island': [
        {
            id: "ki_kyoshi_warrior_ambush",
            description: "There's a chance the Kyoshi Warriors intervene to protect their home.",
            triggerChance: 0.20,
            appliesToAll: true,
            outcome: { type: "external_intervention" } // Engine will interpret this as a draw/no contest
        },
        {
            id: "ki_bridge_knockoff",
            description: "Heavy or immobile fighters risk being knocked off a bridge.",
            triggerChance: 1.0,
            conditionLogic: (char) => char.mobility < 0.4,
            outcome: { type: "environmental_kill" }
        },
        {
            id: "ki_sokka_familiarity",
            description: "Sokka's time here gives him a tactical advantage.",
            triggerChance: 1.0,
            appliesToCharacter: "sokka",
            outcome: { type: "buff", property: "tactics", value: 0.10 }
        }
    ],
    'great-divide': [
        {
            id: "gd_aang_updrafts",
            description: "The canyon updrafts significantly boost Aang's airbending.",
            triggerChance: 1.0,
            appliesToCharacter: "aang",
            outcome: { type: "buff", property: "windPower", value: 0.40 }
        },
        {
            id: "gd_cliff_death",
            description: "The precarious cliffs are a major hazard.",
            triggerChance: 0.60,
            appliesToAll: true,
            outcome: { type: "environmental_kill" }
        },
        {
            id: "gd_mai_accuracy",
            description: "The long, clear sightlines are perfect for a marksman like Mai.",
            triggerChance: 1.0,
            appliesToCharacter: "mai",
            outcome: { type: "buff", property: "throwingAccuracy", value: 0.25 }
        }
    ],
    'ba-sing-se-lower-ring': [
        {
            id: "bslr_toph_urban_buff",
            description: "The dense urban terrain is Toph's ideal battlefield.",
            triggerChance: 1.0,
            appliesToCharacter: "toph",
            outcome: { type: "buff", property: "power", value: 0.30 }
        },
        {
            id: "bslr_crowd_interference",
            description: "Civilians might get in the way of the fight.",
            triggerChance: 0.15,
            appliesToAll: true,
            outcome: { type: "external_intervention" }
        },
        {
            id: "bslr_tylee_alley_buff",
            description: "Ty Lee is even more effective in the tight alleys.",
            triggerChance: 1.0,
            appliesToCharacter: "ty-lee",
            outcome: { type: "buff", property: "chiBlockingOdds", value: 0.40 }
        }
    ]
};