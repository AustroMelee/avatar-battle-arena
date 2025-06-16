// FILE: data_location_foggy-swamp.js
'use strict';

// Environmental conditions for The Foggy Swamp.

export const foggySwampConditions = {
    id: 'foggy-swamp',
    waterRich: true,
    earthRich: true,
    plantsRich: true,
    isDense: true,
    lowVisibility: true, // Confirmed: Low visibility due to fog
    isSlippery: true,
    isMuddy: true, // NEW: Specific tag for difficult terrain/mobility penalties
    fragility: 0.4, 
    damageThresholds: {
        minor: 10, moderate: 25, severe: 50, catastrophic: 75
    },
    environmentalImpacts: {
        minor: [
            "Muck splashes as roots are torn up.",
            "The thick fog briefly disperses in patches.",
            "Ancient swamp trees groan from impacts."
        ],
        moderate: [
            "Massive trees are uprooted, crashing into the murky water.",
            "The swamp's mist thickens with disturbed spores and debris.",
            "The ground becomes an even more treacherous bog of mud and shattered flora."
        ],
        severe: [
            "The banyan-grove tree's roots themselves show deep scarring.",
            "Sections of the swamp become impassable due to deep, destructive churns.",
            "The air fills with the smell of disturbed earth and rotting vegetation."
        ],
        catastrophic: [
            "The ancient swamp is scarred, its vibrant ecosystem ravaged by uncontrolled power.",
            "The Banyan-Grove tree stands defiant but wounded, its surroundings a desolate mire.",
            "What was once a living, breathing landscape is now a churned, broken battlefield."
        ]
    },
    environmentalModifiers: {
        water: { damageMultiplier: 1.1, energyCostModifier: 0.9, description: "Waterbending amplifies the swamp's natural currents." },
        earth: { damageMultiplier: 1.2, energyCostModifier: 0.95, description: "Earthbending causes massive mudslides and root damage." },
        fire: { damageMultiplier: 1.0, energyCostModifier: 1.05, description: "Fire performs normally, but humidity may increase energy cost slightly." }, // Adjusted from 1.3/1.15
        lightning: { damageMultiplier: 1.0, energyCostModifier: 1.05, description: "Lightning performs normally, but humidity may increase energy cost slightly." }, // Consistent with fire
        air: { damageMultiplier: 1.0, energyCostModifier: 1.1, description: "Airbending is partially absorbed by dense fog and humidity." },
        physical: { damageMultiplier: 0.8, energyCostModifier: 1.3, description: "Physical combat is severely hampered by thick muck, roots, and low visibility." }, // Increased penalty
        // NEW: Modifiers for general move tags affected by environment
        ranged_attack: { damageMultiplier: 0.5, energyCostModifier: 1.5, description: "Dense fog and vegetation severely hinder precise ranged attacks." }, // Significant penalty
        mobility_move: { damageMultiplier: 0.7, energyCostModifier: 1.4, description: "Difficult terrain (mud, roots) heavily impedes agile movement." }, // Significant penalty
        evasive: { damageMultiplier: 0.7, energyCostModifier: 1.4, description: "Difficult terrain (mud, roots) heavily impedes evasive maneuvers." } // Significant penalty
    },
    // NEW: Psychological impact specific to this location
    psychologicalImpact: {
        stressIncrease: 8, // Base stress increase per turn for non-immune characters
        // Note: Confidence Suppression can be modeled as increased stress, which in turn impacts AI personality.
    },
    tags: ["water_rich", "earth_rich", "plants_rich", "dense", "low_visibility", "slippery", "cramped", "isMuddy"], // Added isMuddy tag
    disabledElements: [],
    notes: "A unique environment where water and earthbending can be uniquely applied. Dense vegetation and muck severely hinder mobility and visibility for most. Psychological discomfort is common."
};