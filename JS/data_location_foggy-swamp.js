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
        air: { damage: -15, energy: 10, reason: "The dense, heavy fog dampens air currents." },
        fire: { damage: -25, energy: 20, reason: "The dampness of the swamp makes firebending difficult." },
        earth: { damage: 10, energy: -5, reason: "The soft, muddy ground is easily manipulated." },
        water: { damage: 25, energy: -20, reason: "The entire swamp is a massive source of water." },
        ice: { damage: 20, energy: -15, reason: "The abundant water can be readily frozen." },
        physical: { damage: -10, energy: 5, reason: "The murky water and tangled roots hinder movement." },
        mobility_move: { damage: -20, energy: 15, reason: "The swamp's terrain makes agile movements difficult." },
        evasive: { damage: 15, energy: -10, reason: "The fog and dense vegetation provide excellent cover for hiding." },
        ranged_attack: { damage: -30, energy: 25, reason: "The thick fog severely obscures visibility for ranged attacks." }
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