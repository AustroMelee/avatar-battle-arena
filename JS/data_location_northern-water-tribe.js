// FILE: data_location_northern-water-tribe.js
'use strict';

// Environmental conditions for Northern Water Tribe City.

export const northernWaterTribe = {
    id: 'northern-water-tribe',
    name: 'Northern Water Tribe City',
    description: "A majestic city of ice and water, the stronghold of the Northern Water Tribe, under a perpetual twilight during the winter.",
    waterRich: true,
    iceRich: true,
    isSlippery: true,
    isCold: true,
    isUrban: true,    // NEW: Reflects city/building structure
    isDense: true,    // NEW: For close quarters
    hasCover: true,   // NEW: Ice pillars, buildings
    isCramped: true,  // NEW: Narrow ice bridges, pathways
    fragility: 30,
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
        air: { damage: -10, energy: 5, reason: "The frigid air is thin and difficult to manipulate." },
        fire: { damage: -20, energy: 15, reason: "The intense cold severely weakens firebending." },
        earth: { damage: -50, energy: 50, reason: "There is no earth to bend, only ice and snow." },
        water: { damage: 30, energy: -25, reason: "The city itself is a masterpiece of waterbending, empowering its masters." },
        ice: { damage: 35, energy: -30, reason: "Ice is the fundamental element of the city, granting unparalleled control." },
        physical: { damage: -5, energy: 5, reason: "The icy surfaces make footing treacherous for physical combat." },
        mobility_move: { damage: 10, energy: -10, reason: "The canals and ice slides allow for unique and rapid movement." },
        evasive: { damage: 5, energy: 0, reason: "The ice architecture provides ample cover." },
        ranged_attack: { damage: -15, energy: 10, reason: "The glittering ice and constant flurries can obscure vision." }
    },
    disabledElements: [], // Elements are not 'disabled' but heavily modified
    notes: "An abundance of water and ice makes this a fortress for waterbenders. Firebending is severely suppressed. Earthbending can adapt to frozen earth, but at a cost. Movement is affected by cold."
};