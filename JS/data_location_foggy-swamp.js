// FILE: data_location_foggy-swamp.js
'use strict';

// Environmental conditions for The Foggy Swamp.

export const foggySwampConditions = {
    id: 'foggy-swamp',
    waterRich: true,
    earthRich: true,
    plantsRich: true,
    isDense: true,
    lowVisibility: true,
    isSlippery: true,
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
        fire: { damageMultiplier: 1.3, energyCostModifier: 1.15, description: "Fire creates steam and burns vegetation, but struggles with moisture." },
        air: { damageMultiplier: 1.0, energyCostModifier: 1.1, description: "Airbending is partially absorbed by dense fog and humidity." },
        physical: { damageMultiplier: 0.9, energyCostModifier: 1.1, description: "Physical combat is hampered by thick muck and vegetation." }
    },
    disabledElements: [],
    notes: "A unique environment where water and earthbending can be uniquely applied. Dense vegetation and muck."
};