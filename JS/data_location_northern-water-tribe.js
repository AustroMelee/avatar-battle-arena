// FILE: data_location_northern-water-tribe.js
'use strict';

// Environmental conditions for Northern Water Tribe City.

export const northernWaterTribeConditions = {
    id: 'northern-water-tribe',
    waterRich: true,
    iceRich: true,
    isSlippery: true,
    isCold: true,
    isUrban: true,    // NEW: Reflects city/building structure
    isDense: true,    // NEW: For close quarters
    hasCover: true,   // NEW: Ice pillars, buildings
    isCramped: true,  // NEW: Narrow ice bridges, pathways
    fragility: 0.6, 
    damageThresholds: {
        minor: 10, moderate: 25, severe: 50, catastrophic: 75
    },
    environmentalImpacts: {
        minor: [
            "Cracks spiderweb across the ice bridges.",
            "A spray of slush erupts from the canals.",
            "Distant ice formations begin to groan and shift."
        ],
        moderate: [
            "Sections of ice pathways shatter, plunging into the freezing water.",
            "Waterbending constructs begin to destabilize from the force.",
            "The intricate ice architecture shows significant fracturing."
        ],
        severe: [
            "Large chunks of ice infrastructure break off, creating dangerous floes.",
            "The canals churn violently as ice dams are breached.",
            "The cold wind carries stinging shards of ice and snow."
        ],
        catastrophic: [
            "The beautiful ice city is torn apart, leaving a chaotic seascape of shattered ice and raging water.",
            "The tranquil canals are now violent currents, threatening to consume all in their path.",
            "What remains are icy ruins, a testament to the battle's ferocity."
        ]
    },
    environmentalModifiers: {
        water: { damageMultiplier: 1.3, energyCostModifier: 0.7, description: "Waterbending thrives with abundant water and ice, reaching near-maximum strength." }, // UPDATED: More significant buff
        ice: { damageMultiplier: 1.3, energyCostModifier: 0.7, description: "Ice bending is exceptionally potent with abundant ice." }, // UPDATED: More significant buff
        fire: { damageMultiplier: 0.4, energyCostModifier: 1.8, description: "Fire is severely suppressed by the extreme cold and moisture, and drains energy rapidly." }, // UPDATED: Major debuff
        lightning: { damageMultiplier: 0.4, energyCostModifier: 1.8, description: "Lightning is severely suppressed by the extreme cold and moisture, and drains energy rapidly." }, // NEW: Consistent with fire
        earth: { damageMultiplier: 1.0, energyCostModifier: 1.2, specialModifier: 'frozen_earth_impact', description: "Earthbending is possible on frozen ground, but unfamiliar and costs more energy." }, // UPDATED: Energy cost
        physical: { damageMultiplier: 0.9, energyCostModifier: 1.1, description: "Slippery surfaces and cold drain physical stamina." }, // Slight penalty for physical
        ranged_attack: { damageMultiplier: 0.5, energyCostModifier: 1.5, description: "Dense ice structures severely hinder line-of-sight and effectiveness of projectiles." }, // NEW: Severe penalty for ranged
        mobility_move: { damageMultiplier: 0.8, energyCostModifier: 1.2, description: "Cold saps agility over time, increasing energy cost for mobile maneuvers." }, // NEW: Penalty for mobility
        evasive: { damageMultiplier: 0.8, energyCostModifier: 1.2, description: "Cold saps stamina, increasing energy cost for evasive maneuvers." } // NEW: Penalty for evasive
    },
    disabledElements: [], // Elements are not 'disabled' but heavily modified
    notes: "An abundance of water and ice makes this a fortress for waterbenders. Firebending is severely suppressed. Earthbending can adapt to frozen earth, but at a cost. Movement is affected by cold."
};