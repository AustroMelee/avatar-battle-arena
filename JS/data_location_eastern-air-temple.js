// FILE: data_location_eastern-air-temple.js
'use strict';

// Environmental conditions for Eastern Air Temple.

export const easternAirTempleConditions = {
    id: 'eastern-air-temple',
    airRich: true,
    isVertical: true,
    isExposed: true,
    wind: 0.3, 
    fragility: 0.5, 
    hasCover: true, // NEW: Added for cover opportunities
    isCramped: true, // NEW: Added for tight spaces within the temple
    damageThresholds: { 
        minor: 10, moderate: 25, severe: 50, catastrophic: 75
    },
    environmentalImpacts: {
        minor: [
            "Dust billows from cracked stone.",
            "Small sections of the ancient structure begin to crumble.",
            "Loose rock slides down cliff faces."
        ],
        moderate: [
            "A section of a tiered platform collapses with a groan.",
            "Ancient carvings are obscured by falling debris.",
            "The strong winds whip up clouds of shattered stone and dust."
        ],
        severe: [
            "A large section of the temple's foundation gives way, threatening further collapse.",
            "Whole sections of cliff crumble into the abyss.",
            "The air currents become unpredictable, swirling with immense debris."
        ],
        catastrophic: [
            "The once serene Eastern Air Temple is scarred by massive fissures and collapsing structures.",
            "The sacred grounds are reduced to a perilous landscape of falling rock and violent updrafts.",
            "The very air vibrates with the sound of grinding earth and crumbling masonry."
        ]
    },
    environmentalModifiers: {
        air: { damageMultiplier: 1.15, energyCostModifier: 0.9, description: "Airbending flows freely with the winds." },
        fire: { damageMultiplier: 0.8, energyCostModifier: 1.2, description: "Fire struggles against the high winds." },
        earth: { damageMultiplier: 1.0, energyCostModifier: 1.05, description: "Earthbending is challenging on unstable platforms." },
        water: { damageMultiplier: 0.3, energyCostModifier: 1.8, description: "Waterbending is severely hindered by lack of water sources." }, // NEW: Severe penalty for water
        ice: { damageMultiplier: 0.3, energyCostModifier: 1.8, description: "Ice bending is severely hindered by lack of water sources." },   // NEW: Severe penalty for ice
        physical: { damageMultiplier: 0.9, energyCostModifier: 1.05, description: "Physical attacks are hindered by footing and wind." },
        // NEW: Modifiers for general move tags affected by environment
        mobility_move: { damageMultiplier: 1.2, energyCostModifier: 0.8, description: "Verticality and air currents enhance agile movement." },
        evasive: { damageMultiplier: 1.2, energyCostModifier: 0.8, description: "Verticality and air currents enhance evasive maneuvers." },
        ranged_attack: { damageMultiplier: 0.7, energyCostModifier: 1.15, description: "Cover and verticality hinder clear line of sight for ranged attacks." }
    },
    disabledElements: ['water', 'ice'], // NEW: Explicitly disable by default, only canteen/specific moves allowed
    notes: "High altitude and strong winds favor airbenders. Structures are old and somewhat brittle. Lack of water. Agile and evasive movements are highly effective due to verticality and air currents, but ranged attacks are hampered by cover."
};