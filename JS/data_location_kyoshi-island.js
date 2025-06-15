// FILE: data_location_kyoshi-island.js
'use strict';

// Environmental conditions for Kyoshi Island Village.

export const kyoshiIslandConditions = {
    id: 'kyoshi-island',
    isCoastal: true,
    waterRich: true,
    earthRich: true,
    hasCover: true,
    plantsRich: true,
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
        water: { damageMultiplier: 1.3, energyCostModifier: 0.85, description: "Waterbending can unleash the power of the ocean with ease." },
        earth: { damageMultiplier: 1.0, energyCostModifier: 1.0, description: "Earthbending can damage village structures and terrain." },
        fire: { damageMultiplier: 1.1, energyCostModifier: 1.05, description: "Fire burns wooden structures easily, but moisture can hinder." },
        physical: { damageMultiplier: 1.0, energyCostModifier: 1.0, description: "The varied terrain provides balanced physical combat." }
    },
    disabledElements: [],
    notes: "A balanced environment with access to multiple elements. Village structures are relatively fragile."
};