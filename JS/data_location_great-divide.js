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
        earth: { damageMultiplier: 1.4, energyCostModifier: 0.9, description: "Earthbending causes massive geological shifts with ease." },
        air: { damageMultiplier: 1.0, energyCostModifier: 1.0, description: "Airbending can dislodge loose scree and move with currents." },
        fire: { damageMultiplier: 0.8, energyCostModifier: 1.1, description: "Fire has limited structural effect on solid rock and can be diffused." },
        physical: { damageMultiplier: 0.9, energyCostModifier: 1.1, description: "Precarious footing and echoing sounds hinder physical combat." }
    },
    disabledElements: ['water', 'ice'], 
    notes: "A sheer canyon with little cover, favoring those with high mobility or powerful earthbending. Very stable."
};