// FILE: data_location_northern-water-tribe.js
'use strict';

// Environmental conditions for Northern Water Tribe City.

export const northernWaterTribeConditions = {
    id: 'northern-water-tribe',
    waterRich: true,
    iceRich: true,
    isSlippery: true,
    isCold: true,
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
        water: { damageMultiplier: 1.15, energyCostModifier: 0.9, description: "Waterbending thrives with abundant water and ice." },
        ice: { damageMultiplier: 1.2, energyCostModifier: 0.85, description: "Ice bending is exceptionally potent here." },
        fire: { damageMultiplier: 1.5, energyCostModifier: 1.2, description: "Fire melts and shatters ice, but faces moisture." }, // Fire does more damage *to the ice structures*, but might cost more for the bender
        earth: { damageMultiplier: 0.7, energyCostModifier: 1.3, description: "Earthbending is limited in icy water terrain." }
    },
    disabledElements: [],
    notes: "An abundance of water and ice makes this a fortress for waterbenders. Ice structures are vulnerable to heat."
};