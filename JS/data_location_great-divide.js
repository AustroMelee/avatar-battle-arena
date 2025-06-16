// FILE: data_location_great-divide.js
'use strict';

// Environmental conditions for The Great Divide.

export const greatDivideConditions = {
    id: 'great-divide',
    isExposed: true,
    isRocky: true,
    isVertical: true,
    isPrecarious: true,
    earthRich: true,
    fragility: 0.3, 
    damageThresholds: {
        minor: 10, moderate: 25, severe: 50, catastrophic: 75
    },
    environmentalImpacts: {
        minor: [
            "Small pebbles dislodge from the canyon walls.",
            "The echo of impacts rings through the chasm.",
            "Dust puffs up from the dry riverbed."
        ],
        moderate: [
            "A significant rockslide thunders down the cliff face.",
            "New cracks appear in the sheer rock walls, revealing deeper fissures.",
            "The chasm itself seems to widen under the pressure."
        ],
        severe: [
            "Massive boulders detach and plummet to the canyon floor, shaking the very ground.",
            "Sections of the canyon wall begin to collapse entirely.",
            "The air is thick with rock dust, making breathing difficult."
        ],
        catastrophic: [
            "The Great Divide is transformed into a chaotic abyss of shifting rock and active landslides.",
            "The canyon's sheer walls are now crumbled, treacherous slopes.",
            "The raw power of the battle has irrevocably reshaped the natural landscape."
        ]
    },
    environmentalModifiers: {
        air: { damage: 10, energy: -5, reason: "The open canyon is ideal for powerful air currents." },
        earth: { damage: 15, energy: -10, reason: "The canyon walls provide an endless supply of rock." },
        fire: { damage: -10, energy: 5, reason: "The windiness of the canyon makes controlling fire difficult." },
        lightning: { damageMultiplier: 1.3, energyCostModifier: 0.75, solar_amplification: true, description: "Lightning is highly effective and amplified by the open, dry air." }, // Major buff for lightning
        water: { damage: -60, energy: 60, reason: "Water is extremely scarce in the arid canyon." },
        ice: { damage: -70, energy: 70, reason: "There is no water to freeze in the hot canyon." },
        physical: { damage: -5, energy: 5, reason: "The uneven, rocky terrain makes footing precarious." },
        
        // General move tag modifiers influenced by terrain
        ranged_attack: { damage: -15, energy: 10, reason: "The variable elevation and wind makes ranged attacks unreliable." },
        mobility_move: { damage: 20, energy: -15, reason: "The cliffs and ledges are perfect for acrobatic movement." },
        evasive: { damage: 10, energy: -5, reason: "The numerous rocks and crevices offer places to hide." },
        
        // NEW MECHANIC: Toph's aerial vulnerability
        aerialAttackVulnerability: { 
            appliesToElement: "earth", // Only applies to earthbenders like Toph
            condition: "defender_grounded_attacker_airborne", // Specific condition for activation
            damageMultiplier: 1.3, // Earthbender takes 30% more damage from airborne attacks
            momentumChangeDefender: -1, // Small momentum loss for defender
            description: "An earthbender vulnerable to attacks from above."
        }
    },
    disabledElements: ['water', 'ice'], // Explicitly disable water/ice moves if not using canteen/specific moves
    notes: "A sheer canyon with little cover, favoring those with high mobility or powerful earthbending. Very stable but provides specific vulnerabilities."
};