// FILE: data_location_kyoshi-island.js
'use strict';

// Environmental conditions for Kyoshi Island Village.

export const kyoshiIslandConditions = {
    id: 'kyoshi-island',
    isCoastal: true,
    waterRich: true,
    earthRich: true, // Earth is present, but less open than a pure earth arena
    hasCover: true,
    plantsRich: true,
    isUrban: true,   // NEW: For village structure/buildings
    isDense: true,   // NEW: For close-quarters
    isCramped: true, // NEW: For alleyways, tight spaces
    fragility: 0.6, 
    damageThresholds: {
        minor: 10, moderate: 25, severe: 50, catastrophic: 75
    },
    environmentalImpacts: {
        minor: [
            "Ocean spray mixes with kicked-up dust.",
            "A small fishing boat bobs wildly from distant impacts.",
            "Thatched roofs show minor damage."
        ],
        moderate: [
            "Village houses are torn apart, their wooden frames splintering.",
            "The coastline is eroded by powerful elemental forces.",
            "The tranquil waters of the bay are churned into violent swells."
        ],
        severe: [
            "The main village square is devastated, its buildings flattened and docks shattered.",
            "The ocean itself seems to rage, sending massive waves crashing inland.",
            "The once picturesque island is marred by widespread wreckage and flooding."
        ],
        catastrophic: [
            "Kyoshi Island is ravaged, its gentle village obliterated and its natural beauty scarred.",
            "The relentless ocean assaults the broken land, reclaiming what the battle has destroyed.",
            "A once peaceful sanctuary is now a testament to the brutal force unleashed upon it."
        ]
    },
    environmentalModifiers: {
        water: { damageMultiplier: 1.3, energyCostModifier: 0.8, description: "Waterbending unleashes the ocean's might." }, // UPDATED: More potent
        ice: { damageMultiplier: 1.3, energyCostModifier: 0.8, description: "Ice bending is exceptionally potent by the ocean." },    // NEW: For consistency with water
        fire: { damageMultiplier: 0.9, energyCostModifier: 1.1, description: "Fire struggles slightly against pervasive coastal moisture." }, // UPDATED: Slight penalty
        lightning: { damageMultiplier: 0.9, energyCostModifier: 1.1, description: "Lightning is diffused by coastal moisture." }, // NEW: Consistent with fire
        earth: { damageMultiplier: 1.0, energyCostModifier: 1.0, description: "Earthbending can damage village structures and terrain." },
        physical: { damageMultiplier: 1.0, energyCostModifier: 1.0, description: "The varied terrain provides balanced physical combat." },
        // NEW: Modifiers for general move tags affected by environment
        ranged_attack: { damageMultiplier: 0.8, energyCostModifier: 1.1, description: "Vegetation and structures create line-of-sight disruptions for ranged attacks." }, // NEW: Penalty for ranged
        mobility_move: { damageMultiplier: 1.2, energyCostModifier: 0.85, description: "Urban and natural features provide excellent parkour opportunities." }, // NEW: Buff for mobility
        evasive: { damageMultiplier: 1.2, energyCostModifier: 0.85, description: "Urban and natural features provide excellent evasive opportunities." } // NEW: Buff for evasive
    },
    disabledElements: [],
    notes: "A balanced environment with abundant water, but urban structures and varied terrain create cover and hinder clear sightlines. Favors agile and mobile combatants."
};