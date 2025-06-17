'use strict';

export const boilingRock = {
    id: 'boiling-rock',
    name: 'The Boiling Rock',
    description: "A high-security prison in the middle of a boiling lake, with metal structures and oppressive heat.",
    locationTags: ['prison', 'metal', 'volcanic', 'fire_nation'],
    environmentalEffects: [
        "Oppressive heat",
        "Rising steam",
        "Clanging metal walkways",
        "Distant screams"
    ],
    environmentalModifiers: {
        air: { damage: -10, energy: 5, reason: "The hot, heavy air slightly hinders airbending." },
        fire: { damage: 15, energy: -10, reason: "The intense heat empowers firebending." },
        earth: { damage: -50, energy: 50, reason: "There is no earth to bend, only metal." },
        water: { damage: -90, energy: 90, reason: "The surrounding water is boiling hot and unusable." },
        ice: { damage: -100, energy: 100, reason: "Ice instantly sublimates into steam." },
        physical: { damage: 5, energy: -5, reason: "The metal structures provide advantages for physical combat." },
        mobility_move: { damage: -15, energy: 10, reason: "Confined walkways and guard towers limit mobility." },
        evasive: { damage: -10, energy: 5, reason: "Limited space makes evasion difficult." },
        ranged_attack: { damage: 10, energy: -5, reason: "Guard towers provide clear lines of sight for ranged attacks." }
    },
    specialConditions: {
        description: "The oppressive heat and metal environment favor firebenders and metalbenders, while severely hindering water and earthbenders.",
        effects: [
            {
                type: 'elemental_advantage',
                element: 'fire',
                bonus: 0.15,
                details: "The intense ambient heat empowers firebending."
            },
            {
                type: 'elemental_disadvantage',
                element: 'water',
                penalty: 0.9,
                details: "The boiling lake is an unusable water source."
            },
            {
                type: 'elemental_disadvantage',
                element: 'earth',
                penalty: 0.5,
                details: "There is no earth to bend, only metal."
            }
        ]
    },
    interactibles: [
        {
            name: "Guard Towers",
            description: "Provide a vantage point for ranged attacks but are vulnerable to collapse.",
            actions: ['ascend', 'garrison', 'topple']
        },
        {
            name: "Steam Pipes",
            description: "Can be ruptured to create a blinding cloud of steam, obscuring vision and causing chaos.",
            actions: ['rupture', 'scald']
        }
    ],
    fragility: 20,
    background: 'https://static.wikia.nocookie.net/avatar/images/c/c4/Boiling_Rock.png',
}; 