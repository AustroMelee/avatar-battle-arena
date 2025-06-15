// FILE: data_location_si-wong-desert.js
'use strict';

// Environmental conditions for Si Wong Desert.

export const siWongDesertConditions = {
    id: 'si-wong-desert',
    isSandy: true,
    isHot: true,
    hasShiftingGround: true,
    lowVisibility: true,
    fragility: 0.2, 
    damageThresholds: {
        minor: 10, moderate: 25, severe: 50, catastrophic: 75
    },
    environmentalImpacts: {
        minor: [
            "Sand whips up into stinging gusts.",
            "Small dunes are displaced.",
            "The ground shudders, creating minor sand geysers."
        ],
        moderate: [
            "Large sandstorms are stirred, reducing visibility further.",
            "Deeper fissures appear in the desert floor.",
            "Oasis flora is uprooted and buried under shifting sands."
        ],
        severe: [
            "Massive sand whirlwinds tear across the landscape, obscuring everything.",
            "Canyons widen and shift as the very ground gives way.",
            "The desert environment becomes a chaotic, blinding maelstrom of sand and heat."
        ],
        catastrophic: [
            "The desert is utterly transformed, vast dunes are flattened, and new canyons carved by destructive forces.",
            "A blinding sandstorm rages, making continued combat almost impossible.",
            "The once featureless expanse is now a scarred, tortured wasteland."
        ]
    },
    environmentalModifiers: {
        fire: { damageMultiplier: 0.9, energyCostModifier: 0.95, description: "Fire has limited structural impact but intensifies heat." },
        earth: { damageMultiplier: 1.5, energyCostModifier: 0.85, description: "Earthbending can reshape the sandy terrain dramatically." },
        water: { damageMultiplier: 0.5, energyCostModifier: 1.5, description: "Waterbending struggles to cause widespread damage in dry sand and intense heat." },
        air: { damageMultiplier: 1.0, energyCostModifier: 0.95, description: "Airbending can manipulate sand, but costs energy." }
    },
    disabledElements: ['water', 'ice'], 
    notes: "Scorching heat and lack of water severely penalize waterbenders. Sand shifts constantly."
};