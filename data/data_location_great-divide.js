'use strict';

export const greatDivide = {
    id: 'great-divide',
    name: 'The Great Divide',
    description: "The largest canyon in the world, a vast and treacherous chasm that tests the resolve of any who dare to cross.",
    locationTags: ['canyon', 'treacherous', 'arid', 'earth_kingdom'],
    environmentalEffects: [
        "Howling winds",
        "Loose rockfalls",
        "Echoing sounds",
        "Extreme heat"
    ],
    environmentalModifiers: {
        air: { damage: 10, energy: -5, reason: "The open canyon is ideal for powerful air currents." },
        fire: { damage: -10, energy: 5, reason: "The windiness of the canyon makes controlling fire difficult." },
        earth: { damage: 15, energy: -10, reason: "The canyon walls provide an endless supply of rock." },
        water: { damage: -60, energy: 60, reason: "Water is extremely scarce in the arid canyon." },
        ice: { damage: -70, energy: 70, reason: "There is no water to freeze in the hot canyon." },
        physical: { damage: -5, energy: 5, reason: "The uneven, rocky terrain makes footing precarious." },
        mobility_move: { damage: 20, energy: -15, reason: "The cliffs and ledges are perfect for acrobatic movement." },
        evasive: { damage: 10, energy: -5, reason: "The numerous rocks and crevices offer places to hide." },
        ranged_attack: { damage: -15, energy: 10, reason: "The variable elevation and wind makes ranged attacks unreliable." }
    },
    specialConditions: {
        description: "The vast, windy canyon favors earth and airbenders, while the lack of water is a severe disadvantage.",
        effects: [
            {
                type: 'elemental_advantage',
                element: 'earth',
                bonus: 0.15,
                details: "The canyon provides an endless supply of rock for earthbenders."
            },
            {
                type: 'elemental_advantage',
                element: 'air',
                bonus: 0.10,
                details: "The strong updrafts and open spaces are ideal for airbending."
            },
            {
                type: 'elemental_disadvantage',
                element: 'water',
                penalty: 0.6,
                details: "The arid environment offers almost no water to bend."
            }
        ]
    },
    interactibles: [
        {
            name: "Canyon Walls",
            description: "Can be used to create rockfalls or to launch attacks from a higher elevation.",
            actions: ['trigger_rockslide', 'climb']
        },
        {
            name: "Narrow Ledges",
            description: "Treacherous paths that can be used for quick movement, but are easy to fall from.",
            actions: ['traverse', 'knock_off']
        }
    ],
    fragility: 80,
    background: 'https://static.wikia.nocookie.net/avatar/images/3/33/Great_Divide.png',
}; 