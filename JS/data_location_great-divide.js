'use strict';

export const greatDivide = {
    id: 'great-divide',
    name: 'The Great Divide',
    description: "A massive, treacherous canyon that tests the endurance and climbing skills of any who dare to cross.",
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
    fragility: 80,
    background: 'images/locations/great_divide.webp',
}; 