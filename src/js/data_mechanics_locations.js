// FILE: data_mechanics_locations.js
'use strict';

// Refined Environmental Curb Stomp Mechanics (v2) for Direct Engine Integration

export const locationCurbstompRules = {
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
    ]
};