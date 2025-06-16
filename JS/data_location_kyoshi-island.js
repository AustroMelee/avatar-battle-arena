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
        air: { damage: 0, energy: 0, reason: "The temperate climate has little effect on airbending." },
        fire: { damage: -10, energy: 5, reason: "The wooden buildings are vulnerable, but the sea air is damp." },
        earth: { damage: 5, energy: 0, reason: "The island provides ample earth for bending." },
        water: { damage: 15, energy: -10, reason: "Being surrounded by the sea is a massive advantage for waterbenders." },
        ice: { damage: 10, energy: -5, reason: "The sea provides a vast source for icebending." },
        physical: { damage: 10, energy: -5, reason: "The close quarters of the village favor physical combat." },
        mobility_move: { damage: -15, energy: 10, reason: "The buildings and narrow streets can restrict broad movements." },
        evasive: { damage: 20, energy: -15, reason: "The rooftops and alleys of the village are perfect for evasive maneuvers." },
        ranged_attack: { damage: -20, energy: 15, reason: "The buildings provide significant cover, hindering ranged attacks." }
    },
    disabledElements: [],
    notes: "A balanced environment with abundant water, but urban structures and varied terrain create cover and hinder clear sightlines. Favors agile and mobile combatants."
};